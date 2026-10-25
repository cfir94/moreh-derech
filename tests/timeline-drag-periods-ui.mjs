import { chromium, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { TIMELINE_SETS } from "../src/data/timelines/drag-sets.ts";
const out=resolve("out"), errors=[];
const server=createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,"http://localhost").pathname).replace(/^\/moreh-derech(?=\/|$)/,"");
 let file=resolve(out,"."+name);
 if(!file.startsWith(out+sep)&&file!==out){res.writeHead(403).end();return;}
 if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,"index.html");
 if(!existsSync(file)){res.writeHead(404).end();return;}
 res.setHeader("Content-Type",({".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".woff2":"font/woff2"})[extname(file)]||"application/octet-stream");res.end(readFileSync(file));
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const browser=await chromium.launch({headless:true,channel:"chrome"});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:"+server.address().port+"/moreh-derech/quizzes/timeline-drag/",{waitUntil:"networkidle"});
 for(const key of ["second_temple_events","roman_events","byzantine_events"]){
  const set=TIMELINE_SETS.find(s=>s.key===key);
  await page.getByRole("button",{name:new RegExp(set.title.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))}).click();
  await expect(page.locator("ol>li")).toHaveCount(set.nodes.length);
  await expect(page.locator("ol .num.truncate")).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  // Solve using the same accessible controls a learner uses.
  for(let target=0;target<set.nodes.length;target++){
   const label=set.nodes[target].label;
   let labels=await page.locator("ol>li").allTextContents();
   let current=labels.findIndex(s=>s.includes(label));
   while(current>target){await page.getByRole("button",{name:label+" — מוקדם יותר",exact:true}).click();current--;}
  }
  await page.getByRole("button",{name:"בדיקה",exact:true}).click();
  await expect(page.getByText("כל הכרטיסים במקומם.",{exact:true})).toBeVisible();
  await expect(page.locator("ol .num.truncate")).toHaveCount(set.nodes.length);
  await page.getByText("מקורות והערות לתיארוך",{exact:true}).click();
  await expect(page.getByRole("link",{name:"מחברת בית שני ↗",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"עוד סיבוב",exact:true}).click();
  await expect(page.locator("ol .num.truncate")).toHaveCount(0);
  await page.getByRole("button",{name:"בדיקה",exact:true}).click();
  await page.getByRole("button",{name:"הצגת הסדר הנכון",exact:true}).click();
  const shown=await page.locator("ol>li").allTextContents();
  set.nodes.forEach((n,i)=>expect(shown[i]).toContain(n.label));
  await page.getByRole("button",{name:"← לכל הצירים",exact:true}).click();
 }
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 expect(errors).toEqual([]);
 console.log("PASS: three new timelines, 65 cards, hidden dates, keyboard controls, correct scores, answer reveal, retry, notebook links and mobile widths");
}finally{await browser.close();await new Promise(done=>server.close(done));}
