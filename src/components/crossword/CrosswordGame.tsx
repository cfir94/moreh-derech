"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { CROSSWORD_BANK } from "@/data/crossword/bank";
import { CROSSWORD_NOTEBOOKS, NOTEBOOK_BY_ID } from "@/data/crossword/notebooks";
import { puzzleForWeek, type Direction, type Puzzle, type PuzzleWord } from "@/lib/crossword/generate";
import { KEYBOARD_ROWS, letterFromKey } from "@/lib/crossword/hebrew";
import {
  buildGrid, cellKey, clueOrder, entryCell, isFull, isWordFilled, isWordSolved, shown, starsFor, stepClue, streak,
  wordCells, wrongCells, type Fill, type GridCell,
} from "@/lib/crossword/play";
import { daysToNextWeek, israelDate, weekByNumber, weekOfDate, weekRange, type CrosswordWeek } from "@/lib/crossword/week";
import {
  clearSave, currentSave, emptySave, readSave, useCrosswordProgress, writeSave, type CrosswordProgress, type CrosswordSave,
} from "@/lib/crosswordProgress";
import { recordSummaryAttempt } from "@/lib/progress";
import styles from "./Crossword.module.css";

/*
 * תשבץ השבוע. The week is read on the client (the site is static), the grid
 * is generated from the bank for that week, and the letters are saved per
 * user on the device. Laid out as an excavation square: the empty squares are
 * the grid lines in the dirt, and every answer is a row of stones.
 */

const DIR_LABEL: Record<Direction, string> = { across: "מאוזן", down: "מאונך" };
const EMPTY_FILL: Fill = {};

function subscribeClock(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}

/** Today in Jerusalem; null during the static render, so the week is never baked into the HTML. */
function useIsraelToday() {
  return useSyncExternalStore(subscribeClock, () => israelDate(new Date()), () => null);
}

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function useHash() {
  return useSyncExternalStore(subscribeHash, () => window.location.hash, () => "");
}

function weekNumberOf(start: string) {
  return weekOfDate(start).number;
}

function clock(ms: number) {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return minutes >= 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:${seconds}` : `${minutes}:${seconds}`;
}

export function CrosswordGame() {
  const today = useIsraelToday();
  const hash = useHash();
  const progress = useCrosswordProgress();

  if (!today) return <div className={styles.game} aria-busy="true"><div className={styles.loading}>טוען את תשבץ השבוע…</div></div>;

  const current = weekOfDate(today);
  const requested = Number(/^#w(\d+)$/.exec(hash)?.[1]);
  const number = requested >= 1 && requested <= current.number ? requested : current.number;
  return <WeekView key={number} number={number} current={current} today={today} progress={progress} />;
}

function WeekView({ number, current, today, progress }: {
  number: number; current: CrosswordWeek; today: string; progress: CrosswordProgress;
}) {
  // Generated once per week shown; the component is keyed by the week.
  const [puzzle] = useState(() => puzzleForWeek(CROSSWORD_BANK, weekByNumber(number)));
  const solvedWeeks = new Set(
    Object.entries(progress).filter(([, save]) => save.doneAt).map(([start]) => weekNumberOf(start)),
  );

  if (!puzzle) return <ComingSoon />;
  const save = readSave(progress, puzzle.week.start, puzzle.signature);
  const isCurrent = number === current.number;

  return (
    <div className={styles.game}>
      <Hero puzzle={puzzle} save={save} isCurrent={isCurrent} today={today} streakCount={streak(solvedWeeks, current.number)} />
      <Board puzzle={puzzle} save={save} />
      <Archive current={current} shown={number} progress={progress} />
    </div>
  );
}

function ComingSoon() {
  return (
    <div className={styles.game}>
      <section className={styles.soon}>
        <p className={styles.eyebrow}>תשבץ השבוע</p>
        <h1 className={styles.title}>התשבץ הראשון בדרך</h1>
        <p className={styles.lead}>
          כל יום שישי עולה כאן תשבץ חדש, כ־20 מילים: דמויות, אירועים, אתרים ומושגים מכל מחברות הקורס.
          המאגר נאסף עכשיו מהמחברות, והתשבץ הראשון יופיע ברגע שיהיו בו מספיק מילים.
        </p>
        <p className={styles.soonCount}>
          <b className="num">{CROSSWORD_BANK.length}</b> מילים במאגר עד עכשיו
        </p>
        <ul className={styles.soonBooks} aria-label="המחברות שמהן נאספות המילים">
          {CROSSWORD_NOTEBOOKS.map((notebook) => (
            <li key={notebook.id} style={{ "--nb": notebook.color } as CSSProperties}>{notebook.title}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Hero({ puzzle, save, isCurrent, today, streakCount }: {
  puzzle: Puzzle; save: CrosswordSave | null; isCurrent: boolean; today: string; streakCount: number;
}) {
  const fill = save?.fill ?? EMPTY_FILL;
  const notebooks = new Set(puzzle.words.map((word) => word.notebook)).size;
  const order = clueOrder(puzzle);
  const solved = puzzle.words.filter((word) => isWordSolved(word, fill)).length;
  const days = daysToNextWeek(today);

  return (
    <header className={styles.hero}>
      <div className={styles.heroText}>
        <p className={styles.eyebrow}>
          תשבץ השבוע · <span className="num">#{puzzle.week.number}</span> · <span dir="ltr">{weekRange(puzzle.week)}</span>
          {!isCurrent && <span className={styles.pastTag}>מהארכיון</span>}
        </p>
        <h1 className={styles.title}>תשבץ מורי הדרך</h1>
        <p className={styles.lead}>
          <span className="num">{puzzle.words.length}</span> מילים מ־<span className="num">{notebooks}</span> מחברות הקורס.
          {isCurrent ? (days === 1 ? " תשבץ חדש עולה מחר." : ` תשבץ חדש בעוד ${days} ימים.`) : " אפשר לפתור גם תשבצים שעברו."}
        </p>
        <div className={styles.chips}>
          <span><b className="num">{solved}</b>/<span className="num">{puzzle.words.length}</span> נפתרו</span>
          <span>⏱ <b className="num">{clock(save?.ms ?? 0)}</b></span>
          {streakCount > 1 && <span>🔥 רצף של <b className="num">{streakCount}</b> שבועות</span>}
        </div>
      </div>
      {/* One tessera per answer, set in its notebook's colour once solved. */}
      <ol className={styles.mosaic} aria-label={`${solved} מתוך ${puzzle.words.length} מילים נפתרו`}>
        {order.map((index) => {
          const word = puzzle.words[index];
          const done = isWordSolved(word, fill);
          return (
            <li
              key={word.id}
              data-done={done || undefined}
              style={{ "--nb": NOTEBOOK_BY_ID.get(word.notebook)?.color } as CSSProperties}
              title={done ? word.answer : `${word.number} ${DIR_LABEL[word.dir]}`}
            />
          );
        })}
      </ol>
    </header>
  );
}

/** "(4, 7)" as plain text: in the RTL clue, bidi puts the first word's length on the right. */
function Enumeration({ lengths }: { lengths: number[] }) {
  return <span className={styles.enum}>({lengths.join(", ")})</span>;
}

function NotebookChip({ word }: { word: PuzzleWord }) {
  const notebook = NOTEBOOK_BY_ID.get(word.notebook);
  if (!notebook) return null;
  return <span className={styles.book} style={{ "--nb": notebook.color } as CSSProperties}>{notebook.short}</span>;
}

type Selection = { key: string; dir: Direction };

function Board({ puzzle, save }: { puzzle: Puzzle; save: CrosswordSave | null }) {
  const week = puzzle.week.start;
  const [grid] = useState(() => buildGrid(puzzle));
  const order = useMemo(() => clueOrder(puzzle), [puzzle]);
  const [sel, setSel] = useState<Selection>(() => {
    const first = puzzle.words[order[0]];
    return { key: entryCell(first, save?.fill ?? EMPTY_FILL), dir: first.dir };
  });
  const [wrong, setWrong] = useState<ReadonlySet<string>>(() => new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<number | undefined>(undefined);
  const gridRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fill = save?.fill ?? EMPTY_FILL;
  const revealed = new Set(save?.revealed ?? []);
  const done = Boolean(save?.doneAt);
  const started = Boolean(save);
  const cell = grid.get(sel.key)!;
  const activeIndex = cell[sel.dir] ?? cell.across ?? cell.down!;
  const active = puzzle.words[activeIndex];
  const activeCells = new Set(wordCells(active));
  const solvedWords = new Set(puzzle.words.flatMap((word, index) => (isWordSolved(word, fill) ? [index] : [])));
  const full = isFull(grid, fill);

  // The clock runs while the puzzle is open, started and unsolved.
  useEffect(() => {
    if (!started || done) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const latest = currentSave(week, puzzle.signature);
      if (latest && !latest.doneAt) writeSave(week, { ...latest, ms: latest.ms + 1000 });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, done, week, puzzle.signature]);

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  // Keep the active clue in view inside the clue column (desktop), without scrolling the page.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>(`[data-word="${activeIndex}"]`);
    if (!list || !item || list.scrollHeight <= list.clientHeight) return;
    const top = item.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: top - list.clientHeight / 3, behavior: "smooth" });
    }
  }, [activeIndex]);

  function say(message: string) {
    setFlash(message);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 2600);
  }

  function base(): CrosswordSave {
    return currentSave(week, puzzle.signature) ?? emptySave(puzzle.signature);
  }

  function commit(next: CrosswordSave) {
    let saved = next;
    if (!next.doneAt && puzzle.words.every((word) => isWordSolved(word, next.fill))) {
      saved = { ...next, doneAt: Date.now() };
      const helped = new Set(next.revealed);
      const clean = puzzle.words.filter((word) => wordCells(word).every((key) => !helped.has(key))).length;
      recordSummaryAttempt({
        quiz: "crossword",
        quizLabel: "תשבץ השבוע",
        category: `תשבץ #${puzzle.week.number}`,
        correct: clean,
        total: puzzle.words.length,
      });
    }
    writeSave(week, saved);
  }

  function select(word: number, nextFill: Fill = fill) {
    const target = puzzle.words[word];
    setSel({ key: entryCell(target, nextFill), dir: target.dir });
  }

  function type(letter: string) {
    if (done) return;
    const current = base();
    const nextFill = revealed.has(sel.key) ? current.fill : { ...current.fill, [sel.key]: letter };
    if (!revealed.has(sel.key)) commit({ ...current, fill: nextFill });
    if (wrong.has(sel.key)) setWrong((prev) => new Set([...prev].filter((key) => key !== sel.key)));

    const cells = wordCells(active);
    const at = cells.indexOf(sel.key);
    const ahead = cells.slice(at + 1).find((key) => !nextFill[key]) ?? cells.find((key) => !nextFill[key]);
    if (ahead) setSel({ key: ahead, dir: sel.dir });
    else if (at < cells.length - 1) setSel({ key: cells[at + 1], dir: sel.dir });
    else select(stepClue(puzzle, activeIndex, 1, nextFill), nextFill);
  }

  function erase() {
    if (done) return;
    const current = base();
    const without = (key: string) => {
      const nextFill = { ...current.fill };
      delete nextFill[key];
      commit({ ...current, fill: nextFill });
    };
    if (current.fill[sel.key] && !revealed.has(sel.key)) return without(sel.key);
    const cells = wordCells(active);
    const at = cells.indexOf(sel.key);
    if (at <= 0) return;
    setSel({ key: cells[at - 1], dir: sel.dir });
    if (current.fill[cells[at - 1]] && !revealed.has(cells[at - 1])) without(cells[at - 1]);
  }

  /** Arrow keys: the first press across the current direction turns; the next ones move. */
  function move(dr: number, dc: number) {
    const dir: Direction = dr ? "down" : "across";
    if (sel.dir !== dir && cell[dir] !== undefined) return setSel({ key: sel.key, dir });
    for (let r = cell.row + dr, c = cell.col + dc; r >= 0 && c >= 0 && r < puzzle.rows && c < puzzle.cols; r += dr, c += dc) {
      const target = grid.get(cellKey(r, c));
      if (target) return setSel({ key: target.key, dir: target[dir] !== undefined ? dir : target.across !== undefined ? "across" : "down" });
    }
  }

  function toggleDirection() {
    const other: Direction = sel.dir === "across" ? "down" : "across";
    if (cell[other] !== undefined) setSel({ key: sel.key, dir: other });
  }

  function clickCell(target: GridCell) {
    if (target.key === sel.key) return toggleDirection();
    const other: Direction = sel.dir === "across" ? "down" : "across";
    setSel({ key: target.key, dir: target[sel.dir] !== undefined ? sel.dir : other });
  }

  function chooseClue(word: number) {
    select(word);
    gridRef.current?.focus({ preventScroll: true });
  }

  /*
   * Letters and Backspace are taken anywhere on the page except in a text
   * field, so typing works the moment the page opens. Arrows, Enter and Space
   * only while the grid has focus — elsewhere they still scroll and press.
   */
  const onKey = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
    const inGrid = Boolean(target && gridRef.current?.contains(target));
    const letter = letterFromKey(event.key, event.code);
    if (letter) {
      event.preventDefault();
      return type(letter);
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      return erase();
    }
    if (!inGrid) return;
    const keys: Record<string, () => void> = {
      // The grid is right to left: the left arrow goes forward in an across word.
      ArrowLeft: () => move(0, 1),
      ArrowRight: () => move(0, -1),
      ArrowUp: () => move(-1, 0),
      ArrowDown: () => move(1, 0),
      Enter: () => select(stepClue(puzzle, activeIndex, event.shiftKey ? -1 : 1, fill)),
      " ": toggleDirection,
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  });

  useEffect(() => {
    const listener = (event: globalThis.KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  function checkWord() {
    const bad = wrongCells(active, fill);
    setWrong(new Set(bad));
    const current = base();
    commit({ ...current, checks: current.checks + 1 });
    if (bad.length) say(bad.length === 1 ? "אות אחת לא במקום" : `${bad.length} אותיות לא במקום`);
    else say(isWordFilled(active, fill) ? "נכון! ✓" : "עד כאן הכול נכון");
  }

  function revealLetter() {
    if (done || fill[sel.key] === cell.letter) return;
    const current = base();
    commit({ ...current, fill: { ...current.fill, [sel.key]: cell.letter }, revealed: [...new Set([...current.revealed, sel.key])] });
    setWrong((prev) => new Set([...prev].filter((key) => key !== sel.key)));
  }

  function revealWord() {
    if (done) return;
    const current = base();
    const nextFill = { ...current.fill };
    const nextRevealed = new Set(current.revealed);
    wordCells(active).forEach((key, i) => {
      if (nextFill[key] === active.letters[i]) return;
      nextFill[key] = active.letters[i];
      nextRevealed.add(key);
    });
    commit({ ...current, fill: nextFill, revealed: [...nextRevealed] });
    setWrong(new Set());
  }

  function restart() {
    if (!window.confirm("למחוק את כל האותיות בתשבץ הזה ולהתחיל מחדש?")) return;
    clearSave(week);
    setWrong(new Set());
    select(order[0], EMPTY_FILL);
  }

  const clueBar = (
    <div className={styles.clueBar}>
      <button type="button" className={styles.step} onClick={() => select(stepClue(puzzle, activeIndex, -1, fill))} aria-label="ההגדרה הקודמת">›</button>
      <p aria-live="polite">
        <b>{active.number} {DIR_LABEL[active.dir]}</b>
        <span className={styles.barClue}>{active.clue}</span>
        <Enumeration lengths={active.enumeration} />
      </p>
      <button type="button" className={styles.flip} onClick={toggleDirection} disabled={cell.across === undefined || cell.down === undefined} aria-label="החלפת כיוון">
        {sel.dir === "across" ? "⇆" : "⇅"}
      </button>
      <button type="button" className={styles.step} onClick={() => select(stepClue(puzzle, activeIndex, 1, fill))} aria-label="ההגדרה הבאה">‹</button>
    </div>
  );

  return (
    <div className={styles.play}>
      {done && <Solved puzzle={puzzle} save={save!} />}

      <div className={styles.layout}>
        <section className={styles.boardCol} aria-label="לוח התשבץ">
          <div className={styles.topBar}>{clueBar}</div>
          <div className={styles.boardWrap}>
            <div
              ref={gridRef}
              className={styles.grid}
              data-done={done || undefined}
              tabIndex={0}
              role="group"
              aria-label={`תשבץ: ${puzzle.cols} עמודות על ${puzzle.rows} שורות. אותיות בעברית; חיצים לתנועה, רווח להחלפת כיוון, Enter להגדרה הבאה.`}
              style={{ "--cols": puzzle.cols, "--rows": puzzle.rows } as CSSProperties}
            >
              {[...grid.values()].map((target) => {
                const letter = fill[target.key];
                const isSolvedCell = (target.across !== undefined && solvedWords.has(target.across))
                  || (target.down !== undefined && solvedWords.has(target.down));
                return (
                  <button
                    key={target.key}
                    type="button"
                    tabIndex={-1}
                    className={styles.cell}
                    style={{ gridRow: target.row + 1, gridColumn: target.col + 1 }}
                    data-active={activeCells.has(target.key) || undefined}
                    data-selected={target.key === sel.key || undefined}
                    data-solved={isSolvedCell || undefined}
                    data-wrong={wrong.has(target.key) || undefined}
                    data-revealed={revealed.has(target.key) || undefined}
                    data-break-across={target.breakAcross || undefined}
                    data-break-down={target.breakDown || undefined}
                    onClick={() => clickCell(target)}
                    aria-label={`${target.number ? `${target.number}, ` : ""}${letter ? shown(target, letter) : "ריק"}`}
                  >
                    {target.number && <span className={styles.num}>{target.number}</span>}
                    <span className={styles.letter}>{shown(target, letter)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.tools}>
            <button type="button" onClick={checkWord} disabled={done}>בדיקת מילה</button>
            <button type="button" onClick={revealLetter} disabled={done}>גילוי אות</button>
            <button type="button" onClick={revealWord} disabled={done}>גילוי מילה</button>
            <button type="button" onClick={restart} disabled={!started} className={styles.quiet}>התחלה מחדש</button>
          </div>
          <p className={styles.status} role="status">
            {flash ?? (full && !done ? "כל המשבצות מלאות, אבל משהו עוד לא מסתדר. נסו לבדוק מילה." : "")}
          </p>
        </section>

        <div className={styles.clues} ref={listRef}>
          {(["across", "down"] as const).map((dir) => (
            <section key={dir} aria-label={DIR_LABEL[dir]}>
              <h2>{DIR_LABEL[dir]}</h2>
              <ol>
                {order.filter((index) => puzzle.words[index].dir === dir).map((index) => {
                  const word = puzzle.words[index];
                  return (
                    <li key={word.id}>
                      <button
                        type="button"
                        data-word={index}
                        data-active={index === activeIndex || undefined}
                        data-solved={solvedWords.has(index) || undefined}
                        onClick={() => chooseClue(index)}
                      >
                        <b className="num">{word.number}</b>
                        <span>
                          {word.clue} <Enumeration lengths={word.enumeration} />
                          <NotebookChip word={word} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </div>

      {/* Touch screens: the current clue and a Hebrew keyboard, docked at the bottom. */}
      {!done && (
        <div className={styles.dock} data-crossword-dock>
          {clueBar}
          <div className={styles.keyboard} role="group" aria-label="מקלדת">
            {KEYBOARD_ROWS.map((row, i) => (
              <div key={i}>
                {row.map((letter) => (
                  <button key={letter} type="button" onClick={() => type(letter)}>{letter}</button>
                ))}
                {i === KEYBOARD_ROWS.length - 1 && (
                  <button type="button" className={styles.backspace} onClick={erase} aria-label="מחיקה">⌫</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Solved({ puzzle, save }: { puzzle: Puzzle; save: CrosswordSave }) {
  const stars = starsFor(save.revealed.length, save.checks);
  const order = clueOrder(puzzle);
  return (
    <section className={styles.solved} aria-labelledby="crossword-solved">
      <div className={styles.burst} aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ "--a": `${i * 20}deg`, "--d": `${70 + (i % 3) * 28}px`, "--nb": CROSSWORD_NOTEBOOKS[i % CROSSWORD_NOTEBOOKS.length].color } as CSSProperties} />
        ))}
      </div>
      <p className={styles.stars} aria-label={`${stars} כוכבים`}>{"★".repeat(stars)}<span>{"★".repeat(3 - stars)}</span></p>
      <h2 id="crossword-solved">פתרתם את תשבץ <span className="num">#{puzzle.week.number}</span>!</h2>
      <p className={styles.solvedMeta}>
        <span>⏱ <b className="num">{clock(save.ms)}</b></span>
        <span>אותיות שנחשפו: <b className="num">{save.revealed.length}</b></span>
        <span>בדיקות: <b className="num">{save.checks}</b></span>
      </p>
      <details className={styles.learned}>
        <summary>המילים של השבוע — ומה כדאי לזכור</summary>
        <ul>
          {order.map((index) => {
            const word = puzzle.words[index];
            return (
              <li key={word.id}>
                <b>{word.answer}</b>
                <span>{word.clue}</span>
                {word.note && <small>{word.note}</small>}
                <NotebookChip word={word} />
              </li>
            );
          })}
        </ul>
      </details>
    </section>
  );
}

function Archive({ current, shown: shownWeek, progress }: { current: CrosswordWeek; shown: number; progress: CrosswordProgress }) {
  if (current.number < 2) return null;
  const weeks = Array.from({ length: current.number }, (_, i) => weekByNumber(current.number - i));
  return (
    <nav className={styles.archive} aria-label="תשבצים קודמים">
      <h2>כל התשבצים</h2>
      <ul>
        {weeks.map((week) => {
          const save = progress[week.start];
          const status = save?.doneAt ? "✓ נפתר" : save ? "בתהליך" : "";
          return (
            <li key={week.number}>
              {/* A plain anchor: the week is read from the hash, and only real navigation fires hashchange. */}
              <a href={`#w${week.number}`} aria-current={week.number === shownWeek ? "page" : undefined}>
                <b className="num">#{week.number}</b>
                <span dir="ltr">{weekRange(week)}</span>
                <small>{week.number === current.number ? "השבוע" : status}</small>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
