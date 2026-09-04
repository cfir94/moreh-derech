"use client";

import { useState } from "react";
import Link from "next/link";
import { SCENARIOS, scenarioById } from "@/data/guide-reports/scenarios";
import { saveDraft } from "@/lib/guideReportDrafts";
import type { ScheduleRow } from "@/data/guide-reports";

function emptyRow(n: number): ScheduleRow {
  return { n, time: "", activity: "", logistics: "" };
}

export function DaySimulator({ initialScenarioId }: { initialScenarioId?: string }) {
  const [scenarioId, setScenarioId] = useState(
    initialScenarioId && scenarioById(initialScenarioId)
      ? initialScenarioId
      : SCENARIOS[0].id,
  );
  const [rows, setRows] = useState<ScheduleRow[]>(() =>
    Array.from({ length: 8 }, (_, i) => emptyRow(i + 1)),
  );
  const [draftId, setDraftId] = useState<string | undefined>();
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const scenario = scenarioById(scenarioId)!;

  function updateRow(n: number, patch: Partial<ScheduleRow>) {
    setRows((prev) =>
      prev.map((r) => (r.n === n ? { ...r, ...patch } : r)),
    );
  }

  function addRow() {
    setRows((prev) => {
      if (prev.length >= 16) return prev;
      return [...prev, emptyRow(prev.length + 1)];
    });
  }

  function removeLast() {
    setRows((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)));
  }

  function seedFromSites() {
    const sites = scenario.seedSites;
    const seeded: ScheduleRow[] = [
      {
        n: 1,
        time: "07:00 – 08:30",
        activity: "נסיעה מנקודת היציאה לאזור הסיור. הדרכת דרך בדרך.",
        logistics: "ספירה, תדריך פתיחה, הצגת המדריך.",
      },
    ];
    let n = 2;
    let t = 9;
    for (const site of sites.slice(0, 4)) {
      seeded.push({
        n: n++,
        time: `${String(t).padStart(2, "0")}:00 – ${String(t + 1).padStart(2, "0")}:00`,
        activity: `ביקור / הדרכה: ${site}`,
        logistics: "שירותים לפי הצורך. וידוא מים וכובעים.",
      });
      t += 1;
      if (n === 5) {
        seeded.push({
          n: n++,
          time: `${String(t).padStart(2, "0")}:00 – ${String(t + 1).padStart(2, "0")}:00`,
          activity: "ארוחת צהריים והפסקה.",
          logistics: "תיאום מקום ישיבה / מסעדה.",
        });
        t += 1;
      }
    }
    seeded.push({
      n: n++,
      time: "17:00 – 19:00",
      activity: "נסיעה חזרה. סיכום יום.",
      logistics: "תודות לנהג ולקבוצה.",
    });
    setRows(seeded.map((r, i) => ({ ...r, n: i + 1 })));
  }

  function onSave() {
    const d = saveDraft({
      id: draftId,
      kind: "day",
      title: scenario.title,
      payload: { scenarioId, rows },
    });
    setDraftId(d.id);
    setSavedMsg("הטיוטה נשמרה במכשיר זה");
    setTimeout(() => setSavedMsg(null), 2500);
  }

  const filled = rows.filter((r) => r.time.trim() && r.activity.trim()).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1.5 block text-[12px] font-extrabold text-txt-dim">
          בחרו תרחיש קבוצה (כמו במבחן — חלק ב׳)
        </label>
        <select
          value={scenarioId}
          onChange={(e) => setScenarioId(e.target.value)}
          className="w-full rounded-md border border-line bg-card-2 px-3 py-2.5 text-sm font-bold"
        >
          {SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-line bg-card p-4 text-[13px] leading-relaxed">
        <p className="mb-2">
          <b>הקבוצה: </b>
          {scenario.group}
        </p>
        <p className="mb-1 font-extrabold text-txt-dim">אילוצים</p>
        <ul className="mb-2 list-inside list-disc text-txt-dim">
          {scenario.constraints.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="text-txt-dim">
          <b className="text-txt">אזור מוצע: </b>
          {scenario.regionHint}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={seedFromSites}
          className="rounded-full border border-line bg-card-2 px-4 py-2.5 text-[12.5px] font-extrabold transition active:scale-95"
        >
          מילוי התחלתי מאתרים מוצעים
        </button>
        <button
          type="button"
          onClick={addRow}
          className="rounded-full border border-line bg-card px-4 py-2.5 text-[12.5px] font-extrabold transition active:scale-95"
        >
          + שורה
        </button>
        <button
          type="button"
          onClick={removeLast}
          className="rounded-full border border-line bg-card px-4 py-2.5 text-[12.5px] font-extrabold text-txt-dim transition active:scale-95"
        >
          − שורה אחרונה
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-card-2 text-right">
              <th className="w-8 px-2 py-2 text-[11px] font-extrabold text-txt-dim">
                #
              </th>
              <th className="w-[130px] px-2 py-2 text-[11px] font-extrabold text-txt-dim">
                שעות
              </th>
              <th className="px-2 py-2 text-[11px] font-extrabold text-txt-dim">
                מסלול / פעילות
              </th>
              <th className="w-[28%] px-2 py-2 text-[11px] font-extrabold text-txt-dim">
                מנהלות
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.n} className="border-b border-line align-top">
                <td className="px-2 py-2">
                  <span className="num text-[12px] text-txt-dim">{row.n}</span>
                </td>
                <td className="px-2 py-2">
                  <input
                    value={row.time}
                    onChange={(e) => updateRow(row.n, { time: e.target.value })}
                    placeholder="08:00 – 09:00"
                    className="num w-full rounded border border-line bg-card px-2 py-1.5 text-[12px]"
                  />
                </td>
                <td className="px-2 py-2">
                  <textarea
                    value={row.activity}
                    onChange={(e) =>
                      updateRow(row.n, { activity: e.target.value })
                    }
                    rows={2}
                    placeholder="נסיעה / הליכה / ביקור / הדרכת דרך…"
                    className="w-full rounded border border-line bg-card px-2 py-1.5 text-[12.5px] leading-relaxed"
                  />
                </td>
                <td className="px-2 py-2">
                  <textarea
                    value={row.logistics}
                    onChange={(e) =>
                      updateRow(row.n, { logistics: e.target.value })
                    }
                    rows={2}
                    placeholder="ספירה, שירותים, ואוצ׳ר…"
                    className="w-full rounded border border-line bg-card px-2 py-1.5 text-[12.5px] leading-relaxed"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[12.5px] text-txt-dim">
        מולאו <span className="num font-bold text-txt">{filled}</span> שורות
        מתוך <span className="num">{rows.length}</span> (עד 16 במבחן/דו״ח).
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          className="rounded-full px-5 py-3 text-sm font-extrabold text-on-accent transition active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
            boxShadow: "0 10px 26px -10px var(--teal)",
          }}
        >
          שמירת טיוטה
        </button>
        <Link
          href="/guide-reports/drafts"
          className="rounded-full border border-line bg-card-2 px-5 py-3 text-sm font-extrabold transition active:scale-95"
        >
          כל הטיוטות
        </Link>
        <Link
          href="/guide-reports/practice/unit"
          className="rounded-full border border-line bg-card px-5 py-3 text-sm font-extrabold text-txt-dim transition active:scale-95"
        >
          לתרגל יחידת הדרכה
        </Link>
      </div>

      {savedMsg && <p className="text-sm font-bold text-ok">{savedMsg}</p>}

      <div className="rounded-md border border-dashed border-line bg-card p-3 text-[12.5px] leading-relaxed text-txt-dim">
        <b className="text-txt">טיפ למבחן: </b>
        בחלק ב׳ בונים מסלול לפי מאפייני הקבוצה — לא ׳המסלול היפה ביותר׳. בדקו
        התאמה לגיל, כושר, זמן נסיעה, שירותים ומנהלות בכל מקטע.
      </div>
    </div>
  );
}
