// ממצאי תקופת הברזל (LA-40) בדפדפן: הרשימה, תמונות, סינון לפי סוג, המלכים באותה עת ותרגול.
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
    await page.goto(base + "/timelines/archaeology/");
    await expect(page.getByRole("heading", { name: /ממצאים, מצורים וביצורים/, level: 1 })).toBeVisible();
    await expect(page.locator('article[id^="find-"]')).toHaveCount(25);
    await expect(page.locator("#find-701")).toContainText("ביהודה: חזקיהו");
    const img = page.locator("#find-701 figure img");
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);

    await page.getByRole("button", { name: "מצורים וחורבנות" }).click();
    expect(await page.locator('article[id^="find-"]').count()).toBeLessThan(25);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);

    await page.getByRole("tab", { name: /תרגול/ }).click();
    await expect(page.getByText("שאלה 1 מתוך 10")).toBeVisible();
    await context.close();
  }
  expect(errors).toEqual([]);
  console.log("iron finds browser checks passed");
} finally {
  await browser.close();
  server.close();
}
