import assert from "node:assert/strict";
import { test } from "node:test";
import MiniSearch from "minisearch";
import { MINISEARCH_OPTIONS, processTerm, rankedSearch, stripNiqqud, tokenize } from "../web/src/shared/hebrew.mjs";

test("מסיר ניקוד וטעמים אבל לא את המקף העליון", () => {
  assert.equal(stripNiqqud("שָׁלוֹם"), "שלום");
  assert.equal(stripNiqqud("בְּרֵאשִׁ֖ית"), "בראשית");
  assert.deepEqual(tokenize("כי־אם בית־המקדש"), ["כי", "אם", "בית", "המקדש"]);
});

test("תחיליות: גם המילה המקורית וגם המילה בלי התחילית", () => {
  assert.deepEqual(processTerm("והמקדש"), ["והמקדש", "מקדש"]);
  assert.deepEqual(processTerm("בירושלים"), ["בירושלים", "ירושלים"]);
  assert.deepEqual(processTerm("שהרומאים"), ["שהרומאים", "רומאים"]);
  assert.deepEqual(processTerm("לטיטוס"), ["לטיטוס", "טיטוס"]);
});

test("מילה של 3 אותיות ומטה לא מקוצרת", () => {
  assert.deepEqual(processTerm("בית"), ["בית"]);
  assert.deepEqual(processTerm("הר"), ["הר"]);
});

test("תחילית לא משאירה פחות משלוש אותיות", () => {
  // "שלום": "של" היה משאיר "ום" — לכן נבחרת "ש" ונשאר "לום".
  assert.deepEqual(processTerm("שלום"), ["שלום", "לום"]);
});

test("מילות קישור לא נכנסות לאינדקס", () => {
  assert.equal(processTerm("של"), null);
  assert.equal(processTerm("the"), null);
});

test("כתיב שונה בתרגומים הישנים", () => {
  assert.deepEqual(processTerm("אספסיאנוס"), ["אספסיאנוס", "אספסינוס"]);
});

test("אנגלית: אותיות קטנות, בלי קיצור תחיליות", () => {
  assert.deepEqual(processTerm("Vesuvius"), ["vesuvius"]);
});

test("חיפוש מוצא מילה עם תחילית, ומעדיף קטע שמכסה יותר ממילות השאילתה", () => {
  const ms = new MiniSearch(MINISEARCH_OPTIONS);
  ms.addAll([
    { id: 0, ref: "א", url: "", text: "כניעה כניעה כניעה כניעה ונכנעו" },
    { id: 1, ref: "ב", url: "", text: "והרומאים עלו על יודפת והעיר נכבשה, ויוסף ירד אל המערה" },
    { id: 2, ref: "ג", url: "", text: "דברים אחרים לגמרי על המקדש" },
  ]);
  const hits = rankedSearch(ms, "יודפת מערה כניעה");
  assert.equal(hits[0].ref, "ב");
  assert.equal(hits[0].coverage, 2);
  assert.equal(rankedSearch(ms, "רומאים")[0].ref, "ב"); // "והרומאים" נמצא דרך הקיצור
});
