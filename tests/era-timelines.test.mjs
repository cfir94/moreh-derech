import { test } from "node:test";
import assert from "node:assert/strict";
import * as roman from "../src/data/roman/index.ts";
import * as byz from "../src/data/byzantine/index.ts";

const sets = [
  { name: "roman", prefix: "RO", events: roman.ROMAN_EVENTS, eras: roman.ROMAN_ERAS, kinds: roman.ROMAN_KINDS, first: -63, last: 324 },
  { name: "byzantine", prefix: "BY", events: byz.BYZ_EVENTS, eras: byz.BYZ_ERAS, kinds: byz.BYZ_KINDS, first: 324, last: 641 },
];

for (const set of sets) {
  test(`${set.name}: ids, eras and kinds are consistent`, () => {
    const eraIds = set.eras.map((era) => era.id);
    const kindIds = new Set(set.kinds.map((kind) => kind.id));
    set.events.forEach((event, index) => {
      // Sequential ids: they are the milestone numbers and the deep-link fragments.
      assert.equal(event.id, `${set.prefix}-${String(index + 1).padStart(3, "0")}`);
      assert.ok(eraIds.includes(event.era), `${event.id}: era ${event.era}`);
      assert.ok(kindIds.has(event.kind), `${event.id}: kind ${event.kind}`);
      for (const field of ["date", "title", "summary", "body", "tip"]) assert.ok(event[field]?.trim(), `${event.id}: ${field}`);
    });
    for (const era of eraIds) assert.ok(set.events.some((event) => event.era === era), `${set.name}: era ${era} has events`);
  });

  test(`${set.name}: events run in order, era by era`, () => {
    const eraIndex = new Map(set.eras.map((era, i) => [era.id, i]));
    for (let i = 1; i < set.events.length; i++) {
      const [a, b] = [set.events[i - 1], set.events[i]];
      assert.ok(eraIndex.get(a.era) <= eraIndex.get(b.era), `${b.id}: era goes backwards`);
      assert.ok(a.year <= b.year, `${b.id}: year goes backwards`);
    }
    assert.equal(set.events[0].year, set.first);
    assert.equal(set.events.at(-1).year, set.last);
  });
}

test("the two timelines meet at 324 and exam concepts are marked", () => {
  assert.equal(roman.ROMAN_EVENTS.at(-1).year, byz.BYZ_EVENTS[0].year);
  for (const id of ["RO-019", "RO-020", "RO-030", "RO-031", "RO-033", "RO-036"]) assert.ok(roman.ROMAN_EVENTS.find((e) => e.id === id).concept, id);
  for (const id of ["BY-002", "BY-010", "BY-021", "BY-030", "BY-033", "BY-036", "BY-043"]) assert.ok(byz.BYZ_EVENTS.find((e) => e.id === id).concept, id);
});
