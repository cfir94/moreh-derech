// Browser checks for the Roman and Byzantine timelines, against the static export in out/.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
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
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route("**/*.supabase.co/**", (route) => route.fulfill({ json: [] }));
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(base + "/timelines/");
  await page.getByRole("link", { name: /התקופה הרומית — מפומפיוס עד קונסטנטינוס/ }).click();
  await expect(page.getByRole("heading", { name: "התקופה הרומית", exact: true })).toBeVisible();

  // notebook chapters (owner, 14.11): the strip of all eras, one chapter on screen, three things to remember
  const strip = page.getByRole("navigation", { name: "פס הזמן: הפרקים" });
  await expect(strip.getByRole("button")).toHaveCount(7);
  await expect(page.getByRole("heading", { name: "רומא מגיעה", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "שלושה דברים לזכור" })).toBeVisible();
  await expect(page.locator('li[id^="RO-"]')).toHaveCount(5);

  await strip.getByRole("button", { name: /המרד והשושלת הפלבית/ }).click();
  await expect(page.getByRole("heading", { name: "המרד והשושלת הפלבית", level: 2 })).toBeVisible();
  await expect(strip.getByRole("button", { name: /המרד והשושלת הפלבית/ })).toHaveAttribute("aria-current", "step");
  const stations = await page.locator('li[id^="RO-"]').count();
  await page.getByRole("button", { name: "מושגים למבחן" }).click();
  expect(await page.locator('li[id^="RO-"]').count()).toBeLessThan(stations);
  await page.getByRole("button", { name: "מושגים למבחן" }).click();
  // the chapter's own practice, then the way on
  await expect(page.getByRole("heading", { name: "בדקו את עצמכם על הפרק" })).toBeVisible();
  await expect(page.getByRole("button", { name: /הפרק הבא/ })).toBeVisible();

  // search reaches every chapter; a result opens its chapter and the event
  const search = page.getByRole("searchbox", { name: "חיפוש" });
  await search.fill("ביתר");
  await page.getByRole("button", { name: /נפילת ביתר/ }).click();
  await expect(page.getByRole("heading", { name: "מטריאנוס עד בר כוכבא", level: 2 })).toBeVisible();
  await expect(page.locator("#RO-033 > button")).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("heading", { name: "נפילת ביתר", level: 3 })).toBeVisible();
  await search.fill("לאקייםבכלל");
  await expect(page.getByText("לא נמצאו אירועים מתאימים")).toBeVisible();
  await page.getByRole("button", { name: "לנקות את החיפוש" }).click();
  await page.getByRole("tab", { name: /הקיסרים והלגיונות/ }).click();
  await expect(page.getByRole("heading", { name: "אדריאנוס" })).toBeVisible();

  // a direct link opens the event's chapter and its page, with the photo really loaded
  const loaded = async (id) => {
    const img = page.locator(`article[aria-labelledby="${id}-title"] figure img`);
    await img.scrollIntoViewIfNeeded();
    await expect(img).toBeVisible();
    await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
  };
  await page.goto(base + "/timelines/roman/#RO-030");
  await expect(page.locator("#RO-030 > button")).toHaveAttribute("aria-expanded", "true");
  await loaded("RO-030");
  await page.goto(base + "/timelines/roman/#RO-019");
  await loaded("RO-019");
  await expect(page.locator('article[aria-labelledby="RO-019-title"] figcaption')).toContainText("·");

  await page.goto(base + "/timelines/byzantine/");
  await expect(page.getByRole("heading", { name: "התקופה הביזנטית", exact: true })).toBeVisible();
  const byzStrip = page.getByRole("navigation", { name: "פס הזמן: הפרקים" });
  await expect(byzStrip.getByRole("button")).toHaveCount(5);
  await byzStrip.getByRole("button", { name: /תור הזהב של יוסטיניאנוס/ }).click();
  await expect(page.locator("#BY-033")).toBeVisible();
  await expect(page.locator("#BY-002")).toHaveCount(0);
  await page.getByRole("tab", { name: /^צליינים/ }).click();
  await expect(page.getByRole("heading", { name: "אגריה" })).toBeVisible();
  await page.goto(base + "/timelines/byzantine/#BY-036");
  await expect(page.locator("#BY-036 > button")).toHaveAttribute("aria-expanded", "true");
  await loaded("BY-036");
  await page.goto(base + "/timelines/byzantine/#BY-023");
  await loaded("BY-023");

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
