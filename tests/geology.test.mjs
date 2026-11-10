// עזר הגאולוגיה ומפת המסלול צובעים את אותן יחידות לפי אותם גילים. הבדיקה מוודאת שלא יתפצלו.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { AGES, ROCKS, SOILS } from "../src/data/geology/geology.ts";
import { RELIEF } from "../src/data/geology/relief.ts";

const ages = new Map(AGES.map((a) => [a.id, a]));

for (const level of ["basic", "advanced"]) {
  test(`every ${level} map unit has a known age and that age's colour`, () => {
    const data = JSON.parse(readFileSync(`public/embeds/map/js/data/geology_${level}.geojson`, "utf8"));
    for (const f of data.features) {
      const p = f.properties;
      const age = ages.get(p.age_class);
      assert.ok(age, `${p.id}: unknown age_class ${p.age_class}`);
      assert.equal(p.color, age.color, `${p.id}: colour should be ${age.color} (${age.name})`);
    }
  });
}

test("ages run from oldest to youngest", () => {
  for (let i = 1; i < AGES.length; i++) assert.ok(AGES[i].from <= AGES[i - 1].from, AGES[i].id);
});

test("rocks point only at rocks and ages that exist", () => {
  const ids = new Set(ROCKS.map((r) => r.id));
  assert.equal(ids.size, ROCKS.length, "duplicate rock id");
  for (const rock of ROCKS) {
    for (const c of rock.confuse ?? []) assert.ok(ids.has(c.with), `${rock.id} → ${c.with}`);
    for (const a of rock.ages) assert.ok(ages.has(a), `${rock.id} → ${a}`);
  }
  assert.equal(new Set(SOILS.map((s) => s.id)).size, SOILS.length, "duplicate soil id");
});

test("the relief grid matches its generated description", () => {
  assert.equal(statSync("public/geology/relief.bin").size, RELIEF.grid.w * RELIEF.grid.h * 2);
});

test("every photo subject is a rock or a soil", () => {
  const subjects = new Set([...ROCKS.map((r) => r.id), ...SOILS.map((s) => `soil-${s.id}`)]);
  for (const item of JSON.parse(readFileSync("tools/geology_photos.json", "utf8"))) {
    assert.ok(subjects.has(item.subject), `${item.id}: ${item.subject}`);
    if (item.status === "approved") assert.ok(item.caption && item.alt, `${item.id}: approved without caption/alt`);
  }
});

test("the official GSI layer: every polygon has a known formation with a colour and an age", async () => {
  const { GSI_UNITS } = await import("../src/data/geology/gsi-units.ts");
  const { gsiAge } = await import("../src/data/geology/gsi.ts");
  const data = JSON.parse(readFileSync("public/geology/gsi-200k.geojson", "utf8"));
  assert.ok(data.features.length > 8000, "the 1:200,000 map has about 8,450 polygons");
  for (const f of data.features) assert.ok(GSI_UNITS[f.properties.c], `unknown formation ${f.properties.c}`);
  for (const [code, u] of Object.entries(GSI_UNITS)) {
    assert.match(u.color, /^#[0-9A-F]{6}$/, code);
    assert.ok(ages.has(gsiAge(u.en)), code);
  }
  assert.equal(gsiAge("Elat Granite - (Precambrian)"), "precambrian");
  assert.equal(gsiAge("Yam Suf Group - (Cambrian)"), "paleozoic");
  assert.equal(gsiAge("Golan Basalt; Raqqad Basalt - (Quaternary)"), "basalt-young");
});
