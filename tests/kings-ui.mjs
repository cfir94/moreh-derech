// מלכי ישראל ויהודה (LA-40) בדפדפן: הציר, כרטיס מלך, הלשוניות והתרגול, במחשב ובטלפון.
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
    await page.goto(base + "/timelines/kings/");
    await expect(page.getByRole("heading", { name: "מלכי ישראל ויהודה", level: 1 })).toBeVisible();

    // the chart: every king of both kingdoms is a button, and a pick opens his card
    await expect(page.getByRole("button", { name: /, מלך יהודה,/ })).toHaveCount(20);
    await expect(page.getByRole("button", { name: /, מלך ישראל,/ })).toHaveCount(18);
    await page.getByRole("button", { name: /^אחאב, מלך ישראל/ }).click();
    await expect(page.getByRole("heading", { name: "אחאב", level: 2 })).toBeVisible();
    await expect(page.getByText(/אליהו —/)).toBeVisible();

    // no block hides another: the names of a cluster of one-year reigns stay apart
    const boxes = await page.getByRole("button", { name: /, מלך ישראל,/ }).evaluateAll((els) => els.map((el) => el.getBoundingClientRect()).map((r) => [r.top, r.bottom]));
    for (let i = 1; i < boxes.length; i++) expect(boxes[i][0], `Israel block ${i} overlaps the previous one`).toBeGreaterThanOrEqual(boxes[i - 1][1] - 1);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);

    await page.getByRole("tab", { name: /אירועים וממצאים/ }).click();
    await expect(page.getByRole("heading", { name: /כתובת השילוח/ })).toBeVisible();
    await page.getByRole("tab", { name: /הנביאים/ }).click();
    await expect(page.getByRole("heading", { name: "ירמיהו" })).toBeVisible();
    await page.getByRole("tab", { name: /תרגול/ }).click();
    await expect(page.getByText("שאלה 1 מתוך 10")).toBeVisible();
    await context.close();
  }
  expect(errors).toEqual([]);
  console.log("kings browser checks passed");
} finally {
  await browser.close();
  server.close();
}
