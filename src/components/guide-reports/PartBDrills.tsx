"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DRILLS, DRILL_CATEGORIES, type DrillCategory } from "@/data/guide-reports/part-b-drills";
import { emphasisById } from "@/data/guide-reports/coordinator-session";

/**
 * Quick decision drills for part B — one question at a time, immediate
 * feedback, and the coordinator's reasoning after every answer. Nothing is
 * stored: these are warm-ups, not material to track.
 */
export function PartBDrills() {
  const [cat, setCat] = useState<DrillCategory | "all">("all");
  const items = useMemo(() => (cat === "all" ? DRILLS : DRILLS.filter((d) => d.category === cat)), [cat]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ right: 0, done: 0 });
  const finished = i >= items.length;
  const d = items[i];

  function choose(k: number) {
    if (picked !== null || !d) return;
    setPicked(k);
    setScore((s) => ({ right: s.right + (k === d.correct ? 1 : 0), done: s.done + 1 }));
  }
  function restart(c: DrillCategory | "all") {
    setCat(c);
    setI(0);
    setPicked(null);
    setScore({ right: 0, done: 0 });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1.5">
        {[{ id: "all" as const, label: "הכול" }, ...DRILL_CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => restart(c.id)}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-extrabold transition active:scale-95 ${cat === c.id ? "border-teal bg-teal/15 text-teal" : "border-line bg-card-2 text-txt-dim"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {finished ? (
        <div className="screen-in rounded-lg border border-line bg-card p-6 text-center">
          <p className="mb-1 text-3xl font-black">
            <span className="num">{score.right}</span>/<span className="num">{score.done}</span>
          </p>
          <p className="mb-4 text-txt-dim">סיימתם את הסבב.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => restart(cat)} className="rounded-full border border-line bg-card-2 px-5 py-2.5 text-sm font-extrabold transition active:scale-95">
              סבב נוסף
            </button>
            <Link href="/guide-reports/workshop" className="rounded-full px-5 py-2.5 text-sm font-extrabold text-on-accent transition active:scale-95" style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)" }}>
              לסדנת התכנון ←
            </Link>
          </div>
        </div>
      ) : (
        <div key={d.id} className="screen-in rounded-lg border border-line bg-card p-5">
          <p className="mb-2 text-[12px] font-bold text-txt-dim">
            <span className="num">{i + 1}</span> / <span className="num">{items.length}</span> · {DRILL_CATEGORIES.find((c) => c.id === d.category)?.label}
          </p>
          <h2 className="mb-4 text-[17px] leading-relaxed">{d.prompt}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {d.options.map((o, k) => {
              const state = picked === null ? "" : k === d.correct ? "border-ok bg-ok/15" : k === picked ? "border-rose bg-rose/15" : "opacity-30";
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => choose(k)}
                  disabled={picked !== null}
                  style={picked !== null && k === picked && k !== d.correct ? { animation: "shake 0.4s" } : undefined}
                  className={`rounded-lg border border-line bg-card-2 px-4 py-3 text-right text-[14px] font-bold transition active:scale-95 ${state}`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="mt-4 rounded-md border border-line bg-card-2/50 p-3 text-[13px] leading-relaxed">
              <p className={`mb-1 font-extrabold ${picked === d.correct ? "text-ok" : "text-rose"}`}>{picked === d.correct ? "נכון" : "לא בדיוק"}</p>
              <p className="text-txt-dim">{d.explanation}</p>
              {emphasisById(d.emphasis) && (
                <Link href={`/guide-reports/coordinator#${d.emphasis}`} className="mt-1 inline-block text-[12px] font-bold text-teal hover:underline">
                  🎙️ {emphasisById(d.emphasis)!.title} ←
                </Link>
              )}
              <div className="mt-3">
                <button type="button" onClick={() => { setI(i + 1); setPicked(null); }} className="rounded-full px-5 py-2.5 text-sm font-extrabold text-on-accent transition active:scale-95" style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)" }}>
                  {i + 1 < items.length ? "הבאה ←" : "לתוצאה ←"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
