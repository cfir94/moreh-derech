// מאגר השאלות של מורה הדרך: התאמה לנושא, בלי חזרות, סוג השאלה, ומה נשלח למודל ומה מוצג לתלמיד.

import assert from "node:assert/strict";
import { test } from "node:test";
import { QuizBank, toItem, type BankQuestion } from "../web/src/quiz.ts";

const mc = (id: string, question: string, category: string, options: string[], correct = 0): BankQuestion => ({
  id,
  quiz: "התקופה הרומית והביזנטית",
  category,
  topic: "",
  question,
  options,
  correct,
  explanation: `הסבר ${id}`,
  url: "https://example.org/quizzes/roman-byzantine",
});

const BANK: BankQuestion[] = [
  mc("r1", "מי היה הקיסר בזמן חורבן הבית השני?", "קיסרים", ["אספסיאנוס", "טיטוס", "נירון", "אדריאנוס"]),
  mc("r2", "מי בנה את איליה קפיטולינה?", "קיסרים", ["אדריאנוס", "טריאנוס", "קונסטנטינוס", "דיוקלטיאנוס"]),
  mc("r3", "מי כינס את ועידת ניקיאה?", "קיסרים", ["קונסטנטינוס", "יוליאנוס", "זנון", "יוסטיניאנוס"]),
  mc("b1", "איזו כנסייה בנה יוסטיניאנוס בירושלים?", "כנסיות", ["הניאה", "האלאונה", "הקבר", "המולד"], 0),
  mc("a1", "מהו היפוקאוסט?", "מרחץ", ["חימום תת־רצפתי", "חדר קר", "בריכה", "אמת מים"]),
  {
    id: "f1",
    quiz: "מבחן בית שני–ביזנטית",
    category: "קיסרים",
    topic: "",
    question: "הקיסר ____ העביר את הבירה לקונסטנטינופוליס",
    answer: "קונסטנטינוס",
    explanation: "",
    url: "https://example.org/exams/course-temple-1",
  },
];

// "אקראי" צפוי: תמיד האיבר הראשון במאגר.
const first = () => 0;

test("שאלה אמריקאית: אותיות לאפשרויות, והתשובה הנכונה עם האות", () => {
  const item = toItem(BANK[1]);
  assert.deepEqual(item.options, ["א. אדריאנוס", "ב. טריאנוס", "ג. קונסטנטינוס", "ד. דיוקלטיאנוס"]);
  assert.equal(item.answer, "א. אדריאנוס");
  assert.equal(item.from, "התקופה הרומית והביזנטית · קיסרים");
  assert.equal(toItem(BANK[5]).answer, "קונסטנטינוס");
  assert.equal(toItem(BANK[5]).options, undefined);
});

test("לפי נושא: רק שאלות שמתאימות, ובלי לחזור על שאלה בשיחה", async () => {
  const bank = QuizBank.fromQuestions(BANK, first);
  const a = await bank.pick({ topic: "קיסרים", count: 3, format: "mc" });
  assert.equal(a.items.length, 3);
  assert.ok(a.items.every((q) => q.from.endsWith("קיסרים")));
  const b = await bank.pick({ topic: "קיסרים", count: 3, format: "mc" });
  assert.equal(b.items.length, 0, "שלוש השאלות האמריקאיות על קיסרים כבר נשאלו");
  const open = await bank.pick({ topic: "קיסרים", format: "open" });
  assert.deepEqual(open.items.map((q) => q.answer), ["קונסטנטינוס"]);
});

test("שאלה על נושא אחר, וכמות בין 1 ל-5", async () => {
  const bank = QuizBank.fromQuestions(BANK, first);
  const r = await bank.pick({ topic: "היפוקאוסט מרחץ", count: 1 });
  assert.deepEqual(r.items.map((q) => q.question), ["מהו היפוקאוסט?"]);
  const all = await QuizBank.fromQuestions(BANK, first).pick({ topic: "", count: 99 });
  assert.equal(all.items.length, 5);
});

test("לתלמיד מוצגות השאלה והאפשרויות — בלי התשובה ובלי ההסבר", async () => {
  const r = await QuizBank.fromQuestions(BANK, first).pick({ topic: "ניאה יוסטיניאנוס", count: 1 });
  assert.equal(r.shown.length, 1);
  assert.deepEqual(Object.keys(r.shown[0]).sort(), ["options", "question", "ref", "url"]);
  assert.ok(!JSON.stringify(r.shown).includes("הסבר"));
});
