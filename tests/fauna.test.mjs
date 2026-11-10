// מגדיר החי: נתונים שלמים, הפניות "לא להתבלבל" תקינות, ולכל בעל חיים בקשת תמונה.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ANIMALS, ANIMAL_GROUPS, REGIONS } from "../src/data/fauna/animals.ts";

test("animals are complete and point at each other correctly", () => {
  const ids = new Set(ANIMALS.map((a) => a.id));
  assert.equal(ids.size, ANIMALS.length, "duplicate id");
  for (const a of ANIMALS) {
    assert.ok(ANIMAL_GROUPS[a.group], a.id);
    assert.ok(a.regions.length && a.regions.every((r) => REGIONS[r]), a.id);
    assert.ok(a.sign && a.where && a.fact, a.id);
    for (const c of a.confuse ?? []) assert.ok(ids.has(c.with), `${a.id} → ${c.with}`);
  }
});

test("every animal has a photo request, and approved photos carry a caption", () => {
  const manifest = JSON.parse(readFileSync("tools/fauna_photos.json", "utf8"));
  const subjects = new Set(manifest.map((m) => m.subject));
  // the murex photo was rejected after review; it stays text-only until a clear one is found
  for (const a of ANIMALS) if (a.id !== "murex") assert.ok(subjects.has(a.id), `no photo request for ${a.id}`);
  for (const m of manifest) if (m.status === "approved") assert.ok(m.caption && m.alt, m.id);
});
