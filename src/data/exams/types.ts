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
};

export type Exam = {
  slug: string;
  label: Localized;
  date: string;
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
