import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { TALK_CHARACTERS } from "../src/data/history-talk.ts";

// The site's card list mirrors history-talk/characters/*/character.json — same people, same
// chronological order (sortYear), same names. A character added there must be added here too.
test("TALK_CHARACTERS matches history-talk/characters, in chronological order", () => {
  const root = new URL("../history-talk/characters/", import.meta.url);
  const chars = readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => JSON.parse(readFileSync(new URL(`${d.name}/character.json`, root), "utf8")))
    .sort((a, b) => a.sortYear - b.sortYear);
  assert.deepEqual(
    TALK_CHARACTERS.map((c) => [c.id, c.name, c.years, c.tagline]),
    chars.map((c) => [c.id, c.nameHe, c.years, c.taglineHe]),
  );
});
