"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { EXAM_PAPERS, type ExamGroup } from "@/data/guide-reports/exam-briefs";
import { analyzeFiveMs } from "@/lib/fiveMs";
import { saveDraft } from "@/lib/guideReportDrafts";

/**
 * חלק ב' של מבחן הרישוי, כפי שהוא.
 *
 * The point of this screen is the constraint, not the text box. In the real
 * paper the candidate is handed three groups, picks one, and then has three
 * hours to produce a day that fills a numbered list of guiding slots between a
 * fixed start and a fixed end. So the slots are the form: one editor per
 * required unit, each labelled with the Ministry's own wording, and a running
 * self-check that says which requirement is still empty.
 */

const WORDS = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

type UnitDraft = { site: string; duration: string; body: string; methods: string };
const emptyUnit = (): UnitDraft => ({ site: "", duration: "", body: "", methods: "" });

type Row = { time: string; activity: string; logistics: string };
const emptyRow = (): Row => ({ time: "", activity: "", logistics: "" });

/** Part I is capped at 16 rows in the course template. */
const MAX_ROWS = 16;

function Counter({ n, max }: { n: number; max: number }) {
  // Under half the ceiling is the failure mode the lecturer keeps flagging:
  // "תרחיב עוד קצת, נצל את מלוא המילים". Over the ceiling is a different fault.
  const state = n > max ? "over" : n >= max * 0.75 ? "good" : n > 0 ? "thin" : "empty";
  const color =
    state === "over" ? "text-rose" : state === "good" ? "text-ok" : "text-txt-dim";
  return (
    <span className={`num text-[11px] font-bold ${color}`}>
      {n}/{max} מילים
      {state === "thin" && " · קצר מדי, נצלו את המכסה"}
      {state === "over" && " · חורג"}
    </span>
  );
}

function Timer({ hours }: { hours: number }) {
  const [left, setLeft] = useState<number | null>(null);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (left === null) return;
    ref.current = window.setInterval(
      () => setLeft((v) => (v === null || v <= 0 ? v : v - 1)),
      1000,
    );
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [left === null]);

  if (left === null) {
    return (
      <button
        type="button"
        onClick={() => setLeft(hours * 3600)}
        className="rounded-full border border-line bg-card-2 px-4 py-2 text-[12.5px] font-extrabold transition active:scale-95"
      >
        להפעיל שעון — {hours} שעות
      </button>
    );
  }
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const pad = (v: number) => String(v).padStart(2, "0");
  return (
    <div className="flex items-center gap-2">
      <span
        className={`num rounded-full border border-line px-4 py-2 text-sm font-extrabold ${
          left <= 0 ? "text-rose" : left < 900 ? "text-gold" : "text-txt"
        }`}
      >
        {left <= 0 ? "נגמר הזמן" : `${pad(h)}:${pad(m)}:${pad(s)}`}
      </span>
      <button
        type="button"
        onClick={() => setLeft(null)}
        className="text-[12px] font-bold text-txt-dim hover:underline"
      >
        איפוס
      </button>
    </div>
  );
}

export function ExamSimulator() {
  const [paperSlug, setPaperSlug] = useState(EXAM_PAPERS[0].slug);
  const paper = EXAM_PAPERS.find((p) => p.slug === paperSlug)!;
  const [groupN, setGroupN] = useState<number | null>(null);
  const group: ExamGroup | undefined = paper.groups.find((g) => g.n === groupN);

  const [assumptions, setAssumptions] = useState("");
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [units, setUnits] = useState<UnitDraft[]>([]);
  const [expanded, setExpanded] = useState({
    site: "",
    topic: "",
    position: "",
    body: "",
  });
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | undefined>();

  // Choosing a group resets the answer sheet — in the exam you commit to one.
  function pickGroup(n: number) {
    setGroupN(n);
    const g = paper.groups.find((x) => x.n === n);
    setUnits(g ? g.shortUnits.map(emptyUnit) : []);
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    setExpanded({ site: "", topic: "", position: "", body: "" });
  }

  const check = useMemo(() => {
    if (!group) return null;
    const filledRows = rows.filter((r) => r.time.trim() && r.activity.trim());
    const unitsDone = units.filter((u) => u.site.trim() && WORDS(u.body) >= 40);
    const thinUnits = units.filter(
      (u) => WORDS(u.body) > 0 && WORDS(u.body) < 135,
    );
    const noMethods = units.filter(
      (u) => WORDS(u.body) > 0 && !u.methods.trim(),
    );
    const missingMs = units
      .map((u, i) => ({ i, miss: analyzeFiveMs(u.body).results.filter((r) => !r.found) }))
      .filter((x) => WORDS(units[x.i].body) > 0 && x.miss.length > 0);
    const expWords = WORDS(expanded.body);
    return {
      items: [
        {
          ok: filledRows.length >= 8,
          label: `חלק I — ${filledRows.length} שורות מלאות`,
          note:
            filledRows.length >= 8
              ? "יום שלם מכוסה משעת היציאה עד שעת הסיום"
              : "יום של 10–11 שעות דורש בערך 10–16 שורות, לא שלוש",
        },
        {
          ok: rows.some((r) => /הדרכת דרך|הדרכות דרך/.test(r.activity)),
          label: "הדרכת דרך מסומנת בטבלה",
          note: "התבנית דורשת לציין הדרכת דרך בכל מקטע נסיעה או הליכה שבו הייתה",
        },
        {
          ok: rows.filter((r) => r.logistics.trim()).length >= filledRows.length - 1,
          label: "תיאומים ומנהלות בכל שורה",
          note: "עמודה שלמה בפני עצמה — 3 נקודות בתבנית הקורס",
        },
        {
          ok: unitsDone.length === units.length && units.length > 0,
          label: `חלק II — ${unitsDone.length}/${units.length} יחידות`,
          note: "כל דרישה ברשימה היא סעיף מנוקד בפני עצמו; יחידה חסרה = נקודות שאבדו",
        },
        {
          ok: thinUnits.length === 0,
          label: "אורך היחידות",
          note:
            thinUnits.length === 0
              ? "היחידות מנצלות את מכסת ה-180 מילה"
              : `${thinUnits.length} יחידות מתחת ל-135 מילים — הערה חוזרת של המרצה`,
        },
        {
          ok: missingMs.length === 0,
          label: "חמש המ״מים בכל יחידה",
          note:
            missingMs.length === 0
              ? "מי, מה, מתי, מאיפה ומדוע מכוסים"
              : `חסר בחלק מהיחידות: ${[
                  ...new Set(missingMs.flatMap((x) => x.miss.map((m) => m.label))),
                ].join(", ")}`,
        },
        {
          ok: noMethods.length === 0,
          label: "אמצעים מתודיים",
          note: "עמודה נדרשת לכל יחידה — עזר, מפה, ציטוט, הצבעה בשטח",
        },
        {
          ok: expWords >= 300 && !!expanded.position.trim(),
          label: `חלק III — ${expWords}/400 מילים`,
          note: expanded.position.trim()
            ? "כולל מיקום הקבוצה בזמן ההדרכה"
            : "חסר מיקום הקבוצה בזמן ההדרכה — נדרש במפורש בתבנית",
        },
      ],
    };
  }, [group, rows, units, expanded]);

  function onSave() {
    if (!group) return;
    const d = saveDraft({
      id: draftId,
      kind: "day",
      title: `חלק ב׳ — ${paper.sitting} · קבוצה ${group.n}`,
      payload: { paperSlug, groupN, assumptions, rows, units, expanded },
    });
    setDraftId(d.id);
    setSavedMsg("הטיוטה נשמרה במכשיר זה");
    setTimeout(() => setSavedMsg(null), 2500);
  }

  return (
    <div className="flex flex-col gap-7">
      <section className="rounded-lg border border-line bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-extrabold text-txt-dim">
              מועד המבחן
            </label>
            <select
              value={paperSlug}
              onChange={(e) => {
                setPaperSlug(e.target.value);
                setGroupN(null);
              }}
              className="rounded-md border border-line bg-card-2 px-3 py-2 text-sm font-bold"
            >
              {EXAM_PAPERS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.sitting}
                </option>
              ))}
            </select>
          </div>
          <Timer hours={paper.hours} />
        </div>
        <p className="text-[12.5px] leading-relaxed text-txt-dim">
          {paper.points !== undefined && (
            <b className="text-txt">
              חלק ב׳ — סה״כ <span className="num">{paper.points}</span> נקודות.{" "}
            </b>
          )}
          משך חלק זה של הבחינה:{" "}
          <span className="num">{paper.hours}</span> שעות. עליכם לבחור אחת מתוך{" "}
          <span className="num">{paper.groups.length}</span> הקבוצות ולתכנן
          עבורה טיול.{" "}
          {paper.sourceUrl && (
            <a
              href={paper.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-teal hover:underline"
            >
              טופס הבחינה המקורי ↗
            </a>
          )}
        </p>
        {paper.note && (
          <p className="mt-2 text-[12px] leading-relaxed text-txt-dim opacity-80">
            {paper.note}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold tracking-[0.05em] text-txt-dim">
          בחרו קבוצה אחת
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paper.groups.map((g) => {
            const active = g.n === groupN;
            return (
              <button
                key={g.n}
                type="button"
                onClick={() => pickGroup(g.n)}
                className={`rounded-lg border p-4 text-right transition ${
                  active
                    ? "border-teal bg-card-2"
                    : "border-line bg-card hover:bg-card-2"
                }`}
              >
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <h3 className="text-[15px]">
                    קבוצה {g.n}
                    {g.title ? ` — ${g.title}` : ""}
                  </h3>
                  {active && (
                    <span className="text-[11px] font-extrabold text-teal">
                      נבחרה
                    </span>
                  )}
                </div>
                <p className="mb-2 text-[12.5px] leading-relaxed text-txt-dim">
                  {g.brief}
                </p>
                <p className="text-[11.5px] font-bold text-txt-dim">
                  יציאה: {g.start} · סיום: {g.end}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {group && (
        <>
          <section className="rounded-lg border border-line bg-card-2/40 p-4">
            <p className="mb-2 text-[13px] leading-relaxed">
              <b>הדרישות שלכם:</b> {group.brief} היציאה מ{group.start}, הסיום ב
              {group.end}.
            </p>
            <label className="mb-1 block text-[12px] font-extrabold text-txt-dim">
              מאפייני הקבוצה וההנחות שלכם
            </label>
            <textarea
              value={assumptions}
              onChange={(e) => setAssumptions(e.target.value)}
              rows={3}
              placeholder="גיל, שפה, כושר הליכה, אופי דתי, גודל הקבוצה, סוג הרכב — מה שהשאלה לא אמרה ואתם מניחים"
              className="w-full rounded-md border border-line bg-card px-3 py-2.5 text-[13px] leading-relaxed"
            />
            <p className="mt-1 text-[11.5px] text-txt-dim">
              בטופס המקורי מתבקשים לרשום את מאפייני הקבוצה שבחרתם ולהוסיף הנחות
              משלכם — זה מה שמצדיק אחר כך כל החלטה במסלול.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-bold tracking-[0.05em] text-txt-dim">
              חלק I — תוכנית יום הטיול
            </h2>
            <p className="mb-3 text-[12.5px] text-txt-dim">
              עד <span className="num">{MAX_ROWS}</span> שורות. לוח זמנים
              (5 נק׳) · פירוט המסלול ואופי הפעילות, עד 25 מילים (4 נק׳) ·
              תיאומים ומנהלות, עד 25 מילים (3 נק׳). אתר גדול מפוצל לכמה שורות.
            </p>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[720px] border-collapse text-[12.5px]">
                <thead>
                  <tr className="bg-card-2 text-right">
                    <th className="w-10 px-2 py-2 font-extrabold">#</th>
                    <th className="w-36 px-2 py-2 font-extrabold">לוח זמנים</th>
                    <th className="px-2 py-2 font-extrabold">
                      פירוט המסלול ואופי הפעילות
                    </th>
                    <th className="px-2 py-2 font-extrabold">תיאומים ומנהלות</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t border-line align-top">
                      <td className="num px-2 py-1.5 text-txt-dim">{i + 1}</td>
                      <td className="px-1 py-1">
                        <input
                          value={r.time}
                          onChange={(e) =>
                            setRows((v) =>
                              v.map((x, j) =>
                                j === i ? { ...x, time: e.target.value } : x,
                              ),
                            )
                          }
                          placeholder={i === 0 ? group.start.split(", ")[1] : ""}
                          className="w-full rounded border border-line bg-card px-2 py-1.5"
                        />
                      </td>
                      <td className="px-1 py-1">
                        <textarea
                          value={r.activity}
                          onChange={(e) =>
                            setRows((v) =>
                              v.map((x, j) =>
                                j === i ? { ...x, activity: e.target.value } : x,
                              ),
                            )
                          }
                          rows={2}
                          className="w-full rounded border border-line bg-card px-2 py-1.5 leading-relaxed"
                        />
                      </td>
                      <td className="px-1 py-1">
                        <textarea
                          value={r.logistics}
                          onChange={(e) =>
                            setRows((v) =>
                              v.map((x, j) =>
                                j === i ? { ...x, logistics: e.target.value } : x,
                              ),
                            )
                          }
                          rows={2}
                          className="w-full rounded border border-line bg-card px-2 py-1.5 leading-relaxed"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length < MAX_ROWS && (
              <button
                type="button"
                onClick={() => setRows((v) => [...v, emptyRow()])}
                className="mt-2 rounded-full border border-line bg-card-2 px-4 py-2 text-[12.5px] font-extrabold transition active:scale-95"
              >
                + שורה
              </button>
            )}
          </section>

          <section>
            <h2 className="mb-1 text-sm font-bold tracking-[0.05em] text-txt-dim">
              חלק II — יחידות הדרכה קצרות
            </h2>
            <p className="mb-3 text-[12.5px] text-txt-dim">
              עד 180 מילים ליחידה, כולל חמש המ״מים ותיאור המיקום שממנו אתם
              מדריכים. כל שורה כאן היא דרישה מטופס הבחינה עצמו.
            </p>
            <div className="flex flex-col gap-4">
              {group.shortUnits.map((req, i) => {
                const u = units[i] ?? emptyUnit();
                const fb = analyzeFiveMs(u.body);
                return (
                  <div key={i} className="rounded-lg border border-line bg-card p-4">
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-[14px]">
                        <span className="num text-txt-dim">{i + 1}. </span>
                        {req}
                      </h3>
                      <Counter n={WORDS(u.body)} max={180} />
                    </div>
                    <div className="mb-2 grid gap-2 sm:grid-cols-[2fr_1fr]">
                      <input
                        value={u.site}
                        onChange={(e) =>
                          setUnits((v) =>
                            v.map((x, j) =>
                              j === i ? { ...x, site: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="האתר, והמיקום שממנו אתם מדריכים"
                        className="rounded-md border border-line bg-card-2 px-3 py-2 text-[13px]"
                      />
                      <input
                        value={u.duration}
                        onChange={(e) =>
                          setUnits((v) =>
                            v.map((x, j) =>
                              j === i ? { ...x, duration: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="משך ההדרכה"
                        className="rounded-md border border-line bg-card-2 px-3 py-2 text-[13px]"
                      />
                    </div>
                    <textarea
                      value={u.body}
                      onChange={(e) =>
                        setUnits((v) =>
                          v.map((x, j) =>
                            j === i ? { ...x, body: e.target.value } : x,
                          ),
                        )
                      }
                      rows={7}
                      placeholder="פתחו במילת מפתח או בשאלה, ספרו מי/מה/מתי/מאיפה/מדוע, הוסיפו ציטוט או מחלוקת, וסיימו במשפט שמהדהד…"
                      className="w-full rounded-md border border-line bg-card px-3 py-2.5 text-[13px] leading-relaxed"
                    />
                    <input
                      value={u.methods}
                      onChange={(e) =>
                        setUnits((v) =>
                          v.map((x, j) =>
                            j === i ? { ...x, methods: e.target.value } : x,
                          ),
                        )
                      }
                      placeholder="אמצעים מתודיים (עד 20 מילים) — מפה, תצלום, ציטוט, הצבעה בשטח"
                      className="mt-2 w-full rounded-md border border-line bg-card-2 px-3 py-2 text-[13px]"
                    />
                    {WORDS(u.body) > 0 && (
                      <p className="mt-2 text-[11.5px] text-txt-dim">
                        {fb.results.map((r) => (
                          <span key={r.key} className="ml-2 inline-block">
                            <span className={r.found ? "text-ok" : "text-rose"}>
                              {r.found ? "✓" : "○"}
                            </span>{" "}
                            {r.label}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-bold tracking-[0.05em] text-txt-dim">
              חלק III — יחידת הדרכה מורחבת
            </h2>
            <p className="mb-3 text-[12.5px] leading-relaxed text-txt-dim">
              <b className="text-txt">הדרישה: </b>
              {group.extendedUnit}. עד 400 מילים, כולל מיקום הקבוצה בזמן
              ההדרכה, פתיחה, עזרים והצבעות בשטח, וסיום.
            </p>
            <div className="rounded-lg border border-line bg-card p-4">
              <div className="mb-2 grid gap-2 sm:grid-cols-2">
                <input
                  value={expanded.site}
                  onChange={(e) =>
                    setExpanded((v) => ({ ...v, site: e.target.value }))
                  }
                  placeholder="האתר"
                  className="rounded-md border border-line bg-card-2 px-3 py-2 text-[13px]"
                />
                <input
                  value={expanded.topic}
                  onChange={(e) =>
                    setExpanded((v) => ({ ...v, topic: e.target.value }))
                  }
                  placeholder="הנושא"
                  className="rounded-md border border-line bg-card-2 px-3 py-2 text-[13px]"
                />
              </div>
              <input
                value={expanded.position}
                onChange={(e) =>
                  setExpanded((v) => ({ ...v, position: e.target.value }))
                }
                placeholder="מיקום הקבוצה בזמן ההדרכה — איפה עומדים, לאן פונים"
                className="mb-2 w-full rounded-md border border-line bg-card-2 px-3 py-2 text-[13px]"
              />
              <textarea
                value={expanded.body}
                onChange={(e) =>
                  setExpanded((v) => ({ ...v, body: e.target.value }))
                }
                rows={14}
                className="w-full rounded-md border border-line bg-card px-3 py-2.5 text-[13px] leading-relaxed"
              />
              <div className="mt-1 text-left">
                <Counter n={WORDS(expanded.body)} max={400} />
              </div>
            </div>
          </section>

          {check && (
            <section className="rounded-lg border border-line bg-card p-4">
              <h2 className="mb-3 text-base">בדיקה עצמית</h2>
              <ul className="flex flex-col gap-2">
                {check.items.map((it) => (
                  <li
                    key={it.label}
                    className="flex gap-2 rounded-md border border-line bg-card-2/50 px-3 py-2 text-[13px]"
                  >
                    <span aria-hidden className="text-lg leading-none">
                      {it.ok ? "✓" : "○"}
                    </span>
                    <span>
                      <b className={it.ok ? "text-ok" : "text-txt"}>{it.label}</b>
                      {" — "}
                      <span className="text-txt-dim">{it.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[12px] text-txt-dim">
                הבדיקה כאן היא לפי כללים ומילות מפתח, לא ציון של בוחן. היא תופסת
                את מה שנופל בפועל: יחידה חסרה, יחידה קצרה מדי, מ״ם שלא נאמרה,
                טבלה שלא מכסה את היום.
              </p>
            </section>
          )}

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
              className="rounded-full border border-line bg-card px-5 py-3 text-sm font-extrabold text-txt-dim transition active:scale-95"
            >
              כל הטיוטות
            </Link>
            {savedMsg && (
              <span className="self-center text-sm font-bold text-ok">
                {savedMsg}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
