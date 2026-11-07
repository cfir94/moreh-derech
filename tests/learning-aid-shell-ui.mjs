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
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".woff2": "font/woff2" };
  response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
  response.end(readFileSync(file));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}/moreh-derech/timelines/shell-demo/`;
const browser = await chromium.launch({ headless: true, channel: process.env.WHO_AM_I_BROWSER_CHANNEL || undefined });
const errors = [];

try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(base, { waitUntil: "networkidle" });

    await page.getByRole("tab", { name: /תמונות/ }).click();
    await expect(page).toHaveURL(/#photos$/);
    await page.goto(`${base}#practice`, { waitUntil: "networkidle" });
    await expect(page.getByRole("tab", { name: /תרגול/ })).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: /סיכום/ }).click();
    const details = page.locator("details").first();
    await details.getByText("עוד", { exact: true }).click();
    await expect(details).toHaveAttribute("open", "");

    await page.getByRole("tab", { name: /תרגול/ }).click();
    for (let question = 0; question < 3; question++) {
      await page.locator('button[data-correct="true"]').click();
      await expect(page.locator("[data-feedback]")).toBeVisible();
      await page.getByRole("button", { name: "הבא" }).click();
    }
    await expect(page.locator("[data-practice-score]")).toContainText("3 מתוך 3");

    if (viewport.width === 390) {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
    await page.close();
  }
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("learning-aid shell UI ok");
} finally {
  await browser.close();
  server.close();
}
