// ניתוב: /api/token, /api/chat, /api/config, /api/health — וכל השאר לקבצים הסטטיים, עם כותרות אבטחה.

import { CHARACTERS } from "./characters.generated.ts";
import { geminiGenerate, handleChat } from "./chat.ts";
import {
  allowedOrigin,
  corsHeaders,
  countryBlocked,
  errorResponse,
  checkDailyQuota,
  commitDailyQuota,
  hashIp,
  intVar,
  isFreeTier,
  recordStat,
  securityHeaders,
  verifyTurnstile,
  type Env,
} from "./guards.ts";
import type { ServerCharacter } from "./prompt.ts";
import { createLockedToken, sdkCreateToken, type TokenCreator } from "./token.ts";

/** חידושים מותרים לכל שיחה (החיבור נקטע בערך כל 10 דקות). */
export const MAX_RESUMES = 2;

interface SessionRecord {
  characterId: string;
  startedAt: number;
  resumes: number;
}

interface TokenBody {
  characterId?: unknown;
  turnstileToken?: unknown;
  resume?: { sessionId?: unknown; handle?: unknown };
}

export interface Deps {
  characters: Record<string, ServerCharacter>;
  createToken: TokenCreator;
  fetcher: typeof fetch;
  now: () => number;
}

const defaultDeps: Deps = { characters: CHARACTERS, createToken: sdkCreateToken, fetcher: fetch, now: Date.now };

export async function handleToken(request: Request, env: Env, deps: Deps = defaultDeps): Promise<Response> {
  // 1. מקור הבקשה
  const origin = allowedOrigin(request, env);
  const cors = corsHeaders(origin);
  if (!origin) return errorResponse("forbidden_origin", cors);

  let body: TokenBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse("bad_request", cors);
  }
  const characterId = typeof body.characterId === "string" ? body.characterId : "";
  const character = Object.hasOwn(deps.characters, characterId) ? deps.characters[characterId] : undefined;
  if (!character) return errorResponse("unknown_character", cors);

  // 2. מדינה
  if (countryBlocked(request, env)) return errorResponse("country_blocked", cors);

  const ip = request.headers.get("CF-Connecting-IP");
  const ipHash = await hashIp(ip ?? "unknown", env.TURNSTILE_SECRET);
  const { success } = await env.TOKEN_LIMITER.limit({ key: ipHash });
  if (!success) return errorResponse("rate_limited", cors);

  const now = deps.now();
  const maxMinutes = intVar(env.MAX_SESSION_MINUTES, 12);
  let sessionId: string;
  let session: SessionRecord;
  let resumeHandle: string | undefined;
  let quotaCounts: { ipCount: number; globalCount: number } | undefined;
  let countSession = false;

  if (body.resume) {
    // חידוש אחרי goAway או ניתוק: לא נספר במכסה היומית, עד MAX_RESUMES לשיחה.
    const id = typeof body.resume.sessionId === "string" ? body.resume.sessionId : "";
    const handle = typeof body.resume.handle === "string" ? body.resume.handle : "";
    const stored = id ? await env.SESSIONS.get<SessionRecord>(`sess:${id}`, "json") : null;
    if (
      !stored ||
      !handle ||
      handle.length > 4096 ||
      stored.characterId !== characterId ||
      stored.resumes >= MAX_RESUMES ||
      now > stored.startedAt + maxMinutes * 60_000
    ) {
      return errorResponse("resume_rejected", cors);
    }
    sessionId = id;
    session = { ...stored, resumes: stored.resumes + 1 };
    resumeHandle = handle;
  } else {
    // 3. Turnstile
    const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : undefined;
    if (!(await verifyTurnstile(turnstileToken, ip, env.TURNSTILE_SECRET, deps.fetcher))) {
      return errorResponse("turnstile_failed", cors);
    }
    // 4. מכסות יומיות
    const quota = await checkDailyQuota(env.SESSIONS, ipHash, env, now);
    if (quota.code) return errorResponse(quota.code, cors);
    if (!("unlimited" in quota)) quotaCounts = quota;
    countSession = true;
    sessionId = crypto.randomUUID();
    session = { characterId, startedAt: now, resumes: 0 };
  }

  // 5–6. הוראות ואסימון נעול
  let token: { token: string; expiresAt: string };
  try {
    token = await createLockedToken(
      {
        apiKey: env.GEMINI_API_KEY,
        apiVersion: env.GEMINI_API_VERSION || "v1beta",
        model: env.GEMINI_LIVE_MODEL,
        character,
        sessionStartedAt: session.startedAt,
        maxSessionMinutes: maxMinutes,
        resumeHandle,
        now,
      },
      deps.createToken,
    );
  } catch (err) {
    console.error(JSON.stringify({ event: "token_error", message: (err as Error).message?.slice(0, 300) }));
    return errorResponse("gemini_unavailable", cors);
  }

  if (quotaCounts) await commitDailyQuota(env.SESSIONS, ipHash, quotaCounts, now);
  if (countSession) await recordStat(env.SESSIONS, characterId, now);
  const ttl = Math.max(60, Math.ceil((session.startedAt + (maxMinutes + 30) * 60_000 - now) / 1000));
  await env.SESSIONS.put(`sess:${sessionId}`, JSON.stringify(session), { expirationTtl: ttl });

  // 7. תשובה — בלי ההוראות ובלי המפתח.
  return Response.json(
    {
      token: token.token,
      model: env.GEMINI_LIVE_MODEL,
      apiVersion: env.GEMINI_API_VERSION || "v1beta",
      expiresAt: token.expiresAt,
      maxSessionMinutes: maxMinutes,
      sessionId,
      startedAt: session.startedAt,
      resumesLeft: MAX_RESUMES - session.resumes,
    },
    { headers: { ...cors, "Cache-Control": "no-store" } },
  );
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(allowedOrigin(request, env)) });
    if (url.pathname === "/api/health") return new Response("ok", { headers: { "Cache-Control": "no-store" } });
    if (url.pathname === "/api/config" && request.method === "GET") {
      return Response.json(
        {
          turnstileSiteKey: env.TURNSTILE_SITE_KEY,
          maxSessionMinutes: intVar(env.MAX_SESSION_MINUTES, 12),
          freeTierMode: isFreeTier(env),
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (url.pathname === "/api/token" && request.method === "POST") return handleToken(request, env);
    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env, { characters: CHARACTERS, fetcher: fetch, now: Date.now, generate: geminiGenerate });
    }
    return new Response("Not found", { status: 404 });
  }
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env): Promise<Response> {
    const response = await route(request, env);
    // תגובות של ASSETS אינן ניתנות לשינוי — מעתיקים לתגובה חדשה עם הכותרות.
    const out = new Response(response.body, response);
    for (const [k, v] of Object.entries(securityHeaders(env))) out.headers.set(k, v);
    return out;
  },
} satisfies ExportedHandler<Env>;
