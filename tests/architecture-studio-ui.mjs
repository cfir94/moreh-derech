// Browser checks for the classical architecture studio — one chapter per screen — against the static export in out/.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
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
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

  await page.goto(base + "/timelines/");
  await page.getByRole("link", { name: /מושגי יסוד באדריכלות קלאסית/ }).click();
  await expect(page.getByRole("heading", { name: "מושגי יסוד באדריכלות קלאסית", level: 1 })).toBeVisible();
  const rail = page.getByRole("tablist", { name: "לוחות" });
  await expect(rail.getByRole("tab")).toHaveCount(14);
  await expect(rail.getByRole("tab", { selected: true })).toContainText("הסדרים");

  // One screen per chapter: the page is not a long scroll.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(height, "orders chapter fits in about two screens").toBeLessThan(2400);

  // 3D opens first; the model renders, or the page says the browser cannot show it.
  const stage = page.locator("#arch-stage");
  await expect(stage.locator("canvas").or(stage.getByText("הדפדפן הזה לא מציג תלת־ממד"))).toBeVisible({ timeout: 20000 });
  await stage.getByRole("button", { name: /כותרת/ }).first().click();
  await expect(stage.getByRole("complementary").first()).toContainText("כותרת");

  // The 2D drawing is a sub-tab of the same chapter.
  await stage.getByRole("tab", { name: "השוואה בשרטוט" }).click();
  await stage.getByRole("button", { name: "בסיס — יוני" }).hover();
  await expect(stage.getByRole("complementary").first()).toContainText("אין בסיס!");

  // Changing chapter swaps the screen in place and is reflected in the URL.
  await rail.getByRole("tab", { name: /מבני בידור/ }).click();
  await expect(page).toHaveURL(/#entertainment$/);
  await expect(page.getByRole("heading", { name: "מבני בידור", level: 2 })).toBeVisible();
  await stage.getByRole("tab", { name: "היפודרום", exact: true }).click();
  await stage.getByRole("button", { name: "להזניק את המרכבה" }).click();
  await expect(stage.getByText(/סיבוב \d\/7/)).toBeVisible();
  await stage.getByRole("button", { name: /בית המרחץ/ }).click();
  await expect(page).toHaveURL(/#baths$/);
  await page.goBack();
  await expect(page).toHaveURL(/#entertainment$/);
  await expect(rail.getByRole("tab", { selected: true })).toContainText("מבני בידור");

  // Every chapter but the decoration experiments opens on a 3D model.
  for (const id of ["temples", "city", "roads", "water", "entertainment", "baths", "purity", "burial", "synagogues", "churches"]) {
    await page.goto(`${base}/timelines/classical-architecture/#${id}`);
    await expect(stage.getByRole("tab", { selected: true })).toContainText("תלת־ממד");
    await expect(stage.locator("canvas").or(stage.getByText("הדפדפן הזה לא מציג תלת־ממד"))).toBeVisible({ timeout: 20000 });
  }

  // Field photos open in a lightbox with their credit.
  await page.goto(`${base}/timelines/classical-architecture/#synagogues`);
  await stage.getByRole("tab", { name: "תמונות מהשטח" }).click();
  await stage.getByRole("button", { name: /להגדיל: בית הכנסת בגמלא/ }).click();
  const box = page.getByRole("dialog", { name: "תמונה מוגדלת" });
  await expect(box).toBeVisible();
  await expect(box).toContainText("צילום:");
  await box.getByRole("button", { name: "התמונה הבאה" }).click();
  await box.getByRole("button", { name: /סגירה/ }).click();
  await expect(box).toBeHidden();

  // Deep links: a chapter, and a glossary term from site search.
  await page.goto(base + "/timelines/classical-architecture/#water");
  await expect(rail.getByRole("tab", { selected: true })).toContainText("אמות מים");
  await page.goto(base + "/timelines/classical-architecture/#t-munera");
  await expect(rail.getByRole("tab", { selected: true })).toContainText("מילון");
  await expect(page.locator("#t-munera")).toHaveAttribute("open", "");

  const phone = await browser.newContext({ viewport: { width: 320, height: 760 } });
  await phone.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
  const small = await phone.newPage();
  small.on("pageerror", (error) => errors.push(error.message));
  for (const hash of ["", "#burial", "#synagogues", "#glossary"]) {
    await small.goto(`${base}/timelines/classical-architecture/${hash}`);
    await small.waitForTimeout(400);
    const overflow = await small.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow at 320px ${hash}`).toBeLessThanOrEqual(1);
  }
  expect(errors).toEqual([]);
  console.log("architecture studio browser checks passed");
} finally {
  await browser.close();
  server.close();
}
