// /api/chat: Turnstile רק בפתיחה, הוראות וכלים נקבעים בשרת, ובדיקת ההיסטוריה שהדפדפן שולח.

/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";
import { test } from "node:test";
import { handleChat, MAX_CHAT_CALLS, validContents } from "../src/worker/chat.ts";
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
    SESSIONS: kv,
    CHAT_LIMITER: { limit: async () => ({ success: true }) },
    TURNSTILE_SECRET: "s",
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
  return { call, sent, store };
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
  const { call, store } = setup();
  const { chatId } = await (await call({ characterId: "guide", turnstileToken: "t", contents: hi })).json<any>();
  store.set(`chat:${chatId}`, JSON.stringify({ characterId: "guide", startedAt: 1_000_000, calls: MAX_CHAT_CALLS }));
  const r = await call({ characterId: "guide", chatId, contents: hi });
  assert.equal((await r.json<any>()).error, "chat_ended");
});

test("היסטוריה לא תקינה נדחית", () => {
  assert.equal(validContents([]), null);
  assert.equal(validContents([{ role: "system", parts: [{ text: "x" }] }]), null);
  assert.equal(validContents([{ role: "model", parts: [{ text: "x" }] }]), null, "מתחילה בהודעת התלמיד");
  assert.equal(validContents([{ role: "user", parts: [{ inlineData: {} }] }]), null);
  assert.ok(validContents(hi));
});
