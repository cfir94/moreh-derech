/* eslint-disable @typescript-eslint/no-require-imports -- a plain Node script, CommonJS on purpose */
const { chromium, devices } = require("playwright");
const BASE = "http://127.0.0.1:8811";
const OUT = process.env.OUT || "/tmp/marketing-raw";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(ctx, name, path, prep, settle = 2500) {
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 90000 });
    await wait(settle);
    if (prep) await prep(page);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log("ok", name);
  } catch (e) {
    console.log("FAIL", name, e.message.split("\n")[0]);
  } finally {
    await page.close();
  }
}

const quizFlow = async (page) => {
  await page.getByRole("button", { name: "להתחיל לתרגל" }).click();
  await wait(1200);
};
const quizAnswer = async (page) => {
  await quizFlow(page);
  const answers = page.locator("main button").filter({ hasText: /\S/ });
  // first answer-like button inside the question card
  const opts = page.locator('main button[class*="items-start"]');
  if (await opts.count()) await opts.first().click();
  else await answers.nth(3).click();
  await wait(900);
};

(async () => {
  const browser = await chromium.launch();
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: "he-IL" });
  const phone = await browser.newContext({ ...devices["iPhone 14"], locale: "he-IL" });
  const plan = [
    ["home", "/"],
    ["quizzes", "/quizzes/"],
    ["quiz-question", "/quizzes/second-temple/", quizFlow],
    ["quiz-feedback", "/quizzes/second-temple/", quizAnswer],
    ["exams", "/exams/"],
    ["atlas", "/timelines/history-atlas/", null, 5000],
    ["learn-map", "/map/learn/", null, 4000],
    ["roman", "/timelines/roman/"],
    ["byzantine", "/timelines/byzantine/"],
    ["architecture", "/timelines/classical-architecture/", null, 4000],
    ["who-am-i", "/games/who-am-i/"],
    ["crossword", "/games/crossword/"],
    ["robes", "/games/jerusalem-robes/"],
    ["guide-reports", "/guide-reports/"],
    ["timelines", "/timelines/"],
    ["history-talk", "/timelines/history-talk/", null, 6000],
  ];
  for (const [name, path, prep, settle] of plan) {
    await shoot(desk, `d-${name}`, path, prep, settle);
    await shoot(phone, `m-${name}`, path, prep, settle);
  }
  await browser.close();
})();
