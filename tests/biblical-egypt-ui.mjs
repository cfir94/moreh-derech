import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const out = resolve(root, "out");
const readTimeline = name => JSON.parse(readFileSync(resolve(root, `src/data/timelines/${name}.ts`), "utf8").match(/const timelines: Timeline\[\] = (\[[\s\S]*\]);\n\nexport default/)[1]);
const biblical = readTimeline("biblical");
const egypt = readTimeline("egypt-canaan")[0];
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let path = resolve(out, "." + pathname);
  if (path !== out && !path.startsWith(out + sep)) return res.writeHead(403).end();
  if (existsSync(path) && statSync(path).isDirectory()) path = resolve(path, "index.html");
  if (!existsSync(path)) return res.writeHead(404).end();
  res.setHeader("Content-Type", ({ ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" })[extname(path)] ?? "application/octet-stream");
  res.end(readFileSync(path));
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}/moreh-derech`;
const browser = await chromium.launch({ headless: true, channel: process.env.WHO_AM_I_BROWSER_CHANNEL || undefined });
const errors = [];

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    const page = await browser.newPage({ viewport });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}/timelines/biblical/`, { waitUntil: "networkidle" });
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.getByRole("tab")).toHaveCount(biblical.length + 1);
    for (const timeline of biblical) {
      await page.getByRole("tab", { name: new RegExp(timeline.shortTitle ?? timeline.title) }).click();
      const cards = page.locator("article");
      await expect(cards).toHaveCount(timeline.events.length);
      for (const [eventIndex, event] of timeline.events.entries()) {
        const card = cards.nth(eventIndex);
        await expect(card.getByRole("heading", { name: event.title, exact: true })).toBeVisible();
        await expect(card).toContainText(event.reference);
        await expect(card).toContainText(event.body);
        await card.locator("summary").click();
        if (event.quote) await expect(card).toContainText(event.quote);
        for (const section of event.sections) {
          await expect(card).toContainText(section.reference);
          await expect(card).toContainText(section.quote);
        }
      }
    }
    await page.goto(`${base}/timelines/biblical/#${biblical.at(-1).events.at(-1).id}`);
    await expect(page.locator(`#${biblical.at(-1).events.at(-1).id}`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

    await page.goto(`${base}/timelines/egypt-canaan/`, { waitUntil: "networkidle" });
    await expect(page.locator("iframe")).toHaveCount(0);
    for (const kind of ["egypt", "israel"]) {
      await page.getByRole("tab", { name: kind === "egypt" ? /מצרים/ : /ראשית ישראל/ }).click();
      const expected = egypt.events.filter(event => event.kind === kind);
      await expect(page.locator("article")).toHaveCount(expected.length);
      for (const event of expected) await expect(page.locator(`#${event.id}`)).toContainText(event.body);
    }
    await page.getByRole("tab", { name: "תרגול" }).click();
    await expect(page.getByRole("heading", { name: /מה התרחש/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.close();
  }
  for (const path of ["biblical", "egypt-canaan"]) {
    const page = await browser.newPage();
    await page.goto(`${base}/timelines/${path}/classic/`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("iframe")).toHaveCount(1);
    await page.close();
  }
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("biblical and Egypt–Canaan UI ok");
} finally {
  await browser.close();
  server.close();
}
