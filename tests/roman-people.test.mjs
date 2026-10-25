import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROMAN_PEOPLE, COMPARISONS, ERAS, ROLES, SOURCES, PORTRAITS, filterPeople } from "../src/data/roman-people.ts";

test("each person has a grounded event, a distinct role and a usable memory card", () => {
  assert.equal(ROMAN_PEOPLE.length, 36);
  assert.equal(new Set(ROMAN_PEOPLE.map(p => p.id)).size, 36);
  for (const p of ROMAN_PEOPLE) {
    for (const key of ["name", "role", "date", "hook", "action", "memory", "trap"]) assert.ok(p[key]?.length, `${p.id}: ${key}`);
    assert.ok(ERAS.some(e => e.id === p.era));
    assert.ok(p.roles.length && p.roles.every(role => ROLES[role]));
    assert.ok(p.sources.length && p.sources.every(id => SOURCES[id]));
  }
  for (const era of ERAS) {
    const years = ROMAN_PEOPLE.filter(p => p.era === era.id).map(p => p.year);
    assert.deepEqual(years, [...years].sort((a, b) => a - b));
  }
  assert.deepEqual(ROMAN_PEOPLE.find(p => p.id === "gallus").roles, ["deputy"]);
  assert.deepEqual(ROMAN_PEOPLE.find(p => p.id === "cestius").roles, ["governor", "general"]);
});
test("search recognizes aliases, roles, accents and combined filters", () => {
  assert.deepEqual(filterPeople("אוקטביאנוס").map(p => p.id), ["augustus", "antony"]);
  assert.deepEqual(filterPeople("פִּילָטוּס").map(p => p.id), ["pilate"]);
  assert.deepEqual(filterPeople("גאלוס", "conquest").map(p => p.id), ["cestius"]);
  assert.deepEqual(filterPeople("", "all", "deputy").map(p => p.id), ["gallus"]);
  assert.equal(filterPeople("לאקיים").length, 0);
  assert.ok(filterPeople("", "all", "all", true).every(p => !p.secondary));
});
test("comparisons and image credits all resolve", () => {
  assert.equal(COMPARISONS.length, 11);
  for (const pair of COMPARISONS) {
    assert.equal(pair.people.length, 2);
    assert.ok(pair.people.every(id => ROMAN_PEOPLE.some(p => p.id === id)));
    assert.ok(pair.rule.length > 35);
  }
  for (const [id, portrait] of Object.entries(PORTRAITS)) {
    assert.ok(ROMAN_PEOPLE.some(p => p.id === id));
    assert.ok(portrait.credit && portrait.licenseUrl.startsWith("https://"));
    assert.match(portrait.localSrc, /^\/moreh-derech\/images\/roman-people\/portraits\/[a-z0-9]+\.webp$/);
    const bytes = readFileSync(new URL("../public/" + portrait.localSrc.replace("/moreh-derech/", ""), import.meta.url));
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", `${id}: valid WebP container`);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", `${id}: WebP signature`);
    if (id === "varus") assert.equal(portrait.sourceUrl, "https://www.livius.org/pictures/a/roman-portraits/varus/");
    else assert.ok(["commons.wikimedia.org", "www.livius.org"].includes(new URL(portrait.sourceUrl).hostname));
  }
  assert.equal(Object.keys(PORTRAITS).length, 35);
  assert.deepEqual(ROMAN_PEOPLE.filter(p => !PORTRAITS[p.id]).map(p => p.id), ["florus"]);
  for (const id of ["quirinius", "pilate", "cestius"]) assert.match(PORTRAITS[id].caption, /מאוחר/);
  assert.equal(PORTRAITS.varus.caption, "מטבע");
  assert.equal(PORTRAITS.theodosius1.file, "Gold Solidus of Theodosius I, 379-383.jpg");
  assert.ok(PORTRAITS.quietus.note.includes("אין בו דיוקן אישי ודאי"));
});


import { ROMAN_TENURES, TENURE_SOURCES } from "../src/data/roman-tenures.ts";
test("every person and Herodian companion has sourced, role-specific tenure information", () => {
  for (const id of [...ROMAN_PEOPLE.map(p => p.id), "herod-great", "antipas", "agrippa1"]) {
    const t = ROMAN_TENURES[id];
    assert.ok(t?.label && t.period && t.duration, id);
    assert.ok(t.sources.every(key => TENURE_SOURCES[key]?.href.startsWith("https://")), id);
    if (!["pompey", "antony", "helena", "eudocia"].includes(id)) assert.ok(t.sources.length, id);
  }
  assert.match(ROMAN_TENURES.augustus.duration, /40/);
  assert.match(ROMAN_TENURES.antipas.duration, /42/);
  assert.match(ROMAN_TENURES.caracalla.period, /198/);
  assert.match(ROMAN_TENURES.caracalla.note, /211/);
  assert.match(ROMAN_TENURES.constantine.note, /324/);
  assert.match(ROMAN_TENURES.quirinius.duration, /אינו ודאי/);
  assert.match(ROMAN_TENURES.titus.period, /79–81/);
});

import { ROMAN_PROFILES, PROFILE_SOURCES } from "../src/data/roman-profiles.ts";
import { STORY_CHAPTERS, STORY_RELATIONS } from "../src/data/roman-story.ts";
import { HERODIAN_COMPANIONS } from "../src/data/herodian-companions.ts";

test("context and sourced Jewish notes cover the original figures and Herodian companions", () => {
  const ids = [...ROMAN_PEOPLE, ...HERODIAN_COMPANIONS].map(p => p.id);
  assert.deepEqual(Object.keys(ROMAN_PROFILES).sort(), [...ids].sort());
  for (const id of ids) {
    const p = ROMAN_PROFILES[id];
    assert.equal(p.points.length, 2, id);
    for (const point of [...p.points, ...(p.jewish ? [p.jewish] : [])]) {
      assert.ok(point.text.length > 35, id);
      assert.ok(point.sources.length && point.sources.every(source => PROFILE_SOURCES[source]), id);
    }
  }
  for (const id of ["helena","eudocia","domitian","nerva","heraclius"]) assert.equal(ROMAN_PROFILES[id].jewish, null);
  assert.match(ROMAN_PROFILES.caracalla.jewish.text, /השערה/);
  assert.match(ROMAN_PROFILES.constantine.jewish.text, /אין לייחס/);
  assert.doesNotMatch(JSON.stringify(ROMAN_PROFILES), /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
});

test("the story covers all 39 figures once, in chronological rows, and labels crucial transitions", () => {
  const rows = STORY_CHAPTERS.flatMap(c => c.rows), ids = rows.flatMap(r => r.people);
  assert.equal(STORY_CHAPTERS.length, 8);
  assert.deepEqual([...ids].sort(), [...ROMAN_PEOPLE,...HERODIAN_COMPANIONS].map(p => p.id).sort());
  assert.deepEqual(rows.map(r => r.year), rows.map(r => r.year).sort((a,b) => a-b));
  assert.ok(rows.every(row => row.year !== 0));
  const events = rows.map(row => row.event).filter(Boolean);
  assert.deepEqual(events.filter(e => e.art !== undefined).map(e => e.art).sort(), [0,1,2,3,4,5]);
  for (const event of events) assert.ok(event.sources.every(id => PROFILE_SOURCES[id]), event.id);
  for (const id of ["first-prefects","last-king","second-prefects","destruction","bar-kokhba","christian-rise","state-religion","patriarchate","end-byzantine"]) assert.ok(events.some(e => e.id === id), id);
  assert.match(events.find(e => e.id === "last-king").title, /ששלט ביהודה/);
  assert.match(events.find(e => e.id === "last-king").text, /אגריפס השני/);
  for (const relation of STORY_RELATIONS) {
    assert.ok(ids.includes(relation.from) && ids.includes(relation.to), relation.id);
    assert.ok(relation.from !== relation.to);
    assert.ok(relation.sources.every(id => PROFILE_SOURCES[id]));
  }
  assert.match(STORY_RELATIONS.find(r => r.from === "herod-great" && r.to === "agrippa1").label, /סב ונכדו/);
  assert.match(STORY_RELATIONS.find(r => r.from === "nerva" && r.to === "trajan").label, /לא אב ביולוגי/);
  assert.equal(STORY_RELATIONS.find(r => r.from === "constantius" && r.to === "gallus").kind, "power");
});
