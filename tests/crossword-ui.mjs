// Browser checks for תשבץ השבוע, against the static export in out/.
// Run with: node --import ./tests/register-ts.mjs tests/crossword-ui.mjs
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { CROSSWORD_BANK } from "../src/data/crossword/bank.ts";
import { puzzleForWeek } from "../src/lib/crossword/generate.ts";
import { clueOrder } from "../src/lib/crossword/play.ts";
import { weekOf } from "../src/lib/crossword/week.ts";

const { chromium } = createRequire(import.meta.url)("playwright");
const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let target = resolve(out, "." + pathname);
  if (!target.startsWith(out)) { res.writeHead(403).end(); return; }
  if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, "index.html");
  if (!existsSync(target)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", mime[extname(target)] ?? "application/octet-stream");
  res.end(readFileSync(target));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}/moreh-derech`;

const now = new Date();
const puzzle = puzzleForWeek(CROSSWORD_BANK, weekOf(now));
const browser = await chromium.launch({ headless: true });
const errors = [];
// A Hebrew keyboard sends keydown with the Hebrew key; Playwright's type() sends only input events for it.
const typeHebrew = async (page, text) => {
  for (const key of text) await page.evaluate((k) => window.dispatchEvent(new KeyboardEvent("keydown", { key: k, cancelable: true })), key);
};

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, timezoneId: "Asia/Jerusalem" });
  await context.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => msg.type() === "error" && /hydrat/i.test(msg.text()) && errors.push(msg.text()));

  await page.goto(base + "/games/");
  await page.getByRole("link", { name: /תשבץ השבוע/ }).click();
  await page.waitForURL(/\/games\/crossword\/?$/);

  if (!puzzle) {
    // Until the bank has enough words: an explanation, never an empty grid.
    await page.getByRole("heading", { name: "התשבץ הראשון בדרך" }).waitFor();
    assert.equal(await page.locator("[aria-label^='תשבץ:']").count(), 0);
    console.log("crossword: bank not filled yet — coming-soon page checked");
  } else {
    const grid = page.locator("[aria-label^='תשבץ:']");
    await grid.waitFor();
    const order = clueOrder(puzzle);
    const clue = (i) => page.locator(`button[data-word="${i}"]`);

    // Typing works without clicking first, and a word typed right is marked solved.
    await typeHebrew(page, puzzle.words[order[0]].letters.join(""));
    assert.notEqual(await clue(order[0]).getAttribute("data-solved"), null);

    // A wrong word: the check marks exactly its wrong letters.
    const second = puzzle.words[order[1]];
    await clue(order[1]).click();
    await typeHebrew(page, second.letters.map((l) => (l === "א" ? "ב" : "א")).join(""));
    await clue(order[1]).click();
    await page.getByRole("button", { name: "בדיקת מילה" }).click();
    const crossesFirst = await page.locator("button[data-wrong]").count();
    assert.ok(crossesFirst >= 1 && crossesFirst <= second.letters.length);

    // Revealing the rest finishes the puzzle and the result survives a reload.
    for (const i of order) {
      if ((await clue(i).getAttribute("data-solved")) !== null) continue;
      await clue(i).click();
      await page.getByRole("button", { name: "גילוי מילה" }).click();
    }
    await page.locator("#crossword-solved").waitFor();
    await page.reload();
    await page.locator("#crossword-solved").waitFor();
    console.log(`crossword: week ${puzzle.week.number}, ${puzzle.words.length} words — solve flow checked`);

    // Phone: the Hebrew keyboard is docked, types into the grid, and nothing scrolls sideways.
    const phone = await browser.newContext({ viewport: { width: 360, height: 780 }, hasTouch: true, isMobile: true, timezoneId: "Asia/Jerusalem" });
    const mobile = await phone.newPage();
    mobile.on("pageerror", (error) => errors.push(error.message));
    await mobile.goto(base + "/games/crossword/");
    await mobile.locator("[data-crossword-dock]").waitFor();
    const first = puzzle.words[order[0]].letters[0];
    await mobile.locator(`[data-crossword-dock] button:text-is("${first}")`).tap();
    const typed = await mobile.locator("[aria-label^='תשבץ:'] button[data-active]")
      .evaluateAll((cells) => cells.map((cell) => cell.lastElementChild.textContent).join(""));
    assert.equal(typed, first);
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  }
} finally {
  await browser.close();
  server.close();
}
assert.deepEqual(errors, []);
