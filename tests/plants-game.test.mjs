// משחק הצמחים: סבבים שלמים, עם תמונות או בלעדיהן, ושאלות שתמיד יש להן תשובה אחת נכונה.
import test from "node:test";
import assert from "node:assert/strict";
import { PLANTS } from "../src/data/plants/plants.ts";
import { createRound, progressId } from "../src/lib/plantsGame.ts";
import raw from "../src/data/plants/photos.json" with { type: "json" };

const photos = Object.values(raw).flat().filter((p) => p.status === "approved");

test("a round has ten questions, each with the right answer among distinct choices", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const round = createRound(PLANTS, photos, { seed });
    assert.equal(round.length, 10);
    assert.equal(new Set(round.map((q) => q.plant)).size, 10, "no plant twice in a round");
    for (const q of round) {
      assert.ok(q.choices.includes(q.plant), `${q.kind}/${q.plant}: answer among choices`);
      assert.equal(new Set(q.choices).size, q.choices.length, "distinct choices");
      assert.equal(q.choices.length, q.kind === "pair" ? 2 : 4);
      if (q.kind === "photo") assert.ok(photos.some((p) => p.id === q.photo && p.plant === q.plant), "photo of the right plant");
      if (q.kind === "pair") assert.ok(q.how, "pair questions explain the difference");
    }
  }
});

test("without approved photos the round is still complete, in text", () => {
  const round = createRound(PLANTS, [], { seed: 7 });
  assert.equal(round.length, 10);
  assert.ok(round.every((q) => q.kind !== "photo"));
});

test("plants missed last time come first", () => {
  const missed = [PLANTS[5].id, PLANTS[17].id];
  const round = createRound(PLANTS, photos, { seed: 3, missed });
  assert.deepEqual(new Set(round.slice(0, 2).map((q) => q.plant)), new Set(missed));
});

test("progress ids are stable and unique", () => {
  const ids = PLANTS.map((p) => progressId(PLANTS, p.id));
  assert.equal(new Set(ids).size, PLANTS.length);
  assert.ok(ids.every((id) => id > 0));
});
