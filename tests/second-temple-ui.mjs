import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdtempSync } from "node:fs";
import { resolve, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const screenshots = process.env.TEMPLE_QA_DIR ?? mkdtempSync(join(tmpdir(), "temple-qa-"));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let target = resolve(out, "." + pathname);
  if (!target.startsWith(out + "/") && !target.startsWith(out + "\\") && target !== out) { res.writeHead(403).end(); return; }
  if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, "index.html");
  if (!existsSync(target)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", mime[extname(target)] ?? "application/octet-stream");
  res.end(readFileSync(target));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = process.env.TEMPLE_TEST_BASE_URL ?? `http://127.0.0.1:${server.address().port}/moreh-derech`;
const browser = await chromium.launch({ headless: true });
const errors = [];
let checks = 0;
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  await context.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("even-derech-theme", "light"));
  await page.goto(base + "/timelines/");
  await page.getByRole("link", { name: /בית שני — מן השיבה אל החורבן/ }).click();
  await expect(page.getByRole("heading", { name: "בית שני", exact: true })).toBeVisible();
  await expect(page.locator('article[id^="ST-"]')).toHaveCount(88);
  await expect(page.locator("#ST-086")).toHaveCount(0);
  await expect(page.locator("#ST-014 summary")).toContainText("שנת העלייה דורשת בירור");
  checks++;

  await page.locator("#ST-007 summary").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#ST-007 details")).toHaveAttribute("open", "");
  await expect(page.locator("#ST-007 footer")).toContainText("Eyal_lesson11_mobile.mp3");
  await page.screenshot({ path: join(screenshots, "event-desktop-light.png") });
  checks++;

  await page.getByRole("button", { name: /ממרד לממלכה/ }).click();
  await expect(page.locator('article[id^="ST-"]')).toHaveCount(21);
  const search = page.getByRole("searchbox", { name: "חיפוש בתצוגה הנוכחית" });
  await search.fill("ניקנור");
  await expect(page.locator("#ST-035")).toBeVisible();
  await search.fill("לאקייםבמחקרהזה");
  await expect(page.getByRole("heading", { name: "לא נמצאו אירועים מתאימים" })).toBeVisible();
  await page.getByRole("button", { name: "להציג את כל האירועים" }).click();
  await expect(page.locator('article[id^="ST-"]')).toHaveCount(88);
  await page.getByRole("checkbox", { name: "אירועי מפתח בלבד" }).check();
  expect(await page.locator('article[id^="ST-"]').count()).toBeLessThan(88);
  await page.getByRole("button", { name: "ניקוי סינון" }).click();
  await page.getByRole("combobox", { name: "נושא" }).selectOption("building");
  await expect(page.locator("#ST-055")).toBeVisible();
  await page.getByRole("button", { name: "ניקוי סינון" }).click();
  checks++;

  await page.getByRole("button", { name: /אנשי התקופה/ }).click();
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(78);
  await search.fill("הורדוס הגדול");
  await expect(page.getByRole("heading", { name: "הורדוס הגדול", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /מינוי הורדוס ברומא/ }).click();
  await expect(page.locator("#ST-051 details")).toHaveAttribute("open", "");
  await expect(page.locator('article[id^="ST-"]')).toHaveCount(88);
  checks++;

  await page.getByRole("button", { name: /אתרים וממצאים/ }).click();
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(54);
  await search.fill("חניון גבעתי");
  await expect(page.getByRole("heading", { name: "חניון גבעתי והחקרא" })).toBeVisible();
  await expect(page.getByText(/זיהוי כחקרא סלאוקית מול ביצור חשמונאי/)).toBeVisible();
  checks++;

  await page.getByRole("button", { name: /התמונה הרחבה/ }).click();
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(10);
  await expect(page.getByRole("table")).toHaveCount(1);
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(4);
  await page.getByRole("button", { name: "מקורות ודיוק" }).click();
  await expect(page.getByRole("link", { name: /למחברת תקופת הבית השני/ })).toHaveAttribute("href", /e1eef0d4/);
  await expect(page.getByText(/רשומת יעד לימוד בלבד/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "שמונת מקורות המחברת" })).toBeVisible();
  checks++;

  await page.goto(base + "/timelines/second-temple/#ST-082");
  await expect(page.locator("#ST-082 details")).toHaveAttribute("open", "");
  await expect(page.locator("#ST-082 summary")).toContainText("חודש אב מופיע בתמלול");
  await expect(page.locator("#ST-082")).toBeFocused();
  checks++;

  // The global search uses same-page fragment navigation. It must clear hidden filters.
  await page.getByRole("button", { name: /שיבה ובניין/ }).click();
  await page.getByRole("button", { name: "חיפוש בכל חומרי האתר", exact: true }).click();
  await page.getByRole("dialog").getByRole("searchbox").fill("טיהור המקדש");
  const globalResult = page.locator('a[href$="/timelines/second-temple/#ST-033"]');
  await expect(globalResult).toBeVisible({ timeout: 20000 });
  await globalResult.click();
  await expect(page.locator("#ST-033 details")).toHaveAttribute("open", "");
  await expect(page.locator('article[id^="ST-"]')).toHaveCount(88);
  checks++;

  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    for (const theme of ["light", "dark"]) {
      await page.goto(base + "/timelines/second-temple/");
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${theme}: page overflow`).toBe(true);
      if (width !== 320) await page.screenshot({ path: join(screenshots, `${width}-${theme}.png`) });
      if (width === 390 && theme === "dark") {
        await page.goto(base + "/timelines/second-temple/#ST-082");
        await expect(page.locator("#ST-082 details")).toHaveAttribute("open", "");
        await page.screenshot({ path: join(screenshots, "event-mobile-dark.png") });
      }
      await page.getByRole("button", { name: /התמונה הרחבה/ }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${theme}: process overflow`).toBe(true);
      checks++;
    }
  }
  expect(errors).toEqual([]);
  console.log(JSON.stringify({ browserChecks: checks, pageErrors: errors, screenshots }));
  await context.close();
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
