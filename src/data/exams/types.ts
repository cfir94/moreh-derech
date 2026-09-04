export const EXAM_LANGS = ["he", "en", "ar"] as const;
export type ExamLang = (typeof EXAM_LANGS)[number];

/** The same text as printed in each of the exam's three official editions. */
export type Localized = Record<ExamLang, string>;

/**
 * One numbered exam item, exactly as the Ministry prints it: a fill-in-the-blank
 * statement followed by a four-option comprehension question. Only the second
 * half is graded; the first is shown for context and its official answer is
 * revealed with the results.
 */
export type ExamQuestion = {
  number: number;
  /** Id of the same question inside the past-exams practice quiz, so a mistake
   *  made here joins the ordinary review queue. */
  quizId: number;
  statement: Localized;
  statementAnswer: Localized;
  question: Localized;
  answers: { text: Localized }[];
  correctIndex: number;
  /** Subject from the licensing syllabus (`src/data/topics.ts`). */
  topic?: string;
  /** "fill" items are answered by typing; they have no options. */
  kind?: "mc" | "fill";
  /** The expected text of a fill-in answer; "/" separates accepted variants. */
  answerText?: string;
  /** Why that is the answer. The course's exams carry one; the Ministry's do not. */
  explanation?: string;
  /**
   * Only on a sitting whose key was worked out rather than published:
   * h = certain, m = fairly sure, l = worth checking against a source.
   */
  confidence?: "h" | "m" | "l";
};

export type Exam = {
  slug: string;
  label: Localized;
  date: string;
  /** Editions whose text came out of the PDFs complete and clean. */
  languages: ExamLang[];
  /**
   * "official" — the Ministry's own key marks the answer in the PDF.
   * "derived"  — no key was ever published for this sitting and the answers
   *              were worked out by hand. Shown as unofficial throughout.
   * "course"   — a practice exam written for the course, not a Ministry paper.
   */
  keySource: "official" | "derived" | "course";
  questions: ExamQuestion[];
};

export const LANG_META: Record<
  ExamLang,
  { name: string; dir: "rtl" | "ltr"; flag: string }
> = {
  he: { name: "עברית", dir: "rtl", flag: "🇮🇱" },
  en: { name: "English", dir: "ltr", flag: "🇬🇧" },
  ar: { name: "العربية", dir: "rtl", flag: "🇸🇦" },
};
