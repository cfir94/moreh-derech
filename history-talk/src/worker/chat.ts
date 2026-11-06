// צ'אט בכתב (/api/chat): אותה דמות, אותן הוראות ואותם כלים — דרך generateContent, בלי קול.
// השרת לא שומר את השיחה: הדפדפן שולח את ההיסטוריה בכל בקשה, ומריץ בעצמו את הכלים
// (החיפוש במקורות ומאגר השאלות יושבים בדפדפן), ואז שולח את התוצאה בבקשה הבאה.
// ההוראות והכלים נקבעים כאן בלבד. שיחה נפתחת ב-Turnstile. מצב השיחה (דמות, התחלה, מונה) נשמר
// באסימון חתום (HMAC) שחוזר לדפדפן בכל תשובה, ולא ב-KV: ל-KV יש בתוכנית החינמית רק 1,000
// כתיבות ביום לכל החשבון, וכתיבה לכל הודעה הפילה את מוטי בשעות העומס.

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

export interface ChatRecord {
  characterId: string;
  startedAt: number;
  calls: number;
}

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (text: string) =>
  Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function hmac(secret: string, payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(`chat-ticket:${secret}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

/** אסימון השיחה: `<payload>.<חתימה>`. הדפדפן מחזיר אותו בכל הודעה ומקבל אסימון חדש עם המונה המעודכן. */
export async function signTicket(secret: string, chat: ChatRecord): Promise<string> {
  const payload = b64url(new TextEncoder().encode(JSON.stringify([chat.characterId, chat.startedAt, chat.calls])));
  return `${payload}.${b64url(await hmac(secret, payload))}`;
}

/** אסימון לא חתום, מזויף או פגום מחזיר null. השוואת החתימה אינה תלויה בזמן. */
export async function readTicket(secret: string, ticket: string): Promise<ChatRecord | null> {
  if (ticket.length > 400) return null;
  const [payload, sig, extra] = ticket.split(".");
  if (!payload || !sig || extra !== undefined) return null;
  try {
    const expected = await hmac(secret, payload);
    const given = fromB64url(sig);
    if (given.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ given[i];
    if (diff) return null;
    const [characterId, startedAt, calls] = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (typeof characterId !== "string" || !Number.isFinite(startedAt) || !Number.isInteger(calls)) return null;
    return { characterId, startedAt, calls };
  } catch {
    return null;
  }
}

type Part = (
  | { text: string }
  | { functionCall: { name: string; args?: Record<string, unknown>; id?: string } }
  | { functionResponse: { name: string; response: Record<string, unknown>; id?: string } }
) & { thoughtSignature?: string };

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
      // Gemini 3+ דורש להחזיר את החתימה המקורית אחרי קריאה לכלי.
      if (p.thoughtSignature !== undefined) {
        if (typeof p.thoughtSignature !== "string" || c.role !== "model") return null;
        parts[parts.length - 1].thoughtSignature = p.thoughtSignature;
      }
      const part = parts[parts.length - 1];
      if ("functionCall" in part && typeof p.functionCall.id === "string") part.functionCall.id = p.functionCall.id;
      if ("functionResponse" in part && typeof p.functionResponse.id === "string") part.functionResponse.id = p.functionResponse.id;
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
  /** 429 בגלל המכסה היומית (ולא הדקתית): אין טעם לנסות את המודל הזה שוב עד האיפוס. */
  readonly daily: boolean;
  constructor(status: number, message: string, daily = false) {
    super(message);
    this.status = status;
    this.daily = daily;
  }
}

const API = "https://generativelanguage.googleapis.com/v1beta";

/** כולל קריאת גוף התשובה: ספק שאינו משלים תשובה לא מעכב את כל ניסיונות הגיבוי. */
export async function geminiJson(url: string, init: RequestInit, timeoutMs = 10_000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      // ב-429 גוף השגיאה אומר איזו מכסה נגמרה (למשל GenerateRequestsPerDayPerProjectPerModel-FreeTier).
      const detail = res.status === 429 ? await res.text().catch(() => "") : "";
      throw new GeminiError(res.status, `Gemini ${res.status}`, /PerDay/i.test(detail));
    }
    return await res.json();
  } catch (err) {
    if (controller.signal.aborted) throw new GeminiError(504, "Gemini response timed out");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

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
  const data = await geminiJson(`${API}/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify(body),
  }) as { candidates?: { content?: { parts?: Part[] } }[] };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  if (!parts.some(p => "functionCall" in p || ("text" in p && !(p as { thought?: boolean }).thought && p.text.trim()))) {
    throw new GeminiError(502, "Gemini returned no reply");
  }
  return parts;
}

/** עומס זמני או מודל שאינו זמין: כדאי לנסות מודל אחר. */
const RETRY = new Set([404, 429, 500, 502, 503, 504]);
const MAX_MODELS = 3;

/**
 * זיכרון של ה-isolate (לא KV): המודל שעבד לאחרונה, ומודלים שנחסמו. מכסה יומית של Gemini מתאפסת
 * בחצות שעון פסיפיק (08:00 UTC בחורף, 07:00 בקיץ; שעה של חסימה מיותרת בקיץ זה מחיר סביר).
 * מכסה דקתית נחסמת לדקה.
 */
const memo = { preferred: "", blockedUntil: new Map<string, number>() };

export function resetModelMemo() {
  memo.preferred = "";
  memo.blockedUntil.clear();
}

export function nextQuotaReset(now: number): number {
  const reset = new Date(now);
  reset.setUTCHours(8, 0, 0, 0);
  if (reset.getTime() <= now) reset.setUTCDate(reset.getUTCDate() + 1);
  return reset.getTime();
}

/**
 * סדר הניסיונות: המודל שעבד בפעם הקודמת, ואחריו המודל שהוגדר. בתוכנית החינמית Flash-Lite קודם, כי
 * המכסה היומית שלו גבוהה בהרבה (Flash מקבל כ-20 בקשות ביום לפרויקט). אחריו Flash כגיבוי, ואחר כך
 * רשימת המודלים הזמינים. מודל חסום מדולג עד שהחסימה פגה. עד שלושה ניסיונות עם זמן קצוב.
 */
export const geminiGenerate: GenerateFn = async (env, body) => {
  const now = Date.now();
  const configured = env.GEMINI_CHAT_MODEL || "gemini-flash-lite-latest";
  const usable = (m: string) => (memo.blockedUntil.get(m) ?? 0) <= now;
  const tried: string[] = [];
  let queue = [memo.preferred, configured, "gemini-flash-lite-latest", "gemini-flash-latest"].filter(Boolean);
  let listed = false;
  let lastError: unknown;
  let allDaily = true;
  while (tried.length < MAX_MODELS) {
    const model = queue.find((m) => !tried.includes(m) && usable(m));
    if (!model) {
      if (listed) break;
      listed = true;
      try {
        const list = await geminiJson(`${API}/models?pageSize=200`, { headers: { "x-goog-api-key": env.GEMINI_API_KEY } }, 3_000) as { models?: { name: string }[] };
        queue = rankFlashModels(list.models ?? []);
      } catch {
        break;
      }
      continue;
    }
    tried.push(model);
    try {
      const parts = await callModel(env, model, body);
      memo.preferred = model;
      return { parts };
    } catch (err) {
      lastError = err;
      if (!(err instanceof GeminiError) || !RETRY.has(err.status)) throw err;
      if (err.status === 429) memo.blockedUntil.set(model, err.daily ? nextQuotaReset(now) : now + 60_000);
      if (!(err.status === 429 && err.daily)) allDaily = false;
      if (memo.preferred === model) memo.preferred = "";
      console.error(JSON.stringify({ event: "chat_model_retry", model, status: err.status, daily: err instanceof GeminiError && err.daily }));
    }
  }
  if (!tried.length) {
    // כל המודלים כבר חסומים. חסימה ארוכה מכמה דקות היא מכסה יומית.
    const longest = Math.max(0, ...memo.blockedUntil.values());
    throw new GeminiError(429, "all models blocked", longest - now > 5 * 60_000);
  }
  if (allDaily && lastError instanceof GeminiError && lastError.status === 429) {
    throw new GeminiError(429, "daily quota exhausted", true);
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
  const secret = env.TURNSTILE_SECRET;
  const ticket = typeof body.chatId === "string" ? body.chatId : "";
  let chat = ticket ? await readTicket(secret, ticket) : null;
  if (ticket && (!chat || chat.characterId !== characterId || chat.calls >= MAX_CHAT_CALLS || now > chat.startedAt + CHAT_HOURS * 3_600_000)) {
    return errorResponse("chat_ended", cors);
  }
  if (!chat) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : undefined;
    if (!(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET, deps.fetcher))) return errorResponse("turnstile_failed", cors);
    chat = { characterId, startedAt: now, calls: 0 };
    recordStat(characterId, now);
  }

  let parts: Part[];
  try {
    ({ parts } = await deps.generate(env, chatRequestBody(character, contents)));
  } catch (err) {
    console.error(JSON.stringify({ event: "chat_error", message: (err as Error).message?.slice(0, 300) }));
    const status = err instanceof GeminiError ? err.status : 0;
    if (err instanceof GeminiError && err.daily) return errorResponse("daily_exhausted", cors);
    // 429 = מכסת הקצב של Gemini; הקוד מוצג בהודעה כדי שאפשר יהיה לאבחן תקלה.
    return errorResponse(status === 429 ? "rate_limited" : "gemini_unavailable", cors, status ? `Gemini ${status}` : undefined);
  }
  const chatId = await signTicket(secret, { ...chat, calls: chat.calls + 1 });

  // רק טקסט וקריאות לכלים חוזרים לדפדפן (בלי "מחשבות" של המודל).
  const reply = parts.filter((p) => ("text" in p && !(p as { thought?: boolean }).thought) || "functionCall" in p);
  return Response.json({ chatId, parts: reply }, { headers: { ...cors, "Cache-Control": "no-store" } });
}
