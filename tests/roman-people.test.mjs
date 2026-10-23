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
