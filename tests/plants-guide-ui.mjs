import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";
import { PLANTS } from "../src/data/plants/plants.ts";
import { parseSeasonMonths } from "../src/components/plants-guide/season.ts";

for (const plant of PLANTS) {
  const months = parseSeasonMonths(plant.season);
  assert.ok(months.every((value) => Number.isInteger(value) && value >= 0 && value < 12), plant.id);
}
assert.deepEqual(parseSeasonMonths("הראשון לפרוח: ינואר–פברואר, ט״ו בשבט"), [0, 1]);
assert.deepEqual(parseSeasonMonths("פריחה ורודה או לבנה"), []);

const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let path = resolve(out, "." + pathname);
  if (path !== out && !path.startsWith(out + sep)) { res.writeHead(403).end(); return; }
  if (existsSync(path) && statSync(path).isDirectory()) path = resolve(path, "index.html");
  if (!existsSync(path)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", ({ ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" })[extname(path)] ?? "application/octet-stream");
  res.end(readFileSync(path));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}/moreh-derech`;
const browser = await chromium.launch({ headless: true, channel: process.env.WHO_AM_I_BROWSER_CHANNEL || undefined });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 360, height: 800 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto(`${base}/timelines/plants-guide/`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "מגדיר צמחים", level: 1 })).toBeVisible();
    await expect(page.getByText("נשארו 40 צמחים")).toBeVisible();
    await page.getByLabel("בית גידול").selectOption("riverside");
    await expect(page.getByText("נשארו 2 צמחים")).toBeVisible();
    await page.getByRole("button", { name: /דולב מזרחי/ }).click();
    await expect(page).toHaveURL(/#plant-platanus-orientalis$/);
    await expect(page.getByRole("dialog")).toContainText("סימן מזהה");
    await page.getByRole("button", { name: "סגירה" }).click();
    await page.getByRole("button", { name: "ניקוי סינון" }).click();
    await page.getByRole("button", { name: "אפריל" }).click();
    await expect(page.getByText(/צמחים$/).last()).toBeVisible();
    await page.screenshot({ path: `test-results/plants-guide-${viewport.width}.png`, fullPage: true });
    await page.close();
  }
  console.log("plants guide UI ok");
} finally {
  await browser.close();
  server.close();
}
