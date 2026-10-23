// Browser checks for the classical architecture page, against the static export in out/.
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
  await expect(page.locator('section[id^="ch-"]')).toHaveCount(12);

  // Orders: hovering a part of the drawing explains it, in all three orders at once.
  const orders = page.locator("#ch-orders");
  await orders.getByRole("button", { name: "בסיס — יוני" }).hover();
  await expect(orders.getByRole("complementary").getByRole("heading", { name: /בסיס/ })).toBeVisible();
  await expect(orders.getByRole("complementary")).toContainText("אין בסיס!");
  await orders.getByRole("checkbox", { name: "פדסטל" }).check();
  await expect(orders.getByRole("button", { name: "פדסטל" }).first()).toBeVisible();
  await orders.getByRole("button", { name: "יוני", exact: true }).first().click();
  await orders.getByRole("button", { name: "קורינתי" }).last().click();
  await expect(orders.getByRole("status")).not.toHaveText(/^\s*$/);

  // City variants and the mikveh sequence.
  const city = page.locator("#ch-city");
  await city.getByRole("button", { name: "סוסיתא — רק דקומנוס" }).click();
  await expect(city.getByRole("complementary").first()).toContainText("אין קרדו מקסימוס");
  const purity = page.locator("#ch-purity");
  await purity.getByRole("button", { name: "הקיץ עובר…" }).click();
  await purity.getByRole("button", { name: "לרוקן ולמלא במים שאובים" }).click();
  await expect(purity.getByRole("complementary")).toContainText("פסולים");
  await purity.getByRole("button", { name: "להסיר את הפקק לאוצר" }).click();
  await expect(purity.getByRole("complementary")).toContainText("מוכשרים");

  // The chariot race counts its laps.
  const ent = page.locator("#ch-entertainment");
  await ent.getByRole("button", { name: "להזניק את המרכבה" }).click();
  await expect(ent.getByText(/סיבוב \d\/7/)).toBeVisible();

  // Glossary search and deep links.
  await page.getByRole("searchbox", { name: "חיפוש מושג" }).fill("מונרה");
  await expect(page.locator("#t-munera")).toBeVisible();
  await expect(page.locator("details[id^='t-']")).toHaveCount(1);
  await page.goto(base + "/timelines/classical-architecture/#t-hypocaust");
  await expect(page.locator("#t-hypocaust")).toHaveAttribute("open", "");

  const phone = await browser.newContext({ viewport: { width: 320, height: 760 } });
  await phone.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
  const small = await phone.newPage();
  small.on("pageerror", (error) => errors.push(error.message));
  await small.goto(`${base}/timelines/classical-architecture/`);
  const overflow = await small.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "horizontal overflow at 320px").toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
  console.log("classical architecture browser checks passed");
} finally {
  await browser.close();
  server.close();
}
