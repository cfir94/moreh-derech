/** Prompts for short guiding-unit practice (Part II style). */

export type UnitPrompt = {
  id: string;
  site: string;
  duration: string;
  /** What the student should focus on. */
  focus: string;
  /** Soft checklist reminders (not scored strictly). */
  hints: string[];
};

export const UNIT_PROMPTS: UnitPrompt[] = [
  {
    id: "sodom-fish-trail",
    site: "הר סדום — שביל הדגים",
    duration: "20 דק׳",
    focus: "היווצרות הר המלח והשבר הסורי־אפריקאי, תוך התייחסות לשטח.",
    hints: [
      "מי / מה גרם לתנועת הלוחות",
      "מתי נוצרו לגונת סדום / אגם הלשון",
      "מדוע המלח מתרומם (חום, צפיפות)",
      "מה רואים מתחת לרגליים עכשיו",
    ],
  },
  {
    id: "zohar-fort",
    site: "מיצד זוהר",
    duration: "15 דק׳",
    focus: "המיצד הממלוכי, דרך הדואר, ומים במדבר.",
    hints: [
      "מי היו הממלוכים ומתי שלטו",
      "מהי טריק אל־באריד",
      "מאיפה הדרך הגיעה ולאן המשיכה",
      "מדוע בחרו דווקא בנקודה הזו",
    ],
  },
  {
    id: "bokek-wadi",
    site: "נחל בוקק",
    duration: "20 דק׳",
    focus: "מים וצומח במדבר יהודה — ניגוד לנוף הצחיח.",
    hints: [
      "מה מקורות המים כאן",
      "מי / אילו צמחים מותאמים למליחות",
      "מדוע הנחל ירוק יחסית לסביבה",
    ],
  },
  {
    id: "dead-sea-works",
    site: "מפעלי ים המלח — מרכז מבקרים",
    duration: "25 דק׳",
    focus: "נובומייסקי, הפקת אשלגן, והמעבר דרומה אחרי תש״ח.",
    hints: [
      "מי ייסד את המפעל",
      "מה מפיקים וכיצד (קרנליט)",
      "מתי עברו מדרום / צפון",
      "מדוע המפלס יורד (קשר למפעלים ולירדן)",
    ],
  },
];

export function promptById(id: string) {
  return UNIT_PROMPTS.find((p) => p.id === id);
}
