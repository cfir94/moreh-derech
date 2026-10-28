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
 const rangeText=()=>range.textContent(),node=id=>page.locator(`[data-atlas-node="${id}"]`);
 await expect(page.getByRole("heading",{name:"אטלס הזמן",exact:true})).toBeVisible();await expect(atlas).toHaveAttribute("data-level","overview");
 // The page opens at the top of the axis, the Bronze Age, zoomed close enough that the wheel walks down through the periods.
 for(const id of ["F-01","F-10","EC-merneptah"])await expect(node(id)).toHaveCount(1);
 expect(await page.locator(".legend, details:has(> summary[aria-label=\"מקרא\"])").first().evaluate(el=>Boolean(el.closest("footer")))).toBe(true);
 const box=await stage.boundingBox(),startRange=await rangeText();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 for(let i=0;i<4;i++)await page.mouse.wheel(0,250);
 await expect.poll(rangeText).not.toBe(startRange);await expect(atlas).toHaveAttribute("data-level","overview");
 await page.keyboard.down("Control");await page.mouse.wheel(0,-400);await page.mouse.wheel(0,-400);await page.keyboard.up("Control");
 await expect(atlas).not.toHaveAttribute("data-level","overview");
 await page.locator('[data-atlas-level="overview"]').click();await expect(atlas).toHaveAttribute("data-level","overview");
 for(const id of ["P-008","P-033","P-051","ST-007","L-13"])await expect(node(id)).toHaveCount(1);
 expect(await page.locator("[data-atlas-art]").count()).toBeGreaterThan(1);
 expect(await page.locator('[data-atlas-node][data-rank="2"],[data-atlas-node][data-rank="3"]').count()).toBe(0);
 if(!process.env.ATLAS_PREVIEW)for(const id of ["P-008","P-033"]){const img=node(id).locator("img");await expect.poll(()=>img.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);}

 // Nothing on the tree covers anything else (the tree is clipped to its own area, so only the visible part counts).
 // Drawings stand in the tree beneath the portraits on purpose, so they are left out.
 const overlaps=()=>stage.evaluate(el=>{const clip=(r,c)=>({left:Math.max(r.left,c.left),right:Math.min(r.right,c.right),top:Math.max(r.top,c.top),bottom:Math.min(r.bottom,c.bottom)});const boxes=[...el.querySelectorAll("[data-atlas-node]")].map(n=>({id:n.dataset.atlasNode,r:clip(n.getBoundingClientRect(),n.parentElement.getBoundingClientRect())}));const bad=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i].r,b=boxes[j].r,w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(w>2&&h>2)bad.push(boxes[i].id+"/"+boxes[j].id);}return bad;});
 expect(await overlaps()).toEqual([]);

 // The lane of event titles closes into dots on the spine, and opens again; the drawings in the tree stay either way.
 const titles=page.locator('[data-atlas-node][data-kind="event"]');
 expect(await titles.count()).toBeGreaterThan(5);
 await page.locator('[data-atlas-lane="close"]').click();await expect(titles).toHaveCount(0);
 expect(await page.locator("[data-atlas-dot]").count()).toBeGreaterThan(20);expect(await page.locator("[data-atlas-art]").count()).toBeGreaterThan(1);
 await page.locator('[data-atlas-dot="ST-007"]').dispatchEvent("click");await expect(detail.locator("h2")).toHaveText(/כורש/);await page.keyboard.press("Escape");
 await page.locator('[data-atlas-lane="open"]').click();expect(await titles.count()).toBeGreaterThan(5);

 // The Hasmonean family tree: Mattathias and his sons, joined by lines.
 let before=await rangeText();
 await page.locator('[data-atlas-phase="hasmonean"]').click();await expect(atlas).toHaveAttribute("data-level","context");
 expect(await rangeText()).not.toBe(before);
 for(const id of ["P-032","P-033","P-037","P-039","P-040","P-043","P-044"])await expect(node(id)).toHaveCount(1);
 // A father stands above his sons, even though they come in the same year.
 const below=async(parent,child)=>{const a=await node(parent).boundingBox(),b=await node(child).boundingBox();return a.y+a.height<=b.y;};
 for(const son of ["P-033","P-037","P-039"])expect(await below("P-032",son)).toBe(true);
 expect(await below("P-039","P-040")).toBe(true);expect(await below("P-044","P-045")).toBe(true);
 expect(await stage.locator("path[data-kind='parent']").count()).toBeGreaterThan(3);expect(await stage.locator("path[data-kind='succession']").count()).toBeGreaterThan(1);
 expect(await overlaps()).toEqual([]);
 before=await rangeText();
 await page.getByRole("button",{name:"התקרבות בזמן",exact:true}).click();await expect(atlas).toHaveAttribute("data-level","detail");expect(await rangeText()).not.toBe(before);
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);before=await rangeText();
 for(let i=0;i<6;i++)await page.mouse.wheel(0,200);
 await expect.poll(rangeText).not.toBe(before);await expect(atlas).toHaveAttribute("data-level","detail");
 await page.locator('[data-atlas-level="overview"]').click();await expect(atlas).toHaveAttribute("data-level","overview");

 // Herod's reign: the building projects in the lane, and the rebuilt Temple's drawing in the tree, beside Herod.
 await page.locator('[data-atlas-phase="herod"]').click();
 for(const id of ["P-051","P-054","P-058","ST-055","ST-057","ST-058"])await expect(node(id)).toHaveCount(1);
 const temple=page.locator('[data-atlas-art="ST-058"] img');await expect(temple).toHaveCount(1);
 expect(await temple.evaluate(i=>Boolean(i.closest("[data-atlas-chart]")&&!i.closest("[data-atlas-art]").matches("[data-in-lane]")))).toBe(true);
 if(!process.env.ATLAS_PREVIEW)await expect.poll(()=>temple.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
 expect(await overlaps()).toEqual([]);

 // Moving through time: drag, the keyboard and the minimap.
 before=await rangeText();
 await page.mouse.move(box.x+box.width*.45,box.y+box.height*.6);await page.mouse.down();await page.mouse.move(box.x+box.width*.45,box.y+box.height*.3,{steps:8});await page.mouse.up();
 await expect.poll(rangeText).not.toBe(before);before=await rangeText();
 await stage.focus();await page.keyboard.press("ArrowDown");await expect.poll(rangeText).not.toBe(before);
 const minimap=page.getByRole("slider",{name:"מיקום חלון הזמן"});before=await rangeText();await minimap.focus();await minimap.press("ArrowRight");await expect.poll(rangeText).not.toBe(before);

 // "+N" lists what has no room, and can zoom in on it.
 await page.locator('[data-atlas-level="overview"]').click();
 const cluster=page.locator("[data-zone]").first();await expect(cluster).toBeVisible();
 const hiddenCount=Number((await cluster.textContent()).replace(/\D/g,""));await cluster.click();
 const pile=page.locator("[data-pile]");await expect(pile).toBeVisible();await expect(pile.locator("button[style]")).toHaveCount(hiddenCount);
 before=await rangeText();await pile.getByRole("button",{name:/להתקרב לכאן/}).click();await expect.poll(rangeText).not.toBe(before);await expect(pile).toHaveCount(0);

 // A card opens beside the tree, with relations, sources and a tour through time.
 const search=page.locator("#atlas-search");await search.fill("יהודה המכבי");await page.locator('[data-atlas-result="P-033"]').click();
 await expect(detail).toBeVisible();await expect(detail.locator("h2")).toHaveText("יהודה המכבי");await expect(detail).toContainText("אב ובן");await expect(detail.locator('a[href*="notebook.google"]')).toHaveCount(1);
 await expect(node("P-033")).toHaveCount(1);await expect(node("P-032")).toHaveCount(1);
 await expect.poll(()=>node("P-033").evaluate(el=>{const r=el.getBoundingClientRect(),s=el.closest("[data-atlas-chart]").getBoundingClientRect();return r.left>=s.left&&r.right<=s.right&&r.top>=s.top&&r.bottom<=s.bottom;})).toBe(true);
 expect(await stage.locator("svg g[data-kind='rival'] text").count()).toBeGreaterThan(0);
 expect(await page.evaluate(()=>location.hash)).toBe("#P-033");
 const father=detail.getByRole("button").filter({hasText:"מתתיהו"});await father.first().click();await expect(detail.locator("h2")).toContainText("מתתיהו");
 const title=await detail.locator("h2").textContent();await detail.getByRole("button",{name:/^הבא בזמן/}).click();await expect(detail.locator("h2")).not.toHaveText(title);
 await page.keyboard.press("Escape");await expect(detail).not.toBeVisible();
 await search.fill("נחמיה");await page.locator('[data-atlas-result="P-018"]').click();await expect(detail).toContainText("שנת העלייה דורשת בירור");await page.keyboard.press("Escape");
 // Agrippa II has his own place below his father, and the cards tell about the figures in the third person.
 await search.fill("אגריפס השני");await page.locator('[data-atlas-result="P-067"]').click();await expect(detail).toContainText("בנו של אגריפס הראשון");await expect(detail.getByRole("button",{name:"להתמקד בזמן הזה ←",exact:true})).toHaveCount(1);await page.keyboard.press("Escape");
 await search.fill("חנה המקראית");await page.locator('[data-atlas-result="F-19"]').click();await expect(detail).toContainText("אם ובן");await expect(detail).toContainText("שמואל הנביא");await expect(detail).toContainText("התפללה בלחש");await page.keyboard.press("Escape");
 await page.locator('[data-atlas-level="overview"]').click();
 await node("P-051").click();await expect(detail.locator("h2")).toContainText("הורדוס");
 await detail.getByRole("button",{name:"להתמקד בזמן הזה ←",exact:true}).click();await expect(atlas).toHaveAttribute("data-level","detail");
 await detail.getByRole("button",{name:"סגירת פריט האטלס",exact:true}).click();await expect(detail).not.toBeVisible();

 // Topics open as dimensions of their own, and close back to the same place on the axis.
 await page.locator('[data-atlas-level="overview"]').click();await page.locator('[data-atlas-phase="hasmonean"]').click();
 const chip=page.locator('[data-atlas-topic-chip="hasmonean"]');await expect(chip).toBeVisible();before=await rangeText();
 await chip.click();await expect(atlas).toHaveAttribute("data-topic","hasmonean");await expect(page.locator('[data-atlas-topic="hasmonean"]')).toContainText("מרד החשמונאים");
 for(const id of ["P-032","P-033","ST-028"])await expect(node(id)).toHaveCount(1);await expect(page.locator('[data-atlas-art="ST-028"]')).toHaveCount(1);
 expect(await page.evaluate(()=>location.hash)).toBe("#hasmonean");
 await page.keyboard.press("Escape");await expect(atlas).not.toHaveAttribute("data-topic",/.+/);await expect.poll(rangeText).toBe(before);
 // From a card: Jesus on the axis opens the topic of his life, with the crucifixion's drawing beside him.
 await search.fill("ישוע הנוצרי");await page.locator('[data-atlas-result="P-063"]').click();
 await detail.locator('[data-atlas-card-topic="jesus"]').click();await expect(atlas).toHaveAttribute("data-topic","jesus");await expect(detail.locator("h2")).toContainText("ישוע");
 expect(await page.evaluate(()=>location.hash)).toBe("#jesus/P-063");
 await expect(detail.locator('a[href*="/timelines/"]')).toHaveCount(0);
 await search.fill("הצליבה");await page.locator('[data-atlas-result="JS-26"]').click();await expect(detail.locator("h2")).toContainText("הצליבה");
 await expect(page.locator('[data-atlas-art="JS-26"]')).toHaveCount(1);
 await expect.poll(()=>page.locator('[data-atlas-art="JS-26"]').evaluate(el=>{const owner=el.dataset.owner;return owner==="P-063"||owner==="NT-01";})).toBe(true);
 await detail.locator("[data-atlas-card-axis]").count().then(n=>expect(n).toBe(0));
 await page.locator("[data-atlas-exit]").click();await expect(atlas).not.toHaveAttribute("data-topic",/.+/);
 // The menu in the bottom bar lists every topic.
 await page.locator('[data-atlas-topics] summary').click();await page.locator('[data-atlas-topic-item="prophets"]').click();await expect(atlas).toHaveAttribute("data-topic","prophets");
 for(const id of ["F-20","F-33","F-44"])await expect(page.locator(`[data-atlas-index="${id}"]`)).toHaveCount(1);
 await page.locator('[data-atlas-topics] summary').click();await page.locator('[data-atlas-topic-item="judges"]').click();await expect(atlas).toHaveAttribute("data-topic","judges");
 for(const id of ["F-14","F-17","JD-03"])await expect(page.locator(`[data-atlas-index="${id}"]`)).toHaveCount(1);
 await page.goto(base+"/timelines/history-atlas/#prophets/F-51",{waitUntil:"networkidle"});await expect(atlas).toHaveAttribute("data-topic","prophets");await expect(detail.locator("h2")).toContainText("ירמיהו");
 await detail.locator("[data-atlas-card-axis]").click();await expect(atlas).not.toHaveAttribute("data-topic",/.+/);await expect(detail.locator("h2")).toContainText("ירמיהו");
 await page.keyboard.press("Escape");

 // The index reaches every item, including those without a place on the axis.
 await page.getByRole("button",{name:"כל הדמויות והאירועים",exact:true}).click();
 expect(await page.locator("[data-atlas-index]").count()).toBeGreaterThan(250);await expect(page.locator('[data-atlas-index="BY-044"]')).toHaveCount(1);
 await page.locator('[data-atlas-index="P-018"]').click();await expect(detail.locator("h2")).toContainText("נחמיה");await page.keyboard.press("Escape");

 for(const width of [320,390,768,1440])for(const theme of ["light","dark"]){
  // A fresh page each time: once the lane is opened or closed by hand, that choice stays when the window is resized.
  await page.setViewportSize({width,height:width<500?780:900});await page.goto(base+"/timelines/history-atlas/",{waitUntil:"networkidle"});
  await page.evaluate(t=>{document.documentElement.dataset.theme=t;},theme);await page.locator('[data-atlas-level="overview"]').click();await page.locator('[data-atlas-phase="hasmonean"]').click();
  const m=await atlas.evaluate(el=>{const s=el.querySelector("[data-atlas-chart]").getBoundingClientRect();return {background:getComputedStyle(el).backgroundImage,overflow:document.documentElement.scrollWidth>innerWidth+1,bottom:el.getBoundingClientRect().bottom,height:innerHeight,stage:s.toJSON(),
   people:[...el.querySelectorAll('[data-atlas-node][data-kind="person"]')].filter(n=>{const r=n.getBoundingClientRect();return r.right>s.left&&r.left<s.right&&r.bottom>s.top&&r.top<s.bottom;}).length,events:el.querySelectorAll("[data-atlas-dot]").length,lane:el.querySelector("[data-atlas-chart]").dataset.lane};});
  expect(m.overflow).toBe(false);expect(m.bottom).toBeLessThanOrEqual(m.height+1);expect(m.stage.height).toBeGreaterThan(300);expect(m.people).toBeGreaterThan(1);expect(m.events).toBeGreaterThan(3);
  // The lane starts open beside the tree on a wide screen and closed on a phone, where it opens over the tree.
  expect(m.lane).toBe(width>=900?"open":"closed");
  if(width<640){await page.locator('[data-atlas-lane="open"]').click();await expect(stage).toHaveAttribute("data-lane","overlay");expect(await titles.count()).toBeGreaterThan(3);await page.locator('[data-atlas-lane="close"]').click();await expect(stage).toHaveAttribute("data-lane","closed");}
  expect(m.background).toContain(theme==="dark"?"rgb(11, 21, 35)":"rgb(246, 241, 231)");
  expect(await overlaps()).toEqual([]);
 }
 await page.setViewportSize({width:1440,height:900});
 await page.goto(base+"/timelines/history-atlas/#ST-082",{waitUntil:"networkidle"});await expect(detail).toBeVisible();await expect(detail.locator("h2")).toContainText("המקדש");
 const art=detail.locator("figure img");await expect(art).toHaveCount(1);if(!process.env.ATLAS_PREVIEW)await expect.poll(()=>art.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
 expect(errors).toEqual([]);console.log("History atlas: vertical tree with parents above children, wheel scrolling and Ctrl-zoom, semantic zoom, family lines, drawings on their year, the events lane, drag/keyboard/minimap, counts, cards with relations and tour, index, deep links and responsive themes passed.");
}finally{await browser.close();await new Promise(done=>server.close(done));}
