// Browser checks for the map chooser and the learning map, against the static export in out/.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

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
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => msg.type() === "error" && /hydrat/i.test(msg.text()) && errors.push(msg.text()));

  // "מפה" offers the two maps; the field map moved to /map/route
  await page.goto(base + "/map/");
  await expect(page.getByRole("link", { name: /תכנון מסלול/ })).toHaveAttribute("href", /\/map\/route\/?$/);
  await page.getByRole("link", { name: /מפת למידה/ }).click();
  await expect(page.getByRole("heading", { name: "מפת למידה" })).toBeVisible();
  const markers = page.locator("svg g[role=button][aria-label]");
  expect(await markers.count()).toBeGreaterThan(40);

  // the list is in building order; a row opens the site card and marks the dot
  await page.getByRole("button", { name: "ביזנטית", exact: true }).click();
  await page.getByRole("button", { name: /^יוסטיניאנוס/ }).click();
  const rows = page.locator("ul li > button");
  await expect(rows.filter({ hasText: "הניאה" })).toHaveCount(1);
  await expect(rows.filter({ hasText: "הבסיליקה של יוסטיניאנוס" })).toHaveCount(1);
  await expect(rows.filter({ hasText: "הכנסייה הקונסטנטינית" })).toHaveCount(0);
  await rows.filter({ hasText: "הניאה" }).click();
  await expect(page.getByRole("heading", { name: "כנסיית הניאה" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "ירושלים" })).toHaveAttribute("aria-selected", "true");
  expect(new URL(page.url()).hash).toBe("#nea");
  await page.getByRole("button", { name: "✓ יודע" }).click();
  await expect(page.getByRole("button", { name: "✓ יודע" })).toHaveAttribute("aria-pressed", "true");

  // deep link, and the Jerusalem badge on the country sheet
  await page.goto(base + "/map/learn/#beit-alfa");
  await expect(page.getByRole("heading", { name: "בית הכנסת בבית אלפא" })).toBeVisible();
  await expect(page.getByText("עקדת יצחק", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "→ לרשימה" }).click();
  await page.getByRole("button", { name: "כל המפה" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /^ירושלים — \d+ אתרים/ }).click();
  await expect(page.getByRole("tab", { name: "ירושלים" })).toHaveAttribute("aria-selected", "true");

  // practice: "where is it?" — giving up reveals the answer; "what is it?" — options
  await page.getByRole("tab", { name: "תרגול" }).click();
  await page.getByRole("button", { name: /איפה זה\?/ }).click();
  await expect(page.getByText(/שאלה 1 מתוך/)).toBeVisible();
  await page.getByRole("button", { name: "לא יודע — הראו לי" }).click();
  await expect(page.getByText("✗ לא בדיוק")).toBeVisible();
  await page.getByRole("button", { name: "לשאלה הבאה ←" }).click();
  await expect(page.getByText(/שאלה 2 מתוך/)).toBeVisible();
  await page.getByRole("tab", { name: "תרגול" }).click();
  await page.getByRole("button", { name: /מה זה\?/ }).click();
  const options = page.locator("[class*=options] button");
  await expect(options).toHaveCount(4);
  await options.first().click();
  await expect(page.getByRole("status")).toBeVisible();

  const phone = await browser.newContext({ viewport: { width: 360, height: 760 } });
  await phone.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
  const small = await phone.newPage();
  small.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/map/", "/map/learn/", "/map/learn/#mamre"]) {
    await small.goto(base + path);
    await small.waitForTimeout(300);
    const overflow = await small.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path}: horizontal overflow at 360px`).toBeLessThanOrEqual(1);
  }
  expect(errors).toEqual([]);
  console.log("learning map browser checks passed");
} finally {
  await browser.close();
  server.close();
}
