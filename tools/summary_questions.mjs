// The site's questions on one syllabus topic, for the writer of its summary (docs/team/gemini/SUM-GEMINI.md).
//   node --import ./tests/register-ts.mjs tools/summary_questions.mjs
// Writes docs/team/gemini/questions/<topic>.md for every topic.
import fs from "node:fs";
import { QUIZZES } from "../src/data/quizzes/index.ts";
import { TOPICS } from "../src/data/topics.ts";

// a topic's own quizzes, and the course-bank categories that belong to it
const MAP = {
  minorities: [[], []], christianity: [["christianity"], ["נצרות"]], islam: [[], []], judaism: [["judaism"], ["יהדות"]],
  prehistory: [["prehistory"], ["פרהיסטוריה"]], bible: [["iron-age", "bronze-age"], ["תקופת הברזל", "תקופת הברונזה"]],
  "second-temple": [["second-temple"], ["בית שני"]], "roman-byzantine": [["roman-byzantine"], ["התקופה הרומית", "התקופה הביזנטית"]],
  "early-islam": [["early-islam"], []], crusader: [["medieval"], []], "mamluk-ottoman": [["ottoman"], []],
  "modern-yishuv": [[], []], state: [[], []], jerusalem: [[], []], geology: [["geology"], ["גיאולוגיה"]],
  "water-climate": [[], []], "flora-fauna": [["flora-fauna"], ["חי", "צומח"]], geography: [["israel-borders"], ["גבולות"]],
  "art-arch": [["classical-architecture", "archaeology-intro"], ["ארכיאולוגיה"]], tourism: [[], []],
};
fs.mkdirSync("docs/team/gemini/questions", { recursive: true });
for (const t of TOPICS) {
  const [slugs, cats] = MAP[t.key] ?? [[], []];
  const seen = new Set(), rows = [];
  for (const q of QUIZZES) for (const x of q.questions) {
    const cat = (x.category || "").split(/[–-]/)[0].trim();
    const ok = slugs.includes(q.slug) || (q.slug === "past-exams" && x.topic === t.key) || (q.slug === "course-bank" && cats.includes(cat));
    if (!ok) continue;
    const k = x.question.replace(/\s+/g, " ").trim();
    if (seen.has(k)) continue;
    seen.add(k);
    const a = (x.answers || []).find((y) => y.correct)?.text ?? x.answerText ?? "";
    rows.push(`- ${k} — ${a.replace(/\s+/g, " ")}`);
  }
  fs.writeFileSync(`docs/team/gemini/questions/${t.key}.md`, `# שאלות על ${t.label} מהאתר (${rows.length})\n\nכל שאלה כאן צריכה לקבל תשובה מתוך הסיכום. השאלה, ואחרי המקף התשובה הנכונה. שאלה שלא שייכת לנושא, דלגו עליה.\n\n${rows.join("\n")}\n`);
  console.log(t.key, rows.length);
}
