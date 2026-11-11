// שאלוני התיארוך (LA-40): הנתונים שחולצו מהכלי המוטמע.
import { test } from "node:test";
import assert from "node:assert/strict";
import { DATING_QUIZZES } from "../src/data/history-timeline/dating.ts";

test("seven sets, every question answerable", () => {
  assert.equal(Object.keys(DATING_QUIZZES).length, 7);
  for (const [key, quiz] of Object.entries(DATING_QUIZZES)) {
    assert.ok(quiz.title && quiz.items.length > 10, key);
    for (const item of quiz.items) {
      if (item.type === "mc") {
        assert.ok(item.options.length >= 2 && item.correct >= 0 && item.correct < item.options.length, `${key}: ${item.q}`);
        assert.equal(new Set(item.options).size, item.options.length, `${key}: duplicate option in ${item.q}`);
      } else {
        assert.equal(item.type, "fill", `${key}: unknown type`);
        assert.ok(item.answer.trim(), `${key}: no answer for ${item.q}`);
      }
    }
  }
});

test("set keys match the progress ids the embedded tool recorded", () => {
  // timeline-dating-<key> is in users' history; renaming a key would orphan it
  assert.deepEqual(Object.keys(DATING_QUIZZES), ["prehistory_bronze", "iron_age", "judaism_history", "christianity_history", "borders_history", "archaeology_iron", "judaism_books"]);
});
