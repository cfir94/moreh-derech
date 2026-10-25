// בדיקות ל-/api/token עם Gemini מדומה: סדר השומרים, מכסות, חידוש, ומה נכנס לאסימון.

/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import type { Env } from "../src/worker/guards.ts";
import { handleToken, MAX_RESUMES, type Deps } from "../src/worker/index.ts";
import type { ServerCharacter } from "../src/worker/prompt.ts";
import type { CreateTokenParams } from "../src/worker/token.ts";

class MemoryKV {
  store = new Map<string, string>();
  async get(key: string, type?: string) {
    const v = this.store.get(key) ?? null;
    return type === "json" && v ? JSON.parse(v) : v;
  }
  async put(key: string, value: string) {
    this.store.set(key, value);
  }
}

const josephus: ServerCharacter = {
  id: "josephus",
  nameHe: "יוסף בן מתתיהו",
  voiceName: "Sadaltager",
  openingLineHe: "שלום לך.",
  prompt: "אתה יוסף בן מתתיהו.",
  knowledgeSheet: "ציר זמן: 67 — יודפת.",
};

const guide: ServerCharacter = {
  id: "guide",
  nameHe: "מוטי",
  voiceName: "Algenib",
  openingLineHe: "שלום.",
  prompt: "אתה מוטי, מורה דרך ותיק.",
  knowledgeSheet: "",
  kind: "guide",
};

let kv: MemoryKV;
let env: Env;
let created: { apiKey: string; apiVersion: string; params: CreateTokenParams }[];
let turnstileOk: boolean;
let limiterOk: boolean;
let now: number;

const deps = (): Deps => ({
  characters: { josephus, guide },
  createToken: async (apiKey, apiVersion, params) => {
    created.push({ apiKey, apiVersion, params });
    return { name: `auth_tokens/t${created.length}` };
  },
  fetcher: (async () => Response.json({ success: turnstileOk })) as unknown as typeof fetch,
  now: () => now,
});

beforeEach(() => {
  kv = new MemoryKV();
  created = [];
  turnstileOk = true;
  limiterOk = true;
  now = Date.parse("2026-10-23T10:00:00Z");
  env = {
    ASSETS: {} as Fetcher,
    SESSIONS: kv as unknown as KVNamespace,
    TOKEN_LIMITER: { limit: async () => ({ success: limiterOk }) } as unknown as RateLimit,
    GEMINI_API_KEY: "secret-key",
    TURNSTILE_SECRET: "ts-secret",
    GEMINI_LIVE_MODEL: "gemini-3.8-live",
    GEMINI_API_VERSION: "v1beta",
    ALLOWED_ORIGINS: "https://cfir94.github.io",
    FRAME_ANCESTORS: "https://cfir94.github.io",
    FREE_TIER_MODE: "true",
    MAX_SESSION_MINUTES: "12",
    DAILY_SESSIONS_PER_IP: "3",
    DAILY_SESSIONS_GLOBAL: "60",
    TURNSTILE_SITE_KEY: "site",
  };
});

function req(body: object, opts: { origin?: string | null; country?: string; ip?: string } = {}) {
  const headers: Record<string, string> = { "content-type": "application/json", "CF-Connecting-IP": opts.ip ?? "1.2.3.4" };
  const origin = opts.origin === undefined ? "https://talk.example.workers.dev" : opts.origin;
  if (origin) headers.Origin = origin;
  const r = new Request("https://talk.example.workers.dev/api/token", { method: "POST", headers, body: JSON.stringify(body) });
  Object.defineProperty(r, "cf", { value: { country: opts.country ?? "IL" } });
  return r;
}

const start = (opts = {}) => handleToken(req({ characterId: "josephus", turnstileToken: "tt" }, opts), env, deps());

test("שיחה תקינה: מחזיר אסימון, בלי ההוראות ובלי המפתח", async () => {
  const res = await start();
  assert.equal(res.status, 200);
  const body = await res.json<any>();
  assert.equal(body.token, "auth_tokens/t1");
  assert.equal(body.model, "gemini-3.8-live");
  assert.equal(body.maxSessionMinutes, 12);
  const raw = JSON.stringify(body);
  assert.ok(!raw.includes("secret-key"));
  assert.ok(!raw.includes("כללי מערכת"));
  assert.ok(!raw.includes("ציר זמן"));
});

test("האסימון: שימוש אחד, דקה להתחלה, 14 דקות בסך הכול, הכול נעול", async () => {
  await start();
  const { apiKey, apiVersion, params } = created[0];
  assert.equal(apiKey, "secret-key");
  assert.equal(apiVersion, "v1beta");
  const c = params.config;
  assert.equal(c.uses, 1);
  assert.equal(Date.parse(c.newSessionExpireTime) - now, 60_000);
  assert.equal(Date.parse(c.expireTime) - now, 14 * 60_000);
  assert.equal(c.liveConnectConstraints.model, "gemini-3.8-live");
  const live = c.liveConnectConstraints.config;
  assert.ok(live.systemInstruction.startsWith("כללי מערכת"));
  assert.ok(live.systemInstruction.includes("אתה יוסף בן מתתיהו."));
  assert.ok(live.systemInstruction.includes("ציר זמן: 67 — יודפת."));
  assert.ok(live.systemInstruction.includes("1201"));
  assert.equal(live.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, "Sadaltager");
  assert.equal(live.tools[0].functionDeclarations[0].name, "search_sources");
  assert.deepEqual(live.contextWindowCompression, { slidingWindow: {} });
  assert.deepEqual(live.sessionResumption, {});
  assert.deepEqual(live.inputAudioTranscription, {});
  assert.ok(!("lockAdditionalFields" in c), "בלי lockAdditionalFields כל השדות נעולים");
});

test("מקור לא מאושר נחסם, מקור מהרשימה מקבל CORS", async () => {
  assert.equal((await start({ origin: "https://evil.example" })).status, 403);
  assert.equal((await start({ origin: null })).status, 403);
  const ok = await start({ origin: "https://cfir94.github.io" });
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("Access-Control-Allow-Origin"), "https://cfir94.github.io");
});

test("מדינות אירופה ובריטניה נחסמות בתוכנית החינמית בלבד", async () => {
  for (const country of ["DE", "GB", "CH", "NO"]) {
    const res = await start({ country });
    assert.equal(res.status, 451);
    assert.equal((await res.json<any>()).error, "country_blocked");
  }
  env.FREE_TIER_MODE = "false";
  assert.equal((await start({ country: "DE" })).status, 200);
});

test("Turnstile שנכשל חוסם, ולא נוצר אסימון", async () => {
  turnstileOk = false;
  const res = await start();
  assert.equal(res.status, 403);
  assert.equal((await res.json<any>()).error, "turnstile_failed");
  assert.equal(created.length, 0);
});

test("Rate limit לפי IP", async () => {
  limiterOk = false;
  assert.equal((await start()).status, 429);
});

test("שיחה רביעית מאותו IP נחסמת; IP אחר עדיין עובר", async () => {
  for (let i = 0; i < 3; i++) assert.equal((await start()).status, 200);
  const fourth = await start();
  assert.equal(fourth.status, 429);
  assert.equal((await fourth.json<any>()).error, "quota_ip");
  assert.equal((await start({ ip: "5.6.7.8" })).status, 200);
});

test("\"0\" = בלי מכסה יומית, ובלי כתיבות מכסה ל-KV", async () => {
  env.DAILY_SESSIONS_PER_IP = "0";
  env.DAILY_SESSIONS_GLOBAL = "0";
  for (let i = 0; i < 10; i++) assert.equal((await start()).status, 200);
  assert.ok(![...kv.store.keys()].some((k) => k.startsWith("ip:") || k.startsWith("global:")));
});

test("תקרה יומית כללית", async () => {
  env.DAILY_SESSIONS_GLOBAL = "2";
  await start({ ip: "1.1.1.1" });
  await start({ ip: "2.2.2.2" });
  const res = await start({ ip: "3.3.3.3" });
  assert.equal((await res.json<any>()).error, "quota_global");
});

test("תקלה ב-Gemini לא נספרת במכסה", async () => {
  const failing: Deps = { ...deps(), createToken: async () => Promise.reject(new Error("boom")) };
  for (let i = 0; i < 5; i++) {
    const res = await handleToken(req({ characterId: "josephus", turnstileToken: "tt" }), env, failing);
    assert.equal(res.status, 502);
  }
  assert.equal((await start()).status, 200);
});

test("ה-IP לא נשמר גלוי", async () => {
  await start({ ip: "203.0.113.77" });
  for (const [k, v] of kv.store) {
    assert.ok(!k.includes("203.0.113.77") && !v.includes("203.0.113.77"), k);
  }
});

test("חידוש: בלי Turnstile ובלי מכסה, עם ה-handle בתוך האסימון, עד שני חידושים", async () => {
  const first = await (await start()).json<any>();
  turnstileOk = false; // חידוש לא עובר דרך Turnstile
  for (let i = 1; i <= MAX_RESUMES; i++) {
    now += 10 * 60_000 * (i === 1 ? 1 : 0.1);
    const res = await handleToken(
      req({ characterId: "josephus", resume: { sessionId: first.sessionId, handle: `h${i}` } }),
      env,
      deps(),
    );
    assert.equal(res.status, 200, `חידוש ${i}`);
    const body = await res.json<any>();
    assert.equal(body.resumesLeft, MAX_RESUMES - i);
    const params = created.at(-1)!.params.config;
    assert.deepEqual(params.liveConnectConstraints.config.sessionResumption, { handle: `h${i}` });
    // התקרה נמדדת מתחילת השיחה המקורית, לא מהחידוש
    assert.equal(Date.parse(params.expireTime), first.startedAt + 14 * 60_000);
  }
  const third = await handleToken(
    req({ characterId: "josephus", resume: { sessionId: first.sessionId, handle: "h3" } }),
    env,
    deps(),
  );
  assert.equal((await third.json<any>()).error, "resume_rejected");
  // החידושים לא נספרו: עוד שתי שיחות מאותו IP עוברות
  turnstileOk = true;
  assert.equal((await start()).status, 200);
  assert.equal((await start()).status, 200);
});

test("חידוש נדחה לדמות אחרת, לשיחה לא קיימת, ואחרי סוף הזמן", async () => {
  const first = await (await start()).json<any>();
  const resume = (body: object) => handleToken(req(body), env, deps()).then((r) => r.json<any>());
  assert.equal((await resume({ characterId: "josephus", resume: { sessionId: "nope", handle: "h" } })).error, "resume_rejected");
  now += 13 * 60_000;
  assert.equal((await resume({ characterId: "josephus", resume: { sessionId: first.sessionId, handle: "h" } })).error, "resume_rejected");
});

test("דמות לא קיימת", async () => {
  const res = await handleToken(req({ characterId: "__proto__", turnstileToken: "tt" }), env, deps());
  assert.equal(res.status, 404);
});

test("מורה הדרך: כללי המורה וכלי הבוחן; לדמות היסטורית — רק החיפוש", async () => {
  await handleToken(req({ characterId: "guide", turnstileToken: "tt" }), env, deps());
  const live = created[0].params.config.liveConnectConstraints.config;
  assert.ok(live.systemInstruction.startsWith("כללי מערכת (מורה הדרך)"));
  assert.ok(live.systemInstruction.includes("quiz_questions"));
  assert.ok(!live.systemInstruction.includes("אינך יודע דבר על מה שקרה אחרי מותך"));
  assert.deepEqual(
    live.tools[0].functionDeclarations.map((f) => f.name),
    ["search_sources", "quiz_questions"],
  );

  await start();
  const historical = created[1].params.config.liveConnectConstraints.config;
  assert.deepEqual(
    historical.tools[0].functionDeclarations.map((f) => f.name),
    ["search_sources"],
  );
  assert.ok(!historical.systemInstruction.includes("quiz_questions"));
});
