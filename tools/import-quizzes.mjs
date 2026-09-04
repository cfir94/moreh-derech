import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const outputDir = path.join(root, "src/data/quizzes");

const judaismTopics = [
  ["אמונה וזהות יהודית", 1, 13],
  ["תנ״ך ותורה שבעל פה", 14, 39],
  ["הלכה וארון הספרים", 40, 50],
  ["הלוח וחגי תשרי–אדר", 51, 75],
  ["פסח ומועדי ניסן–אלול", 76, 100],
  ["תפילה ובית הכנסת", 101, 125],
  ["שבת וכשרות", 126, 143],
  ["תשמישי קדושה", 144, 150],
];

const bordersTopics = [
  ["יסודות הגבול", 1, 21, [73, 74, 75]],
  ["שמות וזהות הארץ", 22, 25],
  ["גבולות לאורך ההיסטוריה", 26, 50],
  ["עות׳מאנים וראשית העת החדשה", 51, 62],
  ["גבולות מודרניים והלכתיים", 63, 72],
  ["צפון הארץ ומישור החוף", 76, 100],
  ["שדרת ההר והדרום", 101, 125],
  ["עיצוב הגבולות המודרניים", 126, 150],
];

function topicFor(id, topics) {
  const topic = topics.find(([, from, to, extra = []]) =>
    (id >= from && id <= to) || extra.includes(id),
  );
  if (!topic) throw new Error(`No topic configured for question ${id}`);
  return topic[0];
}

function writeQuiz(filename, source, quiz) {
  const serialized = JSON.stringify(quiz, null, 2);
  const contents = `// Auto-generated from ${source}\n// Do not edit by hand — run npm run import:quizzes.\nimport type { Quiz } from "@/data/quizzes/types";\n\nconst quiz: Quiz = ${serialized};\n\nexport default quiz;\n`;
  fs.writeFileSync(path.join(outputDir, `${filename}.ts`), contents);
  console.log(`${filename}: ${quiz.questions.length} questions, ${quiz.categories.length} categories`);
}

function readJson(repo, filename = "questions.json") {
  return JSON.parse(fs.readFileSync(path.join(root, "..", repo, filename), "utf8"));
}

function answers(correct, distractors) {
  return [correct, ...distractors].map((text) => ({ text, correct: text === correct }));
}

function importChristianity() {
  const source = fs.readFileSync(
    path.join(root, "..", "christianity-tour-guide-quiz", "questions.js"),
    "utf8",
  );
  const context = { window: {} };
  vm.runInNewContext(source, context);
  const questions = context.window.QUESTIONS;

  writeQuiz("christianity", "cfir94/christianity-tour-guide-quiz", {
    slug: "christianity",
    label: "נצרות",
    categories: [...new Set(questions.map((question) => question.unit))],
    questions: questions.map((item) => ({
      id: item.id,
      question: item.prompt,
      category: item.unit,
      answers: item.options.map((text) => ({ text, correct: text === item.answer })),
      explanation: item.explanation,
      source: item.source,
    })),
  });
}

function importJsonQuiz({ repo, filename, slug, label, topics }) {
  const questions = readJson(repo);
  writeQuiz(filename, `cfir94/${repo}`, {
    slug,
    label,
    categories: topics.map(([name]) => name),
    questions: questions.map((item) => ({
      id: item.id,
      question: item.question,
      category: topicFor(item.id, topics),
      answers: answers(item.correct, item.distractors),
      explanation: item.explanation,
      source: item.source,
    })),
  });
}

function importIronAge() {
  const source = fs.readFileSync(
    path.join(root, "..", "iron-age-quiz", "client/src/lib/quizData.ts"),
    "utf8",
  );
  const declaration = source.indexOf("export const QUESTIONS");
  const start = source.indexOf("[", declaration);
  const end = source.lastIndexOf("];", source.length) + 1;
  if (declaration < 0 || start < 0 || end <= start) {
    throw new Error("Could not locate the Iron Age question array");
  }

  const expression = source
    .slice(start, end)
    .replace(
      /`\$\{import\.meta\.env\.BASE_URL\}images\/([^`]+)`/g,
      '"/quiz-images/iron-age/$1"',
    );
  const questions = vm.runInNewContext(`(${expression})`);
  const normalized = questions.map(({ image, ...item }) => ({
    ...item,
    ...(image?.url
      ? { image: { url: image.url, fit: image.fit, credit: image.credit } }
      : {}),
  }));

  writeQuiz("iron-age", "cfir94/iron-age-quiz", {
    slug: "iron-age",
    label: "תקופת הברזל",
    categories: [...new Set(normalized.map((question) => question.category))],
    questions: normalized,
  });
}

importChristianity();
importJsonQuiz({
  repo: "judaism-quiz",
  filename: "judaism",
  slug: "judaism",
  label: "יהדות",
  topics: judaismTopics,
});
importJsonQuiz({
  repo: "israel-borders-quiz",
  filename: "israel-borders",
  slug: "israel-borders",
  label: "גבולות ארץ ישראל",
  topics: bordersTopics,
});
importIronAge();
