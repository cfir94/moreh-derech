// מאגר השאלות של מורה הדרך, בדפדפן: הכלי quiz_questions. השאלות נוצרות מהאתר
// (tools/export_guide_knowledge.mjs) ונטענות בעצלתיים בפעם הראשונה שמבקשים בוחן.
// בכל שיחה שאלה לא חוזרת; מתוך השאלות שמתאימות לנושא נבחרות שאלות אקראיות, כדי שבוחן חוזר
// על אותו נושא לא יפתח תמיד באותן שאלות.

import MiniSearch from "minisearch";
import { processTerm, tokenize } from "./shared/hebrew.mjs";

export interface BankQuestion {
  id: string;
  quiz: string;
  category: string;
  topic: string;
  question: string;
  /** שאלה אמריקאית: האפשרויות ואינדקס התשובה הנכונה. */
  options?: string[];
  correct?: number;
  /** שאלה פתוחה או השלמה: התשובה ("/" מפריד בין נוסחים קבילים). */
  answer?: string;
  explanation: string;
  /** אמינות התשובה, כשאינה מפתח רשמי. */
  note?: string;
  url: string;
}

export type QuizFormat = "mc" | "open" | "any";

export interface QuizArgs {
  topic?: string;
  count?: number;
  format?: QuizFormat;
}

/** מה שהמודל מקבל: השאלה, האפשרויות עם אותיות, התשובה וההסבר. */
export interface QuizItem {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  from: string;
  note?: string;
}

/** מה שמוצג לתלמיד בצד: השאלה והאפשרויות, בלי התשובה. */
export interface QuizShown {
  ref: string;
  url: string;
  question: string;
  options?: string[];
}

export const MAX_QUESTIONS = 5;
/** מתוך כמה מההתאמות הטובות ביותר מגרילים. */
const POOL = 40;
const LETTERS = ["א", "ב", "ג", "ד", "ה", "ו"];

export function toItem(q: BankQuestion): QuizItem {
  const options = q.options?.map((o, i) => `${LETTERS[i]}. ${o}`);
  const answer = options && q.correct !== undefined ? options[q.correct] : (q.answer ?? "");
  return {
    question: q.question,
    ...(options ? { options } : {}),
    answer,
    ...(q.explanation ? { explanation: q.explanation } : {}),
    from: [q.quiz, q.category].filter(Boolean).join(" · "),
    ...(q.note ? { note: q.note } : {}),
  };
}

const fits = (q: BankQuestion, format: QuizFormat) => format === "any" || (format === "mc") === Boolean(q.options);

export class QuizBank {
  private data?: Promise<{ questions: BankQuestion[]; ms: MiniSearch<BankQuestion> }>;
  private readonly asked = new Set<string>();
  private readonly url: string;
  private readonly random: () => number;

  constructor(url: string, random: () => number = Math.random) {
    this.url = url;
    this.random = random;
  }

  load() {
    this.data ??= fetch(this.url)
      .then((r) => {
        if (!r.ok) throw new Error(`questions ${r.status}`);
        return r.json() as Promise<{ questions: BankQuestion[] }>;
      })
      .then(({ questions }) => QuizBank.index(questions));
    this.data.catch(() => (this.data = undefined));
    return this.data;
  }

  static index(questions: BankQuestion[]) {
    const ms = new MiniSearch<BankQuestion>({
      fields: ["question", "options", "category", "quiz", "topic", "answer"],
      storeFields: [],
      extractField: (doc, field) => {
        const v = (doc as unknown as Record<string, unknown>)[field];
        return Array.isArray(v) ? v.join(" ") : String(v ?? "");
      },
      tokenize,
      processTerm,
      searchOptions: {
        boost: { category: 2, quiz: 1.5, topic: 1.5, question: 1.2 },
        // בלי fuzzy: "קיסרים" ו"קיסריה" רחוקות באות אחת, ובבוחן זו כבר שאלה על נושא אחר.
        prefix: (t) => t.length >= 5,
      },
    });
    ms.addAll(questions);
    return { questions, ms };
  }

  /** בשביל בדיקות: מאגר מוכן בלי fetch. */
  static fromQuestions(questions: BankQuestion[], random?: () => number): QuizBank {
    const bank = new QuizBank("", random);
    bank.data = Promise.resolve(QuizBank.index(questions));
    return bank;
  }

  async pick(args: QuizArgs): Promise<{ items: QuizItem[]; shown: QuizShown[] }> {
    const { questions, ms } = await this.load();
    const count = Math.max(1, Math.min(MAX_QUESTIONS, Math.round(Number(args.count) || 3)));
    const format: QuizFormat = args.format === "mc" || args.format === "open" ? args.format : "any";
    const topic = String(args.topic ?? "").trim().slice(0, 200);
    const byId = new Map(questions.map((q) => [q.id, q]));

    const fresh = (q: BankQuestion | undefined): q is BankQuestion => !!q && !this.asked.has(q.id) && fits(q, format);
    let pool: BankQuestion[];
    if (topic) {
      // עדיפות לשאלות שמכסות יותר ממילות הנושא, ואחר כך לפי הציון.
      const words = new Map<string, number>();
      tokenize(topic).forEach((w, i) => {
        for (const v of processTerm(w) ?? []) if (!words.has(v)) words.set(v, i);
      });
      const hits = ms
        .search(topic)
        .map((r) => ({ q: byId.get(String(r.id)), score: r.score, cover: new Set(r.queryTerms.map((t) => words.get(t))).size }))
        .filter((h) => fresh(h.q))
        .sort((a, b) => b.cover - a.cover || b.score - a.score);
      pool = hits.slice(0, POOL).map((h) => h.q!);
    } else pool = questions.filter(fresh);

    const picked: BankQuestion[] = [];
    while (picked.length < count && pool.length) picked.push(pool.splice(Math.floor(this.random() * pool.length), 1)[0]);
    for (const q of picked) this.asked.add(q.id);
    return {
      items: picked.map(toItem),
      shown: picked.map((q) => ({
        ref: [q.quiz, q.category].filter(Boolean).join(" · "),
        url: q.url,
        question: q.question,
        ...(q.options ? { options: q.options } : {}),
      })),
    };
  }
}
