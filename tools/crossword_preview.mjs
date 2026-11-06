// Preview the coming weeks of תשבץ השבוע, and freeze the weeks already played.
//
//   node --import ./tests/register-ts.mjs tools/crossword_preview.mjs            this week + 3 more
//   node --import ./tests/register-ts.mjs tools/crossword_preview.mjs --from 5 --weeks 2
//   node --import ./tests/register-ts.mjs tools/crossword_preview.mjs --record   freeze weeks up to this one
//
// --record writes each played week's layout signature to tests/crossword-signatures.json;
// tests/crossword.test.mjs then fails if a change to the bank would alter a week someone already solved.
import { readFileSync, writeFileSync } from "node:fs";
import { CROSSWORD_BANK } from "../src/data/crossword/bank.ts";
import { NOTEBOOK_BY_ID } from "../src/data/crossword/notebooks.ts";
import { cycleLength, eligibleEntries, puzzleForWeek } from "../src/lib/crossword/generate.ts";
import { clueOrder, wordCells } from "../src/lib/crossword/play.ts";
import { finalForm } from "../src/lib/crossword/hebrew.ts";
import { weekByNumber, weekOf, weekRange } from "../src/lib/crossword/week.ts";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at >= 0 ? Number(args[at + 1]) : fallback;
};
const current = weekOf(new Date());
const signaturesFile = new URL("../tests/crossword-signatures.json", import.meta.url);

if (args.includes("--record")) {
  const recorded = JSON.parse(readFileSync(signaturesFile, "utf8"));
  for (let number = 1; number <= current.number; number++) {
    const puzzle = puzzleForWeek(CROSSWORD_BANK, weekByNumber(number));
    if (!puzzle) continue;
    if (recorded[number] && recorded[number] !== puzzle.signature) {
      console.error(`week ${number} no longer matches its recorded grid — the bank changed under a played week`);
      process.exit(1);
    }
    recorded[number] = puzzle.signature;
  }
  writeFileSync(signaturesFile, JSON.stringify(recorded, null, 2) + "\n");
  console.log(`recorded ${Object.keys(recorded).length} weeks`);
  process.exit(0);
}

const eligible = eligibleEntries(CROSSWORD_BANK, current.start);
const perNotebook = Object.entries(Object.groupBy(eligible, (entry) => entry.notebook))
  .map(([id, list]) => `${NOTEBOOK_BY_ID.get(id)?.short ?? id} ${list.length}`).join(" · ");
console.log(`bank: ${CROSSWORD_BANK.length} entries, ${eligible.length} eligible this week, cycle of ${cycleLength(eligible.length)} weeks`);
console.log(perNotebook || "(empty)");

const from = option("--from", current.number);
for (let number = from; number < from + option("--weeks", 4); number++) {
  const week = weekByNumber(number);
  const puzzle = puzzleForWeek(CROSSWORD_BANK, week);
  console.log(`\n══ #${number} · ${weekRange(week)} ${number === current.number ? "(this week)" : ""}`);
  if (!puzzle) {
    console.log("   no puzzle — the bank cannot fill a grid yet");
    continue;
  }
  const grid = Array.from({ length: puzzle.rows }, () => Array(puzzle.cols).fill("·"));
  for (const word of puzzle.words) {
    wordCells(word).forEach((key, i) => {
      const [r, c] = key.split(",").map(Number);
      grid[r][c] = i === word.letters.length - 1 ? finalForm(word.letters[i]) : word.letters[i];
    });
  }
  // Column 0 is the rightmost: reverse each row for a left-to-right terminal.
  for (const row of grid) console.log("   " + row.slice().reverse().join(" "));
  console.log(`   ${puzzle.words.length} words, ${puzzle.cols}×${puzzle.rows}, signature ${puzzle.signature}`);
  for (const index of clueOrder(puzzle)) {
    const word = puzzle.words[index];
    const notebook = NOTEBOOK_BY_ID.get(word.notebook)?.short ?? word.notebook;
    console.log(`   ${String(word.number).padStart(2)} ${word.dir === "across" ? "מאוזן" : "מאונך"}  ${word.clue} (${word.enumeration.join(", ")}) → ${word.answer}  [${notebook}]`);
  }
}
