// שומרי הסף של /api/token: מקור הבקשה, מדינה, Turnstile ומכסות, וכותרות האבטחה.

export interface Env {
  ASSETS: Fetcher;
  SESSIONS: KVNamespace;
  TOKEN_LIMITER: RateLimit;
  CHAT_LIMITER: RateLimit;
  GEMINI_API_KEY: string;
  TURNSTILE_SECRET: string;
  GEMINI_LIVE_MODEL: string;
  /** מודל הצ'אט בכתב (/api/chat). */
  GEMINI_CHAT_MODEL?: string;
  GEMINI_API_VERSION: string;
  ALLOWED_ORIGINS: string;
  FRAME_ANCESTORS: string;
  FREE_TIER_MODE: string;
  MAX_SESSION_MINUTES: string;
  DAILY_SESSIONS_PER_IP: string;
  DAILY_SESSIONS_GLOBAL: string;
  TURNSTILE_SITE_KEY: string;
}

// האיחוד האירופי, אזור הכלכלה האירופי, שווייץ ובריטניה: בתוכנית החינמית של
// Gemini מותר לשרת אותם רק בתוכנית בתשלום (Gemini API Terms).
export const BLOCKED_COUNTRIES = new Set(
  "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO CH GB".split(" "),
);

export type ErrorCode =
  | "bad_request"
  | "forbidden_origin"
  | "unknown_character"
  | "country_blocked"
  | "turnstile_failed"
  | "rate_limited"
  | "quota_ip"
  | "quota_global"
  | "resume_rejected"
  | "chat_ended"
  | "gemini_unavailable";

const MESSAGES: Record<ErrorCode, [number, string, string]> = {
  bad_request: [400, "הבקשה לא תקינה.", "Bad request."],
  forbidden_origin: [403, "השיחה זמינה רק מתוך האתר.", "Requests are only accepted from the site."],
  unknown_character: [404, "הדמות הזו לא קיימת.", "Unknown character."],
  country_blocked: [
    451,
    "מצטערים, השירות עדיין לא זמין במדינה שלך (אירופה ובריטניה). הוא ייפתח כשנעבור לתוכנית בתשלום.",
    "Sorry, this service is not yet available in your country (EU/EEA, Switzerland, UK).",
  ],
  turnstile_failed: [403, "בדיקת האבטחה נכשלה. רענן את הדף ונסה שוב.", "Security check failed. Please reload and retry."],
  rate_limited: [429, "יותר מדי ניסיונות בזמן קצר. חכה דקה ונסה שוב.", "Too many attempts. Please wait a minute."],
  quota_ip: [429, "נגמרה המכסה היומית שלך. אפשר לחזור מחר.", "You have used today's sessions. Come back tomorrow."],
  quota_global: [
    429,
    "נגמרה המכסה היומית של האתר. אפשר לחזור מחר.",
    "The site's daily quota is used up. Come back tomorrow.",
  ],
  chat_ended: [403, "השיחה הזו הסתיימה. אפשר להתחיל שיחה חדשה.", "This chat has ended. Start a new one."],
  resume_rejected: [403, "לא ניתן לחדש את השיחה. התחל שיחה חדשה.", "This session can no longer be resumed."],
  gemini_unavailable: [502, "Gemini לא זמין כרגע. נסה שוב בעוד כמה דקות.", "Gemini is unavailable right now."],
};

export function errorResponse(code: ErrorCode, headers: HeadersInit = {}, detail?: string): Response {
  const [status, messageHe, messageEn] = MESSAGES[code];
  return Response.json({ error: code, messageHe, messageEn, ...(detail ? { detail } : {}) }, { status, headers });
}

export const intVar = (v: string | undefined, fallback: number) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** מגבלה מספרית; "0" = בלי הגבלה. */
export const limitVar = (v: string | undefined, fallback: number) =>
  v?.trim() === "0" ? Number.POSITIVE_INFINITY : intVar(v, fallback);

export const isFreeTier = (env: Env) => env.FREE_TIER_MODE !== "false";

export function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const self = new URL(request.url).origin;
  const list = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
  return origin === self || list.includes(origin) ? origin : null;
}

export function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return { Vary: "Origin" };
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

export function countryBlocked(request: Request, env: Env): boolean {
  if (!isFreeTier(env)) return false;
  const country = (request.cf as { country?: string } | undefined)?.country;
  return !!country && BLOCKED_COUNTRIES.has(country);
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string | null,
  secret: string,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  if (!token || token.length > 2048 || !secret) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const res = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/** גיבוב חד-כיווני של ה-IP עם מלח סודי — ה-IP עצמו לא נשמר בשום מקום. */
export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest).slice(0, 12)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

const DAY_TTL = 2 * 24 * 60 * 60;

async function readCount(kv: KVNamespace, key: string): Promise<number> {
  return Number.parseInt((await kv.get(key)) ?? "0", 10) || 0;
}

const quotaKeys = (ipHash: string, now: number) => {
  const day = today(now);
  return { ipKey: `ip:${ipHash}:${day}`, globalKey: `global:${day}` };
};

/**
 * בודק את המכסות היומיות (בלי לעדכן). KV לא מסונכרן מיידית בין מיקומים, ולכן
 * הספירה משוערת — מספיק לשלב הזה.
 */
export async function checkDailyQuota(kv: KVNamespace, ipHash: string, env: Env, now = Date.now()) {
  const perIp = limitVar(env.DAILY_SESSIONS_PER_IP, 3);
  const global = limitVar(env.DAILY_SESSIONS_GLOBAL, 60);
  // בלי שתי המגבלות אין מה לספור — וגם חוסכים כתיבות ל-KV.
  if (perIp === Number.POSITIVE_INFINITY && global === Number.POSITIVE_INFINITY) return { code: null, unlimited: true };
  const { ipKey, globalKey } = quotaKeys(ipHash, now);
  const [ipCount, globalCount] = await Promise.all([readCount(kv, ipKey), readCount(kv, globalKey)]);
  const code: ErrorCode | null =
    ipCount >= perIp ? "quota_ip" : globalCount >= global ? "quota_global" : null;
  return { code, ipCount, globalCount };
}

/** נספר רק אחרי שהאסימון הונפק — תקלה אצל Gemini לא "שורפת" שיחה. */
export async function commitDailyQuota(
  kv: KVNamespace,
  ipHash: string,
  counts: { ipCount: number; globalCount: number },
  now = Date.now(),
) {
  const { ipKey, globalKey } = quotaKeys(ipHash, now);
  await Promise.all([
    kv.put(ipKey, String(counts.ipCount + 1), { expirationTtl: DAY_TTL }),
    kv.put(globalKey, String(counts.globalCount + 1), { expirationTtl: DAY_TTL }),
  ]);
}

/** מונה מצטבר בלבד: כמה שיחות לכל דמות בכל יום. בלי תוכן ובלי IP. */
export async function recordStat(kv: KVNamespace, characterId: string, now = Date.now()) {
  const key = `stats:${today(now)}:${characterId}`;
  const n = await readCount(kv, key);
  await kv.put(key, String(n + 1), { expirationTtl: 400 * 24 * 60 * 60 });
  console.log(JSON.stringify({ event: "session_started", character: characterId, day: today(now) }));
}

export function securityHeaders(env: Env): Record<string, string> {
  const ancestors = env.FRAME_ANCESTORS.trim();
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "connect-src 'self' https://generativelanguage.googleapis.com wss://generativelanguage.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data:",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "base-uri 'none'",
    "form-action 'self'",
    `frame-ancestors 'self' ${ancestors}`.trim(),
  ].join("; ");
  const micAllow = ["self", ...ancestors.split(/\s+/).filter((o) => o.startsWith("https://")).map((o) => `"${o}"`)];
  return {
    "Content-Security-Policy": csp,
    "Permissions-Policy": `microphone=(${micAllow.join(" ")}), camera=(), geolocation=()`,
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
  };
}
