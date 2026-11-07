// Browser walk-through of the part-B workshop and drills on the static build (run `npm run build` first).
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const out = fileURLToPath(new URL("../out/", import.meta.url));
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let target = resolve(out, "." + path);
  if (!target.startsWith(out)) { res.writeHead(403).end(); return; }
  if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, "index.html");
  if (!existsSync(target)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", mime[extname(target)] ?? "application/octet-stream");
  res.end(readFileSync(target));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/moreh-derech`;
const browser = await chromium.launch();
const shots = process.env.SHOTS;
try {
  for (const [name, opts] of [["desktop", { viewport: { width: 1280, height: 900 } }], ["phone", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
    const page = await browser.newPage(opts);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${base}/guide-reports/workshop/`);
    // July 2026, group 2 (Shephelah) — the one worked in class.
    await page.selectOption("select", "july-2026");
    await page.getByRole("button", { name: "יודע לכתוב 400 מילים" }).nth(1).click();
    await page.getByRole("button", { name: "לעבוד על הקבוצה הזו ←" }).nth(1).click();
    // Step 2: mark a word, compare.
    await page.getByRole("button", { name: "ישראלים", exact: true }).click();
    await page.getByRole("button", { name: "השוואה למפתח" }).click();
    assert.ok(await page.getByText("עברית; מכירים את הסיפורים").isVisible());
    if (shots) await page.screenshot({ path: `${shots}/${name}-read.png`, fullPage: true });
    await page.getByRole("button", { name: "לשלב הבא ←" }).click();
    // Step 3: one idea per list, choose each.
    const ideas = ["עמק האלה", "תל עזקה", "עמאוס ניקופוליס", "יערות קק״ל", "המערה הצידונית", "תל לכיש — השער"];
    const forms = page.locator("form");
    for (let i = 0; i < ideas.length; i++) {
      await forms.nth(i).locator("input").fill(ideas[i]);
      await forms.nth(i).locator("button").click();
      await page.getByRole("button", { name: ideas[i], exact: true }).click();
    }
    await page.getByRole("button", { name: "מה עוד היה אפשר?" }).click();
    assert.ok(await page.getByText("כך הרכז פתר את הקבוצה הזו בשיעור").isVisible());
    if (shots) await page.screenshot({ path: `${shots}/${name}-brainstorm.png`, fullPage: true });
    await page.getByRole("button", { name: "לשלב הבא ←" }).click();
    // Step 4: road guiding on the first leg, check the schedule renders.
    await page.locator("select").last().selectOption({ index: 1 });
    assert.ok(await page.getByText("נסיעה מצטברת").isVisible());
    if (shots) await page.screenshot({ path: `${shots}/${name}-schedule.png`, fullPage: true });
    await page.getByRole("button", { name: "לשלב הבא ←" }).click();
    // Step 5: generated table, then hand-off to the simulator.
    assert.ok(await page.getByText("יחידה מורחבת: תל לכיש — השער").isVisible());
    await page.getByRole("button", { name: "להמשיך לכתיבה בסימולטור ←" }).click();
    await page.waitForURL(/guide-reports\/exam\/?\?draft=/);
    await page.getByText("חלק I — תוכנית יום הטיול").waitFor();
    assert.equal(await page.locator('input[placeholder="האתר, והמיקום שממנו אתם מדריכים"]').first().inputValue(), "עמק האלה");
    const firstRow = await page.locator("tbody textarea").first().inputValue();
    assert.match(firstRow, /נסיעה אל/);
    // Reload keeps the workshop state.
    await page.goto(`${base}/guide-reports/workshop/`);
    await page.selectOption("select", "july-2026");
    await page.getByRole("button", { name: "לעבוד על הקבוצה הזו ←" }).nth(1).click();
    assert.ok(await page.getByText("שלב 5 — בעיני הבוחן").isVisible());
    // Drills.
    await page.goto(`${base}/guide-reports/drills/`);
    await page.getByRole("button", { name: "זמנים ומנהלות" }).click();
    await page.getByRole("button", { name: "10 דקות" }).click();
    assert.ok(await page.getByText("נכון", { exact: true }).isVisible());
    if (shots) await page.screenshot({ path: `${shots}/${name}-drill.png`, fullPage: true });
    await page.goto(`${base}/guide-reports/coordinator/`);
    assert.ok(await page.getByText("\"אתר מקראי\" = תנ״ך").isVisible());
    assert.deepEqual(errors, [], name);
    console.log(`${name}: ok`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
