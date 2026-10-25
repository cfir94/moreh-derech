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
  await expect(page.getByRole("heading", { name: "עזרי למידה", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "עזרי למידה", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /מי זה מי ברומא/ }).click();
  await expect(page.getByRole("heading", { name: "מי זה מי ברומא?", exact: true })).toBeVisible();
  await expect(page.locator("[data-person-button]")).toHaveCount(36);
  const companionNote = page.locator("[data-herodian-context]");
  await companionNote.locator(":scope > summary").click();
  await expect(companionNote.locator("[data-companion]")).toHaveCount(3);
  for (const id of ["herod-great", "antipas", "agrippa1"]) {
    const figure = companionNote.locator(`[data-companion="${id}"]`);
    await figure.scrollIntoViewIfNeeded();
    const image = figure.locator("img");
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(figure.locator("a").first()).toHaveAttribute("href", `/moreh-derech/images/roman-people/companions/${id}.webp`);
  }
  await companionNote.locator(":scope > summary").click();

  // Exercise every downloaded portrait, including the non-core figures, from the
  // exported site. A passing fallback alone must never count as a loaded image.
  const personIds = await page.locator("[data-person-button]").evaluateAll(buttons => buttons.map(button => button.dataset.personButton));
  for (const id of personIds) {
    await page.locator(`[data-person-button="${id}"]`).click();
    await expect(page.locator(`[data-person-detail="${id}"] [data-tenure="${id}"]`)).toBeVisible();
    await expect(page.locator(`[data-person-detail="${id}"] [data-person-context="${id}"]`)).toBeVisible();
    const portrait = page.locator(`[data-person-detail="${id}"] [data-portrait]`);
    if (id === "florus") {
      await expect(portrait.locator("img")).toHaveCount(0);
    } else {
      const image = portrait.locator("img");
      await expect(image).toHaveCount(1);
      await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await image.getAttribute("src")).toBe(`/moreh-derech/images/roman-people/portraits/${id}.webp`);
      await expect(portrait.locator("a")).toHaveAttribute("href", await image.getAttribute("src"));
      await expect(page.locator(`[data-person-detail="${id}"] a[href^="https://"]`).first()).toBeVisible();
    }
  }
  await page.locator('[data-person-button="pompey"]').click();
  await expect(page.locator('[data-person-button="pompey"]')).toBeVisible();
  await expect.poll(() => page.locator("[data-era-art] img").evaluateAll(images => images.length === 3 && images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await expect(page.getByRole("button", { name: "הדמות הקודמת", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "הדמות הבאה", exact: true }).click();
  await expect(page.locator('[data-person-detail="antony"]')).toBeVisible();
  const stage = page.locator('[aria-label^="הדמות הנבחרת."]');
  await stage.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('[data-person-detail="augustus"]')).toBeVisible();
  await expect(page.getByText("אוקטביאנוס ← אקטיום ← אוגוסטוס. שלושה עוגנים, אדם אחד.", { exact: true })).toBeVisible();
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
  await expect(page.locator('[class*="practice"] [data-tenure]')).toHaveCount(0);
  await expect(page.locator('[class*="practice"] [data-person-context]')).toHaveCount(0);
  await page.getByRole("button", { name: "לחשוף את התשובה" }).click();
  await expect(page.getByRole("heading", { name: "פומפיוס", exact: true })).toBeVisible();
  await expect(page.locator('[data-tenure="pompey"]')).toContainText("לא מלך");
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
  await page.locator('[data-person-detail="titus"] details[class*="more"] > summary').click();
  await expect(page.locator('[data-person-detail="titus"] details[class*="more"]')).toHaveAttribute("open", "");
  await search.fill("גאלוס");
  await page.getByRole("button", { name: /לבדוק מה זכרתי/ }).click();
  await expect(page.locator("[data-roman-people]")).toHaveAttribute("data-visual-era", "conquest");
  await page.getByRole("button", { name: "לחשוף את התשובה" }).click();
  await page.getByRole("button", { name: /זכרתי ✓/ }).click();
  await expect(page.locator("[data-roman-people]")).toHaveAttribute("data-visual-era", "byzantine");
  await page.getByRole("button", { name: /להכיר את הדמויות/ }).click();
  await page.getByRole("button", { name: /ניקוי הסינון/ }).click();
  // A short round is optional; the complete filtered deck remains available.
  await page.getByRole("button", { name: /אתגר של 5 דמויות/ }).click();
  await expect(page.getByText("כרטיס 1 מתוך 5", { exact: true })).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: "לחשוף את התשובה" }).click();
    await page.getByRole("button", { name: /זכרתי ✓/ }).click();
  }
  await expect(page.getByText("זכרת 5 מתוך 5 דמויות.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /אתגר של 5 דמויות/ }).click();
  await expect(page.getByText("כרטיס 1 מתוך 5", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /להכיר את הדמויות/ }).click();
  await page.getByRole("button", { name: /להכיר את אוגוסטוס/, exact: true }).click();
  await expect(page.locator('[data-person-detail="augustus"]')).toBeVisible();


  // The fourth mode ignores the card filters and connects all 39 figures.
  await page.getByRole("button", { name: /הרצף והקשרים/ }).click();
  await expect(page.locator("[data-story-person]")).toHaveCount(39);
  expect(await page.locator("[data-story-person]").first().evaluate(node=>getComputedStyle(node).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  expect(await page.evaluate(()=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image.naturalWidth===1024&&image.naturalHeight===1536);image.onerror=()=>resolve(false);image.src="/moreh-derech/images/roman-people/story-vignettes.webp";}))).toBe(true);
  await expect(page.locator("[data-story-chapter]")).toHaveCount(8);
  await expect.poll(() => page.locator("[data-story-lines] path").count()).toBeGreaterThan(0);
  await page.getByRole("button", {name:"בחירת תקופה בציר"}).click();
  await expect(page.locator("[data-story-periods]")).toBeVisible();
  await page.getByRole("button", { name: "כל הקשרים", exact: true }).click();
  await expect.poll(() => page.locator("[data-story-lines] path").count()).toBe(13);
  expect(await page.locator("[data-story-connection]").evaluateAll(links=>links.every(link=>document.querySelector('[data-story-person="'+link.dataset.from+'"]').closest("[data-story-year]")===document.querySelector('[data-story-person="'+link.dataset.to+'"]').closest("[data-story-year]")))).toBe(true);
  expect(await page.locator("[data-story-lines] path").evaluateAll(paths=>paths.every(path=>!/[CQ]/.test(path.getAttribute("d")||"")))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", {name:"בחירת תקופה בציר"})).toHaveAttribute("aria-expanded","false");
  await page.locator('[data-story-person="herod-great"]').click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal.locator('[data-jewish-context="herod-great"]')).toBeVisible();
  await modal.getByRole("button", { name: /סב ונכדו/ }).click();
  await expect(modal.locator('[data-companion="agrippa1"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).not.toBeVisible();
  const event = page.locator('[data-story-event="destruction"]');
  await event.locator("summary").click();
  await expect(event).toHaveAttribute("open","");
  await expect(event).toContainText("טיטוס הוא כאן מצביא");
  await page.getByRole("button", {name:"בחירת תקופה בציר"}).click();
  await page.getByRole("navigation", {name:"מעבר לתחנה במפת הרצף"}).getByRole("button").last().click();
  await expect(page.locator("[data-story-periods]")).not.toBeVisible();
  await expect(page.getByRole("button", {name:"בחירת תקופה בציר"})).toHaveAttribute("aria-expanded","false");
  await expect(page.locator('[data-story-chapter="end"]')).toBeFocused();
  for (const width of [1440,768,390,320]) {
    await page.setViewportSize({width,height:1000});
    for (const theme of ["light","dark"]) {
      await page.evaluate(value => {document.documentElement.dataset.theme=value;},theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "story overflow: "+width+", "+theme).toBe(true);
    }
  }
  await page.locator('[data-story-person="titus"]').click();
  await expect(modal.locator('[data-person-detail="titus"]')).toBeVisible();
  await expect(modal.locator('[data-jewish-context="titus"]')).toBeVisible();
  await expect(modal.getByRole("button",{name:"סגירת כרטיס הדמות"})).toBeFocused();
  await page.keyboard.press("Escape");

  // Entrance is applied once as elements enter the viewport, and respects reduced motion.
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.locator('[data-story-person="pompey"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-story-person="pompey"]')).toHaveAttribute("data-story-reveal","visible");
  await expect(page.locator('[data-story-person="pompey"]')).toHaveCSS("animation-name", /storyAppear/);
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(page.locator('[data-story-person="pompey"]')).toHaveCSS("opacity","1");
  await expect(page.locator('[data-story-person="pompey"]')).toHaveCSS("animation-name","none");
  await expect(page.locator('[data-story-person="pompey"]')).toHaveAttribute("data-story-reveal","ready");
  expect(errors).toEqual([]);
  console.log("Roman people: navigation, alias/era/role/core filters, comparison, recall/retry, mobile, dark mode and zero page errors passed");
} finally { await browser.close(); await new Promise(done => server.close(done)); }
