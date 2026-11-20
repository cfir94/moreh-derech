// Question lists for the two split summaries (bronze age, introduction to archaeology).
//   node --import ./tests/register-ts.mjs tools/summary_questions_split.mjs
import fs from "node:fs";
import { QUIZZES } from "../src/data/quizzes/index.ts";
const SPLIT = { "bronze-age": [["bronze-age"], ["תקופת הברונזה"], "תקופת הברונזה"], "archaeology-intro": [["archaeology-intro"], ["ארכיאולוגיה"], "מבוא לארכאולוגיה"] };
for (const [key, [slugs, cats, label]] of Object.entries(SPLIT)) {
  const seen = new Set(), rows = [];
  for (const q of QUIZZES) for (const x of q.questions) {
    const cat = (x.category || "").split(/[–-]/)[0].trim();
    if (!(slugs.includes(q.slug) || (q.slug === "course-bank" && cats.includes(cat)))) continue;
    const k = x.question.replace(/\s+/g, " ").trim();
    if (seen.has(k)) continue;
    seen.add(k);
    const a = (x.answers || []).find((y) => y.correct)?.text ?? x.answerText ?? "";
    rows.push(`- ${k} — ${a.replace(/\s+/g, " ")}`);
  }
  fs.writeFileSync(`docs/team/gemini/questions/${key}.md`, `# שאלות על ${label} מהאתר (${rows.length})\n\nכל שאלה כאן צריכה לקבל תשובה מתוך הסיכום. השאלה, ואחרי המקף התשובה הנכונה. שאלה שלא שייכת לנושא, דלגו עליה.\n\n${rows.join("\n")}\n`);
  console.log(key, rows.length);
}
