// מלכי ישראל ויהודה (LA-40): הנתונים שחולצו מהאפליקציה המוטמעת והתרגול שנגזר מהם.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ISRAEL_KINGS, JUDAH_KINGS, PROPHETS, UNITED_KINGS, KINGDOM_MILESTONES } from "../src/data/history-timeline/kings.ts";
import { kingsPractice } from "../src/lib/kingsPractice.ts";

test("every reign runs forward in time and the kingdoms are in order", () => {
  for (const list of [UNITED_KINGS, JUDAH_KINGS, ISRAEL_KINGS]) {
    for (const k of list) assert.ok(k.start >= k.end, `${k.name}: ${k.start}–${k.end}`);
    const main = list.filter((k) => !k.row);
    for (let i = 1; i < main.length; i++) assert.ok(main[i].start <= main[i - 1].start, `${main[i].name} before ${main[i - 1].name}`);
  }
  assert.equal(JUDAH_KINGS.at(-1).end, 586);
  assert.ok(KINGDOM_MILESTONES.some((m) => m.year === 586));
});

test("every prophet named next to a king has an entry", () => {
  for (const k of [...JUDAH_KINGS, ...ISRAEL_KINGS]) {
    for (const name of (k.prophet ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
      assert.ok(PROPHETS[name], `${k.name}: unknown prophet ${name}`);
    }
  }
});

test("practice questions are well formed and answerable", () => {
  const items = kingsPractice(JUDAH_KINGS, ISRAEL_KINGS, PROPHETS);
  assert.ok(items.length >= 40, `only ${items.length} questions`);
  assert.equal(new Set(items.map((i) => i.id)).size, items.length);
  for (const item of items) {
    assert.ok(item.choices.length >= 2, item.prompt);
    assert.equal(new Set(item.choices).size, item.choices.length, `duplicate choice: ${item.prompt}`);
    assert.ok(item.answer >= 0 && item.answer < item.choices.length, item.prompt);
  }
  // "who reigned first": the answer really is the earliest of the four
  const all = [...JUDAH_KINGS, ...ISRAEL_KINGS];
  const start = (name) => Math.max(...all.filter((k) => k.name.replace(/\s*\(.*?\)\s*/g, "").trim() === name).map((k) => k.start));
  for (const item of items.filter((i) => i.prompt.startsWith("מי מלך ראשון"))) {
    const first = start(item.choices[item.answer]);
    for (const choice of item.choices) assert.ok(start(choice) <= first, `${item.prompt} ${choice}`);
  }
});
