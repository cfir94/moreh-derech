import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";
import { EXAM_PAPERS } from "../src/data/guide-reports/exam-briefs.ts";
import { EXAMS } from "../src/data/exams/index.ts";

const out = fileURLToPath(new URL("../out/", import.meta.url));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let target = resolve(out, "." + path);
  if (!target.startsWith(out)) { res.writeHead(403).end(); return; }
  if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, "index.html");
  if (!existsSync(target)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", mime[extname(target)] ?? "application/octet-stream");
  res.end(readFileSync(target));
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/moreh-derech`;
const browser = await chromium.launch({ headless: true });
const errors = [];
let checks = 0;
try {
  const row = { time: "09:15", activity: "פעילות שנשמרה", logistics: "ציוד שנשמר" };
  const paper = EXAM_PAPERS[0], group = paper.groups[0];
  const cases = [
    { id: "test-day", kind: "day", title: "טיוטת יום לבדיקה", payload: { scenarioId: "families-dead-sea", rows: [{ n: 1, ...row }] }, expected: "/practice/day/", marker: row.time },
    { id: "test-unit", kind: "unit", title: "טיוטת יחידה לבדיקה", payload: { promptId: "sodom-fish-trail", site: "אתר ששמרתי", duration: "22 דקות", methods: "מפה ששמרתי", body: "תוכן יחידה ששמרתי" }, expected: "/practice/unit/", marker: "תוכן יחידה ששמרתי" },
    // Legacy exam drafts must route to the exam editor even with kind=day.
    { id: "test-exam", kind: "day", title: "טיוטת מבחן ישנה", payload: { paperSlug: paper.slug, groupN: group.n, assumptions: "הנחות ששמרתי", rows: [row], units: group.shortUnits.map(() => ({ site: "אתר מבחן", duration: "20", body: "גוף יחידה", methods: "מפה" })), expanded: { site: "אתר מורחב", topic: "נושא", position: "מיקום הקבוצה", body: "גוף מורחב שנשמר" } }, expected: "/exam/", marker: "הנחות ששמרתי" },
  ];
  for (const item of cases) {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(draft => {
      if (!localStorage.getItem("seeded")) {
        localStorage.setItem("md_guide_drafts_v1", JSON.stringify([{ ...draft, createdAt: 100, updatedAt: 100 }]));
        localStorage.setItem("seeded", "yes");
      }
    }, item);
    await page.goto(base + "/guide-reports/drafts/");
    await page.getByRole("link", { name: "פתיחה", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(item.expected + ".*draft=" + item.id));
    const field = item.kind === "day" && !item.payload.paperSlug ? page.locator("input").first() : page.locator("textarea").first();
    await expect(field).toHaveValue(item.marker);
    await field.fill("תוכן מעודכן");
    await page.getByRole("button", { name: "שמירת טיוטה", exact: true }).click();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("md_guide_drafts_v1")));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(item.id);
    expect(stored[0].createdAt).toBe(100);
    await page.reload();
    await expect(field).toHaveValue("תוכן מעודכן");
    checks++;
    await context.close();
  }

  // Both input formats enter the same review session and clear their real owner.
  for (const quizId of [12001, 20001]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    const exam = EXAMS.find(e => e.questions.some(q => q.quizId === quizId));
    const q = exam.questions.find(q => q.quizId === quizId);
    await page.addInitScript(({ q }) => {
      localStorage.setItem("md_progress_v2", JSON.stringify({ attempts: [], questions: {
        ["past-exams:" + q.quizId]: { quiz: "past-exams", questionId: q.quizId, question: q.question.he, category: "test", seen: 1, wrong: 1, lastCorrectAt: null, lastWrongAt: 10 },
      } }));
    }, { q });
    await page.goto(base + "/quizzes/review/");
    await page.getByRole("button", { name: "להתחיל לחזור על הטעויות" }).click();
    if (q.kind === "fill") {
      await page.locator("#review-fill-answer").fill("תשובה אחרת");
      await page.getByRole("button", { name: "בדיקת התשובה" }).click();
      await page.getByRole("button", { name: "בעצם עניתי נכון" }).click();
    } else {
      await page.getByRole("button").filter({ hasText: q.answers[q.correctIndex].text.he }).click();
    }
    await page.getByRole("button", { name: "לתוצאות", exact: true }).click();
    await expect(page.getByRole("heading", { name: "100%" })).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("md_progress_v2")));
    const owner = quizId > 20000 ? "course-bank" : "past-exams";
    expect(saved.questions[owner + ":" + quizId].seen).toBe(2);
    expect(saved.questions[owner + ":" + quizId].lastCorrectAt).toBeGreaterThan(10);
    expect(saved.attempts).toHaveLength(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    checks++;
    await context.close();
  }

  // Correcting a fill after submitting a real exam updates its saved attempt.
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base + "/exams/january-2026/");
    await page.getByRole("button", { name: "להתחיל את המבחן" }).click();
    await page.locator('input[type="text"]').first().fill("תשובה חלופית");
    await page.getByRole("button", { name: "להגיש את המבחן" }).click();
    await page.getByRole("button", { name: "להגיש בכל זאת" }).click();
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem("md_progress_v2")));
    await page.getByRole("button", { name: "בעצם עניתי נכון" }).first().click();
    const after = await page.evaluate(() => JSON.parse(localStorage.getItem("md_progress_v2")));
    expect(after.attempts).toHaveLength(1);
    expect(after.attempts[0].correct).toBe(before.attempts[0].correct + 1);
    expect(after.questions["past-exams:12001"].seen).toBe(1);
    expect(after.questions["past-exams:12001"].wrong).toBe(0);
    checks++;
    await context.close();
  }
  expect(errors).toEqual([]);
  console.log(JSON.stringify({ browserChecks: checks, pageErrors: errors }));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
