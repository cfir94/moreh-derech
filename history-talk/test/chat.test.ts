// /api/chat: Turnstile רק בפתיחה, הוראות וכלים נקבעים בשרת, ובדיקת ההיסטוריה שהדפדפן שולח.

/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";
import { test } from "node:test";
import { handleChat, MAX_CHAT_CALLS, readTicket, resetModelMemo, signTicket, validContents } from "../src/worker/chat.ts";
import type { Env } from "../src/worker/guards.ts";
import type { ServerCharacter } from "../src/worker/prompt.ts";

const guide: ServerCharacter = { id: "guide", nameHe: "מוטי", voiceName: "Algenib", openingLineHe: "שלום.", prompt: "אתה מוטי.", knowledgeSheet: "", kind: "guide" };

function setup(turnstileOk = true) {
  const store = new Map<string, string>();
  const kv = {
    get: async (k: string, t?: string) => (store.has(k) ? (t === "json" ? JSON.parse(store.get(k)!) : store.get(k)) : null),
    put: async (k: string, v: string) => void store.set(k, v),
  };
  const env = {
    TURNSTILE_SECRET: "s",
    SESSIONS: kv,
    CHAT_LIMITER: { limit: async () => ({ success: true }) },
    ALLOWED_ORIGINS: "https://cfir94.github.io",
    FREE_TIER_MODE: "true",
  } as unknown as Env;
  const sent: any[] = [];
  const deps = {
    characters: { guide },
    fetcher: (async () => Response.json({ success: turnstileOk })) as unknown as typeof fetch,
    now: () => 1_000_000,
    generate: async (_env: Env, body: any) => {
      sent.push(body);
      return { parts: [{ text: "שלום לך", thought: true } as any, { text: "שלום!" }] };
    },
  };
  const call = (body: object) =>
    handleChat(
      new Request("https://w.dev/api/chat", { method: "POST", headers: { Origin: "https://cfir94.github.io" }, body: JSON.stringify(body) }),
      env,
      deps,
    );
  return { call, sent, store, deps };
}

const hi = [{ role: "user", parts: [{ text: "שלום" }] }];

test("פתיחה עם Turnstile, ואחר כך בלי; ההוראות והכלים מהשרת, בלי 'מחשבות'", async () => {
  const { call, sent } = setup();
  const r1 = await call({ characterId: "guide", turnstileToken: "t", contents: hi });
  assert.equal(r1.status, 200);
  const b1 = await r1.json<any>();
  assert.deepEqual(b1.parts, [{ text: "שלום!" }]);
  assert.ok(sent[0].systemInstruction.parts[0].text.startsWith("כללי מערכת (מורה הדרך)"));
  assert.ok(sent[0].systemInstruction.parts[0].text.includes("שיחה בכתב"));
  assert.deepEqual(sent[0].tools[0].functionDeclarations.map((f: any) => f.name), ["search_sources", "quiz_questions"]);
  const r2 = await call({ characterId: "guide", chatId: b1.chatId, contents: hi });
  assert.equal(r2.status, 200);
});

test("בלי Turnstile תקין אין שיחה חדשה; שיחה שמוצתה נסגרת", async () => {
  const bad = setup(false);
  assert.equal((await bad.call({ characterId: "guide", contents: hi })).status, 403);
  const { call } = setup();
  const spent = await signTicket("s", { characterId: "guide", startedAt: 1_000_000, calls: MAX_CHAT_CALLS });
  const r = await call({ characterId: "guide", chatId: spent, contents: hi });
  assert.equal((await r.json<any>()).error, "chat_ended");
});

test("אסימון השיחה חתום: מונה עולה בכל הודעה, זיוף נדחה, ושום דבר לא נכתב ל-KV", async () => {
  const { call, store } = setup();
  const b1 = await (await call({ characterId: "guide", turnstileToken: "t", contents: hi })).json<any>();
  assert.deepEqual(await readTicket("s", b1.chatId), { characterId: "guide", startedAt: 1_000_000, calls: 1 });
  const b2 = await (await call({ characterId: "guide", chatId: b1.chatId, contents: hi })).json<any>();
  assert.equal((await readTicket("s", b2.chatId))!.calls, 2);
  assert.equal(store.size, 0, "הצ'אט לא כותב ל-KV (1,000 כתיבות ביום בתוכנית החינמית)");
  // זיוף: payload של מונה 0 עם החתימה של אסימון אחר
  const forged = (await signTicket("s", { characterId: "guide", startedAt: 1_000_000, calls: 0 })).split(".")[0] + "." + b2.chatId.split(".")[1];
  assert.equal(await readTicket("s", forged), null);
  assert.equal(await readTicket("other-secret", b2.chatId), null);
  assert.equal((await (await call({ characterId: "guide", chatId: forged, contents: hi })).json<any>()).error, "chat_ended");
  // אסימון של דמות אחרת
  const josephus = await signTicket("s", { characterId: "josephus", startedAt: 1_000_000, calls: 0 });
  assert.equal((await (await call({ characterId: "guide", chatId: josephus, contents: hi })).json<any>()).error, "chat_ended");
});

test("מכסה יומית של Gemini: הודעה ברורה, לא 'נסה בעוד דקה'", async () => {
  const { GeminiError } = await import("../src/worker/chat.ts");
  const { call, deps } = setup();
  deps.generate = async () => { throw new GeminiError(429, "daily", true); };
  const r = await call({ characterId: "guide", turnstileToken: "t", contents: hi });
  assert.equal(r.status, 429);
  assert.equal((await r.json<any>()).error, "daily_exhausted");
});

test("היסטוריה לא תקינה נדחית", () => {
  assert.equal(validContents([]), null);
  assert.equal(validContents([{ role: "system", parts: [{ text: "x" }] }]), null);
  assert.equal(validContents([{ role: "model", parts: [{ text: "x" }] }]), null, "מתחילה בהודעת התלמיד");
  assert.equal(validContents([{ role: "user", parts: [{ inlineData: {} }] }]), null);
  assert.ok(validContents(hi));
});

test("מודל עמוס (503) — עוברים לגיבוי וזוכרים אותו בזיכרון (לא ב-KV)", async () => {
  const { geminiGenerate, rankFlashModels } = await import("../src/worker/chat.ts");
  resetModelMemo();
  assert.deepEqual(
    rankFlashModels([
      { name: "models/gemini-3.5-flash-lite", supportedGenerationMethods: ["generateContent"] },
      { name: "models/gemini-3.5-flash", supportedGenerationMethods: ["generateContent"] },
      { name: "models/gemini-4.0-flash-preview", supportedGenerationMethods: ["generateContent"] },
      { name: "models/gemini-3.8-flash-live", supportedGenerationMethods: ["bidiGenerateContent"] },
    ]),
    ["gemini-3.5-flash", "gemini-4.0-flash-preview", "gemini-3.5-flash-lite"],
  );
  const env = { GEMINI_API_KEY: "k", GEMINI_CHAT_MODEL: "gemini-flash-lite-latest" } as unknown as Env;
  const calls: string[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    calls.push(url.replace("https://generativelanguage.googleapis.com/v1beta/", ""));
    if (url.includes("gemini-flash-lite-latest")) return new Response("overloaded", { status: 503 });
    return Response.json({ candidates: [{ content: { parts: [{ text: "שלום" }] } }] });
  }) as unknown as typeof fetch;
  try {
    const { parts } = await geminiGenerate(env, {});
    assert.deepEqual(parts, [{ text: "שלום" }]);
    assert.deepEqual(calls, ["models/gemini-flash-lite-latest:generateContent", "models/gemini-flash-latest:generateContent"]);
    calls.length = 0;
    await geminiGenerate(env, {});
    assert.deepEqual(calls, ["models/gemini-flash-latest:generateContent"], "המודל שעבד נוסה ראשון");
  } finally {
    globalThis.fetch = realFetch;
    resetModelMemo();
  }
});

test("מכסה יומית (429 PerDay): המודל נחסם עד האיפוס, וכשכולם חסומים — שגיאה יומית בלי לפנות ל-Gemini", async () => {
  const { geminiGenerate, GeminiError, nextQuotaReset } = await import("../src/worker/chat.ts");
  resetModelMemo();
  assert.equal(new Date(nextQuotaReset(Date.UTC(2026, 10, 6, 7, 0))).toISOString(), "2026-11-06T08:00:00.000Z");
  assert.equal(new Date(nextQuotaReset(Date.UTC(2026, 10, 6, 9, 0))).toISOString(), "2026-11-07T08:00:00.000Z");
  const env = { GEMINI_API_KEY: "k", GEMINI_CHAT_MODEL: "gemini-flash-lite-latest" } as unknown as Env;
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async (url: string) => {
    calls++;
    if (url.endsWith("/models?pageSize=200")) return Response.json({ models: [] });
    return new Response('{"error":{"details":[{"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"}]}}', { status: 429 });
  }) as unknown as typeof fetch;
  try {
    await assert.rejects(geminiGenerate(env, {}), (err: unknown) => err instanceof GeminiError && err.status === 429 && err.daily);
    const before = calls;
    await assert.rejects(geminiGenerate(env, {}), (err: unknown) => err instanceof GeminiError && err.daily);
    assert.ok(calls - before <= 1, "מודלים חסומים לא נוסים שוב (לכל היותר רשימת המודלים)");
  } finally {
    globalThis.fetch = realFetch;
    resetModelMemo();
  }
});

test("חתימות Gemini ומזהי כלים נשמרים אחרי חיפוש ובתשובת השרת", async () => {
  const signed = { functionCall: { name: "search_sources", args: { query: "הורדוס" }, id: "call-1" }, thoughtSignature: "original-encrypted-signature" };
  const history = [...hi, { role: "model", parts: [signed] }, { role: "user", parts: [{ functionResponse: { name: "search_sources", id: "call-1", response: { results: [] } } }] }];
  assert.deepEqual(validContents(history), history);
  const { call, sent } = setup();
  assert.equal((await call({ characterId: "guide", turnstileToken: "t", contents: history })).status, 200);
  assert.deepEqual(sent[0].contents[1].parts[0], signed);
  assert.equal(validContents([{ role: "user", parts: [{ text: "x", thoughtSignature: "fake" }] }]), null);
});

test("תגובה שלא מגיעה נעצרת בזמן, גם בקריאת הגוף", async () => {
  const { geminiJson, GeminiError } = await import("../src/worker/chat.ts");
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    return await new Promise((_resolve, reject) => init.signal!.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true }));
  }) as typeof fetch;
  try {
    await assert.rejects(geminiJson("https://example.test", {}, 5), (err: unknown) => err instanceof GeminiError && err.status === 504);
  } finally { globalThis.fetch = realFetch; }
});

test("שגיאת בקשה אינה גוררת החלפת מודלים והמתנה נוספת", async () => {
  const { geminiGenerate, GeminiError } = await import("../src/worker/chat.ts");
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => { calls++; return new Response("bad history", { status: 400 }); }) as typeof fetch;
  try {
    resetModelMemo();
    const env = { GEMINI_API_KEY: "k" } as unknown as Env;
    await assert.rejects(geminiGenerate(env, {}), (err: unknown) => err instanceof GeminiError && err.status === 400);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = realFetch; }
});
