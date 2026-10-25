// החיבור ל-Gemini Live: אסימון מהשרת, חיבור, שליחה וקבלה, הכלים search_sources ו-quiz_questions,
// תמלול, וחיבור מחדש עם sessionResumption כשמגיע goAway או כשהחיבור נקטע.

import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";
import type { QuizArgs, QuizItem, QuizShown } from "./quiz.ts";
import type { Passage } from "./search.ts";

export interface TokenInfo {
  token: string;
  model: string;
  apiVersion: string;
  expiresAt: string;
  maxSessionMinutes: number;
  sessionId: string;
  startedAt: number;
  resumesLeft: number;
}

export class ApiError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export type LiveEvent =
  | { type: "status"; status: "connecting" | "live" | "reconnecting" | "closed" }
  | { type: "audio"; pcm: Int16Array }
  | { type: "interrupted" }
  | { type: "turnComplete" }
  | { type: "transcript"; who: "user" | "model"; text: string }
  | { type: "sources"; passages: Passage[] }
  | { type: "quiz"; questions: QuizShown[] }
  | { type: "error"; code: string; message: string };

export interface LiveClientOptions {
  characterId: string;
  apiBase: string;
  search: (query: string) => Promise<Passage[]>;
  /** מאגר השאלות — רק למורה הדרך. */
  quiz?: (args: QuizArgs) => Promise<{ items: QuizItem[]; shown: QuizShown[] }>;
  onEvent: (e: LiveEvent) => void;
}

const KICKOFF = "(הגולש הצטרף עכשיו לשיחה. פתח במשפט הפתיחה שלך, בעברית.)";
const FAREWELL = '(הזמן תם. היפרד מהגולש במשפט אחד קצר בלבד, למשל: "הזמן שלנו תם. שוב תבוא לשאול.")';

export function base64FromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function pcm16FromBase64(b64: string): Int16Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  // PCM16 little-endian; כל מעבדי הדפדפן הנפוצים הם little-endian.
  return new Int16Array(bytes.buffer, 0, bytes.length >> 1);
}

export class LiveClient {
  private readonly opts: LiveClientOptions;
  private session?: Session;
  private info?: TokenInfo;
  private handle?: string;
  private closedByUs = false;
  private reconnecting = false;
  private ending = false;
  /** מונה חיבורים: אירועי סגירה של חיבור ישן (אחרי חידוש) לא נוגעים בחדש. */
  private gen = 0;

  constructor(opts: LiveClientOptions) {
    this.opts = opts;
  }

  get tokenInfo(): TokenInfo | undefined {
    return this.info;
  }

  private async requestToken(body: object): Promise<TokenInfo> {
    let res: Response;
    try {
      res = await fetch(`${this.opts.apiBase}/api/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: this.opts.characterId, ...body }),
      });
    } catch {
      throw new ApiError("network", "אין חיבור לשרת. בדוק את החיבור לאינטרנט ונסה שוב.");
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string; messageHe?: string };
    if (!res.ok) throw new ApiError(data.error ?? "server", data.messageHe ?? "השרת לא זמין כרגע.");
    return data as TokenInfo;
  }

  /** שיחה חדשה: אסימון (עם Turnstile) ואז חיבור. */
  async start(turnstileToken: string): Promise<TokenInfo> {
    this.closedByUs = false;
    this.ending = false;
    this.handle = undefined;
    this.opts.onEvent({ type: "status", status: "connecting" });
    this.info = await this.requestToken({ turnstileToken });
    await this.connect(false);
    return this.info;
  }

  private async connect(resuming: boolean): Promise<void> {
    const info = this.info!;
    const myGen = ++this.gen;
    const ai = new GoogleGenAI({ apiKey: info.token, httpOptions: { apiVersion: info.apiVersion } });
    let opened = false;
    this.session = await ai.live.connect({
      model: info.model,
      // ההגדרות האמיתיות נעולות באסימון; השרת קבע אותן.
      config: { responseModalities: [Modality.AUDIO] },
      callbacks: {
        onopen: () => {
          opened = true;
        },
        onmessage: (msg) => this.onMessage(msg),
        onerror: () => {
          /* הטיפול ב-onclose */
        },
        onclose: (e) => {
          if (myGen === this.gen) this.onClose(e, opened);
        },
      },
    });
    this.opts.onEvent({ type: "status", status: "live" });
    if (!resuming) this.session.sendRealtimeInput({ text: KICKOFF });
  }

  private onMessage(msg: LiveServerMessage): void {
    const sc = msg.serverContent;
    if (sc) {
      if (sc.interrupted) this.opts.onEvent({ type: "interrupted" });
      for (const part of sc.modelTurn?.parts ?? []) {
        const data = part.inlineData?.data;
        if (data && part.inlineData?.mimeType?.startsWith("audio/")) {
          this.opts.onEvent({ type: "audio", pcm: pcm16FromBase64(data) });
        }
      }
      if (sc.inputTranscription?.text) this.opts.onEvent({ type: "transcript", who: "user", text: sc.inputTranscription.text });
      if (sc.outputTranscription?.text) this.opts.onEvent({ type: "transcript", who: "model", text: sc.outputTranscription.text });
      if (sc.turnComplete) {
        this.opts.onEvent({ type: "turnComplete" });
        if (this.ending) this.close();
      }
    }
    if (msg.toolCall?.functionCalls?.length) void this.onToolCall(msg.toolCall.functionCalls);
    if (msg.sessionResumptionUpdate?.resumable && msg.sessionResumptionUpdate.newHandle) {
      this.handle = msg.sessionResumptionUpdate.newHandle;
    }
    if (msg.goAway) void this.resume();
  }

  private async onToolCall(calls: { id?: string; name?: string; args?: Record<string, unknown> }[]) {
    const functionResponses = await Promise.all(
      calls.map(async (fc) => {
        if (fc.name === "quiz_questions" && this.opts.quiz) return { id: fc.id, name: fc.name, response: await this.quiz(fc.args ?? {}) };
        if (fc.name !== "search_sources") {
          return { id: fc.id, name: fc.name, response: { error: "unknown tool" } };
        }
        const query = String(fc.args?.query ?? "").slice(0, 300);
        try {
          const passages = await this.opts.search(query);
          this.opts.onEvent({ type: "sources", passages });
          return {
            id: fc.id,
            name: fc.name,
            response: passages.length ? { results: passages } : { results: [], note: "לא נמצאו קטעים. נסה מילות מפתח אחרות, או אמור שאין לך מקור." },
          };
        } catch {
          return { id: fc.id, name: fc.name, response: { error: "המאגר לא נטען. אמור שאינך יכול לבדוק במקורות כרגע." } };
        }
      }),
    );
    this.session?.sendToolResponse({ functionResponses });
  }

  private onClose(e: CloseEvent, opened: boolean): void {
    if (this.closedByUs) return;
    if (!opened) {
      // החיבור נדחה לפני שנפתח — בדרך כלל אסימון שפג או גרסת API לא נכונה.
      this.fail("gemini_unavailable", "לא הצלחנו להתחבר ל-Gemini. נסה שוב בעוד כמה דקות.");
      return;
    }
    if (e.code !== 1000) void this.resume();
    else this.finish();
  }

  private async quiz(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const { items, shown } = await this.opts.quiz!({
        topic: String(args.topic ?? ""),
        count: Number(args.count) || undefined,
        format: args.format === "mc" || args.format === "open" ? args.format : "any",
      });
      if (shown.length) this.opts.onEvent({ type: "quiz", questions: shown });
      return items.length
        ? { questions: items, note: "התשובה וההסבר בשבילך בלבד. שאל שאלה אחת בכל פעם, וחכה לתשובת התלמיד." }
        : { questions: [], note: "אין עוד שאלות על הנושא הזה. נסה נושא קרוב, או נסח שאלה משלך מתוך search_sources ואמור שהיא שלך." };
    } catch {
      return { error: "מאגר השאלות לא נטען. אפשר לנסח שאלות משלך מתוך search_sources, ולומר שהן שלך." };
    }
  }

  /** חידוש השיחה עם אסימון חדש וה-handle האחרון. */
  private async resume(): Promise<void> {
    if (this.reconnecting || this.closedByUs || this.ending) return;
    const info = this.info;
    if (!info || !this.handle || info.resumesLeft <= 0) {
      this.fail("disconnected", "החיבור נקטע. אפשר להתחיל שיחה חדשה.");
      return;
    }
    this.reconnecting = true;
    this.opts.onEvent({ type: "status", status: "reconnecting" });
    const old = this.session;
    this.session = undefined;
    this.gen++;
    try {
      old?.close();
    } catch {
      /* כבר סגור */
    }
    try {
      const next = await this.requestToken({ resume: { sessionId: info.sessionId, handle: this.handle } });
      this.info = next;
      await this.connect(true);
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError("disconnected", "החיבור נקטע. אפשר להתחיל שיחה חדשה.");
      this.fail(e.code, e.message);
    } finally {
      this.reconnecting = false;
    }
  }

  private fail(code: string, message: string): void {
    this.opts.onEvent({ type: "error", code, message });
    this.close();
  }

  private finish(): void {
    this.opts.onEvent({ type: "status", status: "closed" });
  }

  sendAudio(pcm: ArrayBuffer): void {
    if (!this.session || this.reconnecting) return;
    this.session.sendRealtimeInput({ audio: { data: base64FromBytes(new Uint8Array(pcm)), mimeType: "audio/pcm;rate=16000" } });
  }

  sendText(text: string): void {
    this.session?.sendRealtimeInput({ text });
  }

  /** סוף הזמן: הדמות נפרדת במשפט אחד, ואז סוגרים (או אחרי 15 שניות לכל היותר). */
  farewell(): void {
    if (this.ending || !this.session) return this.close();
    this.ending = true;
    this.session.sendRealtimeInput({ text: FAREWELL });
    setTimeout(() => this.close(), 15_000);
  }

  close(): void {
    if (this.closedByUs) return;
    this.closedByUs = true;
    this.gen++;
    try {
      this.session?.close();
    } catch {
      /* כבר סגור */
    }
    this.session = undefined;
    this.finish();
  }
}
