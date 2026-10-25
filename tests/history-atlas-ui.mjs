import {createServer} from "node:http";
import {readFileSync,existsSync,statSync} from "node:fs";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url),{chromium,expect}=require(process.env.ATLAS_PLAYWRIGHT_PACKAGE??"@playwright/test");
const out=resolve(fileURLToPath(new URL("../out/",import.meta.url)));
const server=createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/,"");
 let path=resolve(out,"."+pathname);if(path!==out&&!path.startsWith(out+sep)){res.writeHead(403).end();return;}
 if(existsSync(path)&&statSync(path).isDirectory())path=resolve(path,"index.html");
 if(!existsSync(path)){res.writeHead(404).end();return;}
 res.setHeader("Content-Type",({".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".woff2":"font/woff2",".webp":"image/webp"})[extname(path)]??"application/octet-stream");res.end(readFileSync(path));
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const base=process.env.ATLAS_TEST_BASE_URL??"http://127.0.0.1:"+server.address().port+"/moreh-derech";
const browser=await chromium.launch({headless:true}),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 // LOCAL_ROUTE
 page.on("pageerror",error=>errors.push(error.message));
 await page.emulateMedia({reducedMotion:"reduce"});
 if(!process.env.ATLAS_PREVIEW){await page.goto(base+"/timelines/");await expect(page.locator('a[href$="/timelines/history-atlas/"],a[href$="/timelines/history-atlas"]').first()).toBeVisible();}
 await page.goto(base+"/timelines/history-atlas/",{waitUntil:"networkidle"});
 const atlas=page.locator("[data-history-atlas]"),detail=page.locator("[data-atlas-detail]");
 await expect(page.getByRole("heading",{name:"אטלס הזמן",exact:true})).toBeVisible();await expect(atlas).toHaveAttribute("data-level","overview");
 await expect(page.locator('[data-atlas-node="P-008"]')).toHaveCount(1);await expect(page.locator('[data-atlas-node="P-044"]')).toHaveCount(1);await expect(page.locator('[data-atlas-explore="background"]')).toHaveCount(0);
 if(!process.env.ATLAS_PREVIEW)for(const id of ["P-008","P-033"]){const img=page.locator('[data-atlas-node="'+id+'"] img');await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);}
 await page.locator('[data-atlas-kind="event"]').click();expect(await page.locator('[data-atlas-node][data-kind="person"]').count()).toBe(0);
 await page.locator('[data-atlas-kind="person"]').click();expect(await page.locator('[data-atlas-node][data-kind="event"]').count()).toBe(0);
 await page.locator('[data-atlas-kind="all"]').click();
 await page.getByRole("button",{name:"פתיחת תקופות האטלס",exact:true}).click();await page.locator('[data-atlas-phase="hasmonean"]').click();await expect(atlas).toHaveAttribute("data-level","context");
 const before=await page.locator("[data-atlas-range]").textContent();await page.getByRole("button",{name:"התקרבות בזמן",exact:true}).click();await expect(atlas).toHaveAttribute("data-level","detail");expect(await page.locator("[data-atlas-range]").textContent()).not.toBe(before);
 const slider=page.getByRole("slider",{name:"מיקום חלון הזמן"});await slider.fill("-50");await slider.press("ArrowLeft");expect(await page.locator("[data-atlas-range]").textContent()).not.toBe(before);
 const search=page.locator("#atlas-search");await search.fill("יהודה המכבי");await page.locator('[data-atlas-result="P-033"]').click();await expect(detail).toBeVisible();await expect(detail.locator("h2")).toHaveText("יהודה המכבי");await expect(detail).toContainText("אב ובן");await expect(detail.locator('a[href*="notebook.google"]')).toHaveCount(1);
 const father=detail.getByRole("button").filter({hasText:"מתתיהו"});await father.first().click();await expect(detail.locator("h2")).toContainText("מתתיהו");await page.keyboard.press("Escape");await expect(detail).not.toBeVisible();
 await search.fill("נחמיה");await page.locator('[data-atlas-result="P-018"]').click();await expect(detail).toContainText("שנת העלייה דורשת בירור");await page.keyboard.press("Escape");
 await search.fill("אגריפס השני");await page.locator('[data-atlas-result="P-067"]').click();await expect(detail).toContainText("אזכור בלבד");await expect(detail.getByRole("button",{name:"להתמקד בזמן הזה ←",exact:true})).toHaveCount(0);await page.keyboard.press("Escape");
 await page.getByRole("button",{name:"פתיחת תקופות האטלס",exact:true}).click();const context=page.getByRole("checkbox");await context.check();await expect(page.locator('[data-atlas-phase="background"]')).toBeVisible();await page.getByRole("button",{name:"סגירת תקופות האטלס",exact:true}).click();await expect(page.locator('[data-atlas-explore="background"]')).toHaveCount(1);
 await page.getByRole("button",{name:"פתיחת תקופות האטלס",exact:true}).click();await context.uncheck();await page.getByRole("button",{name:"סגירת תקופות האטלס",exact:true}).click();await page.getByRole("button",{name:"מבט על כל התקופה",exact:true}).click();await expect(atlas).toHaveAttribute("data-level","overview");
 for(const width of [320,390,768,1440])for(const theme of ["light","dark"]){
  await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme:theme});
  const metrics=await atlas.evaluate(el=>({background:getComputedStyle(el).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth+1,chart:el.querySelector("[data-atlas-chart]").getBoundingClientRect().toJSON(),points:Array.from(el.querySelectorAll('[data-atlas-anchor]>header')).map(e=>e.getBoundingClientRect().toJSON())}));
  expect(metrics.background).toBe("rgb(255, 255, 255)");expect(metrics.overflow).toBe(false);
  for(const p of metrics.points)expect(Math.abs(p.x+p.width/2-metrics.chart.x-metrics.chart.width/2)).toBeLessThan(1.1);
 }
 await page.goto(base+"/timelines/history-atlas/#ST-082",{waitUntil:"networkidle"});await expect(detail).toBeVisible();await expect(detail.locator("h2")).toContainText("המקדש");
 expect(errors).toEqual([]);console.log("History atlas: zoom, pan, content filters, phase drawer, source details, relationships, context, deep links and responsive white layout passed.");
}finally{await browser.close();await new Promise(done=>server.close(done));}
