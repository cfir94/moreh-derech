"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EXAM_CONDITIONS, EXAM_PAPERS, type ExamGroup, type ExamPaper } from "@/data/guide-reports/exam-briefs";
import { insightFor } from "@/data/guide-reports/group-insights";
import { EXAMINER_CHECKLIST, emphasisById } from "@/data/guide-reports/coordinator-session";
import { useHydrated } from "@/lib/clientStore";
import { saveDraft } from "@/lib/guideReportDrafts";
import {
  driveMinutes, emptyPlan, emptyTriage, fmtClock, isRoadSlot, newStopId, parseClock, planKey,
  resetPlan, savePlan, schedule, updateTriage, useWorkshop,
  type GroupPlan, type PaperTriage, type PlanStop,
} from "@/lib/partBWorkshop";

/**
 * סדנת חלק ב׳ — the coordinator's method, one step at a time.
 *
 * The writing simulator (ExamSimulator) is a blank answer sheet. What the
 * 6 November 2026 session drilled is everything that happens *before* the
 * first word: choosing the group by the extended unit, reading every word of
 * the brief, a judgement-free brainstorm per slot, then a geographic order with
 * realistic drives and a midday lunch. Each step here is one of those, and each
 * reveals our key (group-insights.ts) only after the student has committed.
 * The last step turns the plan into a filled-in Part I table and hands it to
 * the simulator as an exam draft, so the writing continues there.
 */

/** Only 2026-shaped papers: four groups of five named slots. */
const PAPERS: ExamPaper[] = EXAM_PAPERS.filter((p) =>
  p.groups.length === 4 && p.groups.every((g) => g.shortUnits.length === 5),
);

const STEPS = ["בחירת קבוצה", "קריאת השאלה", "סיעור מוחין", "סדר וזמנים", "עיני הבוחן"];

const btnPrimary = "rounded-full px-5 py-2.5 text-sm font-extrabold text-on-accent transition active:scale-95 disabled:opacity-40";
const primaryStyle = { background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)", boxShadow: "0 10px 26px -10px var(--teal)" };
const btnGhost = "rounded-full border border-line bg-card-2 px-4 py-2 text-[12.5px] font-extrabold transition active:scale-95 disabled:opacity-40";
const input = "rounded-md border border-line bg-card-2 px-3 py-2 text-[13px]";

const clean = (w: string) => w.replace(/[.,:;!?()"״׳'\-–]/g, "").trim();

function Tip({ id, children }: { id: string; children?: ReactNode }) {
  const e = emphasisById(id);
  if (!e) return null;
  return (
    <details className="rounded-md border border-line bg-card-2/40 px-3 py-2 text-[12.5px] leading-relaxed">
      <summary className="cursor-pointer font-extrabold text-teal">
        🎙️ הרכז: {e.title}
        {e.advice && <span className="mr-2 text-[11px] font-bold text-txt-dim">(המלצה אישית)</span>}
      </summary>
      <ul className="mt-2 flex flex-col gap-1 text-txt-dim">
        {e.points.map((p) => <li key={p}>• {p}</li>)}
      </ul>
      {children}
    </details>
  );
}

function Countdown({ minutes, label }: { minutes: number; label: string }) {
  const [left, setLeft] = useState<number | null>(null);
  const running = left !== null;
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setLeft((v) => (v === null || v <= 0 ? v : v - 1)), 1000);
    return () => window.clearInterval(t);
  }, [running]);
  if (left === null) {
    return <button type="button" className={btnGhost} onClick={() => setLeft(minutes * 60)}>⏱ {label}</button>;
  }
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <span className="flex items-center gap-2">
      <span className={`num rounded-full border border-line px-3 py-1.5 text-sm font-extrabold ${left === 0 ? "text-rose" : left < 180 ? "text-gold" : ""}`}>
        {left === 0 ? "הזמן עבר" : `${mm}:${ss}`}
      </span>
      <button type="button" onClick={() => setLeft(null)} className="text-[12px] font-bold text-txt-dim hover:underline">איפוס</button>
    </span>
  );
}

export function PartBWorkshop() {
  const hydrated = useHydrated();
  const state = useWorkshop();
  const [paperSlug, setPaperSlug] = useState(PAPERS[0].slug);
  const paper = PAPERS.find((p) => p.slug === paperSlug) ?? PAPERS[0];
  const triageBase = useMemo(() => emptyTriage(paper.groups), [paper]);
  const triage: PaperTriage = state.triage[paper.slug] ?? triageBase;
  const [groupN, setGroupN] = useState<number | null>(null);
  const group = paper.groups.find((g) => g.n === groupN);

  if (!hydrated) return <p className="py-6 text-sm text-txt-dim">טוען…</p>;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-line bg-card p-4">
        <label className="mb-1 block text-[12px] font-extrabold text-txt-dim">טופס</label>
        <select
          value={paper.slug}
          onChange={(e) => { setPaperSlug(e.target.value); setGroupN(null); }}
          className="w-full rounded-md border border-line bg-card-2 px-3 py-2 text-sm font-bold sm:w-auto"
        >
          <optgroup label="טפסים של משרד התיירות">
            {PAPERS.filter((p) => !p.practice).map((p) => <option key={p.slug} value={p.slug}>{p.sitting}</option>)}
          </optgroup>
          <optgroup label="תרגילים שלנו בפורמט 2026">
            {PAPERS.filter((p) => p.practice).map((p) => <option key={p.slug} value={p.slug}>{p.sitting}</option>)}
          </optgroup>
        </select>
        <p className="mt-2 text-[12.5px] leading-relaxed text-txt-dim">
          {paper.practice
            ? "טופס תרגול שחיברנו באותו מבנה ובאותן מלכודות — לא טופס רשמי של משרד התיירות."
            : "טופס אמיתי של משרד התיירות, כפי שהודפס."}{" "}
          {EXAM_CONDITIONS}
        </p>
      </section>

      {!group ? (
        <Triage paper={paper} triage={triage} onPick={setGroupN} />
      ) : (
        <GroupFlow key={`${paper.slug}:${group.n}`} paper={paper} group={group} stored={state.plans[planKey(paper.slug, group.n)]} onBack={() => setGroupN(null)} />
      )}
    </div>
  );
}

// ─── step 0: triage ──────────────────────────────────────────────────────

const RATINGS = [
  { v: 2, label: "יודע לכתוב 400 מילים" },
  { v: 1, label: "בערך" },
  { v: 0, label: "אין לי מה לכתוב" },
];

function Triage({ paper, triage, onPick }: { paper: ExamPaper; triage: PaperTriage; onPick: (n: number) => void }) {
  const base = emptyTriage(paper.groups);
  const score = (i: number) => (triage.extended[i] ?? -1) * 10 + (triage.known[i] ?? []).filter(Boolean).length;
  const rated = triage.extended.every((v) => v >= 0);
  const best = rated ? paper.groups.reduce((b, _g, i) => (score(i) > score(b) ? i : b), 0) : -1;

  return (
    <section>
      <h2 className="mb-1 text-lg">שלב 1 — איזו קבוצה לבחור?</h2>
      <p className="mb-3 max-w-2xl text-[13px] leading-relaxed text-txt-dim">
        לפני שקוראים לעומק: לכל קבוצה — האם אני יודע לכתוב <b className="text-txt">400 מילים</b> על היחידה המורחבת? אחר כך סמנו
        אילו יחידות קצרות אתם מכירים (הייתם בסיור, יש לכם דוח).
      </p>
      <div className="mb-3"><Tip id="choose-extended" /></div>
      <div className="grid gap-3 lg:grid-cols-2">
        {paper.groups.map((g, i) => (
          <div key={g.n} className={`rounded-lg border p-4 ${best === i ? "border-teal bg-card-2" : "border-line bg-card"}`}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h3 className="text-[15px]">קבוצה {g.n}{g.title ? ` — ${g.title}` : ""}</h3>
              {best === i && <span className="text-[11px] font-extrabold text-teal">ההמלצה לפי הסימון שלכם</span>}
            </div>
            <p className="mb-2 text-[12.5px] leading-relaxed text-txt-dim">{g.brief}</p>
            <p className="mb-1 text-[13px]"><b>יחידה מורחבת:</b> {g.extendedUnit}</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {RATINGS.map((r) => (
                <button
                  key={r.v}
                  type="button"
                  aria-pressed={triage.extended[i] === r.v}
                  onClick={() => updateTriage(paper.slug, base, (t) => ({ ...t, extended: t.extended.map((x, j) => (j === i ? r.v : x)) }))}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-bold transition active:scale-95 ${triage.extended[i] === r.v ? "border-teal bg-teal/15 text-teal" : "border-line bg-card-2 text-txt-dim"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <ul className="mb-3 flex flex-col gap-1">
              {g.shortUnits.map((u, k) => (
                <li key={u}>
                  <label className="flex cursor-pointer items-start gap-2 text-[12.5px]">
                    <input
                      type="checkbox"
                      checked={!!triage.known[i]?.[k]}
                      onChange={(e) => updateTriage(paper.slug, base, (t) => ({
                        ...t,
                        known: t.known.map((row, j) => (j === i ? row.map((x, kk) => (kk === k ? e.target.checked : x)) : row)),
                      }))}
                      className="mt-0.5"
                    />
                    <span>{u}</span>
                  </label>
                </li>
              ))}
            </ul>
            <button type="button" className={btnPrimary} style={primaryStyle} onClick={() => onPick(g.n)}>
              לעבוד על הקבוצה הזו ←
            </button>
            {triage.extended[i] === 0 && (
              <p className="mt-2 text-[12px] text-gold">הרכז: אם אין לך שום דבר בראש על ההרחבה — אל תבחר את השאלה.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── the per-group flow ──────────────────────────────────────────────────

function GroupFlow({ paper, group, stored, onBack }: { paper: ExamPaper; group: ExamGroup; stored?: GroupPlan; onBack: () => void }) {
  const key = planKey(paper.slug, group.n);
  const fresh = useMemo(() => emptyPlan(group.shortUnits), [group]);
  const plan = stored ?? fresh;
  const insight = insightFor(paper.slug, group.n);
  const set = (patch: Partial<GroupPlan>) => savePlan(key, { ...plan, ...patch });
  const step = Math.min(Math.max(plan.step, 1), 4);
  const go = (s: number) => { set({ step: s }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onBack} className="text-[13px] font-bold text-txt-dim hover:underline">← כל הקבוצות בטופס</button>
        <button
          type="button"
          onClick={() => { if (window.confirm("למחוק את כל העבודה על הקבוצה הזו ולהתחיל מחדש?")) resetPlan(key); }}
          className="text-[12px] font-bold text-txt-dim hover:underline"
        >
          להתחיל מחדש
        </button>
      </div>

      <section className="rounded-lg border border-line bg-card p-4">
        <h2 className="mb-1 text-[16px]">קבוצה {group.n}{group.title ? ` — ${group.title}` : ""}</h2>
        <p className="text-[12.5px] text-txt-dim">יציאה: {group.start} · סיום: {group.end}</p>
      </section>

      <nav aria-label="שלבים" className="flex flex-wrap gap-1.5">
        {STEPS.map((s, i) => i === 0 ? null : (
          <button
            key={s}
            type="button"
            onClick={() => go(i)}
            aria-current={step === i ? "step" : undefined}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-extrabold transition ${step === i ? "border-teal bg-teal/15 text-teal" : "border-line bg-card-2 text-txt-dim"}`}
          >
            <span className="num">{i + 1}</span>. {s}
          </button>
        ))}
      </nav>

      {step === 1 && <ReadStep group={group} plan={plan} set={set} keywords={insight?.keywords ?? []} />}
      {step === 2 && <BrainstormStep group={group} plan={plan} set={set} insight={insight} />}
      {step === 3 && <ScheduleStep group={group} plan={plan} set={set} />}
      {step === 4 && <ExaminerStep paper={paper} group={group} plan={plan} set={set} />}

      <div className="flex justify-between gap-2">
        {step > 1 ? <button type="button" className={btnGhost} onClick={() => go(step - 1)}>→ הקודם</button> : <span />}
        {step < 4 && <button type="button" className={btnPrimary} style={primaryStyle} onClick={() => go(step + 1)}>לשלב הבא ←</button>}
      </div>
    </div>
  );
}

type StepProps = { group: ExamGroup; plan: GroupPlan; set: (p: Partial<GroupPlan>) => void };

// ─── step 2: read every word ─────────────────────────────────────────────

function ReadStep({ group, plan, set, keywords }: StepProps & { keywords: { word: string; means: string }[] }) {
  const [compare, setCompare] = useState(false);
  const words = group.brief.split(/\s+/);
  const marked = new Set(plan.marks);
  const markedWords = words.filter((_, i) => marked.has(i)).map(clean).filter(Boolean);
  const hit = (kw: string) => kw.split(/\s+/).map(clean).some((t) => markedWords.includes(t));

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="mb-1 text-lg">שלב 2 — כל מילה חשובה</h2>
        <p className="max-w-2xl text-[13px] leading-relaxed text-txt-dim">
          הקישו על כל מילה בתיאור הקבוצה שמשנה משהו בתוכנית — גיל, דת, ארץ מוצא, נושא. אחר כך השוו למפתח.
        </p>
      </div>
      <div className="rounded-lg border border-line bg-card p-4 text-[17px] leading-[2.2]">
        {words.map((w, i) => (
          <button
            key={i}
            type="button"
            onClick={() => set({ marks: marked.has(i) ? plan.marks.filter((x) => x !== i) : [...plan.marks, i] })}
            className={`mx-0.5 rounded px-1 transition ${marked.has(i) ? "bg-gold/30 font-extrabold" : "hover:bg-card-2"}`}
          >
            {w}
          </button>
        ))}
        <p className="mt-3 text-[13px] text-txt-dim">
          יציאה: {group.start} · סיום: {group.end}
        </p>
        <ul className="mt-2 flex flex-col gap-0.5 text-[13px]">
          {group.shortUnits.map((u, i) => <li key={u}><span className="num text-txt-dim">{i + 1}.</span> {u}</li>)}
          <li><b>יחידה מורחבת:</b> {group.extendedUnit}</li>
        </ul>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnGhost} disabled={plan.marks.length === 0 || keywords.length === 0} onClick={() => setCompare(true)}>
          השוואה למפתח
        </button>
      </div>
      {compare && (
        <ul className="flex flex-col gap-2">
          {keywords.map((k) => (
            <li key={k.word} className="flex gap-2 rounded-md border border-line bg-card px-3 py-2 text-[13px]">
              <span aria-hidden className={hit(k.word) ? "text-ok" : "text-rose"}>{hit(k.word) ? "✓" : "○"}</span>
              <span><b>{k.word}</b> — <span className="text-txt-dim">{k.means}</span></span>
            </li>
          ))}
        </ul>
      )}
      <Tip id="reading-every-word" />
      <div>
        <label className="mb-1 block text-[12px] font-extrabold text-txt-dim">מאפייני הקבוצה וההנחות שלכם (ייכנסו לטיוטה)</label>
        <textarea
          value={plan.assumptions}
          onChange={(e) => set({ assumptions: e.target.value })}
          rows={3}
          placeholder="למשל: 40 משתתפים, אוטובוס, כושר בינוני; קבוצה דתית — ארוחה כשרה וזמן לתפילה…"
          className="w-full rounded-md border border-line bg-card px-3 py-2.5 text-[13px] leading-relaxed"
        />
      </div>
    </section>
  );
}

// ─── step 3: brainstorm, then choose ─────────────────────────────────────

function IdeaList({
  title, ideas, choice, onChange, onChoose, suggestions, revealed,
}: {
  title: ReactNode; ideas: string[]; choice: number; onChange: (v: string[]) => void; onChoose: (i: number) => void;
  suggestions?: string[]; revealed: boolean;
}) {
  const [draft, setDraft] = useState("");
  const add = (v: string) => {
    const t = v.trim();
    if (!t || ideas.includes(t)) return;
    onChange([...ideas, t]);
  };
  return (
    <div className="rounded-lg border border-line bg-card p-3">
      <h3 className="mb-2 text-[14px]">{title}</h3>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {ideas.map((idea, i) => (
          <span key={idea} className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12.5px] ${choice === i ? "border-teal bg-teal/15 font-extrabold" : "border-line bg-card-2"}`}>
            <button type="button" onClick={() => onChoose(choice === i ? -1 : i)} title="לבחור">
              {choice === i ? "✓ " : ""}{idea}
            </button>
            <button
              type="button"
              aria-label={`להסיר ${idea}`}
              onClick={() => { onChange(ideas.filter((x) => x !== idea)); if (choice === i) onChoose(-1); else if (choice > i) onChoose(choice - 1); }}
              className="text-txt-dim hover:text-rose"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); add(draft); setDraft(""); }} className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="רעיון — אתר, נושא, נקודה…" className={`${input} flex-1`} />
        <button type="submit" className={btnGhost}>+</button>
      </form>
      {revealed && suggestions && suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              disabled={ideas.includes(s)}
              className="rounded-full border border-dashed border-line px-2.5 py-1 text-[12px] text-txt-dim transition hover:bg-card-2 disabled:opacity-40"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BrainstormStep({ group, plan, set, insight }: StepProps & { insight?: ReturnType<typeof insightFor> }) {
  const n = group.shortUnits.length;
  const lists = plan.ideas.length === n + 1 ? plan.ideas : [...group.shortUnits.map((_, i) => plan.ideas[i] ?? []), plan.ideas[n] ?? []];
  const choice = plan.choice.length === n + 1 ? plan.choice : lists.map((_, i) => plan.choice[i] ?? -1);
  const allHave = lists.every((l) => l.length > 0);
  const chosen = (i: number) => (choice[i] >= 0 ? lists[i][choice[i]] : "");
  const sameSite = chosen(n) && group.shortUnits.some((_, i) => chosen(i) && chosen(i) === chosen(n));

  const setList = (i: number, v: string[]) => set({ ideas: lists.map((l, j) => (j === i ? v : l)), choice });
  const setChoice = (i: number, c: number) => set({ ideas: lists, choice: choice.map((x, j) => (j === i ? c : x)) });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1 text-lg">שלב 3 — סיעור מוחין</h2>
          <p className="max-w-2xl text-[13px] leading-relaxed text-txt-dim">
            לכל דרישה — כל מה שעולה בראש, בלי לפסול. רק אחרי שכל הרשימות מלאות: מה עוד היה אפשר, ואז בוחרים אחד בכל שורה (הקשה על רעיון).
          </p>
        </div>
        <Countdown minutes={20} label="20 דקות תכנון" />
      </div>
      <Tip id="plan-brainstorm" />

      {group.shortUnits.map((req, i) => (
        <IdeaList
          key={req}
          title={<><span className="num text-txt-dim">{i + 1}. </span>{req}{isRoadSlot(req) && <span className="mr-2 text-[11px] font-bold text-txt-dim">(נושא — ייקבע על קטע נסיעה)</span>}</>}
          ideas={lists[i]}
          choice={choice[i]}
          onChange={(v) => setList(i, v)}
          onChoose={(c) => setChoice(i, c)}
          suggestions={insight?.candidates[i]}
          revealed={plan.revealed}
        />
      ))}
      <IdeaList
        title={<><b>יחידה מורחבת:</b> {group.extendedUnit}</>}
        ideas={lists[n]}
        choice={choice[n]}
        onChange={(v) => setList(n, v)}
        onChoose={(c) => setChoice(n, c)}
        suggestions={insight?.extended}
        revealed={plan.revealed}
      />
      <div>
        <label className="mb-1 block text-[12px] font-extrabold text-txt-dim">על מה תהיה ההרחבה — הנושא שלכם ב-400 מילים</label>
        <input value={plan.extendedFocus} onChange={(e) => set({ extendedFocus: e.target.value })} placeholder="למשל: השער של לכיש וכל הסיפור שלו" className={`${input} w-full`} />
      </div>

      {sameSite && (
        <p className="rounded-md border border-gold/50 bg-gold/10 px-3 py-2 text-[12.5px] leading-relaxed">
          בחרתם אותו דבר ביחידה קצרה ובהרחבה. בעיקרון לא עושים את זה — אלא אם היחידה הקצרה עוסקת בנושא אחר באותו אתר.
        </p>
      )}
      <Tip id="plan-same-site" />

      {!plan.revealed ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={btnPrimary} style={primaryStyle} disabled={!allHave} onClick={() => set({ revealed: true, ideas: lists, choice })}>
            מה עוד היה אפשר?
          </button>
          {!allHave && (
            <button type="button" onClick={() => set({ revealed: true, ideas: lists, choice })} className="text-[12px] font-bold text-txt-dim hover:underline">
              נתקעתי — להציג בכל זאת
            </button>
          )}
        </div>
      ) : (
        insight && (
          <div className="flex flex-col gap-3">
            {insight.pitfalls.length > 0 && (
              <div className="rounded-lg border border-rose/40 bg-card p-4">
                <h3 className="mb-2 text-[14px]">⚠️ מה עולה נקודות בקבוצה הזו</h3>
                <ul className="flex flex-col gap-1 text-[13px] leading-relaxed text-txt-dim">
                  {insight.pitfalls.map((p) => <li key={p}>• {p}</li>)}
                </ul>
              </div>
            )}
            {insight.classPlan && (
              <div className="rounded-lg border border-teal/50 bg-card p-4">
                <h3 className="mb-2 text-[14px]">🎙️ כך הרכז פתר את הקבוצה הזו בשיעור</h3>
                <ol className="mb-2 flex list-decimal flex-col gap-1 pr-5 text-[13px] leading-relaxed">
                  {insight.classPlan.order.map((o) => <li key={o}>{o}</li>)}
                </ol>
                <ul className="flex flex-col gap-1 text-[12.5px] text-txt-dim">
                  {insight.classPlan.notes.map((o) => <li key={o}>• {o}</li>)}
                </ul>
              </div>
            )}
          </div>
        )
      )}
    </section>
  );
}

// ─── step 4: order and times ─────────────────────────────────────────────

function stopName(group: ExamGroup, plan: GroupPlan, s: PlanStop): string {
  const n = group.shortUnits.length;
  const pick = (i: number) => (plan.choice[i] >= 0 ? plan.ideas[i]?.[plan.choice[i]] : undefined);
  if (s.kind === "unit" && s.slot !== undefined) return pick(s.slot) ?? `(טרם נבחר) ${group.shortUnits[s.slot]}`;
  if (s.kind === "extended") return pick(n) ?? `(טרם נבחר) ${group.extendedUnit}`;
  return s.label || (s.kind === "lunch" ? "ארוחת צהריים" : "עצירה");
}

function stopRole(group: ExamGroup, s: PlanStop): string {
  if (s.kind === "unit" && s.slot !== undefined) return `יחידה ${s.slot + 1} · ${group.shortUnits[s.slot]}`;
  if (s.kind === "extended") return `יחידה מורחבת · ${group.extendedUnit}`;
  if (s.kind === "lunch") return "ארוחת צהריים";
  return "עצירה נוספת";
}

function useChecks(group: ExamGroup, plan: GroupPlan) {
  const start = parseClock(group.start);
  const endTarget = parseClock(group.end);
  const sch = schedule(plan.stops, start, plan.finalDrive);
  const lunch = sch.timed.find((s) => s.kind === "lunch");
  const roadSlot = group.shortUnits.findIndex(isRoadSlot);
  const legDrive = plan.roadLeg === "end" ? plan.finalDrive : plan.stops.find((s) => s.id === plan.roadLeg)?.driveBefore ?? 0;
  const items: { ok: boolean; warn?: boolean; label: string; note: string }[] = [];
  const over = sch.end - endTarget;
  items.push({
    ok: over <= 0 && over > -45,
    warn: over <= -45,
    label: `סיום ב-${fmtClock(sch.end)}`,
    note: over > 0 ? `חורג ב-${over} דקות מ-${fmtClock(endTarget)} — לקצר עצירה או לוותר על משהו` : over <= -45 ? `נשארו ${-over} דקות ריקות. הרכז: עשר שעות הן המון — לתכנן גם את סוף היום` : "היום מכוסה עד שעת הסיום",
  });
  items.push({
    ok: sch.totalDrive <= 90,
    label: `נסיעה מצטברת: ${sch.totalDrive} דקות`,
    note: sch.totalDrive <= 90 ? "עד שעה וחצי — סביר ליום כזה" : "יותר משעה וחצי של נסיעה — לא הגיוני ליום כזה",
  });
  if (lunch) {
    const okTime = lunch.arrive >= 11 * 60 + 30 && lunch.arrive <= 14 * 60;
    items.push({
      ok: okTime && lunch.minutes >= 45 && lunch.minutes <= 60,
      label: `ארוחת צהריים ב-${fmtClock(lunch.arrive)}, ${lunch.minutes} דקות`,
      note: !okTime ? "באמצע היום — לא שתצא בשלוש" : lunch.minutes < 45 || lunch.minutes > 60 ? "בתוכנית: 45 דקות עד שעה" : "באמצע היום ובאורך נכון",
    });
  } else {
    items.push({ ok: false, label: "אין ארוחת צהריים", note: "ארוחת הצהריים היא חלק מן התוכנית" });
  }
  if (roadSlot >= 0) {
    items.push({
      ok: !!plan.roadLeg && legDrive >= 10,
      label: "הדרכת הדרך משובצת על קטע נסיעה",
      note: !plan.roadLeg ? "בחרו על איזה קטע נסיעה היא מתקיימת" : legDrive < 10 ? "קטע קצר מדי להדרכת דרך" : "מחוברת למשהו שרואים מן החלון",
    });
  }
  const tight = plan.stops.filter((s) => s.driveBefore > 0 && s.driveBefore < 10);
  items.push({
    ok: tight.length === 0,
    warn: tight.length > 0,
    label: "מרווח בנסיעות",
    note: tight.length === 0 ? "אין נסיעות \"על הקשקש\"" : "נסיעה של 5 דקות — לתכנן 10 (משאית בכיכר)",
  });
  const short = plan.stops.filter((s) => (s.kind === "unit" && s.minutes < 20) || (s.kind === "extended" && s.minutes < 45));
  items.push({
    ok: short.length === 0,
    label: "זמן באתרים",
    note: short.length === 0 ? "לכל יחידה זמן הדרכה וסיור" : "יש אתר שהזמן בו קצר מכדי להדריך ולסייר",
  });
  return { sch, items };
}

function ScheduleStep({ group, plan, set }: StepProps) {
  const [kmFor, setKmFor] = useState<string | null>(null);
  const [km, setKm] = useState("");
  const { sch, items } = useChecks(group, plan);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= plan.stops.length) return;
    const next = [...plan.stops];
    [next[i], next[j]] = [next[j], next[i]];
    set({ stops: next });
  };
  const patch = (id: string, p: Partial<PlanStop>) => set({ stops: plan.stops.map((s) => (s.id === id ? { ...s, ...p } : s)) });
  const legOptions = [...plan.stops.map((s) => ({ id: s.id, label: `בדרך אל ${stopName(group, plan, s)}` })), { id: "end", label: `בדרך ל${group.end.split(",")[0]}` }];
  const hasRoad = group.shortUnits.some(isRoadSlot);

  const kmHelper = (id: string, onSet: (m: number) => void) =>
    kmFor === id ? (
      <span className="flex items-center gap-1 text-[11.5px]">
        <input value={km} onChange={(e) => setKm(e.target.value)} inputMode="decimal" placeholder="ק״מ" className="w-14 rounded border border-line bg-card px-1.5 py-1" />
        <button type="button" className="font-bold text-teal" onClick={() => { onSet(driveMinutes(Number(km))); setKmFor(null); setKm(""); }}>חשב</button>
      </span>
    ) : (
      <button type="button" className="text-[11.5px] font-bold text-txt-dim hover:underline" onClick={() => { setKmFor(id); setKm(""); }}>ק״מ→דק׳</button>
    );

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="mb-1 text-lg">שלב 4 — סדר וזמנים</h2>
        <p className="max-w-2xl text-[13px] leading-relaxed text-txt-dim">
          סדרו את התחנות לפי המפה — לא לפי הסדר בטופס. לכל קטע נסיעה רשמו דקות (ק״מ→דק׳ מחשב לפי 80 קמ״ש ומוסיף מרווח). שתי יחידות באותו מקום? נסיעה 0.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2"><Tip id="plan-order" /><Tip id="times-driving" /></div>

      <ol className="flex flex-col gap-2">
        <li className="rounded-md border border-line bg-card-2/50 px-3 py-2 text-[13px] font-bold">
          <span className="num">{fmtClock(parseClock(group.start))}</span> · יציאה — {group.start.split(",")[0]}
        </li>
        {sch.timed.map((s, i) => (
          <li key={s.id} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2 pr-4 text-[12px] text-txt-dim">
              <span aria-hidden>🚌</span>
              <input type="number" min={0} value={s.driveBefore} onChange={(e) => patch(s.id, { driveBefore: Number(e.target.value) })} className="w-16 rounded border border-line bg-card px-1.5 py-1" aria-label="דקות נסיעה" />
              דק׳ נסיעה
              {kmHelper(s.id, (m) => patch(s.id, { driveBefore: m }))}
              {plan.roadLeg === s.id && <span className="font-extrabold text-teal">· הדרכת דרך</span>}
            </div>
            <div className={`rounded-lg border bg-card p-3 ${s.kind === "extended" ? "border-teal" : s.kind === "lunch" ? "border-gold/60" : "border-line"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11.5px] font-bold text-txt-dim">{stopRole(group, s)}</p>
                  {s.kind === "lunch" || s.kind === "extra" ? (
                    <input value={s.label ?? ""} onChange={(e) => patch(s.id, { label: e.target.value })} className={`${input} mt-1 w-full`} placeholder={s.kind === "lunch" ? "איפה עוצרים — חניון, מסעדה, פיקניק" : "מה עושים כאן"} />
                  ) : (
                    <p className="text-[14px] font-extrabold">{stopName(group, plan, s)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={btnGhost} aria-label="למעלה">▲</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === sch.timed.length - 1} className={btnGhost} aria-label="למטה">▼</button>
                  {s.kind === "extra" && (
                    <button type="button" onClick={() => set({ stops: plan.stops.filter((x) => x.id !== s.id), roadLeg: plan.roadLeg === s.id ? null : plan.roadLeg })} className={btnGhost} aria-label="להסיר">✕</button>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px]">
                <span className="num font-extrabold">{fmtClock(s.arrive)}–{fmtClock(s.leave)}</span>
                <input type="number" min={0} step={5} value={s.minutes} onChange={(e) => patch(s.id, { minutes: Number(e.target.value) })} className="w-16 rounded border border-line bg-card-2 px-1.5 py-1" aria-label="דקות באתר" />
                <span className="text-txt-dim">דק׳ באתר</span>
              </div>
            </div>
          </li>
        ))}
        <li className="flex flex-wrap items-center gap-2 pr-4 text-[12px] text-txt-dim">
          <span aria-hidden>🚌</span>
          <input type="number" min={0} value={plan.finalDrive} onChange={(e) => set({ finalDrive: Number(e.target.value) })} className="w-16 rounded border border-line bg-card px-1.5 py-1" aria-label="דקות נסיעה לסיום" />
          דק׳ נסיעה לנקודת הסיום
          {kmHelper("end", (m) => set({ finalDrive: m }))}
          {plan.roadLeg === "end" && <span className="font-extrabold text-teal">· הדרכת דרך</span>}
        </li>
        <li className="rounded-md border border-line bg-card-2/50 px-3 py-2 text-[13px] font-bold">
          <span className="num">{fmtClock(sch.end)}</span> · סיום — {group.end.split(",")[0]} <span className="text-txt-dim">(נדרש: {group.end.split(",")[1]?.trim()})</span>
        </li>
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={btnGhost} onClick={() => set({ stops: [...plan.stops, { id: newStopId(), kind: "extra", label: "", minutes: 30, driveBefore: 15 }] })}>
          + עצירה נוספת
        </button>
        {hasRoad && (
          <label className="flex items-center gap-2 text-[12.5px] font-bold">
            הדרכת הדרך מתקיימת:
            <select value={plan.roadLeg ?? ""} onChange={(e) => set({ roadLeg: e.target.value || null })} className="rounded-md border border-line bg-card-2 px-2 py-1.5">
              <option value="">— לבחור קטע —</option>
              {legOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
        )}
      </div>

      <Checks items={items} />
      <div className="grid gap-2 sm:grid-cols-2"><Tip id="times-lunch" /><Tip id="units-road" /></div>
    </section>
  );
}

function Checks({ items }: { items: { ok: boolean; warn?: boolean; label: string; note: string }[] }) {
  return (
    <ul className="flex flex-col gap-1.5 rounded-lg border border-line bg-card p-3">
      {items.map((it) => (
        <li key={it.label} className="flex gap-2 text-[13px]">
          <span aria-hidden className={it.ok ? "text-ok" : it.warn ? "text-gold" : "text-rose"}>{it.ok ? "✓" : it.warn ? "!" : "○"}</span>
          <span><b>{it.label}</b> — <span className="text-txt-dim">{it.note}</span></span>
        </li>
      ))}
    </ul>
  );
}

// ─── step 5: the examiner's eyes, and hand-off ───────────────────────────

/** Part I rows from the plan: one row per drive and one per stop (≤ 16 for a 2026 day). */
export function planRows(group: ExamGroup, plan: GroupPlan) {
  const start = parseClock(group.start);
  const sch = schedule(plan.stops, start, plan.finalDrive);
  const roadIdx = group.shortUnits.findIndex(isRoadSlot);
  const roadTopic = roadIdx >= 0 && plan.choice[roadIdx] >= 0 ? plan.ideas[roadIdx]?.[plan.choice[roadIdx]] : "";
  const road = (id: string) => (plan.roadLeg === id ? ` · הדרכת דרך${roadTopic ? `: ${roadTopic}` : ""}` : "");
  const rows: { time: string; activity: string; logistics: string }[] = [];
  sch.timed.forEach((s, i) => {
    const name = stopName(group, plan, s);
    if (s.driveBefore > 0) {
      rows.push({
        time: `${fmtClock(s.driveFrom)}–${fmtClock(s.arrive)}`,
        activity: `נסיעה אל ${name}${road(s.id)}`,
        logistics: i === 0 ? "ספירת משתתפים, תדרוך הנהג על המסלול, בטיחות באוטובוס, מים וכובעים" : "ספירה לפני יציאה",
      });
    }
    rows.push({
      time: `${fmtClock(s.arrive)}–${fmtClock(s.leave)}`,
      activity: s.kind === "lunch" ? `ארוחת צהריים${s.label && s.label !== "ארוחת צהריים" ? ` — ${s.label}` : ""}` : `${stopRole(group, s).split(" · ")[0]}: ${name}`,
      logistics: s.kind === "lunch" ? "שירותים, מילוי מים; תיאום מראש של המקום" : "",
    });
  });
  rows.push({
    time: `${fmtClock(sch.endDriveFrom)}–${fmtClock(sch.end)}`,
    activity: `נסיעה ל${group.end.split(",")[0]}${road("end")}, סיכום ופרידה`,
    logistics: "ספירה אחרונה, בדיקת חפצים באוטובוס",
  });
  return rows;
}

function ExaminerStep({ paper, group, plan, set }: StepProps & { paper: ExamPaper }) {
  const router = useRouter();
  const rows = planRows(group, plan);
  const n = group.shortUnits.length;
  const ticked = EXAMINER_CHECKLIST.filter((c) => plan.checklist[c.id]).length;
  const timed = schedule(plan.stops, parseClock(group.start), plan.finalDrive).timed;

  function toWriting() {
    const pick = (i: number) => (plan.choice[i] >= 0 ? plan.ideas[i]?.[plan.choice[i]] ?? "" : "");
    const roadStop = plan.roadLeg === "end" ? null : plan.stops.find((s) => s.id === plan.roadLeg);
    const d = saveDraft({
      kind: "exam",
      title: `חלק ב׳ — ${paper.sitting} · קבוצה ${group.n} (מהסדנה)`,
      payload: {
        paperSlug: paper.slug,
        groupN: group.n,
        assumptions: plan.assumptions,
        rows: rows.slice(0, 16),
        units: group.shortUnits.map((req, i) => {
          const stop = timed.find((s) => s.kind === "unit" && s.slot === i);
          const site = isRoadSlot(req)
            ? `${pick(i)}${plan.roadLeg ? ` — בדרך ${roadStop ? `אל ${stopName(group, plan, roadStop)}` : `ל${group.end.split(",")[0]}`}` : ""}`
            : pick(i);
          return { site, duration: stop ? `${stop.minutes} דק׳` : "", body: "", methods: "" };
        }),
        expanded: { site: pick(n), topic: plan.extendedFocus, position: "", body: "" },
      },
    });
    router.push(`/guide-reports/exam?draft=${encodeURIComponent(d.id)}`);
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="mb-1 text-lg">שלב 5 — בעיני הבוחן</h2>
        <p className="max-w-2xl text-[13px] leading-relaxed text-txt-dim">
          זו טבלת חלק I שנבנתה מן התוכנית שלכם. קראו אותה כמו הבוחן, וסמנו כל סעיף רק אם הוא באמת מתקיים.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-card-2 text-right">
              <th className="w-8 px-2 py-2">#</th>
              <th className="w-28 px-2 py-2">לוח זמנים</th>
              <th className="px-2 py-2">פירוט המסלול ואופי הפעילות</th>
              <th className="px-2 py-2">תיאומים ומנהלות</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line align-top">
                <td className="num px-2 py-1.5 text-txt-dim">{i + 1}</td>
                <td className="num px-2 py-1.5">{r.time}</td>
                <td className="px-2 py-1.5">{r.activity}</td>
                <td className="px-2 py-1.5 text-txt-dim">{r.logistics}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 16 && <p className="text-[12px] text-rose">יותר מ-16 שורות — בטיוטה ייכנסו 16 הראשונות. אחדו עצירות.</p>}

      <ul className="grid gap-2 sm:grid-cols-2">
        {EXAMINER_CHECKLIST.map((c) => (
          <li key={c.id}>
            <label className={`flex h-full cursor-pointer gap-2 rounded-md border px-3 py-2 text-[13px] ${plan.checklist[c.id] ? "border-teal bg-teal/10" : "border-line bg-card"}`}>
              <input type="checkbox" checked={!!plan.checklist[c.id]} onChange={(e) => set({ checklist: { ...plan.checklist, [c.id]: e.target.checked } })} className="mt-1" />
              <span><b>{c.label}</b><br /><span className="text-[12px] text-txt-dim">{c.hint}</span></span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-[12.5px] text-txt-dim"><span className="num">{ticked}</span> מתוך <span className="num">{EXAMINER_CHECKLIST.length}</span>.</p>
      <Tip id="goal-errors" />

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-card p-4">
        <p className="w-full text-[13px] leading-relaxed text-txt-dim">
          התוכנית מוכנה? ממשיכים לכתיבה: טבלת חלק I, האתרים שבחרתם והנושא של ההרחבה כבר ימולאו בסימולטור, ונשאר לכתוב 180 מילים לכל יחידה ו-400 להרחבה.
        </p>
        <button type="button" className={btnPrimary} style={primaryStyle} onClick={toWriting}>להמשיך לכתיבה בסימולטור ←</button>
        <Link href="/guide-reports/drills" className="text-[13px] font-bold text-teal hover:underline">תרגילי מיקוד</Link>
      </div>
    </section>
  );
}
