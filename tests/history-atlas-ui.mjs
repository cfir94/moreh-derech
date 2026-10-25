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
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 // LOCAL_ROUTE
 page.on("pageerror",error=>errors.push(error.message));
 // Reduced motion turns every flight into a jump, so each step can be checked at once.
 await page.emulateMedia({reducedMotion:"reduce"});
 if(!process.env.ATLAS_PREVIEW){await page.goto(base+"/timelines/");await expect(page.locator('a[href$="/timelines/history-atlas/"],a[href$="/timelines/history-atlas"]').first()).toBeVisible();}
 await page.goto(base+"/timelines/history-atlas/",{waitUntil:"networkidle"});
 const atlas=page.locator("[data-history-atlas]"),stage=page.locator("[data-atlas-chart]"),detail=page.locator("[data-atlas-detail]"),range=page.locator("[data-atlas-range]");
 const rangeText=()=>range.textContent();
 await expect(page.getByRole("heading",{name:"אטלס הזמן",exact:true})).toBeVisible();await expect(atlas).toHaveAttribute("data-level","overview");
 for(const id of ["P-008","P-033","P-044","P-051","ST-082"])await expect(page.locator(`[data-atlas-node="${id}"]`)).toHaveCount(1);
 expect(await page.locator('[data-atlas-node][data-rank="2"],[data-atlas-node][data-rank="3"]').count()).toBe(0);
 if(!process.env.ATLAS_PREVIEW)for(const id of ["P-008","P-033"]){const img=page.locator(`[data-atlas-node="${id}"] img`);await expect.poll(()=>img.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);}

 // Nothing on the stage covers anything else.
 const overlaps=await stage.evaluate(el=>{const boxes=[...el.querySelectorAll("[data-atlas-node]")].map(n=>({id:n.dataset.atlasNode,r:n.getBoundingClientRect()}));const bad=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i].r,b=boxes[j].r,w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(w>2&&h>2)bad.push(boxes[i].id+"/"+boxes[j].id);}return bad;});
 expect(overlaps).toEqual([]);

 await page.locator('[data-atlas-kind="event"]').click();expect(await page.locator('[data-atlas-node][data-kind="person"]').count()).toBe(0);expect(await page.locator('[data-atlas-node][data-kind="event"]').count()).toBeGreaterThan(5);
 await page.locator('[data-atlas-kind="person"]').click();expect(await page.locator('[data-atlas-node][data-kind="event"]').count()).toBe(0);expect(await page.locator('[data-atlas-node][data-kind="person"]').count()).toBeGreaterThan(5);
 await page.locator('[data-atlas-kind="all"]').click();

 // Zoom: a phase title, the buttons, the wheel and the level switch.
 let before=await rangeText();
 await page.locator('[data-atlas-phase="hasmonean"]').click();await expect(atlas).toHaveAttribute("data-level","context");
 expect(await rangeText()).not.toBe(before);expect(await page.locator('[data-atlas-node][data-rank="2"]').count()).toBeGreaterThan(0);
 before=await rangeText();
 await page.getByRole("button",{name:"התקרבות בזמן",exact:true}).click();await expect(atlas).toHaveAttribute("data-level","detail");expect(await rangeText()).not.toBe(before);
 const box=await stage.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);before=await rangeText();
 for(let i=0;i<6;i++)await page.mouse.wheel(0,200);
 await expect.poll(rangeText).not.toBe(before);await expect(atlas).not.toHaveAttribute("data-level","detail");
 await page.locator('[data-atlas-level="detail"]').click();await expect(atlas).toHaveAttribute("data-level","detail");
 await page.locator('[data-atlas-level="overview"]').click();await expect(atlas).toHaveAttribute("data-level","overview");

 // Pan: drag the stage, and step the minimap with the keyboard.
 await page.locator('[data-atlas-phase="herod"]').click();before=await rangeText();
 await page.mouse.move(box.x+box.width*.4,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.55,box.y+box.height*.5,{steps:8});await page.mouse.up();
 await expect.poll(rangeText).not.toBe(before);before=await rangeText();
 const minimap=page.getByRole("slider",{name:"מיקום חלון הזמן"});await minimap.focus();await minimap.press("ArrowRight");await expect.poll(rangeText).not.toBe(before);
 before=await rangeText();await stage.focus();await page.keyboard.press("ArrowLeft");await expect.poll(rangeText).not.toBe(before);
 // "+N" lists what did not fit, and can zoom in on it.
 await page.locator('[data-atlas-level="overview"]').click();
 const cluster=page.locator("[data-zone]").first();await expect(cluster).toBeVisible();
 const hiddenCount=Number((await cluster.textContent()).replace(/\D/g,""));await cluster.click();
 const pile=page.locator("[data-pile]");await expect(pile).toBeVisible();await expect(pile.locator("button[style]")).toHaveCount(hiddenCount);
 before=await rangeText();await pile.getByRole("button",{name:/להתקרב לכאן/}).click();await expect.poll(rangeText).not.toBe(before);await expect(pile).toHaveCount(0);

 // A card opens beside the stage, with relations, sources and a tour through time.
 const search=page.locator("#atlas-search");await search.fill("יהודה המכבי");await page.locator('[data-atlas-result="P-033"]').click();
 await expect(detail).toBeVisible();await expect(detail.locator("h2")).toHaveText("יהודה המכבי");await expect(detail).toContainText("אב ובן");await expect(detail.locator('a[href*="notebook.google"]')).toHaveCount(1);
 await expect(page.locator('[data-atlas-node="P-033"]')).toHaveCount(1);await expect(page.locator('[data-atlas-node="P-032"]')).toHaveCount(1);
 expect(await page.evaluate(()=>location.hash)).toBe("#P-033");
 const father=detail.getByRole("button").filter({hasText:"מתתיהו"});await father.first().click();await expect(detail.locator("h2")).toContainText("מתתיהו");
 const title=await detail.locator("h2").textContent();await detail.getByRole("button",{name:/^הבא בזמן/}).click();await expect(detail.locator("h2")).not.toHaveText(title);
 await page.keyboard.press("Escape");await expect(detail).not.toBeVisible();
 await search.fill("נחמיה");await page.locator('[data-atlas-result="P-018"]').click();await expect(detail).toContainText("שנת העלייה דורשת בירור");await page.keyboard.press("Escape");
 await search.fill("אגריפס השני");await page.locator('[data-atlas-result="P-067"]').click();await expect(detail).toContainText("אזכור בלבד");await expect(detail.getByRole("button",{name:"להתמקד בזמן הזה ←",exact:true})).toHaveCount(0);await page.keyboard.press("Escape");
 await page.locator('[data-atlas-level="overview"]').click();
 await page.locator('[data-atlas-node="P-051"]').click();await expect(detail.locator("h2")).toContainText("הורדוס");
 await detail.getByRole("button",{name:"להתמקד בזמן הזה ←",exact:true}).click();await expect(atlas).toHaveAttribute("data-level","detail");
 await detail.getByRole("button",{name:"סגירת פריט האטלס",exact:true}).click();await expect(detail).not.toBeVisible();

 // The index reaches every item, including those without a place on the axis.
 await page.getByRole("button",{name:"כל הדמויות והאירועים",exact:true}).click();
 await expect(page.locator("[data-atlas-index]")).toHaveCount(166);
 await page.locator('[data-atlas-index="P-018"]').click();await expect(detail.locator("h2")).toContainText("נחמיה");await page.keyboard.press("Escape");

 for(const width of [320,390,768,1440])for(const theme of ["light","dark"]){
  await page.setViewportSize({width,height:width<500?780:900});await page.evaluate(t=>{document.documentElement.dataset.theme=t;},theme);await page.locator('[data-atlas-level="overview"]').click();
  const m=await atlas.evaluate(el=>({background:getComputedStyle(el).backgroundImage,overflow:document.documentElement.scrollWidth>innerWidth+1,bottom:el.getBoundingClientRect().bottom,height:innerHeight,stage:el.querySelector("[data-atlas-chart]").getBoundingClientRect().toJSON(),nodes:el.querySelectorAll("[data-atlas-node]").length}));
  expect(m.overflow).toBe(false);expect(m.bottom).toBeLessThanOrEqual(m.height+1);expect(m.stage.height).toBeGreaterThan(300);expect(m.nodes).toBeGreaterThan(5);
  expect(m.background).toContain(theme==="dark"?"rgb(11, 21, 35)":"rgb(246, 241, 231)");
 }
 await page.goto(base+"/timelines/history-atlas/#ST-082",{waitUntil:"networkidle"});await expect(detail).toBeVisible();await expect(detail.locator("h2")).toContainText("המקדש");
 expect(errors).toEqual([]);console.log("History atlas: semantic zoom, wheel/drag/keyboard/minimap navigation, filters, clusters, cards with relations and tour, index, deep links and responsive themes passed.");
}finally{await browser.close();await new Promise(done=>server.close(done));}
