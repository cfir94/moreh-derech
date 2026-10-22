import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let path = resolve(out, "." + pathname);
  if (path !== out && !path.startsWith(out + sep)) { res.writeHead(403).end(); return; }
  if (existsSync(path) && statSync(path).isDirectory()) path = resolve(path, "index.html");
  if (!existsSync(path)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", mime[extname(path)] ?? "application/octet-stream");
  res.end(readFileSync(path));
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const base = process.env.PERIODS_TEST_BASE_URL ?? `http://127.0.0.1:${server.address().port}/moreh-derech`;
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + "/timelines/");
  await page.getByRole("link", { name: /טבלת התקופות — מבט משווה/ }).click();
  await expect(page.getByRole("heading", { name: "טבלת התקופות", exact: true })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.locator("[data-period-row]")).toHaveCount(26);
  const spans = await page.locator("tbody").evaluate(tbody => [...tbody.rows].reduce((remaining, row) => {
    let column = 0;
    for (const cell of row.cells) {
      while (remaining[column] > 0) column++;
      if (column >= 5) throw Error("Too many cells: " + row.rowIndex);
      remaining[column++] = cell.rowSpan;
    }
    if (remaining.some(value => value < 1)) throw Error("Missing cell: " + row.rowIndex);
    return remaining.map(value => value - 1);
  }, [0, 0, 0, 0, 0]));
  expect(spans).toHaveLength(5);
  await page.locator('[data-period-row="cyrus"] summary').click();
  await expect(page.locator('[data-period-row="cyrus"] details')).toHaveAttribute("open", "");
  await expect(page.locator('[data-period-row="cyrus"] details')).toContainText("539 לפנה״ס");
  await page.getByRole("searchbox", { name: "חיפוש בטבלת התקופות" }).fill("הורדוס");
  await expect(page.locator("[data-period-row]")).toHaveCount(2);
  await page.getByRole("button", { name: /^פרס\s/ }).click();
  await expect(page.getByRole("heading", { name: "לא נמצאו אירועים מתאימים" })).toBeVisible();
  await page.getByRole("button", { name: "להציג את כל התקופות" }).click();
  await expect(page.locator("[data-period-row]")).toHaveCount(26);
  await page.getByRole("button", { name: /^רומא\s/ }).click();
  await expect(page.locator("[data-period-row]")).toHaveCount(9);
  await page.getByRole("button", { name: /ניקוי סינון/ }).click();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${theme}, ${width}px overflow`).toBe(true);
      if (width < 980) {
        await expect(page.locator("[data-period-card]")).toHaveCount(26);
        await expect(page.locator('[data-period-card="herods-sons"]')).toContainText("לפנה״ס");
        await expect(page.locator('[data-period-card="herods-sons"]')).toContainText("לספירה");
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("searchbox", { name: "חיפוש בטבלת התקופות" }).fill("גאלוס");
  await expect(page.locator("[data-period-card]")).toHaveCount(1);
  await page.locator('[data-period-card="gallus"] summary').click();
  await expect(page.locator('[data-period-card="gallus"] details')).toHaveAttribute("open", "");
  expect(errors).toEqual([]);
  console.log("periods table: desktop spans, filters, chronology notes, mobile, both themes and zero page errors passed");
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
