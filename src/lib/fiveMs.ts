/**
 * Heuristic feedback for the five מ״מים in a short guiding unit.
 * Not a grade — a study aid that flags missing dimensions.
 */

export type MKey = "who" | "what" | "when" | "where" | "why";

export type MResult = {
  key: MKey;
  label: string;
  found: boolean;
  note: string;
};

const RULES: {
  key: MKey;
  label: string;
  patterns: RegExp[];
  miss: string;
  hit: string;
}[] = [
  {
    key: "who",
    label: "מי",
    patterns: [
      /מי\b/,
      /אנשי\w*/,
      /מל[כח]/,
      /קיסר/,
      /צבא/,
      /ממלוכ/,
      /צלבנ/,
      /רומ(אים|י)/,
      /יהוד(ים|י)/,
      /בדוא/,
      /נובומייסקי/,
      /הורדוס/,
      /דוד\b/,
      /שלמה\b/,
      /מוחמד/,
      /צלאח/,
    ],
    miss: "לא מצאנו אזכור ברור של דמויות / עמים / בונים. הוסיפו ׳מי׳.",
    hit: "יש התייחסות לדמויות או גורמים אנושיים.",
  },
  {
    key: "what",
    label: "מה",
    patterns: [
      /מה\b/,
      /תופע(ה|ת)/,
      /מבנה/,
      /מצודה|מיצד|מבצר/,
      /אגם|ים\b|נחל/,
      /מפעל/,
      /מלח/,
      /שבר\b/,
      /דרך\b/,
      /זהו|זוהי|אלה הם/,
    ],
    miss: "חסר תיאור ברור של ׳מה רואים / מה זה׳.",
    hit: "יש תיאור של התופעה או האתר.",
  },
  {
    key: "when",
    label: "מתי",
    patterns: [
      /מתי\b/,
      /במאה ה/,
      /לפנה\"ס|לספירה/,
      /שנת\s*\d/,
      /\d{3,4}\s*–\s*\d{3,4}/,
      /לפני כ[־-]?\d/,
      /תקופ(ה|ת)/,
      /אלף\s*ה/,
      /ב־?\d{4}/,
      /תש\"ח|1967|1973|1948/,
    ],
    miss: "חסר עוגן זמן (תקופה / שנה / ׳לפני X שנים׳).",
    hit: "יש עוגן זמן.",
  },
  {
    key: "where",
    label: "מאיפה",
    patterns: [
      /מאיפה/,
      /מצפון|מדרום|ממזרח|ממערב/,
      /מכיוון/,
      /מקור/,
      /הגיע[וה]?\s+מ/,
      /בין\s+.\s+ל/,
      /לאורך/,
      /בקצה|מעל\s+ל|מתחת\s+ל/,
      /בדרך\s+מ/,
    ],
    miss: "חסרה התייחסות למיקום / כיוון / מקור גיאוגרפי.",
    hit: "יש הקשר של מקום או כיוון.",
  },
  {
    key: "why",
    label: "מדוע",
    patterns: [
      /מדוע/,
      /למה\b/,
      /כי\b/,
      /משום/,
      /בגלל/,
      /כדי\s+ל/,
      /לכן\b/,
      /לצורך/,
      /בשל\b/,
      /הסיבה/,
    ],
    miss: "חסר ׳מדוע׳ — למה זה חשוב / למה כאן / למה כך.",
    hit: "יש הסבר או סיבה.",
  },
];

export function analyzeFiveMs(text: string): {
  results: MResult[];
  score: number;
  wordCount: number;
  lengthNote: string | null;
} {
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

  const results: MResult[] = RULES.map((r) => {
    const found = r.patterns.some((p) => p.test(trimmed));
    return {
      key: r.key,
      label: r.label,
      found,
      note: found ? r.hit : r.miss,
    };
  });

  const hits = results.filter((r) => r.found).length;
  const score = Math.round((hits / RULES.length) * 100);

  let lengthNote: string | null = null;
  if (wordCount === 0) lengthNote = "היחידה ריקה — התחילו לכתוב.";
  else if (wordCount < 40)
    lengthNote = `קצר מאוד (${wordCount} מילים). יחידת שטח טיפוסית היא בסביבות 80–180 מילים.`;
  else if (wordCount > 220)
    lengthNote = `ארוך ליחידה קצרה (${wordCount} מילים). נסו לקצר לכ־180 מילים.`;

  return { results, score, wordCount, lengthNote };
}
