import type { CrosswordEntry } from "@/data/crossword/types";

/**
 * The weekly crossword's word bank: people, events, places and terms drawn
 * from the 19 course notebooks (`notebooks.ts`), each with its clue and source
 * notebook. Every week the generator picks about 20 of them and lays out a new
 * grid (`src/lib/crossword/generate.ts`).
 *
 * Rules — `tests/crossword.test.mjs` enforces them:
 * - Every answer and clue comes from the notebook named in `notebook`.
 * - The clue never contains the answer.
 * - Never delete or rename an entry. Retire it with `until`, and add a
 *   corrected entry with a new `since`, so that past weeks keep their puzzle.
 *
 * How the bank is filled: docs/crossword.md.
 */
export const CROSSWORD_BANK: CrosswordEntry[] = [];
