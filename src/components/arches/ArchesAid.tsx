"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AidHeader, AidTabs, useHashTab } from "@/components/learning-aid";
import { useTheme } from "@/components/ThemeToggle";
import { ARCH_TYPES, PROFILES, type ArchType, type Profile } from "@/data/arches/arches";
import type { ArchViewer } from "./arches3d";
import { intrados, SPAN } from "./profile";
import { domainStyle } from "@/lib/domains";
import styles from "./arches.module.css";

const TABS = [
  { id: "model", label: "בתלת־ממד" },
  { id: "compare", label: "השוואת קווים" },
  { id: "ages", label: "לפי תקופה", count: ARCH_TYPES.length },
  { id: "practice", label: "זיהוי" },
] as const;
type TabId = (typeof TABS)[number]["id"];
const TAB_IDS = TABS.map((t) => t.id);

function Extra() {
  return <span className="mr-2 rounded-full border border-line px-2 py-0.5 text-xs font-bold text-txt-dim" title="ידע כללי שאינו בחומר הקורס">השלמה</span>;
}

// ------------------------------------------------------------------ 2D outline

/** קו הקשת כנתיב SVG, ביחידות של רוחב הפתח (0..SPAN), y למעלה. */
function outlinePath(profile: Profile) {
  if (profile === "corbel") {
    const courses = 6, h = 0.42, step = SPAN / 2 / courses;
    const left: string[] = [`M ${-SPAN / 2} 0`];
    for (let c = 0; c < courses; c++) {
      const x = -SPAN / 2 + step * c;
      left.push(`L ${x} ${c * h}`, `L ${x} ${(c + 1) * h}`, `L ${x + step} ${(c + 1) * h}`);
    }
    const right = left.slice(1).map((cmd) => cmd.replace(/L (\S+) (\S+)/, (_, x, y) => `L ${-Number(x)} ${y}`)).reverse();
    return [...left, ...right, `L ${SPAN / 2} 0`].join(" ");
  }
  return intrados(profile, 61).map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(3)} ${y.toFixed(3)}`).join(" ");
}

function ArchOutline({ profile, className, label }: { profile: Profile; className?: string; label?: string }) {
  return <svg viewBox="-2.6 -3.6 5.2 4" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    <g transform="scale(1,-1)">
      <line x1={-SPAN / 2} y1={-0.5} x2={-SPAN / 2} y2={0} className={styles.pier} />
      <line x1={SPAN / 2} y1={-0.5} x2={SPAN / 2} y2={0} className={styles.pier} />
      <path d={outlinePath(profile)} className={styles.curve} />
    </g>
  </svg>;
}

// ------------------------------------------------------------------ 3D

function ModelTab({ typeId, setTypeId }: { typeId: string; setTypeId: (id: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<ArchViewer | null>(null);
  const theme = useTheme();
  const themeRef = useRef(theme);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [forces, setForces] = useState(false);
  const type = ARCH_TYPES.find((t) => t.id === typeId)!;
  const latest = useRef({ type, forces });

  useEffect(() => {
    let disposed = false;
    import("./arches3d").then(({ createArchViewer }) => {
      if (disposed || !host.current) return;
      try {
        const v = createArchViewer(host.current, themeRef.current);
        viewer.current = v;
        v.show(latest.current.type, { forces: latest.current.forces });
        setStatus("ready");
      } catch {
        setStatus("failed");
      }
    }).catch(() => !disposed && setStatus("failed"));
    return () => { disposed = true; viewer.current?.dispose(); viewer.current = null; };
  }, []);

  useEffect(() => { latest.current = { type, forces }; viewer.current?.show(type, { forces }); }, [type, forces, status]);
  useEffect(() => { themeRef.current = theme; viewer.current?.setTheme(theme); }, [theme, status]);

  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <div className="space-y-3">
      <div role="group" aria-label="סוג הקשת" className={styles.picker}>
        {ARCH_TYPES.map((t) => <button key={t.id} type="button" aria-pressed={t.id === typeId} onClick={() => setTypeId(t.id)} className={styles.pick}>
          <ArchOutline profile={t.profile} className={styles.pickIcon} />
          <span>{t.name}</span>
        </button>)}
      </div>
      <div className={styles.stage}>
        <div ref={host} className={styles.canvasHost} role="img" aria-label={`מודל תלת־ממדי: ${type.name}. גררו לסיבוב, גלגלו או צבטו לזום.`} />
        {status === "loading" && <div className={styles.note} role="status">בונה את הקשת…</div>}
        {status === "failed" && <div className={styles.note} role="status">הדפדפן הזה לא מציג תלת־ממד. את ההסבר אפשר לקרוא בצד, ואת הקווים בלשונית ״השוואת קווים״.</div>}
        <p className={styles.hint}>גררו לסיבוב · גלגלת או צביטה לזום</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => viewer.current?.build()} className={styles.primary} disabled={status !== "ready"}>בנו את הקשת</button>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-card px-4 font-bold">
          <input type="checkbox" checked={forces} onChange={(e) => setForces(e.target.checked)} className="h-5 w-5 accent-[var(--color-mc)]" />
          כיוון הלחץ
        </label>
        <button type="button" onClick={() => viewer.current?.resetView()} className="min-h-11 rounded-full border border-line bg-card px-4 font-bold active:scale-95">מבט מלא</button>
      </div>
    </div>
    <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start" aria-live="polite">
      <TypeCard type={type} />
      {forces && <p className="rounded-lg border border-line bg-card p-4 text-sm leading-6 text-txt-dim">החצים מראים לאן הקשת דוחפת את התומכים שלה. בקשת עגולה הדחיפה לצדדים גדולה; בקשת מחודדת היא יורדת תלולה יותר; בקשת מדורגת אין דחיפה לצדדים כלל, כי אין בה אבני קשת.</p>}
    </aside>
  </div>;
}

function TypeCard({ type }: { type: ArchType }) {
  return <article className="screen-in rounded-lg border border-line bg-card p-5">
    <p className="text-sm font-bold text-mc">{type.period}</p>
    <h2 className="mt-1 text-xl font-black">{type.name}{type.extra && <Extra />}</h2>
    <p className="mt-3 leading-7"><strong>איך מזהים: </strong>{type.sign}</p>
    <p className="mt-2 leading-7 text-txt-dim">{type.about}</p>
    <p className="mt-3 text-sm leading-6 text-txt-dim"><strong className="text-txt">{PROFILES[type.profile].name}: </strong>{PROFILES[type.profile].how}</p>
    <h3 className="mt-4 font-black">איפה רואים</h3>
    <ul className="mt-1 space-y-1">
      {type.sites.map((s) => <li key={s.name} className="leading-7">• {s.name}{s.extra && <Extra />}</li>)}
    </ul>
  </article>;
}

// ------------------------------------------------------------------ compare

function CompareTab() {
  const profiles = Object.keys(PROFILES) as Profile[];
  const [on, setOn] = useState<Profile[]>(["round", "pointed"]);
  const toggle = (p: Profile) => setOn((cur) => cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]);
  return <section className="space-y-4" aria-labelledby="compare-title">
    <div className="rounded-lg border border-line bg-card p-5">
      <h2 id="compare-title" className="text-2xl font-black">ארבע צורות על אותו פתח</h2>
      <p className="mt-1 leading-7 text-txt-dim">כל הקשתות כאן מגשרות על אותו רוחב. בחרו שתיים או יותר כדי לראות אותן זו על זו.</p>
      <div role="group" aria-label="קשתות להשוואה" className="mt-4 flex flex-wrap gap-2">
        {profiles.map((p) => <button key={p} type="button" aria-pressed={on.includes(p)} onClick={() => toggle(p)} className={`${styles.chip} ${styles[`c_${p}`]}`}>{PROFILES[p].name}</button>)}
      </div>
    </div>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <figure className="rounded-lg border border-line bg-card p-4">
        <svg viewBox="-2.8 -3.7 5.6 4.1" className={styles.overlay} role="img" aria-label={`השוואה: ${on.map((p) => PROFILES[p].name).join(", ")}`}>
          <g transform="scale(1,-1)">
            <line x1={-2.7} y1={0} x2={2.7} y2={0} className={styles.springing} />
            <line x1={-SPAN / 2} y1={-0.4} x2={-SPAN / 2} y2={0} className={styles.pier} />
            <line x1={SPAN / 2} y1={-0.4} x2={SPAN / 2} y2={0} className={styles.pier} />
            {on.map((p) => <path key={p} d={outlinePath(p)} className={`${styles.curve} ${styles[`c_${p}`]}`} />)}
          </g>
        </svg>
        <figcaption className="mt-2 text-center text-sm text-txt-dim">הקו האופקי הוא קו הזינוק: המקום שבו הקשת יוצאת מהעמוד.</figcaption>
      </figure>
      <div className="space-y-3">
        {on.map((p) => <div key={p} className={`rounded-lg border border-line bg-card p-4 ${styles.legend} ${styles[`c_${p}`]}`}>
          <h3 className="font-black">{PROFILES[p].name}</h3>
          <p className="mt-1 text-sm leading-6 text-txt-dim">{PROFILES[p].how}</p>
        </div>)}
      </div>
    </div>
  </section>;
}

// ------------------------------------------------------------------ by period

function AgesTab({ onShow }: { onShow: (id: string) => void }) {
  const list = [...ARCH_TYPES].sort((a, b) => a.year - b.year);
  return <ol className="space-y-3">
    {list.map((t) => <li key={t.id} className="flex gap-4 rounded-lg border border-line bg-card p-4">
      <ArchOutline profile={t.profile} className={styles.ageIcon} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-mc">{t.period}</p>
        <h3 className="text-lg font-black">{t.name}{t.extra && <Extra />}</h3>
        <p className="mt-1 leading-7 text-txt-dim">{t.sign}</p>
        <p className="mt-1 text-sm text-txt-dim">{t.sites.map((s) => s.name).join(" · ")}</p>
        <button type="button" onClick={() => onShow(t.id)} className="mt-2 min-h-11 rounded-full border border-line px-4 text-sm font-bold active:scale-95">בתלת־ממד</button>
      </div>
    </li>)}
  </ol>;
}

// ------------------------------------------------------------------ practice

const QUIZ = [
  ...ARCH_TYPES.filter((t) => !t.extra).map((t) => ({ id: `p-${t.id}`, prompt: `באיזו תקופה: ${t.sign}?`, answer: t.period, pool: ARCH_TYPES.filter((x) => !x.extra).map((x) => x.period) })),
  { id: "q-dan", prompt: "מדוע השתמר שער לבני הבוץ בתל דן שלם, כולל הקשת?", answer: "כוסה בעפר הסוללה זמן קצר אחרי שנבנה", pool: ["כוסה בעפר הסוללה זמן קצר אחרי שנבנה", "נבנה מאבן גזית ולא מלבנים", "שוחזר בידי הרומאים", "נבנה במערה חצובה"] },
  { id: "q-ablaq", prompt: "מהו אבלק?", answer: "שילוב אבנים בצבעים מתחלפים", pool: ["שילוב אבנים בצבעים מתחלפים", "עיטור מדורג דמוי נטיפים", "אבן הראשה של הקשת", "קמרון שחוצה קמרון"] },
  { id: "q-muqarnas", prompt: "מהם המוקרנס?", answer: "עיטורים מדורגים דמויי נטיפים", pool: ["עיטורים מדורגים דמויי נטיפים", "שילוב אבנים בצבעים מתחלפים", "קשתות פרסה בחזית", "פסים של בזלת וגיר"] },
  { id: "q-ramla", prompt: "איזה מבנה ברמלה נבנה בימי הארון אל־רשיד וקשתותיו מחודדות?", answer: "בריכת הקשתות", pool: ["בריכת הקשתות", "המסגד הלבן", "מגדל הארבעים", "שער האבות"] },
  { id: "q-pointed", prompt: "מה היתרון של קשת מחודדת על קשת עגולה?", answer: "הדחיפה לצדדים קטנה יותר", pool: ["הדחיפה לצדדים קטנה יותר", "אין בה צורך באבן ראשה", "היא נבנית מלבני בוץ בלבד", "היא נמוכה יותר"] },
];

function shuffle<T>(xs: T[], seed: number) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { seed = (seed * 1664525 + 1013904223) >>> 0; const j = seed % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function PracticeTab() {
  const [round, setRound] = useState(1);
  const order = useMemo(() => shuffle(QUIZ, round * 7919), [round]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const q = order[i];
  const choices = useMemo(() => q ? shuffle([q.answer, ...shuffle([...new Set(q.pool)].filter((c) => c !== q.answer), round + i).slice(0, 3)], i + round * 31) : [], [q, i, round]);
  if (!q) return <section className="rounded-lg border border-line bg-card p-6 text-center">
    <h2 className="text-2xl font-black">סיימתם</h2>
    <p className="mt-2 text-txt-dim"><span className="num">{score}</span> מתוך <span className="num">{order.length}</span></p>
    <button type="button" onClick={() => { setRound(round + 1); setI(0); setPicked(null); setScore(0); }} className={`${styles.primary} mt-4`}>סבב נוסף</button>
  </section>;
  return <section aria-label="זיהוי קשתות" className="rounded-lg border border-line bg-card p-5">
    <p className="mb-3 text-sm text-txt-dim">שאלה <span className="num">{i + 1}</span> מתוך <span className="num">{order.length}</span></p>
    <h2 className="text-xl font-black leading-8">{q.prompt}</h2>
    <div className="mt-4 grid gap-3">
      {choices.map((c) => {
        const state = picked === null ? "" : c === q.answer ? styles.right : c === picked ? `${styles.wrong} shake` : styles.faded;
        return <button key={c} type="button" disabled={picked !== null} onClick={() => { setPicked(c); if (c === q.answer) setScore(score + 1); }} className={`${styles.answer} ${state}`}>{c}</button>;
      })}
    </div>
    {picked !== null && <button type="button" onClick={() => { setI(i + 1); setPicked(null); }} className={`${styles.primary} mt-4`}>הבא</button>}
  </section>;
}

// ------------------------------------------------------------------ page

export function ArchesAid() {
  const [tab, setTab] = useHashTab<TabId>(TAB_IDS, "model");
  const [typeId, setTypeId] = useState(ARCH_TYPES[1].id);
  return <main dir="rtl" style={domainStyle("arches")} className="mx-auto min-h-screen w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
    <AidHeader slug="arches" title="קשתות וקמרונות" subtitle="מהקשת הכנענית בתל דן, דרך רומא וביזנטיון, ועד האבלק והמוקרנס של הממלוכים. בונים, מסובבים ומשווים." stats={`${ARCH_TYPES.length} סוגים · 4 צורות קשת`} />
    <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-6">
      <AidTabs tabs={TABS} active={tab} onSelect={setTab} />
      <div role="tabpanel" aria-labelledby={`aid-tab-${tab}`} className="mt-4 min-w-0 lg:mt-0">
        {tab === "model" && <ModelTab typeId={typeId} setTypeId={setTypeId} />}
        {tab === "compare" && <CompareTab />}
        {tab === "ages" && <AgesTab onShow={(id) => { setTypeId(id); setTab("model"); }} />}
        {tab === "practice" && <PracticeTab />}
      </div>
    </div>
  </main>;
}
