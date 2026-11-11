// ממצאי תקופת הברזל (LA-40): המלך באותה עת והתרגול.
import { test } from "node:test";
import assert from "node:assert/strict";
import { IRON_FINDS, FIND_KINDS } from "../src/data/history-timeline/finds.ts";
import { ISRAEL_KINGS, JUDAH_KINGS } from "../src/data/history-timeline/kings.ts";
import { findsPractice, kingAt } from "../src/lib/findsPractice.ts";

test("finds are dated, typed and anchored uniquely", () => {
  for (const f of IRON_FINDS) assert.ok(FIND_KINDS[f.kind], `${f.title}: unknown kind ${f.kind}`);
  assert.equal(new Set(IRON_FINDS.map((f) => f.year)).size, IRON_FINDS.length, "two finds share a year — #find-<year> would collide");
});

test("the reigning king is the one whose reign covers the year", () => {
  assert.equal(kingAt(JUDAH_KINGS, 701).name, "חזקיהו");
  assert.equal(kingAt(ISRAEL_KINGS, 853).name, "אחאב");
  assert.equal(kingAt(ISRAEL_KINGS, 700), undefined);
  assert.equal(kingAt(JUDAH_KINGS, 950), undefined);
});

test("practice questions are well formed and never give the answer away", () => {
  const items = findsPractice(IRON_FINDS, JUDAH_KINGS, ISRAEL_KINGS);
  assert.ok(items.length >= 30, `only ${items.length}`);
  for (const item of items) {
    assert.equal(new Set(item.choices).size, 4, item.prompt);
    assert.ok(!item.prompt.includes(item.choices[0]) || item.prompt.startsWith("מתי"), `answer in the question: ${item.prompt}`);
  }
});
