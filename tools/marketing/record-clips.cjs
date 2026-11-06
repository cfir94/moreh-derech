const { chromium, devices } = require("playwright");
const BASE = "http://127.0.0.1:8811";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function record(name, ctxOpts, fn) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...ctxOpts, locale: "he-IL", recordVideo: { dir: `/tmp/claude-0/mkt/video/${name}`, size: ctxOpts.viewport } });
  const page = await ctx.newPage();
  try { await fn(page); console.log("ok", name); } catch (e) { console.log("FAIL", name, e.message.split("\n")[0]); }
  await ctx.close(); await browser.close();
}
const smoothScroll = async (page, dy, steps = 30) => { for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await wait(40); } };
(async () => {
  await record("quiz", { viewport: { width: 1280, height: 800 } }, async (page) => {
    await page.goto(BASE + "/quizzes/second-temple/", { waitUntil: "networkidle" }); await wait(1500);
    await page.getByRole("button", { name: "להתחיל לתרגל" }).click(); await wait(2200);
    const opts = page.locator('main button[class*="items-start"]');
    await opts.nth(1).hover(); await wait(700); await opts.nth(1).click(); await wait(3500);
  });
  await record("atlas", { viewport: { width: 1280, height: 800 } }, async (page) => {
    await page.goto(BASE + "/timelines/history-atlas/", { waitUntil: "networkidle" }); await wait(3000);
    await page.mouse.move(640, 450);
    await smoothScroll(page, 1400, 50); await wait(800); await smoothScroll(page, 1400, 50); await wait(1500);
  });
  await record("arch3d", { viewport: { width: 1280, height: 800 } }, async (page) => {
    await page.goto(BASE + "/timelines/classical-architecture/", { waitUntil: "networkidle" }); await wait(2500);
    const tab = page.getByRole("tab", { name: /תלת/ }).first();
    if (await tab.count()) { await tab.click(); await wait(3500); }
    const canvas = page.locator("canvas").first();
    if (await canvas.count()) {
      const b = await canvas.boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
      for (let i = 0; i < 60; i++) { await page.mouse.move(b.x + b.width / 2 + i * 6, b.y + b.height / 2 + Math.sin(i / 8) * 20); await wait(40); }
      await page.mouse.up(); await wait(1500);
    } else { await wait(3000); }
  });
  await record("robes-phone", { ...devices["iPhone 14"], viewport: { width: 390, height: 844 } }, async (page) => {
    await page.goto(BASE + "/games/jerusalem-robes/", { waitUntil: "networkidle" }); await wait(2000);
    const start = page.getByRole("button", { name: /להתחיל|מתחילים|לשחק|התחל/ }).first();
    if (await start.count()) { await start.click(); await wait(2500); }
    const choice = page.locator("main button").nth(4);
    if (await choice.count()) { await choice.click(); await wait(2500); }
  });
})();
