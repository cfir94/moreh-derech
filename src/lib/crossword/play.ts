import type { Direction, Puzzle, PuzzleWord } from "@/lib/crossword/generate";
import { finalForm } from "@/lib/crossword/hebrew";

/*
 * The grid as the solver sees it, and the rules of moving through it. Pure
 * functions of the puzzle and the letters filled in ("row,col" → base
 * letter), so the component only holds the selection.
 */

export type GridCell = {
  key: string;
  row: number;
  col: number;
  letter: string;
  number?: number;
  across?: number;
  down?: number;
  /** Drawn as a final letter: the last letter of every word that passes through it. */
  final: boolean;
  /** A space inside a multi-word answer follows this cell. */
  breakAcross: boolean;
  breakDown: boolean;
};

export type Fill = Record<string, string>;

export const cellKey = (row: number, col: number) => `${row},${col}`;

export function wordCells(word: PuzzleWord): string[] {
  return word.letters.map((_, i) =>
    word.dir === "across" ? cellKey(word.row, word.col + i) : cellKey(word.row + i, word.col),
  );
}

/** Indices where one word of a multi-word answer ends. */
function wordEnds(word: PuzzleWord): Set<number> {
  const ends = new Set<number>();
  let total = 0;
  for (const length of word.enumeration) ends.add((total += length) - 1);
  return ends;
}

export function buildGrid(puzzle: Puzzle): Map<string, GridCell> {
  const cells = new Map<string, GridCell>();
  const finals = new Map<string, boolean>();
  puzzle.words.forEach((word, index) => {
    const ends = wordEnds(word);
    wordCells(word).forEach((key, i) => {
      const [row, col] = key.split(",").map(Number);
      const cell = cells.get(key) ?? {
        key, row, col, letter: word.letters[i], final: false, breakAcross: false, breakDown: false,
      };
      cell[word.dir] = index;
      if (i === 0) cell.number = word.number;
      const isEnd = ends.has(i);
      if (isEnd && i < word.letters.length - 1) {
        if (word.dir === "across") cell.breakAcross = true;
        else cell.breakDown = true;
      }
      finals.set(key, (finals.get(key) ?? true) && isEnd);
      cells.set(key, cell);
    });
  });
  for (const [key, final] of finals) cells.get(key)!.final = final;
  return cells;
}

export function shown(cell: GridCell, letter: string | undefined): string {
  if (!letter) return "";
  return cell.final ? finalForm(letter) : letter;
}

export function isWordSolved(word: PuzzleWord, fill: Fill): boolean {
  return wordCells(word).every((key, i) => fill[key] === word.letters[i]);
}

export function isWordFilled(word: PuzzleWord, fill: Fill): boolean {
  return wordCells(word).every((key) => Boolean(fill[key]));
}

export function isSolved(puzzle: Puzzle, fill: Fill): boolean {
  return puzzle.words.every((word) => isWordSolved(word, fill));
}

export function isFull(grid: Map<string, GridCell>, fill: Fill): boolean {
  for (const key of grid.keys()) if (!fill[key]) return false;
  return true;
}

/** Clue order: all across clues by number, then all down clues. */
export function clueOrder(puzzle: Puzzle): number[] {
  const order = puzzle.words.map((word, index) => ({ word, index }));
  const sorted = (dir: Direction) =>
    order.filter(({ word }) => word.dir === dir).sort((a, b) => a.word.number - b.word.number).map(({ index }) => index);
  return [...sorted("across"), ...sorted("down")];
}

/** The next clue in `step` direction, skipping solved-looking (fully filled) ones when any are left. */
export function stepClue(puzzle: Puzzle, from: number, step: 1 | -1, fill: Fill): number {
  const order = clueOrder(puzzle);
  const at = order.indexOf(from);
  for (let i = 1; i <= order.length; i++) {
    const index = order[(at + step * i + order.length * 2) % order.length];
    if (!isWordFilled(puzzle.words[index], fill)) return index;
  }
  return order[(at + step + order.length) % order.length];
}

/** Where to put the cursor when a clue is chosen: its first empty cell, else its first cell. */
export function entryCell(word: PuzzleWord, fill: Fill): string {
  const cells = wordCells(word);
  return cells.find((key) => !fill[key]) ?? cells[0];
}

/** Cells of the word whose letter is filled in and wrong. */
export function wrongCells(word: PuzzleWord, fill: Fill): string[] {
  return wordCells(word).filter((key, i) => fill[key] && fill[key] !== word.letters[i]);
}

/** Three stars without help, two with a few letters revealed, one otherwise. */
export function starsFor(revealed: number, checks: number): 1 | 2 | 3 {
  if (!revealed && !checks) return 3;
  return revealed <= 3 ? 2 : 1;
}

/** Consecutive solved weeks, ending this week or — if this week is still open — last week. */
export function streak(solvedWeeks: Set<number>, current: number): number {
  let week = solvedWeeks.has(current) ? current : current - 1;
  let count = 0;
  while (solvedWeeks.has(week)) {
    count++;
    week--;
  }
  return count;
}
