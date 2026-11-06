const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, locale: "he-IL" });
  await page.goto("http://localhost:3000/moreh-derech/welcome/", { waitUntil: "networkidle", timeout: 120000 });
  await page.addStyleTag({ content: "header, nav[aria-label], [class*='fixed'], nextjs-portal { display:none !important } main section:first-of-type { padding-top: 56px !important }" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "/home/user/moreh-derech/public/marketing/og.png" });
  await browser.close();
})();
