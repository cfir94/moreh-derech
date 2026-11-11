// שרשרת הספרים של היהדות (LA-40): הנתונים שחולצו והתרגול שנגזר מהם.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JUDAISM_CHAIN, JUDAISM_ERAS } from "../src/data/history-timeline/judaism.ts";
import { judaismPractice } from "../src/lib/judaismPractice.ts";

test("the chain runs in order, every book in a known era, with a unique anchor", () => {
  for (let i = 1; i < JUDAISM_CHAIN.length; i++) assert.ok(JUDAISM_CHAIN[i].year >= JUDAISM_CHAIN[i - 1].year, JUDAISM_CHAIN[i].title);
  for (const b of JUDAISM_CHAIN) assert.ok(JUDAISM_ERAS[b.era], `${b.title}: unknown era ${b.era}`);
  assert.equal(new Set(JUDAISM_CHAIN.map((b) => b.year)).size, JUDAISM_CHAIN.length, "two books share a year — the #book-<year> anchors would collide");
});

test("practice questions are well formed, and none answers itself", () => {
  const items = judaismPractice(JUDAISM_CHAIN, JUDAISM_ERAS);
  assert.ok(items.length >= 50, `only ${items.length} questions`);
  for (const item of items) {
    assert.equal(item.choices.length, 4, item.prompt);
    assert.equal(new Set(item.choices).size, 4, `duplicate choice: ${item.prompt}`);
    assert.equal(item.answer, 0);
  }
  const byShort = new Map(JUDAISM_CHAIN.map((b) => [b.short, b]));
  for (const item of items.filter((i) => i.prompt.startsWith("מה מבין הארבעה"))) {
    const years = item.choices.map((c) => byShort.get(c).year);
    assert.ok(years.slice(1).every((y) => y > years[0]), item.choices.join(" / "));
  }
  for (const item of items.filter((i) => i.prompt.startsWith("מי חיבר"))) {
    assert.ok(!item.prompt.includes(item.choices[0]), `answer inside the question: ${item.prompt}`);
  }
});
