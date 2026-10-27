import assert from "node:assert/strict";
import { test } from "node:test";
import { ChatClient } from "../web/src/chat-client.ts";

test("סבב חיפוש בצ'אט מחזיר חתימה ומזהה קריאה ולא מציג אותם למשתמש", async () => {
  const originalFetch = globalThis.fetch;
  const requests: { contents: unknown[] }[] = [];
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    requests.push(JSON.parse(String(init.body)));
    return Response.json(requests.length === 1
      ? { chatId: "chat-1", parts: [{ functionCall: { name: "search_sources", args: { query: "הורדוס" }, id: "call-1" }, thoughtSignature: "signature" }] }
      : { chatId: "chat-1", parts: [{ text: "הורדוס בנה בקיסריה." }] });
  }) as typeof fetch;
  try {
    const client = new ChatClient({ characterId: "guide", apiBase: "", search: async () => [], onSources: () => {}, onQuiz: () => {} });
    assert.equal(await client.send("מי היה הורדוס?", "token"), "הורדוס בנה בקיסריה.");
    const history = requests[1].contents as Array<{ parts: Array<Record<string, unknown>> }>;
    assert.equal(history[1].parts[0].thoughtSignature, "signature");
    assert.deepEqual(history[2].parts[0], { functionResponse: { name: "search_sources", id: "call-1", response: { results: [] } } });
  } finally { globalThis.fetch = originalFetch; }
});

test("סיום שיחה מבטל בקשה ממתינה ומאפשר ניסיון חדש", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    return await new Promise((_resolve, reject) => init.signal!.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true }));
  }) as typeof fetch;
  const client = new ChatClient({ characterId: "guide", apiBase: "", search: async () => [], onSources: () => {}, onQuiz: () => {} });
  try {
    const pending = client.send("שלום", "token");
    client.close();
    await assert.rejects(pending, /התשובה מתעכבת/);
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      assert.equal(body.contents.length, 1, "ההודעה שבוטלה לא נשארת בהיסטוריה");
      return Response.json({ chatId: "new", parts: [{ text: "שלום!" }] });
    }) as typeof fetch;
    assert.equal(await client.send("שלום שוב", "token-2"), "שלום!");
  } finally { globalThis.fetch = originalFetch; }
});
