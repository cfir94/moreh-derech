import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

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
const base = process.env.ROMAN_PEOPLE_TEST_BASE_URL ?? `http://127.0.0.1:${server.address().port}/moreh-derech`;
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + "/timelines/", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: /מי זה מי ברומא/ }).click();
  await expect(page.getByRole("heading", { name: "מי זה מי ברומא?", exact: true })).toBeVisible();
  await expect(page.locator("[data-person-button]")).toHaveCount(36);
  // Exercise every downloaded portrait, including the non-core figures, from the
  // exported site. A passing fallback alone must never count as a loaded image.
  const personIds = await page.locator("[data-person-button]").evaluateAll(buttons => buttons.map(button => button.dataset.personButton));
  for (const id of personIds) {
    await page.locator(`[data-person-button="${id}"]`).click();
    const portrait = page.locator(`[data-person-detail="${id}"] [data-portrait]`);
    if (id === "florus") {
      await expect(portrait.locator("img")).toHaveCount(0);
    } else {
      const image = portrait.locator("img");
      await expect(image).toHaveCount(1);
      await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await image.getAttribute("src")).toBe(`/moreh-derech/images/roman-people/portraits/${id}.webp`);
      await expect(portrait.locator("a")).toHaveAttribute("href", await image.getAttribute("src"));
      await expect(page.locator(`[data-person-detail="${id}"] a[href^="https://commons.wikimedia.org/wiki/File:"]`).first()).toBeVisible();
    }
  }
  await page.locator('[data-person-button="pompey"]').click();
  await expect(page.locator('[data-person-button="pompey"]')).toBeVisible();
  await expect.poll(() => page.locator("[data-era-art] img").evaluateAll(images => images.length === 4 && images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await expect(page.getByRole("button", { name: "הדמות הקודמת", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "הדמות הבאה", exact: true }).click();
  await expect(page.locator('[data-person-detail="antony"]')).toBeVisible();
  const stage = page.locator('[aria-label^="הדמות הנבחרת."]');
  await stage.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('[data-person-detail="augustus"]')).toBeVisible();
  await expect(page.getByText("אוקטביאנוס → אקטיום → אוגוסטוס. שלושה עוגנים, אדם אחד.", { exact: true })).toBeVisible();
  await expect(page.locator('[data-person-detail="augustus"] [class*="trap"]')).toBeVisible();
  const textSize = await page.locator('[data-person-detail="augustus"] [class*="action"]').evaluate(node => parseFloat(getComputedStyle(node).fontSize));
  expect(textSize).toBeGreaterThanOrEqual(17);
  expect(textSize).toBeLessThanOrEqual(19);
  const search = page.getByRole("searchbox", { name: "חיפוש דמות, אירוע או מקום" });
  await search.fill("אוקטביאנוס");
  await expect(page.locator("[data-person-button]")).toHaveCount(2);
  await expect(page.locator('[data-person-detail="augustus"]')).toContainText("אקטיום");
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  await page.getByLabel("תפקיד", { exact: true }).selectOption("deputy");
  await expect(page.locator("[data-person-button]")).toHaveCount(1);
  await expect(page.locator('[data-person-detail="gallus"]')).toContainText("351");
  await page.getByRole("button", { name: /להבדיל בין שמות/ }).click();
  await page.getByLabel("בחר זוג להשוואה").selectOption("two-galluses");
  await expect(page.locator("[data-person-detail]")).toHaveCount(2);
  await expect(page.locator('[data-person-detail="cestius"]')).toContainText("66");
  await expect(page.locator('[data-person-detail="gallus"]')).toContainText("קיסר משנה");
  await page.getByRole("button", { name: /להכיר את הדמויות/ }).click();
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  await search.fill("פומפיוס");
  await page.getByRole("button", { name: /לבדוק מה זכרתי/ }).click();
  await expect(page.getByText("כרטיס 1 מתוך 1", { exact: true })).toBeVisible();
  await expect(page.locator('[class*="answerIdentity"]')).toHaveCount(0);
  await page.getByRole("button", { name: "לחשוף את התשובה" }).click();
  await expect(page.getByRole("heading", { name: "פומפיוס", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /צריך חיזוק/ }).click();
  await expect(page.getByRole("heading", { name: "הסבב הושלם" })).toBeVisible();
  await expect(page.getByText("זכרת 0 מתוך 1 דמויות.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /חזרה על 1 דמויות לחיזוק/ }).click();
  await page.getByRole("button", { name: "לחשוף את התשובה" }).click();
  await page.getByRole("button", { name: /זכרתי ✓/ }).click();
  await expect(page.getByText("זכרת 1 מתוך 1 דמויות.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /להכיר את הדמויות/ }).click();
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  await page.getByRole("button", { name: /המעבר לביזנטיון/ }).click();
  await expect(page.locator("[data-person-button]")).toHaveCount(12);
  await expect(page.locator("[data-roman-people]")).toHaveAttribute("data-visual-era", "byzantine");
  const byzantineScene = await page.locator("[data-roman-people]").evaluate(node => getComputedStyle(node).getPropertyValue("--scene"));
  await page.getByRole("button", { name: /רומא האימפריאלית/ }).click();
  await expect(page.locator("[data-roman-people]")).toHaveAttribute("data-visual-era", "empire");
  expect(await page.locator("[data-roman-people]").evaluate(node => getComputedStyle(node).getPropertyValue("--scene"))).not.toBe(byzantineScene);
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  await page.getByLabel("רק דמויות הליבה").check();
  await expect(page.locator("[data-person-button]")).toHaveCount(29);
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${theme}, ${width}px overflow`).toBe(true);
    }
  }
  await page.getByRole("button", { name: /בחירת דמות/ }).click();
  await page.locator('[data-person-button="titus"]').click();
  await expect(page.getByRole("button", { name: /בחירת דמות/ })).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator('[data-person-detail="titus"]')).toContainText("מצביא בחורבן");
  await page.locator('[data-person-detail="titus"] summary').click();
  await expect(page.locator('[data-person-detail="titus"] details')).toHaveAttribute("open", "");
  await search.fill("גאלוס");
  await page.getByRole("button", { name: /לבדוק מה זכרתי/ }).click();
  await expect(page.locator("[data-roman-people]")).toHaveAttribute("data-visual-era", "conquest");
  await page.getByRole("button", { name: "לחשוף את התשובה" }).click();
  await page.getByRole("button", { name: /זכרתי ✓/ }).click();
  await expect(page.locator("[data-roman-people]")).toHaveAttribute("data-visual-era", "byzantine");
  expect(errors).toEqual([]);
  console.log("Roman people: navigation, alias/era/role/core filters, comparison, recall/retry, mobile, dark mode and zero page errors passed");
} finally { await browser.close(); await new Promise(done => server.close(done)); }
