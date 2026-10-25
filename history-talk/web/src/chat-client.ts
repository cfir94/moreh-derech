// הצ'אט בכתב: שולח את ההיסטוריה ל-/api/chat, מריץ בדפדפן את הכלים שהמודל ביקש
// (חיפוש במקורות, מאגר השאלות), ושולח את התוצאות עד שחוזרת תשובה בטקסט.

import { ApiError } from "./live-client.ts";
import type { QuizArgs, QuizItem, QuizShown } from "./quiz.ts";
import type { Passage } from "./search.ts";

type Part =
  | { text: string }
  | { functionCall: { name: string; args?: Record<string, unknown> } }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

interface Content {
  role: "user" | "model";
  parts: Part[];
}

export interface ChatClientOptions {
  characterId: string;
  apiBase: string;
  search: (query: string) => Promise<Passage[]>;
  quiz?: (args: QuizArgs) => Promise<{ items: QuizItem[]; shown: QuizShown[] }>;
  onSources: (passages: Passage[]) => void;
  onQuiz: (questions: QuizShown[]) => void;
}

/** סבבי כלים לכל הודעה, לפני שמוותרים. */
const MAX_TOOL_ROUNDS = 4;
/** כמה תורות אחרונים נשלחים (השרת מקבל עד 80). */
const KEEP = 60;

export class ChatClient {
  private history: Content[] = [];
  private chatId?: string;
  private readonly opts: ChatClientOptions;

  constructor(opts: ChatClientOptions) {
    this.opts = opts;
  }

  get started(): boolean {
    return Boolean(this.chatId);
  }

  /** הודעה מהתלמיד → התשובה בטקסט. ההודעה הראשונה צריכה אסימון Turnstile. */
  async send(text: string, turnstileToken?: string): Promise<string> {
    this.history.push({ role: "user", parts: [{ text: text.slice(0, 2000) }] });
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const parts = await this.request(turnstileToken);
      turnstileToken = undefined;
      if (!parts.length) return "…";
      this.history.push({ role: "model", parts });
      const calls = parts.filter((p): p is Extract<Part, { functionCall: unknown }> => "functionCall" in p);
      if (!calls.length) return parts.map((p) => ("text" in p ? p.text : "")).join("").trim();
      const responses = await Promise.all(calls.map((c) => this.runTool(c.functionCall.name, c.functionCall.args ?? {})));
      this.history.push({ role: "user", parts: responses });
    }
    return "רגע, הסתבכתי בחיפוש. אפשר לנסח את השאלה שוב?";
  }

  private trimmed(): Content[] {
    if (this.history.length <= KEEP) return this.history;
    // מתחילים בהודעה של התלמיד (לא בתשובת כלי), כדי שזוגות קריאה–תשובה יישארו שלמים.
    let i = this.history.length - KEEP;
    while (i < this.history.length && !(this.history[i].role === "user" && "text" in this.history[i].parts[0])) i++;
    return this.history.slice(i);
  }

  private async request(turnstileToken?: string): Promise<Part[]> {
    let res: Response;
    try {
      res = await fetch(`${this.opts.apiBase}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ characterId: this.opts.characterId, chatId: this.chatId, turnstileToken, contents: this.trimmed() }),
      });
    } catch {
      throw new ApiError("network", "אין חיבור לשרת. בדוק את האינטרנט ונסה שוב.");
    }
    const data = (await res.json().catch(() => ({}))) as { chatId?: string; parts?: Part[]; error?: string; messageHe?: string };
    if (!res.ok) {
      this.history.pop(); // ההודעה לא נענתה — אפשר לשלוח אותה שוב
      throw new ApiError(data.error ?? "server", data.messageHe ?? "משהו השתבש. נסה שוב.");
    }
    this.chatId = data.chatId;
    return data.parts ?? [];
  }

  private async runTool(name: string, args: Record<string, unknown>): Promise<Part> {
    try {
      if (name === "quiz_questions" && this.opts.quiz) {
        const { items, shown } = await this.opts.quiz({
          topic: String(args.topic ?? ""),
          count: Number(args.count) || undefined,
          format: args.format === "mc" || args.format === "open" ? args.format : "any",
        });
        if (shown.length) this.opts.onQuiz(shown);
        return { functionResponse: { name, response: items.length ? { questions: items } : { questions: [], note: "אין עוד שאלות על הנושא." } } };
      }
      if (name === "search_sources") {
        const passages = await this.opts.search(String(args.query ?? "").slice(0, 300));
        this.opts.onSources(passages);
        return { functionResponse: { name, response: { results: passages } } };
      }
      return { functionResponse: { name, response: { error: "unknown tool" } } };
    } catch {
      return { functionResponse: { name, response: { error: "המאגר לא נטען כרגע." } } };
    }
  }
}
