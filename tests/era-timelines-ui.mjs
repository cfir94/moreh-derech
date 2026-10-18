// Browser checks for the Roman and Byzantine timelines, against the static export in out/.
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
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(base + "/timelines/");
  await page.getByRole("link", { name: /התקופה הרומית — מפומפיוס עד קונסטנטינוס/ }).click();
  await expect(page.getByRole("heading", { name: "התקופה הרומית", exact: true })).toBeVisible();
  await expect(page.locator('article[id^="RO-"]')).toHaveCount(48);
  await page.getByRole("checkbox", { name: "מושגים למבחן" }).check();
  expect(await page.locator('article[id^="RO-"]').count()).toBeLessThan(48);
  await page.getByRole("button", { name: "ניקוי סינון" }).click();
  await page.getByRole("searchbox", { name: "חיפוש בתצוגה הנוכחית" }).fill("ביתר");
  await expect(page.locator("#RO-033")).toBeVisible();
  await page.getByRole("searchbox", { name: "חיפוש בתצוגה הנוכחית" }).fill("לאקייםבכלל");
  await expect(page.getByRole("heading", { name: "לא נמצאו אירועים מתאימים" })).toBeVisible();
  await page.getByRole("button", { name: "להציג את כל האירועים" }).click();
  await page.getByRole("button", { name: /הקיסרים והלגיונות/ }).click();
  await expect(page.getByRole("heading", { name: "אדריאנוס" })).toBeVisible();

  await page.goto(base + "/timelines/roman/#RO-030");
  await expect(page.locator("#RO-030 details")).toHaveAttribute("open", "");

  await page.goto(base + "/timelines/byzantine/");
  await expect(page.getByRole("heading", { name: "התקופה הביזנטית", exact: true })).toBeVisible();
  await expect(page.locator('article[id^="BY-"]')).toHaveCount(45);
  await page.getByRole("button", { name: /תור הזהב של יוסטיניאנוס/ }).click();
  await expect(page.locator("#BY-033")).toBeVisible();
  await expect(page.locator("#BY-002")).toHaveCount(0);
  await page.getByRole("button", { name: /^צליינים/ }).click();
  await expect(page.getByRole("heading", { name: "אגריה" })).toBeVisible();
  await page.goto(base + "/timelines/byzantine/#BY-036");
  await expect(page.locator("#BY-036 details")).toHaveAttribute("open", "");

  const phone = await browser.newContext({ viewport: { width: 320, height: 760 } });
  await phone.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
  const small = await phone.newPage();
  small.on("pageerror", (error) => errors.push(error.message));
  for (const slug of ["roman", "byzantine"]) {
    await small.goto(`${base}/timelines/${slug}/`);
    const overflow = await small.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${slug}: horizontal overflow at 320px`).toBeLessThanOrEqual(1);
  }
  expect(errors).toEqual([]);
  console.log("era timeline browser checks passed");
} finally {
  await browser.close();
  server.close();
}
