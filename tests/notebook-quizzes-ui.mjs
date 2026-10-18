// Focused integration of the five new content banks with the unchanged runner.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";
import { QUIZZES } from "../src/data/quizzes/index.ts";

const slugs = ["roman-byzantine", "classical-architecture", "early-islam", "medieval", "ottoman"];
const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".png": "image/png" };
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let file = resolve(out, "." + pathname);
  if (file !== out && !file.startsWith(out + sep)) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, "index.html");
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", mime[extname(file)] ?? "application/octet-stream");
  res.end(readFileSync(file));
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const base = "http://127.0.0.1:" + server.address().port + "/moreh-derech";
const browser = await chromium.launch({ headless: true });
const errors = [];
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
try {
  for (const slug of slugs) {
    const quiz = QUIZZES.find(q => q.slug === slug);
    expect(quiz, slug + " registered").toBeTruthy();
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(slug + ": " + error.message));
    await page.goto(base + "/quizzes/");
    await expect(page.getByRole("link", { name: new RegExp(escape(quiz.label)) })).toBeVisible();
    await page.goto(base + "/quizzes/" + slug + "/");
    await expect(page.getByRole("heading", { name: quiz.label, exact: true })).toBeVisible();
    await page.getByRole("button", { name: "לפי סדר", exact: true }).click();
    await page.getByRole("button", { name: "10", exact: true }).click();
    await page.getByRole("button", { name: "להתחיל לתרגל", exact: true }).click();
    for (const [index, question] of quiz.questions.slice(0, 10).entries()) {
      await expect(page.getByRole("heading", { name: question.question, exact: true })).toBeVisible();
      const answer = question.answers.find(a => index === 0 ? !a.correct : a.correct);
      await page.locator("li > button").filter({ has: page.getByText(answer.text, { exact: true }) }).click();
      await expect(page.getByText(question.explanation, { exact: true })).toBeVisible();
      await expect(page.locator("li > button").first()).toBeDisabled();
      await page.getByRole("button", { name: index === 9 ? "לתוצאות" : "הבאה", exact: true }).click();
    }
    await expect(page.getByRole("heading", { name: "90%", exact: true })).toBeVisible();
    let state = await page.evaluate(() => JSON.parse(localStorage.getItem("md_progress_v2")));
    expect(state.attempts).toHaveLength(1);
    expect(state.attempts[0].quiz).toBe(slug);
    expect(state.attempts[0].correct).toBe(9);
    expect(state.questions[slug + ":" + quiz.questions[0].id].wrong).toBe(1);
    await page.getByRole("button", { name: "לתרגל רק את הטעויות", exact: true }).click();
    const correct = quiz.questions[0].answers.find(a => a.correct);
    await page.locator("li > button").filter({ has: page.getByText(correct.text, { exact: true }) }).click();
    await page.getByRole("button", { name: "לתוצאות", exact: true }).click();
    await expect(page.getByRole("heading", { name: "100%", exact: true })).toBeVisible();
    state = await page.evaluate(() => JSON.parse(localStorage.getItem("md_progress_v2")));
    expect(state.attempts).toHaveLength(2);
    expect(state.questions[slug + ":" + quiz.questions[0].id].seen).toBe(2);
    await page.reload();
    await expect(page.getByRole("heading", { name: quiz.label, exact: true })).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("md_progress_v2")))).toEqual(state);
    const category = quiz.categories[0], filtered = quiz.questions.filter(q => q.category === category);
    await page.getByRole("button", { name: new RegExp("^" + escape(category) + "\\s+" + filtered.length + "$") }).click();
    await page.getByRole("button", { name: new RegExp("^הכל \\(" + filtered.length + "\\)$") }).click();
    await page.getByRole("button", { name: "להתחיל לתרגל", exact: true }).click();
    await expect(page.getByRole("heading", { name: filtered[0].question, exact: true })).toBeVisible();
    for (const theme of ["light", "dark"]) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    console.log(JSON.stringify({ slug, questions: quiz.questions.length, checks: ["card", "setup", "ten-question-run", "explanations", "score", "saved-owner", "retry-wrong", "category", "mobile-themes"] }));
    await context.close();
  }
  expect(errors).toEqual([]);
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
