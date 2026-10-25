// צ'אט בכתב (/api/chat): אותה דמות, אותן הוראות ואותם כלים — דרך generateContent, בלי קול.
// השרת לא שומר את השיחה: הדפדפן שולח את ההיסטוריה בכל בקשה, ומריץ בעצמו את הכלים
// (החיפוש במקורות ומאגר השאלות יושבים בדפדפן), ואז שולח את התוצאה בבקשה הבאה.
// ההוראות והכלים נקבעים כאן בלבד. שיחה נפתחת ב-Turnstile ונשמרת ב-KV עם מונה בקשות.

import {
  allowedOrigin,
  corsHeaders,
  countryBlocked,
  errorResponse,
  hashIp,
  recordStat,
  verifyTurnstile,
  type Env,
} from "./guards.ts";
import { buildSystemInstruction, QUIZ_TOOL, SEARCH_TOOL, type ServerCharacter } from "./prompt.ts";

/** בקשות מותרות לשיחת צ'אט אחת (כל הודעה = בקשה, ועוד אחת לכל סבב של כלים). */
export const MAX_CHAT_CALLS = 150;
export const CHAT_HOURS = 3;
const MAX_CONTENTS = 80;
const MAX_CHARS = 60_000;

interface ChatRecord {
  characterId: string;
  startedAt: number;
  calls: number;
}

type Part =
  | { text: string }
  | { functionCall: { name: string; args?: Record<string, unknown> } }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

export interface Content {
  role: "user" | "model";
  parts: Part[];
}

export type GenerateFn = (env: Env, body: object) => Promise<{ parts: Part[] }>;

export const CHAT_RULES = `שים לב — הפעם זו שיחה בכתב (צ'אט), לא בקול. כל ההוראות למעלה בתוקף, חוץ מאלה:
- כתוב תשובות קצרות וברורות: בדרך כלל עד ארבעה משפטים. בלי כותרות ובלי markdown; מותר לשבור שורה.
- שאלה אמריקאית בבוחן: השאלה בשורה אחת, וכל אפשרות בשורה משלה עם האות שלה (א. / ב. / ג. / ד.).
- אל תתאר קולות, צחוק או השתהות; את האופי תביע במילים.`;

/** בדיקת מבנה ההיסטוריה שהדפדפן שלח: רק תפקידים וחלקים מוכרים, בגודל סביר. */
export function validContents(raw: unknown): Content[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_CONTENTS) return null;
  if (JSON.stringify(raw).length > MAX_CHARS) return null;
  const out: Content[] = [];
  for (const c of raw) {
    if (!c || (c.role !== "user" && c.role !== "model") || !Array.isArray(c.parts) || !c.parts.length) return null;
    const parts: Part[] = [];
    for (const p of c.parts) {
      if (typeof p?.text === "string") parts.push({ text: p.text });
      else if (p?.functionCall && typeof p.functionCall.name === "string") {
        parts.push({ functionCall: { name: p.functionCall.name, args: p.functionCall.args ?? {} } });
      } else if (p?.functionResponse && typeof p.functionResponse.name === "string" && typeof p.functionResponse.response === "object") {
        parts.push({ functionResponse: { name: p.functionResponse.name, response: p.functionResponse.response } });
      } else return null;
    }
    out.push({ role: c.role, parts });
  }
  return out[0].role === "user" ? out : null;
}

export function chatRequestBody(character: ServerCharacter, contents: Content[]): object {
  const tools = character.kind === "guide" ? [SEARCH_TOOL, QUIZ_TOOL] : [SEARCH_TOOL];
  return {
    systemInstruction: { parts: [{ text: `${buildSystemInstruction(character)}\n\n${CHAT_RULES}` }] },
    contents,
    tools: [{ functionDeclarations: tools }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 1200 },
  };
}

export class GeminiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const API = "https://generativelanguage.googleapis.com/v1beta";

/**
 * מודלי Flash שזמינים למפתח, לפי סדר עדיפות: יציב לפני preview, גרסה גבוהה לפני נמוכה,
 * ו-Flash מלא לפני Flash-Lite (שנשאר גיבוי כשהמודלים הגדולים עמוסים).
 */
export function rankFlashModels(models: { name: string; supportedGenerationMethods?: string[] }[]): string[] {
  const usable = models
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""))
    .filter((n) => /flash/.test(n) && !/(live|tts|image|audio|embed|thinking|exp)/.test(n));
  const version = (n: string) => Number(n.match(/gemini-(\d+(?:\.\d+)?)/)?.[1] ?? 0);
  const rank = (n: string) => Number(/lite/.test(n)) * 2 + Number(/preview/.test(n));
  return usable.sort((a, b) => rank(a) - rank(b) || version(b) - version(a));
}

async function callModel(env: Env, model: string, body: object): Promise<Part[]> {
  const res = await fetch(`${API}/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new GeminiError(res.status, `${model} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { candidates?: { content?: { parts?: Part[] } }[] };
  return data.candidates?.[0]?.content?.parts ?? [];
}

/** עומס זמני או מודל שאינו זמין: כדאי לנסות מודל אחר. */
const RETRY = new Set([400, 404, 429, 500, 503]);
const MAX_MODELS = 3;

/**
 * קודם המודל שנבחר בפעם הקודמת (או זה שהוגדר). אם הוא עמוס (503/500/429) או לא קיים (404/400) —
 * עוברים למודלי Flash אחרים מתוך רשימת המודלים של המפתח, עד שלושה ניסיונות. מודל שעבד נשמר לשעה.
 */
export const geminiGenerate: GenerateFn = async (env, body) => {
  const first = (await env.SESSIONS.get("chat-model")) || env.GEMINI_CHAT_MODEL || "gemini-flash-latest";
  const tried: string[] = [];
  let queue = [first];
  let listed = false;
  let lastError: unknown;
  while (tried.length < MAX_MODELS) {
    const model = queue.find((m) => !tried.includes(m));
    if (!model) {
      if (listed) break;
      listed = true;
      const list = await fetch(`${API}/models?pageSize=200`, { headers: { "x-goog-api-key": env.GEMINI_API_KEY } });
      if (!list.ok) break;
      queue = rankFlashModels(((await list.json()) as { models?: { name: string }[] }).models ?? []);
      continue;
    }
    tried.push(model);
    try {
      const parts = await callModel(env, model, body);
      if (model !== first) await env.SESSIONS.put("chat-model", model, { expirationTtl: 3600 });
      return { parts };
    } catch (err) {
      lastError = err;
      if (!(err instanceof GeminiError) || !RETRY.has(err.status)) throw err;
      console.error(JSON.stringify({ event: "chat_model_retry", message: err.message }));
    }
  }
  throw lastError ?? new GeminiError(503, "no flash model available");
};

interface ChatBody {
  characterId?: unknown;
  turnstileToken?: unknown;
  chatId?: unknown;
  contents?: unknown;
}

export async function handleChat(
  request: Request,
  env: Env,
  deps: { characters: Record<string, ServerCharacter>; fetcher: typeof fetch; now: () => number; generate: GenerateFn },
): Promise<Response> {
  const origin = allowedOrigin(request, env);
  const cors = corsHeaders(origin);
  if (!origin) return errorResponse("forbidden_origin", cors);

  let body: ChatBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse("bad_request", cors);
  }
  const characterId = typeof body.characterId === "string" ? body.characterId : "";
  const character = Object.hasOwn(deps.characters, characterId) ? deps.characters[characterId] : undefined;
  if (!character) return errorResponse("unknown_character", cors);
  if (countryBlocked(request, env)) return errorResponse("country_blocked", cors);
  const contents = validContents(body.contents);
  if (!contents) return errorResponse("bad_request", cors);

  const ip = request.headers.get("CF-Connecting-IP");
  const ipHash = await hashIp(ip ?? "unknown", env.TURNSTILE_SECRET);
  if (!(await env.CHAT_LIMITER.limit({ key: ipHash })).success) return errorResponse("rate_limited", cors);

  const now = deps.now();
  let chatId = typeof body.chatId === "string" ? body.chatId : "";
  let chat = chatId ? await env.SESSIONS.get<ChatRecord>(`chat:${chatId}`, "json") : null;
  if (chatId && (!chat || chat.characterId !== characterId || chat.calls >= MAX_CHAT_CALLS || now > chat.startedAt + CHAT_HOURS * 3_600_000)) {
    return errorResponse("chat_ended", cors);
  }
  if (!chat) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : undefined;
    if (!(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET, deps.fetcher))) return errorResponse("turnstile_failed", cors);
    chatId = crypto.randomUUID();
    chat = { characterId, startedAt: now, calls: 0 };
    await recordStat(env.SESSIONS, characterId, now);
  }

  let parts: Part[];
  try {
    ({ parts } = await deps.generate(env, chatRequestBody(character, contents)));
  } catch (err) {
    console.error(JSON.stringify({ event: "chat_error", message: (err as Error).message?.slice(0, 300) }));
    const status = err instanceof GeminiError ? err.status : 0;
    // 429 = מכסת הקצב של Gemini; הקוד מוצג בהודעה כדי שאפשר יהיה לאבחן תקלה.
    return errorResponse(status === 429 ? "rate_limited" : "gemini_unavailable", cors, status ? `Gemini ${status}` : undefined);
  }
  chat = { ...chat, calls: chat.calls + 1 };
  await env.SESSIONS.put(`chat:${chatId}`, JSON.stringify(chat), { expirationTtl: CHAT_HOURS * 3600 });

  // רק טקסט וקריאות לכלים חוזרים לדפדפן (בלי "מחשבות" של המודל).
  const reply = parts.filter((p) => ("text" in p && !(p as { thought?: boolean }).thought) || "functionCall" in p);
  return Response.json({ chatId, parts: reply }, { headers: { ...cors, "Cache-Control": "no-store" } });
}
