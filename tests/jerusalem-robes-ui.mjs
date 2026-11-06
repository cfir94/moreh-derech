import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

// Plays "גלימות ירושלים" end to end on the static export: every question shows a
// loaded photo, right answers are scored as right, and the identity card follows.
const out = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/, "");
  let path = resolve(out, "." + pathname);
  if (path !== out && !path.startsWith(out + sep)) { res.writeHead(403).end(); return; }
  if (existsSync(path) && statSync(path).isDirectory()) path = resolve(path, "index.html");
  if (!existsSync(path)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", ({ ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".webp": "image/webp" })[extname(path)] ?? "application/octet-stream");
  res.end(readFileSync(path));
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}/moreh-derech`;
const browser = await chromium.launch({ headless: true, channel: process.env.WHO_AM_I_BROWSER_CHANNEL || undefined });
const photos = JSON.parse(readFileSync(new URL("../src/data/christian-dress/photos.json", import.meta.url), "utf8"));
const errors = [];
const shots = process.env.ROBES_SHOTS || "test-results";

async function play(page, rounds, wrongFirst) {
  const kinds = new Set();
  for (let i = 0; i < rounds; i++) {
    const stage = page.locator("[data-kind]");
    const kind = await stage.getAttribute("data-kind");
    kinds.add(kind);
    for (const img of await page.locator("[data-kind] img").all()) await expect.poll(() => img.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
    const wrong = wrongFirst && i === 0;
    if (wrong) await page.getByRole("button", { name: "לא יודע/ת — לחשוף" }).click();
    else if (kind === "typed") {
      const id = await page.locator("[data-photo]").getAttribute("data-photo");
      const group = photos.find(p => p.id === id).group;
      const answer = { "greek-orthodox": "יוונים", "russian-orthodox": "רוסים", armenian: "ארמנים", ethiopian: "אתיופים", franciscan: "פרנציסקנים", dominican: "דומיניקנים", benedictine: "בנדיקטינים", "white-fathers": "האבות הלבנים", carmelite: "כרמליתים", trappist: "טרפיסטים", "missionaries-charity": "אמא תרזה", protestant: "פרוטסטנטים" }[group];
      await page.getByRole("textbox", { name: "שם הקהילה או המסדר" }).fill(answer);
      await page.getByRole("textbox", { name: "שם הקהילה או המסדר" }).press("Enter");
    } else {
      // The right answer is read back from the data: the group of the shown photo, or the one photo of the asked group.
      const choices = page.locator("[data-choice]");
      const ids = await choices.evaluateAll(els => els.map(el => el.getAttribute("data-choice")));
      let target;
      if (kind === "pick" || kind === "sepulchre") {
        const prompt = await page.locator("[data-prompt]").textContent();
        const groups = ids.map(id => photos.find(p => p.id === id).group);
        if (kind === "sepulchre") target = ids[groups.findIndex(g => !["greek-orthodox", "armenian", "coptic", "syriac", "ethiopian", "franciscan"].includes(g))];
        else target = ids.find((id, k) => prompt.includes(groupName[groups[k]]));
      } else {
        const shown = await page.locator("[data-photo]").getAttribute("data-photo");
        const group = photos.find(p => p.id === shown).group;
        target = kind === "family" ? familyOf[group] : group;
      }
      await page.locator(`[data-choice="${target}"]`).click();
    }
    await expect(page.locator("[data-feedback]")).toHaveAttribute("data-correct", wrong ? "false" : "true");
    if (i === 1) await page.screenshot({ path: `${shots}/robes-answer-${page.viewportSize().width}.png`, fullPage: true });
    await page.locator("[data-feedback] button").click();
  }
  return kinds;
}

const groupName = { "greek-orthodox": "היוונים-האורתודוקסים", "russian-orthodox": "הרוסים-האורתודוקסים", armenian: "הארמנים", coptic: "הקופטים", syriac: "הסורים-האורתודוקסים", ethiopian: "האתיופים", franciscan: "הפרנציסקנים", dominican: "הדומיניקנים", benedictine: "הבנדיקטינים", "white-fathers": "האבות הלבנים", carmelite: "הכרמליתים", trappist: "הטרפיסטים", "missionaries-charity": "המיסיונריות של הצדקה", protestant: "הכמרים הפרוטסטנטים והאנגליקנים" };
const familyOf = { "greek-orthodox": "eastern-orthodox", "russian-orthodox": "eastern-orthodox", armenian: "oriental-orthodox", coptic: "oriental-orthodox", syriac: "oriental-orthodox", ethiopian: "oriental-orthodox", franciscan: "catholic", dominican: "catholic", benedictine: "catholic", "white-fathers": "catholic", carmelite: "catholic", trappist: "catholic", "missionaries-charity": "catholic", protestant: "protestant" };

try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base + "/games/", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /גלימות ירושלים/ }).click();
    await expect(page.getByRole("heading", { name: /גלימות/ })).toBeVisible();
    await page.screenshot({ path: `${shots}/robes-home-${viewport.width}.png`, fullPage: true });
    await page.getByRole("button", { name: "מדריך השדה" }).click();
    await expect(page.locator("article")).toHaveCount(14);
    await page.screenshot({ path: `${shots}/robes-guide-${viewport.width}.png` });
    await page.getByRole("button", { name: "← חזרה לשער" }).click();
    await page.getByRole("button", { name: "20", exact: true }).click();
    await page.getByRole("button", { name: /יוצאים לסמטאות/ }).click();
    const kinds = await play(page, 20, true);
    await expect(page.locator("[data-summary]")).toBeVisible();
    await expect(page.locator("[data-summary]")).toContainText("19 מתוך 20");
    await page.screenshot({ path: `${shots}/robes-summary-${viewport.width}.png`, fullPage: true });
    if (viewport.width > 1000) expect(kinds.size).toBeGreaterThanOrEqual(6);
    await page.close();
  }
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("jerusalem robes UI ok");
} finally {
  await browser.close();
  server.close();
}
