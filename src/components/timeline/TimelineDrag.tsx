"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TIMELINE_SETS } from "@/data/timelines/drag-sets";
import type { TimelineSet } from "@/data/timelines/types";
import { recordSummaryAttempt } from "@/lib/progress";
import { domainStyle } from "@/lib/domains";

/**
 * Put the cards in chronological order.
 *
 * The embedded version this replaces was a horizontal timeline you dropped
 * cards onto, which on a phone meant dragging a wide card into a narrow slot
 * one-handed. Here the exercise is a vertical list you reorder, which is the
 * same task with none of that: the full screen width goes to the label, and
 * dragging up and down is the gesture a phone is built for.
 *
 * Three things make the drag itself behave:
 *
 * * **Pointer events, not HTML5 drag-and-drop.** dragstart/drop never fire on
 *   touch, which is why the old one needed a tap-the-card-then-tap-the-slot
 *   mode to work at all on a phone.
 * * **Rows are a fixed height.** Every card is ROW_H tall, so the distance
 *   between two positions is always the same number of pixels and the target
 *   index is arithmetic rather than a hit test against moving boxes.
 * * **Nothing is reordered mid-drag.** The lifted card follows the finger and
 *   the others slide by exactly one row to open a gap; the array changes once,
 *   on release. Live-splicing an array under the pointer is what makes this
 *   kind of list feel like it is fighting you.
 *
 * The arrow buttons are not a fallback for a broken drag — they are how you do
 * this with a keyboard, and how you make a one-place correction without
 * picking anything up.
 */

// Tall enough for a two-line label plus the date line the check reveals — the
// labels have to name what the card is now that the dates are hidden, so they
// are longer than a one-line row would take.
const ROW_H = 68;
const ROW_GAP = 8;
const STEP = ROW_H + ROW_GAP;

type Placed = { label: string; dates: string; answer: number };

function shuffled(set: TimelineSet): Placed[] {
  const cards = set.nodes.map((n, i) => ({ ...n, answer: i }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  // A shuffle that happens to solve itself would be a strange way to start.
  if (cards.every((c, i) => c.answer === i) && cards.length > 1) {
    [cards[0], cards[1]] = [cards[1], cards[0]];
  }
  return cards;
}

export function TimelineDrag() {
  const [set, setSet] = useState<TimelineSet | null>(null);
  const [cards, setCards] = useState<Placed[]>([]);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Drag state. `from` is the index picked up, `over` where it would land.
  const [drag, setDrag] = useState<{ from: number; over: number; dy: number } | null>(
    null,
  );
  const startY = useRef(0);

  function begin(chosen: TimelineSet) {
    setSet(chosen);
    setCards(shuffled(chosen));
    setChecked(false);
    setRevealed(false);
    setDrag(null);
  }

  const onPointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      if (checked) return;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      startY.current = e.clientY;
      setDrag({ from: index, over: index, dy: 0 });
    },
    [checked],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      setDrag((d) => {
        if (!d) return d;
        const dy = e.clientY - startY.current;
        const moved = Math.round(dy / STEP);
        const over = Math.max(0, Math.min(cards.length - 1, d.from + moved));
        return { ...d, dy, over };
      });
    },
    [cards.length],
  );

  const onPointerUp = useCallback(() => {
    setDrag((d) => {
      if (!d) return null;
      if (d.over !== d.from) {
        setCards((list) => {
          const next = [...list];
          const [card] = next.splice(d.from, 1);
          next.splice(d.over, 0, card);
          return next;
        });
      }
      return null;
    });
  }, []);

  function nudge(index: number, by: number) {
    const to = index + by;
    if (to < 0 || to >= cards.length || checked) return;
    setCards((list) => {
      const next = [...list];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  const correct = useMemo(
    () => cards.filter((c, i) => c.answer === i).length,
    [cards],
  );

  function check() {
    if (!set) return;
    setChecked(true);
    recordSummaryAttempt({
      quiz: `timeline-drag-${set.key}`,
      quizLabel: `ציר זמן — ${set.title}`,
      category: set.title,
      correct,
      total: cards.length,
    });
  }

  /** How far row `i` slides to open a gap for the card being dragged. */
  function shiftOf(i: number) {
    if (!drag || i === drag.from) return 0;
    const { from, over } = drag;
    if (from < over && i > from && i <= over) return -STEP;
    if (over < from && i >= over && i < from) return STEP;
    return 0;
  }

  if (!set) {
    return (
      <div className="screen-in mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/quizzes"
          className="mb-4 inline-block text-[13px] font-bold text-txt-dim hover:underline"
        >
          ← כל השאלונים
        </Link>
        <div
          className="relative mb-6 overflow-hidden rounded-lg border border-line bg-card p-5"
          style={domainStyle("timeline-drag")}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-mc opacity-20 blur-[8px]"
          />
          <div className="relative flex items-start gap-3">
            <span aria-hidden className="text-[34px] leading-none">
              🧩
            </span>
            <div>
              <h1 className="mb-1 text-2xl">תרגול ציר זמן</h1>
              <p className="text-[13px] text-txt-dim">
                סדרו את הכרטיסים מן המוקדם למאוחר — בגרירה או בחיצים.
              </p>
            </div>
          </div>
        </div>

        <h2 className="mb-2.5 text-sm font-bold tracking-[0.05em] text-txt-dim">
          בחרו ציר
        </h2>
        <div className="flex flex-col gap-2.5">
          {TIMELINE_SETS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => begin(s)}
              className="rounded-lg border border-line bg-card p-4 text-right transition hover:bg-card-2 active:scale-[0.99]"
            >
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <h3 className="text-[15px]">{s.title}</h3>
                <span className="num shrink-0 text-[11.5px] font-bold text-txt-dim">
                  {s.nodes.length} כרטיסים
                </span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-txt-dim">
                {s.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const perfect = checked && correct === cards.length;

  return (
    <div className="screen-in mx-auto max-w-2xl px-4 py-10">
      <button
        type="button"
        onClick={() => setSet(null)}
        className="mb-4 text-[13px] font-bold text-txt-dim hover:underline"
      >
        ← לכל הצירים
      </button>

      <header className="mb-5">
        <h1 className="mb-1 text-2xl">{set.title}</h1>
        <p className="text-[13px] text-txt-dim">
          {revealed
            ? "זה הסדר הנכון, מן המוקדם למאוחר."
            : checked
              ? "התאריכים חזרו, וליד כרטיס שגוי מופיע המקום שאליו הוא שייך."
              : "מן המוקדם (למעלה) אל המאוחר (למטה). התאריכים יתגלו בבדיקה."}
        </p>
      </header>

      <ol
        className="relative select-none"
        style={{ height: cards.length * STEP - ROW_GAP }}
      >
        {(revealed ? [...cards].sort((a, b) => a.answer - b.answer) : cards).map((card, i) => {
          const lifted = drag?.from === i;
          const right = checked && !revealed && card.answer === i;
          const wrong = checked && !revealed && card.answer !== i;
          return (
            <li
              key={card.label}
              className={`absolute inset-x-0 flex items-stretch gap-2 rounded-lg border ${
                right
                  ? "border-ok/60 bg-card"
                  : wrong
                    ? "border-rose/50 bg-card"
                    : "border-line bg-card"
              } ${lifted ? "z-10 border-teal shadow-[0_14px_34px_-8px_rgba(0,0,0,0.65)]" : ""}`}
              style={{
                height: ROW_H,
                top: i * STEP,
                transform: `translateY(${lifted ? drag!.dy : shiftOf(i)}px)${lifted ? " scale(1.02)" : ""}`,
                transition: lifted ? "none" : "transform 160ms ease",
              }}
            >
              {!checked && (
                <button
                  type="button"
                  aria-label={`הזזת ${card.label}`}
                  onPointerDown={(e) => onPointerDown(e, i)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  // Without this the browser scrolls the page instead of
                  // letting the card follow the finger.
                  style={{ touchAction: "none" }}
                  className="flex w-12 shrink-0 cursor-grab flex-col items-center justify-center gap-0.5 rounded-r-lg text-txt-dim hover:bg-card-2 active:cursor-grabbing"
                >
                  <span aria-hidden className="text-[15px] leading-none">
                    ⠿
                  </span>
                  <span aria-hidden className="num text-[11px] font-extrabold">
                    {i + 1}
                  </span>
                </button>
              )}

              {/* The dates are the answer. While the exercise is open the card
                  shows the label alone — with the two lines the dates would
                  have taken, so long labels still fit — and the dates come back
                  on בדיקה as the correction. */}
              <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
                <span className="line-clamp-2 text-[13.5px] leading-[1.25] font-bold">
                  {card.label}
                </span>
                {checked && (
                  <span className="num truncate text-[10.5px] text-txt-dim">
                    {card.dates}
                  </span>
                )}
              </div>

              {checked && (
                <div className="flex w-12 shrink-0 items-center justify-center rounded-r-lg bg-card-2">
                  <span className="num text-[13px] font-extrabold text-txt-dim">
                    {i + 1}
                  </span>
                </div>
              )}

              {checked ? (
                <div className="flex w-16 shrink-0 items-center justify-center gap-1 border-r border-line">
                  {revealed ? null : right ? (
                    <span aria-hidden className="text-ok">
                      ✓
                    </span>
                  ) : (
                    <>
                      <span aria-hidden className="text-[12px] text-rose">
                        ✗
                      </span>
                      <span className="num rounded-full bg-rose/15 px-1.5 py-0.5 text-[11.5px] font-extrabold text-rose">
                        ←{card.answer + 1}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    aria-label={`${card.label} — מוקדם יותר`}
                    disabled={i === 0}
                    onClick={() => nudge(i, -1)}
                    className="flex flex-1 items-end justify-center px-4 pb-0.5 text-[13px] leading-none text-txt-dim transition hover:text-txt disabled:opacity-25"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label={`${card.label} — מאוחר יותר`}
                    disabled={i === cards.length - 1}
                    onClick={() => nudge(i, 1)}
                    className="flex flex-1 items-start justify-center px-4 pt-0.5 text-[13px] leading-none text-txt-dim transition hover:text-txt disabled:opacity-25"
                  >
                    ▼
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {checked && (
        <div className="mt-5 rounded-lg border border-line bg-card p-4">
          <p className="mb-1 text-base">
            <span className="num font-extrabold text-mc">{correct}</span> מתוך{" "}
            <span className="num font-extrabold">{cards.length}</span> במקום
            הנכון
          </p>
          <p className="text-[12.5px] leading-relaxed text-txt-dim">
            {perfect
              ? "כל הכרטיסים במקומם."
              : "הכרטיסים שסומנו באדום מציגים לצדם את המספר שאליו הם שייכים."}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {!checked ? (
          <button
            type="button"
            onClick={check}
            className="rounded-full px-6 py-3.5 text-sm font-extrabold text-on-accent transition active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
              boxShadow: "0 10px 26px -10px var(--teal)",
            }}
          >
            בדיקה
          </button>
        ) : (
          <button
            type="button"
            onClick={() => begin(set)}
            className="rounded-full px-6 py-3.5 text-sm font-extrabold text-on-accent transition active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
              boxShadow: "0 10px 26px -10px var(--teal)",
            }}
          >
            עוד סיבוב
          </button>
        )}
        {checked && !perfect && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="rounded-full border border-line bg-card-2 px-6 py-3.5 text-sm font-extrabold transition active:scale-95"
          >
            {revealed ? "חזרה לתשובה שלי" : "הצגת הסדר הנכון"}
          </button>
        )}
        <button
          type="button"
          onClick={() => begin(set)}
          className="rounded-full border border-line bg-card px-6 py-3.5 text-sm font-extrabold text-txt-dim transition active:scale-95"
        >
          ערבוב מחדש
        </button>
      </div>
    </div>
  );
}
