// שרשרת הספרים של היהדות (LA-40) בדפדפן: תקופות, פתיחת ספר מקישור, סינון, לשוניות ותרגול.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2" };
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
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 360, height: 800 }]) {
    const context = await browser.newContext({ viewport });
    await context.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/timelines/judaism/");
    await expect(page.getByRole("heading", { name: "שרשרת הספרים של היהדות", level: 1 })).toBeVisible();
    await expect(page.locator('li[id^="book-"]')).toHaveCount(34);
    await expect(page.getByRole("heading", { name: /^תנאים/ })).toBeVisible();

    // a direct link opens the book
    await page.goto(base + "/timelines/judaism/#book-1565");
    await expect(page.locator("#book-1565 details")).toHaveAttribute("open", "");
    await expect(page.locator("#book-1565")).toContainText("רבי יוסף קארו");

    await page.goto(base + "/timelines/judaism/");
    await page.getByLabel("רק הספרים המרכזיים").check();
    expect(await page.locator('li[id^="book-"]').count()).toBeLessThan(34);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);

    await page.getByRole("tab", { name: /מרכזי התורה/ }).click();
    await expect(page.getByRole("heading", { name: "בבל" })).toBeVisible();
    await page.getByRole("tab", { name: /יסודות/ }).click();
    await expect(page.getByRole("heading", { name: /מבנה התנ"ך/ })).toBeVisible();
    await page.getByRole("tab", { name: /תרגול/ }).click();
    await expect(page.getByText("שאלה 1 מתוך 10")).toBeVisible();
    await context.close();
  }
  expect(errors).toEqual([]);
  console.log("judaism chain browser checks passed");
} finally {
  await browser.close();
  server.close();
}
