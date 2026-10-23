import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let path = resolve(out, "." + pathname);
  if (path !== out && !path.startsWith(out + sep)) { res.writeHead(403).end(); return; }
  if (existsSync(path) && statSync(path).isDirectory()) path = resolve(path, "index.html");
  if (!existsSync(path)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", ({ ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" })[extname(path)] ?? "application/octet-stream");
  res.end(readFileSync(path));
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const base = process.env.ROMAN_PEOPLE_TEST_BASE_URL ?? `http://127.0.0.1:${server.address().port}/moreh-derech`;
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + "/timelines/", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: /מי זה מי ברומא/ }).click();
  await expect(page.getByRole("heading", { name: "מי זה מי ברומא?", exact: true })).toBeVisible();
  await expect(page.locator("[data-person-button]")).toHaveCount(36);
  const search = page.getByRole("searchbox", { name: "חיפוש דמות, אירוע או מקום" });
  await search.fill("אוקטביאנוס");
  await expect(page.locator("[data-person-button]")).toHaveCount(2);
  await expect(page.locator('[data-person-detail="augustus"]')).toContainText("אקטיום");
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  await page.getByLabel("תפקיד", { exact: true }).selectOption("deputy");
  await expect(page.locator("[data-person-button]")).toHaveCount(1);
  await expect(page.locator('[data-person-detail="gallus"]')).toContainText("351");
  await page.getByRole("button", { name: /להבדיל בין שמות/ }).click();
  await page.getByLabel("בחר זוג להשוואה").selectOption("two-galluses");
  await expect(page.locator("[data-person-detail]")).toHaveCount(2);
  await expect(page.locator('[data-person-detail="cestius"]')).toContainText("66");
  await expect(page.locator('[data-person-detail="gallus"]')).toContainText("קיסר משנה");
  await page.getByRole("button", { name: /להכיר את הדמויות/ }).click();
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  await search.fill("פומפיוס");
  await page.getByRole("button", { name: /לבדוק מה זכרתי/ }).click();
  await expect(page.getByText("כרטיס 1 מתוך 1", { exact: true })).toBeVisible();
  await expect(page.locator('[class*="answerIdentity"]')).toHaveCount(0);
  await page.getByRole("button", { name: "לחשוף את התשובה" }).click();
  await expect(page.getByRole("heading", { name: "פומפיוס", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /צריך חיזוק/ }).click();
  await expect(page.getByRole("heading", { name: "הסבב הושלם" })).toBeVisible();
  await expect(page.getByText("זכרת 0 מתוך 1 דמויות.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /חזרה על 1 דמויות לחיזוק/ }).click();
  await page.getByRole("button", { name: "לחשוף את התשובה" }).click();
  await page.getByRole("button", { name: /זכרתי ✓/ }).click();
  await expect(page.getByText("זכרת 1 מתוך 1 דמויות.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /להכיר את הדמויות/ }).click();
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  await page.getByRole("button", { name: /המעבר לביזנטיון/ }).click();
  await expect(page.locator("[data-person-button]")).toHaveCount(12);
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  await page.getByLabel("רק דמויות הליבה").check();
  await expect(page.locator("[data-person-button]")).toHaveCount(29);
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${theme}, ${width}px overflow`).toBe(true);
    }
  }
  await page.locator('[data-person-button="titus"]').click();
  await expect(page.locator('[data-person-detail="titus"]')).toContainText("מצביא בחורבן");
  await page.locator('[data-person-detail="titus"] summary').click();
  await expect(page.locator('[data-person-detail="titus"] details')).toHaveAttribute("open", "");
  expect(errors).toEqual([]);
  console.log("Roman people: navigation, alias/era/role/core filters, comparison, recall/retry, mobile, dark mode and zero page errors passed");
} finally { await browser.close(); await new Promise(done => server.close(done)); }
