// שאלוני התיארוך (LA-40) בדפדפן: בחירת סט, שאלה אמריקאית, השלמה עם דירוג עצמי, סיום ורישום במעקב.
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
  for (const viewport of [{ width: 1280, height: 900 }, { width: 360, height: 800 }]) {
    const context = await browser.newContext({ viewport });
    await context.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/quizzes/dating/");
    await expect(page.getByRole("heading", { name: "שאלוני תיארוך", level: 1 })).toBeVisible();
    const sets = page.locator("main ul > li > button");
    await expect(sets).toHaveCount(7);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);

    // play a whole set: answer every question, whatever its kind
    await sets.first().click();
    for (let n = 0; n < 40; n++) {
      if (await page.getByRole("heading", { name: "לחזור עליהן" }).isVisible().catch(() => false)) break;
      if (await page.getByRole("button", { name: "שוב את אותו סט" }).isVisible().catch(() => false)) break;
      const reveal = page.getByRole("button", { name: "הצגת התשובה" });
      await page.getByText(/^\d+ \/ \d+$/).waitFor();
      if (await reveal.isVisible().catch(() => false)) {
        await reveal.click();
        await page.getByRole("button", { name: "ידעתי", exact: true }).click();
      } else {
        await page.locator("main section button:has(span.grid)").first().click();
      }
      await page.getByRole("button", { name: /^(הבא|לתוצאות)$/ }).click();
    }
    await expect(page.getByRole("button", { name: "שוב את אותו סט" })).toBeVisible();
    const recorded = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("md_progress_v2")).map((k) => localStorage.getItem(k)).join(""));
    expect(recorded).toContain("timeline-dating-prehistory_bronze");
    await context.close();
  }
  expect(errors).toEqual([]);
  console.log("dating quizzes browser checks passed");
} finally {
  await browser.close();
  server.close();
}
