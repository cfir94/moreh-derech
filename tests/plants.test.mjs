import assert from "node:assert/strict";
import { test } from "node:test";
import { PLANTS, PLANT_BY_ID, PLANT_GROUPS } from "../src/data/plants/plants.ts";

test("plant data: unique ids, valid groups, short identifying sign", () => {
  assert.equal(PLANT_BY_ID.size, PLANTS.length, "duplicate id");
  for (const plant of PLANTS) {
    assert.ok(PLANT_GROUPS[plant.group], `${plant.id}: unknown group`);
    assert.ok(plant.sign.length <= 90, `${plant.id}: sign is ${plant.sign.length} chars (max 90)`);
    for (const field of ["name", "sci", "season", "habitat", "where", "fact"]) assert.ok(plant[field], `${plant.id}: missing ${field}`);
  }
});

test("every confusable pair points at a real plant, and every plant has one", () => {
  for (const plant of PLANTS) {
    assert.ok(plant.confuse.length > 0, `${plant.id}: no confusable plant`);
    for (const c of plant.confuse) {
      assert.ok(PLANT_BY_ID.has(c.with), `${plant.id}: confuse.with "${c.with}" does not exist`);
      assert.notEqual(c.with, plant.id);
    }
  }
});

test("every group has enough plants for a four-choice question", () => {
  for (const group of Object.keys(PLANT_GROUPS)) {
    assert.ok(PLANTS.filter((p) => p.group === group).length >= 2, group);
  }
  assert.ok(PLANTS.length >= 4 * 8);
});
