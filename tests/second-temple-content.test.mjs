import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = (name) => JSON.parse(readFileSync(new URL(`../src/data/second-temple/${name}.json`, import.meta.url), "utf8"));
const data = read("research"), search = read("search");

test("research identities, source locators and original coverage survive the conversion", () => {
  for (const [key, count] of Object.entries({ events: 89, people: 78, sites: 54, processes: 10, sources: 8, issues: 30, gaps: 18 })) {
    assert.equal(data[key].length, count, key);
    assert.equal(new Set(data[key].map((item) => item.id)).size, count, `${key}: unique IDs`);
  }
  const sourceIds = new Set(data.sources.map((source) => source.id));
  for (const event of data.events) {
    for (const field of ["date", "precision", "summary", "body", "causes", "consequences", "people", "places", "archaeology", "takeaway", "caution", "source"]) assert.ok(event[field], `${event.id}: ${field}`);
    const ids = [...event.source.matchAll(/\[(S(?:10|11|12|13|14A|14B|B|G))\]/g)].map((match) => match[1]);
    assert.ok(ids.length, `${event.id}: named source`);
    assert.ok(ids.every((id) => sourceIds.has(id)), event.id);
    assert.match(event.source, /איתור:/, `${event.id}: locator`);
  }
});

test("uncertain chronologies and mention-only content cannot become unqualified search events", () => {
  const byId = new Map(data.events.map((event) => [event.id, event]));
  for (const id of ["ST-014", "ST-036", "ST-067", "ST-069", "ST-082", "ST-085"]) assert.ok(byId.get(id).warning, id);
  assert.doesNotMatch(byId.get("ST-014").date, /445/);
  assert.match(byId.get("ST-014").caution, /445/);
  assert.match(byId.get("ST-085").date, /כנראה/);
  assert.equal(byId.get("ST-086").mentionOnly, true);
  assert.equal(search.length, 88);
  assert.ok(!search.some((event) => event.id === "ST-086"));
  for (const entry of search) {
    const original = byId.get(entry.id);
    assert.equal(original.mentionOnly, false);
    for (const key of ["title", "date", "summary", "people", "places"]) assert.equal(entry[key], original[key], `${entry.id}: search ${key}`);
  }
  for (const id of ["ST-001", "ST-002", "ST-003", "ST-004", "ST-005"]) assert.equal(byId.get(id).period, "background");
  for (const id of ["ST-084", "ST-085", "ST-086"]) assert.equal(byId.get(id).period, "aftermath");
});
