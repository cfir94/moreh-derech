import type { CrosswordEntry, CrosswordNotebookId } from "@/data/crossword/types";
import { answerLetters, enumeration } from "@/lib/crossword/hebrew";
import type { CrosswordWeek } from "@/lib/crossword/week";

/*
 * The weekly crossword generator. Everything here is a pure function of the
 * bank and the week, so every solver gets the same grid, the next weeks can
 * be previewed ahead of time (tools/crossword_preview.mjs), and nothing has
 * to be stored on a server.
 *
 * 1. `weekPool` — which entries this week may use. Eligible entries are dealt
 *    into `cycle` equal piles of at least POOL_SIZE, each notebook spread
 *    evenly across them, and week n draws pile n mod cycle: no answer repeats
 *    within a cycle, and every pile mixes all the notebooks.
 * 2. `layoutPuzzle` — a criss-cross layout: each word crosses one already on
 *    the grid, and a letter never touches another word side by side, so every
 *    run of two letters or more is exactly one answer. Many seeded attempts;
 *    the best one wins.
 *
 * Coordinates are logical: column 0 is the rightmost, and "across" runs right
 * to left (מאוזן), as the grid is drawn in an RTL CSS grid.
 */

export const LIMITS = {
  minWords: 18,
  maxWords: 22,
  maxCols: 14,
  maxRows: 17,
  poolSize: 64,
  attempts: 32,
};

export type Direction = "across" | "down";

export type PuzzleWord = {
  id: string;
  number: number;
  dir: Direction;
  row: number;
  col: number;
  letters: string[];
  answer: string;
  clue: string;
  enumeration: number[];
  notebook: CrosswordNotebookId;
  note?: string;
};

export type Puzzle = {
  week: CrosswordWeek;
  rows: number;
  cols: number;
  words: PuzzleWord[];
  /** Changes whenever the layout does; saved progress is only applied to the same signature. */
  signature: string;
};

/** FNV-1a, 32 bit. */
export function hashString(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const byId = (a: CrosswordEntry, b: CrosswordEntry) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export function eligibleEntries(bank: CrosswordEntry[], weekStart: string): CrosswordEntry[] {
  return bank.filter((entry) => entry.since <= weekStart && (!entry.until || weekStart < entry.until)).sort(byId);
}

export function cycleLength(eligibleCount: number): number {
  return Math.max(1, Math.floor(eligibleCount / LIMITS.poolSize));
}

function deal(eligible: CrosswordEntry[], cycle: number, round: number): CrosswordEntry[][] {
  const groups = new Map<string, CrosswordEntry[]>();
  for (const entry of eligible) groups.set(entry.notebook, [...(groups.get(entry.notebook) ?? []), entry]);
  const dealt = [...groups.keys()].sort().flatMap((notebook) =>
    groups
      .get(notebook)!
      .map((entry) => ({ entry, order: hashString(`${entry.id}|${round}`) }))
      .sort((a, b) => a.order - b.order || byId(a.entry, b.entry))
      .map(({ entry }) => entry),
  );
  const piles: CrosswordEntry[][] = Array.from({ length: cycle }, () => []);
  dealt.forEach((entry, position) => piles[position % cycle].push(entry));
  return piles;
}

/**
 * The pools to try for this week, narrowest first: its own pile, then that
 * pile with the next one, then everything eligible. The fallbacks only matter
 * when a pile's words will not interlock; they may repeat an answer early.
 */
export function weekPools(bank: CrosswordEntry[], week: CrosswordWeek): CrosswordEntry[][] {
  const eligible = eligibleEntries(bank, week.start);
  const cycle = cycleLength(eligible.length);
  if (cycle === 1) return [eligible];
  const index = week.number - 1;
  const pile = ((index % cycle) + cycle) % cycle;
  const piles = deal(eligible, cycle, Math.floor(index / cycle));
  const pools = [piles[pile]];
  if (cycle > 2) pools.push([...piles[pile], ...piles[(pile + 1) % cycle]]);
  pools.push(eligible);
  return pools;
}

type Candidate = { entry: CrosswordEntry; letters: string[]; key: string };
type Cell = { letter: string; row: number; col: number; across?: number; down?: number };
type Placed = { candidate: Candidate; row: number; col: number; dir: Direction };
type Fit = { row: number; col: number; dir: Direction; crossings: number; score: number };

const key = (row: number, col: number) => (row + 512) * 1024 + col + 512;

class Board {
  cells = new Map<number, Cell>();
  /** Cells by letter: where a new word can cross. */
  byLetter = new Map<string, Cell[]>();
  placed: Placed[] = [];
  minRow = 0;
  maxRow = -1;
  minCol = 0;
  maxCol = -1;

  get(row: number, col: number) {
    return this.cells.get(key(row, col));
  }

  bounds(row: number, col: number, dir: Direction, length: number) {
    const endRow = dir === "down" ? row + length - 1 : row;
    const endCol = dir === "across" ? col + length - 1 : col;
    if (!this.placed.length) return { rows: endRow - row + 1, cols: endCol - col + 1 };
    return {
      rows: Math.max(this.maxRow, endRow) - Math.min(this.minRow, row) + 1,
      cols: Math.max(this.maxCol, endCol) - Math.min(this.minCol, col) + 1,
    };
  }

  /** Crossings for a legal placement, or -1. */
  fit(letters: string[], row: number, col: number, dir: Direction): number {
    const [dr, dc] = dir === "across" ? [0, 1] : [1, 0];
    const length = letters.length;
    const { rows, cols } = this.bounds(row, col, dir, length);
    if (rows > LIMITS.maxRows || cols > LIMITS.maxCols) return -1;
    if (this.get(row - dr, col - dc) || this.get(row + dr * length, col + dc * length)) return -1;
    let crossings = 0;
    for (let i = 0; i < length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const cell = this.get(r, c);
      if (cell) {
        if (cell.letter !== letters[i] || cell[dir] !== undefined) return -1;
        crossings++;
      } else if (dir === "across" ? this.get(r - 1, c) || this.get(r + 1, c) : this.get(r, c - 1) || this.get(r, c + 1)) {
        return -1;
      }
    }
    return this.placed.length && !crossings ? -1 : crossings;
  }

  place(candidate: Candidate, row: number, col: number, dir: Direction) {
    const [dr, dc] = dir === "across" ? [0, 1] : [1, 0];
    const { rows, cols } = this.bounds(row, col, dir, candidate.letters.length);
    const index = this.placed.length;
    candidate.letters.forEach((letter, i) => {
      const r = row + dr * i;
      const c = col + dc * i;
      let cell = this.get(r, c);
      if (!cell) {
        cell = { letter, row: r, col: c };
        this.cells.set(key(r, c), cell);
        this.byLetter.set(letter, [...(this.byLetter.get(letter) ?? []), cell]);
      }
      cell[dir] = index;
    });
    this.minRow = index ? Math.min(this.minRow, row) : row;
    this.minCol = index ? Math.min(this.minCol, col) : col;
    this.maxRow = this.minRow + rows - 1;
    this.maxCol = this.minCol + cols - 1;
    this.placed.push({ candidate, row, col, dir });
  }

  /** Every legal placement of the word, scored: crossings first, then a compact, phone-shaped grid. */
  fits(letters: string[], random: () => number): Fit[] {
    const fits: Fit[] = [];
    const seen = new Set<number>();
    const area = (this.maxRow - this.minRow + 1) * (this.maxCol - this.minCol + 1);
    for (let i = 0; i < letters.length; i++) {
      for (const cell of this.byLetter.get(letters[i]) ?? []) {
        const dir: Direction = cell.across === undefined ? "across" : "down";
        if (cell[dir] !== undefined) continue;
        const row = dir === "down" ? cell.row - i : cell.row;
        const col = dir === "across" ? cell.col - i : cell.col;
        const id = key(row, col) * 2 + (dir === "down" ? 1 : 0);
        if (seen.has(id)) continue;
        seen.add(id);
        const crossings = this.fit(letters, row, col, dir);
        if (crossings < 0) continue;
        const next = this.bounds(row, col, dir, letters.length);
        // The phone is tall: a grid wider than it is high is penalised.
        const shape = Math.max(0, next.cols - next.rows) * 1.5;
        fits.push({ row, col, dir, crossings, score: crossings * 14 - (next.rows * next.cols - area) * 0.3 - shape + random() * 3 });
      }
    }
    return fits;
  }
}

function interleaveByNotebook(candidates: Candidate[], random: () => number): Candidate[] {
  const groups = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    groups.set(candidate.entry.notebook, [...(groups.get(candidate.entry.notebook) ?? []), candidate]);
  }
  const queues = shuffled([...groups.values()], random);
  const out: Candidate[] = [];
  while (queues.some((queue) => queue.length)) {
    for (const queue of queues) if (queue.length) out.push(queue.shift()!);
  }
  return out;
}

function attempt(candidates: Candidate[], random: () => number) {
  const order = interleaveByNotebook(shuffled(candidates, random), random);
  const notebooks = new Set(order.map((candidate) => candidate.entry.notebook)).size;
  const cap = Math.max(2, Math.ceil(LIMITS.maxWords / notebooks) + 1);
  const board = new Board();
  const first = order.find((candidate) => candidate.letters.length >= 6 && candidate.letters.length <= LIMITS.maxCols - 2)
    ?? order.find((candidate) => candidate.letters.length <= LIMITS.maxCols);
  if (!first) return board;
  board.place(first, 0, 0, "across");

  const used = new Set([first.key]);
  const perNotebook = new Map([[first.entry.notebook, 1]]);
  for (let pass = 0; pass < 2 && board.placed.length < LIMITS.maxWords; pass++) {
    for (const candidate of order) {
      if (board.placed.length >= LIMITS.maxWords) break;
      if (used.has(candidate.key) || (perNotebook.get(candidate.entry.notebook) ?? 0) >= cap) continue;
      const fits = board.fits(candidate.letters, random);
      if (!fits.length) continue;
      const best = fits.reduce((a, b) => (b.score > a.score ? b : a));
      board.place(candidate, best.row, best.col, best.dir);
      used.add(candidate.key);
      perNotebook.set(candidate.entry.notebook, (perNotebook.get(candidate.entry.notebook) ?? 0) + 1);
    }
  }
  return board;
}

function quality(board: Board) {
  const count = board.placed.length;
  const crossings = [...board.cells.values()].filter((cell) => cell.across !== undefined && cell.down !== undefined).length;
  const area = (board.maxRow - board.minRow + 1) * (board.maxCol - board.minCol + 1);
  const notebooks = new Set(board.placed.map((placed) => placed.candidate.entry.notebook)).size;
  return (count >= LIMITS.minWords ? 1000 : 0) + count * 25 + crossings * 6 + notebooks * 4 - area * 0.4;
}

/** The best criss-cross layout of the pool, or null when it cannot reach `minWords`. */
export function layoutPuzzle(pool: CrosswordEntry[], seed: string, week: CrosswordWeek): Puzzle | null {
  const keys = new Set<string>();
  const candidates: Candidate[] = [];
  for (const entry of pool) {
    const letters = answerLetters(entry.answer);
    const key = letters.join("");
    // Two entries with the same letters would be the same answer twice.
    if (letters.length < 2 || letters.length > Math.max(LIMITS.maxCols, LIMITS.maxRows) || keys.has(key)) continue;
    keys.add(key);
    candidates.push({ entry, letters, key });
  }
  if (candidates.length < LIMITS.minWords) return null;

  let best: Board | null = null;
  let bestQuality = -Infinity;
  for (let i = 0; i < LIMITS.attempts; i++) {
    const board = attempt(candidates, seededRandom(hashString(`${seed}#${i}`)));
    const score = quality(board);
    if (score > bestQuality) {
      best = board;
      bestQuality = score;
    }
  }
  if (!best || best.placed.length < LIMITS.minWords) return null;
  return toPuzzle(best, week);
}

function toPuzzle(board: Board, week: CrosswordWeek): Puzzle {
  const placed = board.placed
    .map((p) => ({ ...p, row: p.row - board.minRow, col: p.col - board.minCol }))
    .sort((a, b) => a.row - b.row || a.col - b.col || (a.dir === b.dir ? 0 : a.dir === "across" ? -1 : 1));
  const numbers = new Map<string, number>();
  for (const p of placed) {
    const key = `${p.row},${p.col}`;
    if (!numbers.has(key)) numbers.set(key, numbers.size + 1);
  }
  const words: PuzzleWord[] = placed.map(({ candidate: { entry, letters }, row, col, dir }) => ({
    id: entry.id,
    number: numbers.get(`${row},${col}`)!,
    dir,
    row,
    col,
    letters,
    answer: entry.answer,
    clue: entry.clue,
    enumeration: enumeration(entry.answer),
    notebook: entry.notebook,
    ...(entry.note ? { note: entry.note } : {}),
  }));
  const signature = hashString(words.map((w) => `${w.id}@${w.row},${w.col},${w.dir}:${w.letters.join("")}`).join("|")).toString(36);
  return {
    week,
    rows: board.maxRow - board.minRow + 1,
    cols: board.maxCol - board.minCol + 1,
    words,
    signature,
  };
}

/** The puzzle of the week, or null while the bank is too small for one. */
export function puzzleForWeek(bank: CrosswordEntry[], week: CrosswordWeek): Puzzle | null {
  for (const pool of weekPools(bank, week)) {
    const puzzle = layoutPuzzle(pool, `crossword:${week.start}`, week);
    if (puzzle) return puzzle;
  }
  return null;
}
