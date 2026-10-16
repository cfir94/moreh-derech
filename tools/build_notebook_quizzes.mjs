/** Canonical authored questions + source locators live in notebook-quizzes/*.json.
 * Generate the existing Quiz schema; never change published IDs on a rebuild.
 * Run: node tools/build_notebook_quizzes.mjs [slug ...]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("../", import.meta.url));
const input = resolve(root, "tools/notebook-quizzes");
const slugs = process.argv.slice(2);
const files = readdirSync(input).filter(f => f.endsWith(".json") && (!slugs.length || slugs.includes(f.slice(0, -5))));
for (const file of files) {
  const bank = JSON.parse(readFileSync(resolve(input, file), "utf8"));
  assert.equal(bank.slug, file.slice(0, -5));
  const seen = new Set(), texts = new Set();
  const questions = bank.rows.map(row => {
    const [id, category, question, correct, d1, d2, d3, explanation, sourceKey, anchor] = row;
    assert.equal(row.length, 10, `Malformed row ${id}`);
    assert(Number.isInteger(id) && id > 0 && !seen.has(id), `Invalid/duplicate ID ${id}`);
    assert(!texts.has(question.trim()), `Duplicate question ${id}`);
    assert(question.endsWith("?"), `Question ${id} needs a question mark`);
    assert([category, correct, d1, d2, d3, explanation, anchor].every(v => typeof v === "string" && v.trim()), `Empty field ${id}`);
    assert(bank.sources[sourceKey]?.title, `Missing source ${id}`);
    assert.equal(new Set([correct, d1, d2, d3].map(v => v.trim())).size, 4, `Duplicate options ${id}`);
    seen.add(id); texts.add(question.trim());
    const answers = [d1, d2, d3].map(text => ({ text, correct: false }));
    answers.splice((id - 1) % 4, 0, { text: correct, correct: true });
    return { id, question, category, answers, explanation, topic: bank.topicByCategory?.[category] ?? bank.topic,
      source: `${bank.sources[sourceKey].title} — ${anchor}` };
  });
  const quiz = { slug: bank.slug, label: bank.label, categories: [...new Set(questions.map(q => q.category))], questions };
  const generated = `// Generated from tools/notebook-quizzes/${file}; edit that source and run node tools/build_notebook_quizzes.mjs.\nimport type { Quiz } from "@/data/quizzes/types";\n\nconst quiz: Quiz = ${JSON.stringify(quiz, null, 2)};\n\nexport default quiz;\n`;
  writeFileSync(resolve(root, `src/data/quizzes/${bank.slug}.ts`), generated);
  console.log(`${bank.slug}: ${questions.length} questions, ${quiz.categories.length} categories; all source locators present`);
}
