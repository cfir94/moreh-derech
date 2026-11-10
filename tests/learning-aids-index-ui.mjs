import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let file = resolve(out, `.${pathname}`);
  if (file !== out && !file.startsWith(out + sep)) { response.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, "index.html");
  if (!existsSync(file)) { response.writeHead(404).end(); return; }
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".woff2": "font/woff2" };
  response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
  response.end(readFileSync(file));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}/moreh-derech/timelines/`;
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 360, height: 760 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto(base);
    for (const heading of ["צירי זמן", "חי, צומח ונוף", "אדריכלות וארכיאולוגיה", "אינטראקטיביים", "מפות"])
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /מגדיר הצמחים/ })).toHaveAttribute("href", /\/timelines\/plants-guide\/?$/);
    await expect(page.getByRole("link", { name: /הברית החדשה — חיי ישוע/ })).toHaveAttribute("href", /\/timelines\/biblical\/?$/);
    await expect(page.getByRole("link", { name: /מצרים, כנען וראשית ישראל/ })).toHaveAttribute("href", /\/timelines\/egypt-canaan\/?$/);
    await expect(page.getByRole("link", { name: /מפת למידה/ })).toHaveAttribute("href", /\/map\/learn\/?$/);
    await expect(page.getByRole("link", { name: /תכנון מסלול/ })).toHaveAttribute("href", /\/map\/route\/?$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.close();
  }
  console.log("learning-aids grouped index UI ok");
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
