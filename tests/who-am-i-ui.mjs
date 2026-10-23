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
const base = `http://127.0.0.1:${server.address().port}/moreh-derech`;
const browser = await chromium.launch({ headless: true });
const errors = [];
const people=JSON.parse(readFileSync(new URL("../src/data/who-am-i/people.json",import.meta.url),"utf8"));
try {
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(base+"/games/",{waitUntil:"networkidle"});
  await page.getByRole("link",{name:/מי אני.*קולות מן העבר/}).click();
  await expect(page.getByRole("heading",{name:"מי אני?",exact:true})).toBeVisible();
  await expect(page.getByRole("group",{name:"בחירת תקופות"}).getByRole("button")).toHaveCount(5);
  await expect(page.getByRole("group",{name:"לימודי יהדות ונצרות"}).getByRole("button")).toHaveCount(2);
  await page.screenshot({path:"test-results/who-am-i-desktop.png",fullPage:true});
  if (process.env.WHO_AM_I_VISUAL_LOGS) console.log("VISUAL_DESKTOP=" + (await page.locator("[data-who-am-i]").screenshot({type:"jpeg",quality:45})).toString("base64"));
  await page.getByRole("button",{name:"ניקוי הבחירה",exact:true}).click();
  await expect(page.getByRole("button",{name:/מתחילים לגלות/})).toBeDisabled();
  await page.getByRole("button",{name:/בית שני/}).click();
  await page.getByRole("button",{name:/מתחילים לגלות/}).click();
  const seenModes=new Set(); let wrongId;
  for(let i=0;i<10;i++){
    await expect(page.locator("[data-reveal]")).toHaveCount(0);
    const clue=await page.locator("[data-clue]").textContent();
    const p=people.find(p=>p.clues.includes(clue));
    expect(p).toBeTruthy(); expect(p.periods).toContain("temple");
    if(i===0){ wrongId=p.id; await page.getByRole("button",{name:"✧ אפשר רמז נוסף"}).click(); await expect(page.getByRole("status")).toContainText(p.date); }
    const choice=page.locator("[data-choice]");
    if(await choice.count()){
      seenModes.add("choice"); await expect(choice).toHaveCount(4);
      if(i===0) await page.getByRole("button",{name:"לא זוכר/ת — לחשוף"}).click();
      else await page.locator('[data-choice="'+p.id+'"]').click();
    } else {
      seenModes.add("typed");
      await page.getByRole("textbox",{name:"מי הדמות?"}).fill(i===0?"תשובה לא נכונה":p.name);
      await page.getByRole("textbox",{name:"מי הדמות?"}).press("Enter");
    }
    await expect(page.locator("[data-feedback]")).toHaveAttribute("data-correct",i===0?"false":"true");
    const reveal=page.locator('[data-reveal="'+p.id+'"]');
    await expect(reveal).toBeVisible();
    await expect.poll(()=>reveal.locator("img").evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    if(i===0) await page.screenshot({path:"test-results/who-am-i-reveal.png",fullPage:true});
    await page.getByRole("button",{name:i===9?"לסיכום הסבב":/לדמות הבאה/}).click();
  }
  expect([...seenModes].sort()).toEqual(["choice","typed"]);
  await expect(page.locator("[data-summary]")).toContainText("זיהית 9 מתוך 10 דמויות.");
  await page.getByRole("button",{name:"לחזור על 1 דמויות לחיזוק",exact:true}).click();
  await expect(page.locator("[data-choice]")).toHaveCount(4);
  await page.locator('[data-choice="'+wrongId+'"]').click();
  await page.getByRole("button",{name:/לסיכום הסבב/}).click();
  await expect(page.locator("[data-summary]")).toContainText("זיהית 1 מתוך 1 דמויות.");
  await page.getByRole("button",{name:/לשנות תחומים/}).click();
  for(const width of [768,390,320]){
    await page.setViewportSize({width,height:950});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:"test-results/who-am-i-mobile.png",fullPage:true});
  if (process.env.WHO_AM_I_VISUAL_LOGS) console.log("VISUAL_MOBILE=" + (await page.locator("[data-who-am-i]").screenshot({type:"jpeg",quality:45})).toString("base64"));
  await page.getByRole("button",{name:"הקלדת שם",exact:true}).click();
  await page.getByRole("button",{name:/מתחילים לגלות/}).click();
  await expect(page.getByRole("textbox",{name:"מי הדמות?"})).toBeVisible();
  await page.getByRole("button",{name:"לא זוכר/ת — לחשוף"}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:"test-results/who-am-i-mobile-reveal.png",fullPage:true});

  // Each new subject supports selection of one notebook, both answer modes and portraits.
  await page.getByRole("button",{name:/לבחירת תחומים/}).click();
  await page.setViewportSize({width:1440,height:1100});
  for(const [faith, label, bookLabel] of [
    ["judaism","לימודי יהדות","יהדות א׳ — מקרא, תורה שבעל פה וספרות"],
    ["christianity","לימודי נצרות","נצרות ב׳ — חיי ישוע ואתרי הבשורות"]]){
    const selected=page.locator('[aria-label="בחירת תקופות"] button[aria-pressed="true"],[aria-label="לימודי יהדות ונצרות"] button[aria-pressed="true"]');
    while(await selected.count()) await selected.first().click();
    await page.getByRole("group",{name:"לימודי יהדות ונצרות"}).getByRole("button",{name:new RegExp(label)}).click();
    const filter=page.locator("details").filter({has:page.locator("summary",{hasText:"התמקדות לפי מחברת"})});
    if(!await filter.evaluate(details=>details.open)) await filter.locator("summary").click();
    await expect(filter).toHaveAttribute("open","");
    const books=filter.getByRole("group",{name:"בחירת מחברות"});
    console.log("FAITH FILTER",faith,await books.textContent());
    await expect(books.getByRole("button")).toHaveCount(3);
    for(const button of await books.getByRole("button").all())
      if(!(await button.textContent()).includes(bookLabel)) await button.click();
    await page.getByRole("button",{name:"הפתעה בכל שאלה",exact:true}).click();
    await page.getByRole("button",{name:/מתחילים לגלות/}).click();
    const faithModes=new Set();
    for(let i=0;i<10;i++){
      const clue=await page.locator("[data-clue]").textContent();
      const p=people.find(p=>p.clues.includes(clue));
      expect(p.periods).toContain(faith);
      expect(p.books).toContain(faith==="judaism"?"judaism-a":"christianity-b");
      if(await page.locator("[data-choice]").count()){
        faithModes.add("choice"); await page.locator('[data-choice="'+p.id+'"]').click();
      }else{
        faithModes.add("typed");
        await page.getByRole("textbox",{name:"מי הדמות?"}).fill(p.name);
        await page.getByRole("textbox",{name:"מי הדמות?"}).press("Enter");
      }
      await expect(page.locator("[data-feedback]")).toHaveAttribute("data-correct","true");
      await expect.poll(()=>page.locator("[data-reveal] img").evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
      await page.getByRole("button",{name:i===9?"לסיכום הסבב":/לדמות הבאה/}).click();
    }
    expect([...faithModes].sort()).toEqual(["choice","typed"]);
    await expect(page.locator("[data-summary]")).toContainText("זיהית 10 מתוך 10 דמויות.");
    await page.getByRole("button",{name:/לשנות תחומים/}).click();
    // Restore this subject's notebook selections for the next loop.
    if(!await filter.evaluate(details=>details.open)) await filter.locator("summary").click();
    for(const b of await filter.getByRole("group",{name:"בחירת מחברות"}).getByRole("button").all())
      if(await b.getAttribute("aria-pressed")==="false") await b.click();
    if(await filter.evaluate(details=>details.open)) await filter.locator("summary").click();
  }

  // Validate actual browser decoding for every portrait, including newly rasterised engravings.
  const imagePaths=await import("../src/data/who-am-i/portraits.json",{with:{type:"json"}});
  const romanContent=readFileSync(new URL("../src/data/roman-portraits.ts",import.meta.url),"utf8");
  const roman=JSON.parse(romanContent.match(/= (\{[\s\S]*\});/)[1]);
  const companions=readFileSync(new URL("../src/data/herodian-companions.ts",import.meta.url),"utf8");
  const companionData=JSON.parse(companions.match(/= (\[[\s\S]*\]);/)[1]);
  const registry={...roman,...Object.fromEntries(companionData.map(p=>[p.id,p])),...imagePaths.default};
  for(const p of people){
    const src=registry[p.id].localSrc;
    const loaded=await page.evaluate(src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img.naturalWidth>0);img.onerror=()=>resolve(false);img.src=src;}),src);
    expect(loaded,p.id).toBe(true);
  }
  expect(errors).toEqual([]);
  console.log("PASS: mixed and typed rounds, filtering, scoring, review, keyboard, all 195 portraits, mobile overflow");
} finally { await browser.close(); await new Promise(done=>server.close(done)); }
