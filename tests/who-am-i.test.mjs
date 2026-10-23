import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PEOPLE, BOOKS, PERIODS } from "../src/data/who-am-i/index.ts";
import { acceptsName, createRound, filterPool, normalizeName, score } from "../src/lib/whoAmI.ts";

const person = id => PEOPLE.find(person => person.id === id);
function random(seed=42) { return () => ((seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296); }

test("four source notebooks, five periods, complete unique identities and local attributed images", () => {
  assert.equal(BOOKS.length, 4); assert.equal(PERIODS.length, 5);
  assert.equal(PEOPLE.length, 133);
  assert.equal(new Set(PEOPLE.map(person => person.id)).size, PEOPLE.length);
  for (const p of PEOPLE) {
    assert.ok(p.clues.length && p.clues.every(clue => clue.trim().length > 0), p.id);
    assert.ok(p.date && p.role && p.distinction && p.sources.length, p.id);
    for (const source of p.sources) { assert.match(source.href, /^https:/); if (source.href.includes("notebook.google.com/notebook/")) assert.ok(source.sourceIds.length); else assert.match(source.label, /השלמה/); }
    assert.ok(p.portrait?.alt && p.portrait.caption && p.portrait.credit && p.portrait.license, p.id);
    assert.match(p.portrait.sourceUrl, /^https:/);
    assert.match(p.portrait.licenseUrl, /^https:/);
    assert.ok(existsSync(resolve("public", p.portrait.localSrc.replace("/moreh-derech/", ""))), p.id);
    assert.ok(acceptsName(p, p.name, PEOPLE), "canonical answer not accepted: " + p.id);
  }
});

test("typing accepts niqqud, punctuation, explicit aliases and alternate ordinals", () => {
  assert.ok(acceptsName(person("titus"), " טִיטוּס! ", PEOPLE));
  assert.ok(acceptsName(person("titus"), "TITUS", PEOPLE));
  assert.ok(acceptsName(person("bar-kokhba"), "בר-כוכבא", PEOPLE));
  assert.ok(acceptsName(person("shoshenq"), "שושנק הראשון", PEOPLE));
  assert.ok(acceptsName(person("hyrcanus2"), "הורקנוס 2", PEOPLE));
  assert.equal(normalizeName("Gamaliel II"), normalizeName("Gamaliel 2"));
});
test("typing preserves distinctions between easily confused people and rejects incomplete answers", () => {
  for (const [correct, wrong] of [["agrippa2","אגריפס הראשון"],["agrippa1","אגריפס השני"],["titus","קיטוס"],["constantine","קונסטנטיוס השני"],["constantius","קונסטנטינוס"],["hyrcanus1","הורקנוס"],["hyrcanus2","הורקנוס הראשון"],["joram-israel","יהורם"],["jehoram-judah","יהורם מלך ישראל"],["theodosius2","תיאודוסיוס הראשון"],["julian-sabar","יוליאנוס"]]) {
    assert.equal(acceptsName(person(correct), wrong, PEOPLE), false, correct + ":" + wrong);
  }
  assert.equal(acceptsName(person("titus"), "", PEOPLE), false);
  const ambiguous = [{...person("titus"),aliases:["זהה"]},{...person("quietus"),aliases:["זהה"]}];
  assert.equal(acceptsName(ambiguous[0], "זהה", ambiguous), false);
});
test("multi-period filtering deduplicates overlapping figures", () => {
  const pool=filterPool(PEOPLE,["iron1","iron2"]);
  assert.equal(pool.filter(p=>p.id==="david").length,1);
  assert.deepEqual(filterPool(PEOPLE,[]),[]);
});
test("mixed rounds are balanced and random, cover everyone once, and never mutate the roster", () => {
  const original=PEOPLE.map(p=>p.id);
  for(let seed=1;seed<=20;seed++){
    const round=createRound(PEOPLE,PEOPLE.length,"mixed",random(seed));
    assert.equal(new Set(round.map(q=>q.id)).size,PEOPLE.length);
    assert.ok(Math.abs(round.filter(q=>q.mode==="choice").length-round.filter(q=>q.mode==="typed").length)<=1);
    for(const q of round){
      assert.equal(q.choices.length,4); assert.equal(new Set(q.choices).size,4);
      assert.ok(q.choices.includes(q.id)); assert.ok(person(q.id).clues.includes(q.clue));
    }
  }
  assert.deepEqual(PEOPLE.map(p=>p.id),original);
  assert.notDeepEqual(createRound(PEOPLE,10,"mixed",random(1)),createRound(PEOPLE,10,"mixed",random(2)));
});
test("period-only distractors stay in the selected period; a one-person review still gets four answers", () => {
  const pool=filterPool(PEOPLE,["temple"]);
  const round=createRound(pool,10,"choice",random(7));
  assert.ok(round.every(q=>q.choices.every(id=>pool.some(p=>p.id===id))));
  const review=createRound([person("titus")],1,"mixed",random(3),pool);
  assert.equal(review[0].choices.length,4);
});
test("scores count skips as incorrect and track streaks without a timer", () => {
  const answers=[true,true,false,true].map((correct,i)=>({id:String(i),correct,given:"",hinted:false}));
  assert.deepEqual(score(answers),{correct:3,total:4,streak:1,best:2,percent:75});
  assert.deepEqual(score([]),{correct:0,total:0,streak:0,best:0,percent:0});
});

test("coverage includes early Roman rulers, revolt leaders and figures required by the course concepts sheet", () => {
  for(const id of ["augustus","antony","varus","quirinius","tiberius","caligula","claudius","nero","cestius","menachem","simon-giora","eleazar-simon","ptolemy1","seleucus1","philo","agrippa2"])
    assert.ok(person(id),id);
});
