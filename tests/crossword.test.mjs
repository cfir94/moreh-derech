import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import people from "../src/data/who-am-i/people.json" with { type: "json" };
import { CROSSWORD_BANK } from "../src/data/crossword/bank.ts";
import { CROSSWORD_NOTEBOOKS } from "../src/data/crossword/notebooks.ts";
import { LIMITS, eligibleEntries, puzzleForWeek, weekPools } from "../src/lib/crossword/generate.ts";
import { answerLetters, answerWords, enumeration, finalForm, letterFromKey } from "../src/lib/crossword/hebrew.ts";
import { buildGrid, entryCell, shown, starsFor, stepClue, streak, wordCells, wrongCells } from "../src/lib/crossword/play.ts";
import {
  CROSSWORD_EPOCH, daysToNextWeek, israelDate, isWeekStart, weekByNumber, weekOfDate,
} from "../src/lib/crossword/week.ts";

// A realistic Hebrew bank for exercising the generator: the who-am-i names,
// spread over the notebooks. Test-only — the real bank comes from the notebooks.
const NOTEBOOK_IDS = CROSSWORD_NOTEBOOKS.map((notebook) => notebook.id);
const FIXTURE = people.map((person, i) => ({
  id: `fixture:${person.id}`,
  answer: person.name,
  clue: person.role,
  notebook: NOTEBOOK_IDS[i % NOTEBOOK_IDS.length],
  since: CROSSWORD_EPOCH,
}));

function letterGrid(puzzle) {
  const cells = new Map();
  for (const word of puzzle.words) {
    wordCells(word).forEach((key, i) => {
      const previous = cells.get(key);
      assert.ok(!previous || previous === word.letters[i], `crossing letters disagree at ${key}`);
      cells.set(key, word.letters[i]);
    });
  }
  return cells;
}

test("Hebrew answers: base letters only, final forms folded, words counted", () => {
  assert.deepEqual(answerLetters("אַבְרָהָם אָבִינוּ"), [..."אברהמ", ..."אבינו"]);
  assert.deepEqual(enumeration("כנסיית הקבר"), [6, 4]);
  assert.deepEqual(enumeration("בית־שאן"), [3, 3]);
  assert.deepEqual(answerWords("רש״י").flat(), [..."רשי"]);
  assert.equal(finalForm("מ"), "ם");
  assert.equal(finalForm("ש"), "ש");
  // Typing works on a Hebrew or an English layout, and finals count as regular letters.
  assert.equal(letterFromKey("ק", "KeyE"), "ק");
  assert.equal(letterFromKey("e", "KeyE"), "ק");
  assert.equal(letterFromKey("ם", "KeyO"), "מ");
  assert.equal(letterFromKey("1", "Digit1"), null);
});

test("the crossword week turns at midnight on Friday in Jerusalem", () => {
  assert.ok(isWeekStart(CROSSWORD_EPOCH));
  assert.deepEqual(weekByNumber(1), { number: 1, start: CROSSWORD_EPOCH, end: "2026-11-05" });
  assert.equal(israelDate(new Date("2026-11-05T21:30:00Z")), "2026-11-05");
  assert.equal(israelDate(new Date("2026-11-05T22:30:00Z")), "2026-11-06");
  assert.equal(weekOfDate("2026-11-05").number, 1);
  assert.equal(weekOfDate("2026-11-06").number, 2);
  assert.equal(weekOfDate("2026-11-08").start, "2026-11-06");
  // Summer time does not move the boundary either.
  assert.equal(israelDate(new Date("2027-06-03T21:30:00Z")), "2027-06-04");
  assert.equal(weekOfDate("2027-06-04").start, "2027-06-04");
  assert.equal(daysToNextWeek("2026-11-05"), 1);
  assert.equal(daysToNextWeek("2026-10-30"), 7);
});

test("every week gets a legal, connected criss-cross grid that fits a phone", () => {
  for (let number = 1; number <= 30; number++) {
    const puzzle = puzzleForWeek(FIXTURE, weekByNumber(number));
    assert.ok(puzzle, `no puzzle for week ${number}`);
    const { words, rows, cols } = puzzle;
    assert.ok(words.length >= LIMITS.minWords && words.length <= LIMITS.maxWords, `week ${number}: ${words.length} words`);
    assert.ok(cols <= LIMITS.maxCols && rows <= LIMITS.maxRows, `week ${number}: ${cols}x${rows}`);
    assert.equal(new Set(words.map((word) => word.letters.join(""))).size, words.length, "an answer appears twice");

    const cells = letterGrid(puzzle);
    for (const key of cells.keys()) {
      const [r, c] = key.split(",").map(Number);
      assert.ok(r >= 0 && c >= 0 && r < rows && c < cols, `cell ${key} outside the ${cols}x${rows} grid`);
    }

    // Every run of two letters or more is exactly one answer — no accidental words.
    const spans = new Set(words.map((word) => `${word.dir}:${wordCells(word).join("|")}`));
    for (const dir of ["across", "down"]) {
      for (let line = 0; line < (dir === "across" ? rows : cols); line++) {
        let run = [];
        for (let i = 0; i <= (dir === "across" ? cols : rows); i++) {
          const key = dir === "across" ? `${line},${i}` : `${i},${line}`;
          if (cells.has(key)) { run.push(key); continue; }
          if (run.length > 1) assert.ok(spans.has(`${dir}:${run.join("|")}`), `week ${number}: stray ${dir} run ${run.join(" ")}`);
          run = [];
        }
      }
    }

    // One piece: every word reachable from the first through crossings.
    const seen = new Set([[...cells.keys()][0]]);
    const queue = [...seen];
    while (queue.length) {
      const [r, c] = queue.pop().split(",").map(Number);
      for (const next of [`${r + 1},${c}`, `${r - 1},${c}`, `${r},${c + 1}`, `${r},${c - 1}`]) {
        if (cells.has(next) && !seen.has(next)) { seen.add(next); queue.push(next); }
      }
    }
    assert.equal(seen.size, cells.size, `week ${number}: the grid falls apart`);

    // Clue numbers run 1..n in reading order (top row first, right to left).
    const starts = [...new Map(words.map((word) => [`${word.row},${word.col}`, word])).values()]
      .sort((a, b) => a.row - b.row || a.col - b.col);
    starts.forEach((word, i) => assert.equal(word.number, i + 1));
  }
});

test("the week's puzzle is deterministic and draws on many notebooks", () => {
  const week = weekByNumber(3);
  const a = puzzleForWeek(FIXTURE, week);
  const b = puzzleForWeek([...FIXTURE].reverse(), week);
  assert.equal(a.signature, b.signature, "bank order must not matter");
  assert.ok(new Set(a.words.map((word) => word.notebook)).size >= 10);
  const perNotebook = Object.values(Object.groupBy(a.words, (word) => word.notebook)).map((list) => list.length);
  assert.ok(Math.max(...perNotebook) <= 3, "one notebook dominates the grid");
});

test("consecutive weeks rarely share an answer", () => {
  let shared = 0;
  for (let number = 1; number < 26; number++) {
    const ids = new Set(puzzleForWeek(FIXTURE, weekByNumber(number)).words.map((word) => word.id));
    shared += puzzleForWeek(FIXTURE, weekByNumber(number + 1)).words.filter((word) => ids.has(word.id)).length;
  }
  assert.ok(shared / 25 < 2, `average ${shared / 25} repeated answers a week`);
  // Within one cycle the piles never overlap.
  const eligible = eligibleEntries(FIXTURE, weekByNumber(1).start);
  const first = weekPools(FIXTURE, weekByNumber(1))[0];
  const second = weekPools(FIXTURE, weekByNumber(2))[0];
  assert.ok(first.length >= LIMITS.poolSize && first.length < eligible.length);
  assert.equal(first.filter((entry) => second.includes(entry)).length, 0);
});

test("adding or retiring entries never changes a week that has begun", () => {
  const later = weekByNumber(6).start;
  const before = Array.from({ length: 5 }, (_, i) => puzzleForWeek(FIXTURE, weekByNumber(i + 1)).signature);
  const grown = [
    ...FIXTURE.map((entry, i) => (i % 7 ? entry : { ...entry, until: later })),
    ...FIXTURE.slice(0, 80).map((entry) => ({ ...entry, id: `${entry.id}:new`, answer: `${entry.answer}ה`, since: later })),
  ];
  const after = Array.from({ length: 5 }, (_, i) => puzzleForWeek(grown, weekByNumber(i + 1)).signature);
  assert.deepEqual(after, before);
  const retired = new Set(FIXTURE.filter((_, i) => i % 7 === 0).map((entry) => entry.id));
  for (let number = 6; number <= 9; number++) {
    assert.ok(puzzleForWeek(grown, weekByNumber(number)).words.every((word) => !retired.has(word.id)));
  }
});

test("a bank too small for a grid gives no puzzle, not a broken one", () => {
  assert.equal(puzzleForWeek([], weekByNumber(1)), null);
  assert.equal(puzzleForWeek(FIXTURE.slice(0, 10), weekByNumber(1)), null);
});

test("play rules: final letters, moving between clues, checking and stars", () => {
  // שלום across, ending on the cell where מלך starts down.
  const words = [
    { id: "a", number: 1, dir: "across", row: 0, col: 0, letters: [..."שלומ"], enumeration: [4], answer: "שלום", clue: "", notebook: "judaism-b" },
    { id: "b", number: 2, dir: "down", row: 0, col: 3, letters: [..."מלכ"], enumeration: [3], answer: "מלך", clue: "", notebook: "iron2" },
  ];
  const puzzle = { week: weekByNumber(1), rows: 3, cols: 4, words, signature: "t" };
  const grid = buildGrid(puzzle);
  assert.equal(grid.get("0,3").final, false, "a crossing that starts a word is not final");
  assert.equal(shown(grid.get("2,3"), "כ"), "ך");
  assert.equal(grid.get("0,0").number, 1);
  assert.equal(grid.get("0,3").number, 2);

  const fill = { "0,0": "ש", "0,1": "ל", "0,2": "ו", "0,3": "מ" };
  assert.equal(stepClue(puzzle, 0, 1, fill), 1);
  assert.equal(entryCell(words[1], fill), "1,3");
  assert.deepEqual(wrongCells(words[0], { ...fill, "0,1": "ר" }), ["0,1"]);

  const multi = buildGrid({ ...puzzle, words: [{ ...words[0], letters: [..."אבינו"], enumeration: [2, 3] }] });
  assert.equal(multi.get("0,1").breakAcross, true);
  assert.equal(multi.get("0,1").final, true);

  assert.equal(starsFor(0, 0), 3);
  assert.equal(starsFor(2, 5), 2);
  assert.equal(starsFor(9, 0), 1);
  assert.equal(streak(new Set([3, 4, 5]), 6), 3, "this week still open: the streak runs to last week");
  assert.equal(streak(new Set([3, 4, 5, 6]), 6), 4);
  assert.equal(streak(new Set([3, 5]), 6), 1);
});

test("the 19 source notebooks are listed once each", () => {
  assert.equal(CROSSWORD_NOTEBOOKS.length, 19);
  assert.equal(new Set(NOTEBOOK_IDS).size, 19);
  assert.equal(new Set(CROSSWORD_NOTEBOOKS.map((notebook) => notebook.notebookId)).size, 19);
  for (const notebook of CROSSWORD_NOTEBOOKS) assert.match(notebook.notebookId, /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
});

test("bank entries are sourced, well-formed and never give the answer away", () => {
  const ids = new Set();
  const live = new Map();
  for (const entry of CROSSWORD_BANK) {
    assert.ok(!ids.has(entry.id), `duplicate id ${entry.id}`);
    ids.add(entry.id);
    assert.ok(NOTEBOOK_IDS.includes(entry.notebook), `${entry.id}: unknown notebook`);
    assert.ok(isWeekStart(entry.since) && entry.since >= CROSSWORD_EPOCH, `${entry.id}: since must be a Friday from the epoch on`);
    if (entry.until) assert.ok(isWeekStart(entry.until) && entry.until > entry.since, `${entry.id}: until must be a later Friday`);
    assert.ok(!/[0-9A-Za-z]/.test(entry.answer), `${entry.id}: answers are Hebrew words only`);
    const letters = answerLetters(entry.answer);
    assert.ok(letters.length >= 2 && letters.length <= Math.max(LIMITS.maxCols, LIMITS.maxRows), `${entry.id}: ${letters.length} letters`);
    assert.ok(entry.clue.trim().length >= 4 && entry.clue.length <= 110, `${entry.id}: clue length`);
    const clueWords = answerWords(entry.clue).map((word) => word.join(""));
    for (const word of answerWords(entry.answer).map((w) => w.join("")).filter((w) => w.length >= 3)) {
      assert.ok(
        !clueWords.some((clueWord) => clueWord === word || (clueWord.length === word.length + 1 && clueWord.endsWith(word) && "והבלמשכ".includes(clueWord[0]))),
        `${entry.id}: the clue contains the answer "${word}"`,
      );
    }
    if (!entry.until) {
      const key = letters.join("");
      assert.ok(!live.has(key), `${entry.id}: same answer as ${live.get(key)}`);
      live.set(key, entry.id);
    }
  }
});

test("weeks already played keep their grid", () => {
  const recorded = JSON.parse(readFileSync(new URL("./crossword-signatures.json", import.meta.url), "utf8"));
  for (const [number, signature] of Object.entries(recorded)) {
    assert.equal(puzzleForWeek(CROSSWORD_BANK, weekByNumber(Number(number)))?.signature, signature,
      `week ${number} changed — retire entries with "until" instead of editing or deleting them`);
  }
});
