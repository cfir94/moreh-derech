/**
 * סיכומי הנושאים שלנו (/summaries/<key>), במקום הקישורים לסיכומים של אפרת נקש.
 * נכתבים ע"י Codex לפי docs/team/codex/SUM.md, ונבדקים לפני שהם נכנסים.
 */
export type SummarySection = {
  title: string;
  /** פסקאות של 3–5 משפטים. */
  body: string[];
  /** 2–4 עובדות קצרות למבחן, בניסוח של שאלה ותשובה. */
  remember: string[];
};

export type Summary = {
  /** מפתח הנושא מ-TOPICS ב-src/data/topics.ts. */
  key: string;
  title: string;
  lede: string;
  sections: SummarySection[];
  terms: { term: string; def: string }[];
  sites: string[];
};
