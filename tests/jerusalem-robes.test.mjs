import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FAMILIES, GROUPS, GROUP_BY_ID } from "../src/data/christian-dress/groups.ts";
import { acceptsGroup, createRound } from "../src/lib/christianDress.ts";

const PHOTOS = JSON.parse(readFileSync(new URL("../src/data/christian-dress/photos.json", import.meta.url), "utf8"));
const MANIFEST = JSON.parse(readFileSync(new URL("../tools/christian_dress_photos.json", import.meta.url), "utf8"));
function random(seed = 7) { return () => ((seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296); }
const group = id => GROUP_BY_ID.get(id);

test("every community is complete, and the six Holy Sepulchre communities are exactly the Status Quo six", () => {
  assert.equal(new Set(GROUPS.map(g => g.id)).size, GROUPS.length);
  for (const g of GROUPS) {
    assert.ok(FAMILIES.some(f => f.id === g.family), g.id);
    assert.ok(g.name && g.body && g.tell && g.site && g.mnemonic, g.id);
    assert.ok(g.cues.length >= 3 && g.places.length >= 1 && g.aliases.length >= 3, g.id);
    assert.ok(acceptsGroup(g, g.name), "own name rejected: " + g.id);
    for (const alias of g.aliases) assert.ok(acceptsGroup(g, alias), `${g.id} rejects its alias ${alias}`);
  }
  assert.deepEqual(GROUPS.filter(g => g.holySepulchre).map(g => g.id).sort(),
    ["armenian", "coptic", "ethiopian", "franciscan", "greek-orthodox", "syriac"]);
  assert.equal(new Set(GROUPS.map(g => g.site)).size, GROUPS.length, "two communities share a site answer");
});

test("every photo is reviewed, attributed, freely licensed and on disk; every community has photos", () => {
  assert.equal(PHOTOS.length, MANIFEST.length, "a manifest entry was not fetched — see tools/christian_dress_photos.report.txt");
  for (const p of PHOTOS) {
    assert.ok(GROUP_BY_ID.has(p.group), p.id);
    assert.ok(p.caption && p.alt, "photo without a reviewed caption/alt: " + p.id);
    assert.ok(p.author && p.license, p.id);
    assert.match(p.source, /^https:\/\/commons\.wikimedia\.org\//, p.id);
    assert.match(p.license, /^(CC0|Public domain|CC BY(-SA)? [\d.]+|Attribution|No restrictions|PD)/i, p.id);
    assert.ok(existsSync(resolve("public", p.src.slice(1))), p.id);
    if (p.focus) { const [x, y, z] = p.focus; assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 100 && z >= 1 && z <= 4, p.id); }
  }
  for (const g of GROUPS) assert.ok(PHOTOS.filter(p => p.group === g.id).length >= 2, "too few photos: " + g.id);
});

test("typing accepts singular, plural, the definite article and English, and keeps look-alikes apart", () => {
  assert.ok(acceptsGroup(group("armenian"), "הארמנים"));
  assert.ok(acceptsGroup(group("armenian"), "כומר ארמני"));
  assert.ok(acceptsGroup(group("franciscan"), "הפרנציסקנים"));
  assert.ok(acceptsGroup(group("franciscan"), "Franciscans"));
  assert.ok(acceptsGroup(group("coptic"), "קופטי"));
  assert.ok(acceptsGroup(group("greek-orthodox"), "יווני-אורתודוקסי"));
  assert.ok(acceptsGroup(group("white-fathers"), "האבות הלבנים"));
  for (const [id, wrong] of [["coptic", "סורים"], ["syriac", "קופטים"], ["greek-orthodox", "רוסים"], ["franciscan", "כרמליתים"], ["dominican", "טרפיסטים"], ["armenian", "אורתודוקסים"], ["franciscan", ""]]) {
    assert.equal(acceptsGroup(group(id), wrong), false, `${id} accepted ${wrong}`);
  }
});

test("rounds show a photo in every question, keep four distinct choices, and cover every community before repeating", () => {
  const ids = GROUPS.map(g => g.id);
  const kinds = ["who", "typed", "detail", "pick", "family", "site", "sepulchre"];
  for (let seed = 1; seed <= 25; seed++) {
    const round = createRound(PHOTOS, ids, kinds, 30, random(seed));
    assert.equal(round.length, 30);
    for (const q of round) {
      const shown = "photo" in q ? [q.photo] : q.photos;
      assert.ok(shown.length >= 1 && shown.every(id => PHOTOS.some(p => p.id === id)), q.kind);
      if ("choices" in q) { assert.equal(new Set(q.choices).size, 4, q.kind); }
      if (q.kind === "who" || q.kind === "detail" || q.kind === "site") assert.ok(q.choices.includes(q.group));
      if (q.kind === "detail") assert.ok(PHOTOS.find(p => p.id === q.photo).focus);
      if (q.kind === "pick" || q.kind === "sepulchre") {
        assert.equal(new Set(q.photos).size, 4);
        const groups = q.photos.map(id => PHOTOS.find(p => p.id === id).group);
        assert.equal(groups.filter(g => g === q.group).length, 1, "exactly one right photo");
        assert.equal(new Set(groups).size, 4);
        if (q.kind === "sepulchre") {
          assert.equal(group(q.group).holySepulchre, false);
          assert.equal(groups.filter(g => group(g).holySepulchre).length, 3);
        }
      }
    }
    const asked = new Set(round.slice(0, 10).map(q => q.group));
    assert.ok(asked.size >= 8, "groups repeat too early");
  }
  assert.deepEqual(createRound(PHOTOS, [], kinds, 10), []);
  const east = GROUPS.filter(g => FAMILIES.find(f => f.id === g.family).side === "east").map(g => g.id);
  for (const q of createRound(PHOTOS, east, ["who", "typed"], 12, random(3))) assert.ok(east.includes(q.group));
});
