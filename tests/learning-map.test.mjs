// Content checks for the learning map (/map/learn): the data is hand-written,
// so these catch the slips a reader would not: a duplicate id, a link to a
// timeline event that does not exist, a dot drawn outside its sheet, a photo
// entry that belongs to no site.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as lm from "../src/data/learning-map/index.ts";
import { COUNTRY, JERUSALEM } from "../src/data/learning-map/geometry.ts";
import { ARCH_ALIAS_IDS } from "../src/data/learning-map/photo-index.ts";
import { ROMAN_EVENTS } from "../src/data/roman/index.ts";
import { BYZ_EVENTS } from "../src/data/byzantine/index.ts";

const research = JSON.parse(readFileSync(new URL("../src/data/second-temple/research.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../tools/learning_map_photos.json", import.meta.url), "utf8"));
const archManifest = JSON.parse(readFileSync(new URL("../tools/architecture_photos.json", import.meta.url), "utf8"));
const photoIndexSource = readFileSync(new URL("../src/data/learning-map/photo-index.ts", import.meta.url), "utf8");

const { SITES, ROWS, PERIODS, BUILDERS } = lm;
const findIds = SITES.flatMap((s) => (s.finds ?? []).map((f) => f.id));

// the sub-periods as years; a phase must sit inside its own (the bounds are shared)
const RANGES = {
  persian: [-538, -332], hellenistic: [-332, -167], hasmonean: [-167, -37],
  herodian: [-37, 70], roman: [70, 324], byzantine: [324, 640],
};

test("ids are unique across sites, phases and finds", () => {
  const ids = [...SITES.map((s) => s.id), ...ROWS.map((r) => r.layer.id), ...findIds];
  const seen = new Set();
  for (const id of ids) {
    assert.ok(!seen.has(id), `duplicate id ${id}`);
    assert.match(id, /^[a-z0-9-]+$/, `id ${id}`);
    seen.add(id);
  }
});

test("every site can be studied and practised", () => {
  for (const site of SITES) {
    for (const field of ["name", "place", "about", "tip"]) assert.ok(site[field]?.trim(), `${site.id}: ${field}`);
    assert.ok(site.layers.length > 0, `${site.id}: no building phase`);
    assert.ok(site.ask.length > 0, `${site.id}: no exam-style question`);
    for (const q of site.ask) {
      assert.ok(q.trim().endsWith("?"), `${site.id}: "${q}" is not a question`);
      // the practice asks it and the answer is the site — the question must not say it
      assert.ok(!q.includes(site.name), `${site.id}: the question gives the answer away`);
    }
    for (const layer of site.layers) {
      for (const field of ["date", "title", "what"]) assert.ok(layer[field]?.trim(), `${layer.id}: ${field}`);
      assert.ok(layer.period in RANGES, `${layer.id}: period ${layer.period}`);
      const [from, to] = RANGES[layer.period];
      assert.ok(layer.year >= from && layer.year <= to, `${layer.id}: ${layer.year} outside ${layer.period}`);
      if (layer.builder) assert.ok(lm.BUILDER_BY_ID[layer.builder], `${layer.id}: builder ${layer.builder}`);
    }
    const years = site.layers.map((l) => l.year);
    assert.deepEqual(years, [...years].sort((a, b) => a - b), `${site.id}: phases out of order`);
  }
});

test("a question belongs to one site only", () => {
  const owner = new Map();
  for (const site of SITES) for (const q of site.ask) {
    assert.ok(!owner.has(q), `"${q}" — asked for ${owner.get(q)} and ${site.id}`);
    owner.set(q, site.id);
  }
});

test("the exam questions that started this map have their answers on it", () => {
  const answer = (q) => SITES.find((s) => s.ask.includes(q))?.id;
  assert.equal(answer("איזו כנסייה בבית לחם נמנית עם מפעלי קונסטנטינוס והלנה?"), "nativity");
  assert.equal(answer("איזו כנסייה גדולה הקים יוסטיניאנוס בירושלים?"), "nea");
  assert.equal(answer("איזה אתר מזוהה עם מנזר גרסימוס במדבר יהודה?"), "gerasimos");
  assert.equal(answer("איזה אתר באזור חברון נכלל במפעלי הבנייה הנוצריים הקונסטנטיניים?"), "mamre");
  assert.ok(lm.SITE_BY_ID.get("beit-alfa").finds.some((f) => f.title === "עקדת יצחק"));
});

test("every period and every builder has something on the map", () => {
  for (const p of PERIODS) assert.ok(ROWS.some((r) => r.layer.period === p.id), `period ${p.id}`);
  for (const b of BUILDERS) assert.ok(ROWS.some((r) => r.layer.builder === b.id), `builder ${b.id}`);
});

test("each dot lies inside its sheet", () => {
  const inside = ([lng0, lat0, lng1, lat1], s) => s.lng > lng0 && s.lng < lng1 && s.lat > lat0 && s.lat < lat1;
  for (const site of SITES) {
    if (site.offMap) {
      assert.ok(!inside(COUNTRY.bounds, site), `${site.id}: marked off-map but inside the frame`);
      continue;
    }
    if (site.jerusalem) assert.ok(inside(JERUSALEM.bounds, site), `${site.id}: outside the Jerusalem sheet`);
    else assert.ok(inside(COUNTRY.bounds, site), `${site.id}: outside the country sheet`);
    // and a country dot that sits in Jerusalem's frame belongs on the Jerusalem sheet
    if (!site.jerusalem) assert.ok(!inside(JERUSALEM.bounds, site), `${site.id}: inside Jerusalem but drawn on the country sheet`);
  }
});

test("course links point at events that exist", () => {
  const events = new Set([
    ...research.events.filter((e) => !e.mentionOnly).map((e) => e.id),
    ...ROMAN_EVENTS.map((e) => e.id),
    ...BYZ_EVENTS.map((e) => e.id),
  ]);
  for (const site of SITES) for (const ref of site.refs ?? []) assert.ok(events.has(ref), `${site.id}: ${ref}`);
});

test("photos belong to a site or a find, and are found one way", () => {
  const owners = new Set([...SITES.map((s) => s.id), ...findIds]);
  const seen = new Set();
  for (const item of manifest) {
    assert.ok(owners.has(item.id), `photo ${item.id} belongs to no site or find`);
    assert.ok(!seen.has(item.id), `photo ${item.id} twice`);
    seen.add(item.id);
    assert.equal(["file", "wiki", "search"].filter((k) => k in item).length, 1, `${item.id}: one of file/wiki/search`);
    assert.ok(item.caption?.trim() && item.alt?.trim(), `${item.id}: caption and alt`);
  }
  const archIds = new Set(archManifest.map((p) => p.id));
  for (const id of ARCH_ALIAS_IDS) {
    assert.ok(owners.has(id), `alias ${id} belongs to no site or find`);
    assert.ok(!seen.has(id), `${id} is both fetched and reused`);
    const target = photoIndexSource.match(new RegExp(`"?${id}"?: "([^"]+)"`))?.[1];
    assert.ok(target && archIds.has(target), `alias ${id} → ${target}: not an architecture photo`);
  }
});
