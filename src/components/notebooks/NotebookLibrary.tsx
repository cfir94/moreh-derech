"use client";

/**
 * עיצוב "ארון מסע": ניווט אופקי לפי אופן למידה, אחריו אזורי שטח או תחומי
 * עיון. כל כרטיס הוא קישור שלם, וממשק הניהול האישי ממשיך את אותה שפה חזותית.
 */
import { useEffect, useMemo, useState } from "react";
import {
  NOTEBOOK_MODES,
  ONLINE_NOTEBOOKS,
  THEORY_NOTEBOOKS,
  THEORY_SUBJECTS,
  TOUR_NOTEBOOKS,
  TOUR_REGIONS,
  type CourseNotebook,
  type NotebookMode,
  type OnlineNotebook,
  type TheoryNotebook,
  type TheorySubject,
  type TourRegion,
} from "@/data/notebooks";
import { useUser } from "@/contexts/UserContext";
import { NotebookManager } from "@/components/notebooks/NotebookManager";
import {
  displayNotebookDate,
  listStoredNotebooks,
  type StoredNotebook,
} from "@/lib/notebookStore";

const toneClasses = {
  teal: "border-teal/35 bg-teal/10 text-teal ring-teal/30",
  blue: "border-blue/35 bg-blue/10 text-blue ring-blue/30",
  gold: "border-gold/35 bg-gold/10 text-gold ring-gold/30",
  violet: "border-violet/35 bg-violet/10 text-violet ring-violet/30",
  rose: "border-rose/35 bg-rose/10 text-rose ring-rose/30",
  sand: "border-gold/30 bg-gold/10 text-gold ring-gold/30",
} as const;

const CFIR94_USER_ID = "e1fb8bb7-1c86-46ce-891a-b616f011d795";
type Tone = keyof typeof toneClasses;
type SortOrder = "added" | "newest" | "oldest";

const dynamicTones: Tone[] = ["teal", "blue", "gold", "violet", "rose"];

function dynamicTone(value: string): Tone {
  const hash = Array.from(value).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return dynamicTones[hash % dynamicTones.length];
}

function resolveTourRegion(id: string) {
  return TOUR_REGIONS.find((region) => region.id === id) ?? {
    id,
    title: id,
    description: `מחברות סיור באזור ${id}.`,
    tone: dynamicTone(id),
  };
}

function resolveTheorySubject(id: string) {
  return THEORY_SUBJECTS.find((subject) => subject.id === id) ?? {
    id,
    title: id,
    description: `מחברות בתחום ${id}.`,
    tone: dynamicTone(id),
  };
}

function notebookDateValue(date?: string) {
  if (!date) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (iso) return Number(`${iso[1]}${iso[2]}${iso[3]}`);
  const display = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);
  if (display) return Number(`${display[3]}${display[2]}${display[1]}`);
  return null;
}

function sortNotebooks<T extends { date?: string }>(notebooks: T[], order: SortOrder) {
  if (order === "added") return notebooks;
  return notebooks
    .map((notebook, index) => ({ notebook, index, date: notebookDateValue(notebook.date) }))
    .sort((first, second) => {
      if (first.date === null && second.date === null) return first.index - second.index;
      if (first.date === null) return 1;
      if (second.date === null) return -1;
      const difference = order === "newest" ? second.date - first.date : first.date - second.date;
      return difference || first.index - second.index;
    })
    .map(({ notebook }) => notebook);
}

function SortControls({ order, onChange }: { order: SortOrder; onChange: (order: SortOrder) => void }) {
  const options: { id: SortOrder; label: string }[] = [
    { id: "added", label: "סדר הוספה" },
    { id: "newest", label: "חדש לישן" },
    { id: "oldest", label: "ישן לחדש" },
  ];
  return (
    <section aria-label="מיון מחברות" className="mb-6 flex flex-wrap items-center gap-2 rounded-[var(--r-md)] border border-line bg-card/45 px-3 py-3 sm:px-4">
      <span className="ml-1 text-sm font-bold text-txt">מיון לפי תאריך:</span>
      {options.map((option) => (
        <button key={option.id} type="button" onClick={() => onChange(option.id)} aria-pressed={order === option.id} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition duration-200 ease-out active:scale-[0.97] ${order === option.id ? "border-teal/45 bg-teal/10 text-teal" : "border-line bg-card text-txt-dim hover:bg-card-2 hover:text-txt"}`}>
          {option.label}
        </button>
      ))}
    </section>
  );
}

function ExternalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4">
      <path d="M14 5h5v5M19 5l-8 8M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NotebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5">
      <path d="M6.5 4.5h10A1.5 1.5 0 0 1 18 6v13H6.5A2.5 2.5 0 0 1 4 16.5v-9A2.5 2.5 0 0 1 6.5 5v0Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 8h7M7 12h7M7 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-3.5">
      <path d="M12 21s6-5.05 6-11a6 6 0 1 0-12 0c0 5.95 6 11 6 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CardAction() {
  return (
    <span className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-bold text-teal transition duration-200 ease-out group-hover:text-txt">
      פתיחה במחברת
      <ExternalIcon />
    </span>
  );
}

function TheorySection({ notebooks }: { notebooks: TheoryNotebook[] }) {
  const [activeSubject, setActiveSubject] = useState<TheorySubject | "all">("all");
  const subjects = useMemo(
    () => Array.from(new Set(notebooks.map((notebook) => notebook.subject))).map(resolveTheorySubject),
    [notebooks],
  );
  const shownNotebooks = useMemo(
    () =>
      activeSubject === "all"
        ? notebooks
        : notebooks.filter((notebook) => notebook.subject === activeSubject),
    [activeSubject, notebooks],
  );
  const selectedSubject =
    activeSubject === "all"
      ? undefined
      : subjects.find((subject) => subject.id === activeSubject);

  return (
    <>
      <section aria-labelledby="theory-subjects-heading" className="mb-6 rounded-[var(--r-md)] border border-line bg-card/55 p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="theory-subjects-heading" className="text-lg text-txt">עיוני לפי תחום לימוד</h2>
            <p className="mt-1 text-sm text-txt-dim">בחרו תחום כדי לצמצם את המחברות לרצף לימוד אחד.</p>
          </div>
          <span className="num rounded-full border border-line bg-card px-2.5 py-1 text-xs font-bold text-txt-dim">{shownNotebooks.length} מחברות</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          <button type="button" onClick={() => setActiveSubject("all")} aria-pressed={activeSubject === "all"} className={`shrink-0 rounded-full border px-3 py-2 text-sm font-bold transition duration-200 ease-out active:scale-[0.97] ${activeSubject === "all" ? "border-teal/45 bg-teal/10 text-teal" : "border-line bg-card text-txt-dim hover:bg-card-2 hover:text-txt"}`}>כל התחומים</button>
          {subjects.map((subject) => {
            const count = notebooks.filter((notebook) => notebook.subject === subject.id).length;
            const isActive = activeSubject === subject.id;
            return (
              <button key={subject.id} type="button" onClick={() => setActiveSubject(subject.id)} aria-pressed={isActive} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition duration-200 ease-out active:scale-[0.97] ${isActive ? toneClasses[subject.tone] : "border-line bg-card text-txt-dim hover:bg-card-2 hover:text-txt"}`}>
                {subject.title}<span className="num text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-live="polite" aria-label="מחברות העיוני">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl text-txt sm:text-2xl">{selectedSubject?.title ?? "כל המחברות העיוניות"}</h2>
            {selectedSubject && <p className="mt-1 text-sm text-txt-dim">{selectedSubject.description}</p>}
          </div>
          <p className="text-xs font-bold text-txt-dim">{shownNotebooks.length} קישורים ישירים למחברות</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shownNotebooks.map((notebook, index) => {
            const subject = resolveTheorySubject(notebook.subject);
            return (
              <a key={notebook.id} href={notebook.url} target="_blank" rel="noopener noreferrer" aria-label={`פתיחת המחברת ${notebook.title}`} style={{ animationDelay: `${index * 0.04}s` }} className="screen-in group relative flex min-h-60 flex-col overflow-hidden rounded-[var(--r-md)] border border-line bg-card p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-teal/45 hover:bg-card-2 hover:shadow-[var(--shadow)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal">
                <span aria-hidden="true" className={`absolute inset-y-0 right-0 w-1 ${toneClasses[subject.tone].split(" ")[1]}`} />
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${toneClasses[subject.tone]}`}><NotebookIcon />{subject.title}</span>
                  <span className="num text-xs font-bold text-txt-dim">{notebook.date}</span>
                </div>
                <h3 className="text-lg leading-snug text-txt">{notebook.title}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-txt-dim"><span className="font-bold text-txt">מוביל/ה:</span> {notebook.guide}</p>
                <p className="mt-2 text-sm leading-relaxed text-txt-dim">{notebook.focus}</p>
                <CardAction />
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}

function OnlineSection({ notebooks }: { notebooks: OnlineNotebook[] }) {
  return (
    <section aria-label="מחברות השיעורים המקוונים">
      <div className="mb-6 rounded-[var(--r-md)] border border-line bg-card/55 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg text-txt">שיעורים מקוונים</h2>
            <p className="mt-1 text-sm text-txt-dim">רצף מחברות בארכאולוגיה, פרהיסטוריה ותקופות ארץ ישראל.</p>
          </div>
          <span className="num rounded-full border border-line bg-card px-2.5 py-1 text-xs font-bold text-txt-dim">{notebooks.length} מחברות</span>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl text-txt sm:text-2xl">כל השיעורים המקוונים</h2>
          <p className="mt-1 text-sm text-txt-dim">סדר המחברות משתנה בהתאם לבחירת המיון.</p>
        </div>
        <p className="text-xs font-bold text-txt-dim">{notebooks.length} קישורים ישירים למחברות</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {notebooks.map((notebook, index) => (
          <a key={notebook.id} href={notebook.url} target="_blank" rel="noopener noreferrer" aria-label={`פתיחת המחברת ${notebook.title}`} style={{ animationDelay: `${index * 0.04}s` }} className="screen-in group relative flex min-h-60 flex-col overflow-hidden rounded-[var(--r-md)] border border-line bg-card p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-teal/45 hover:bg-card-2 hover:shadow-[var(--shadow)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal">
            <span aria-hidden="true" className="absolute inset-y-0 right-0 w-1 bg-violet/10" />
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet/35 bg-violet/10 px-2.5 py-1 text-xs font-bold text-violet"><NotebookIcon />מקוון</span>
              <span className="num text-xs font-bold text-txt-dim">{notebook.date || "שיעור"}</span>
            </div>
            <h3 className="text-lg leading-snug text-txt">{notebook.title}</h3>
            {notebook.lecturer && <p className="mt-2 flex items-center gap-1.5 text-sm text-txt-dim"><span className="font-bold text-txt">מרצה:</span> {notebook.lecturer}</p>}
            <p className="mt-2 text-sm leading-relaxed text-txt-dim">{notebook.focus}</p>
            <CardAction />
          </a>
        ))}
      </div>
    </section>
  );
}

export function NotebookLibrary() {
  const { user, ready } = useUser();
  const [activeMode, setActiveMode] = useState<NotebookMode>("tours");
  const [activeRegion, setActiveRegion] = useState<TourRegion | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("added");
  const [storedNotebooks, setStoredNotebooks] = useState<StoredNotebook[]>([]);
  const [dataError, setDataError] = useState("");
  const [managerOpen, setManagerOpen] = useState(false);
  const isOwner = ready && user?.id === CFIR94_USER_ID;

  useEffect(() => {
    let cancelled = false;
    void listStoredNotebooks()
      .then((notebooks) => {
        if (!cancelled) setStoredNotebooks(notebooks);
      })
      .catch((error) => {
        if (!cancelled) setDataError(error instanceof Error ? error.message : "טעינת המחברות שנוספו נכשלה.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tourNotebooks = useMemo<CourseNotebook[]>(() => [
    ...TOUR_NOTEBOOKS,
    ...storedNotebooks
      .filter((notebook) => notebook.mode === "tours")
      .map((notebook) => ({
        id: `stored-${notebook.id}`,
        mode: "tours" as const,
        region: notebook.subcategory as TourRegion,
        title: notebook.title,
        date: displayNotebookDate(notebook.date),
        guide: notebook.guide,
        places: notebook.places,
        url: notebook.url,
      })),
  ], [storedNotebooks]);

  const theoryNotebooks = useMemo<TheoryNotebook[]>(() => [
    ...THEORY_NOTEBOOKS,
    ...storedNotebooks
      .filter((notebook) => notebook.mode === "theory")
      .map((notebook) => ({
        id: `stored-${notebook.id}`,
        mode: "theory" as const,
        subject: notebook.subcategory as TheorySubject,
        title: notebook.title,
        date: displayNotebookDate(notebook.date),
        guide: notebook.guide,
        focus: notebook.places,
        url: notebook.url,
      })),
  ], [storedNotebooks]);

  const onlineNotebooks = useMemo<OnlineNotebook[]>(() => [
    ...ONLINE_NOTEBOOKS,
    ...storedNotebooks
      .filter((notebook) => notebook.mode === "online")
      .map((notebook) => ({
        id: `stored-${notebook.id}`,
        mode: "online" as const,
        title: notebook.title,
        date: displayNotebookDate(notebook.date),
        lecturer: notebook.guide,
        focus: notebook.places,
        url: notebook.url,
      })),
  ], [storedNotebooks]);

  const sortedTourNotebooks = useMemo(
    () => sortNotebooks(tourNotebooks, sortOrder),
    [tourNotebooks, sortOrder],
  );
  const sortedTheoryNotebooks = useMemo(
    () => sortNotebooks(theoryNotebooks, sortOrder),
    [theoryNotebooks, sortOrder],
  );
  const sortedOnlineNotebooks = useMemo(
    () => sortNotebooks(onlineNotebooks, sortOrder),
    [onlineNotebooks, sortOrder],
  );
  const regions = useMemo(
    () => Array.from(new Set(tourNotebooks.map((notebook) => notebook.region))).map(resolveTourRegion),
    [tourNotebooks],
  );

  const shownNotebooks = useMemo(
    () => activeRegion === "all" ? sortedTourNotebooks : sortedTourNotebooks.filter((notebook) => notebook.region === activeRegion),
    [activeRegion, sortedTourNotebooks],
  );
  const activeRegionDetails = activeRegion === "all" ? undefined : resolveTourRegion(activeRegion);

  function selectMode(mode: NotebookMode) {
    setActiveMode(mode);
    if (mode === "tours") setActiveRegion("all");
  }

  return (
    <main className="screen-in mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10" dir="rtl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-teal"><span aria-hidden="true" className="h-px w-8 bg-teal" />מרכז הלמידה</div>
          <h1 className="grad-text text-3xl leading-tight sm:text-4xl">מחברות הקורס</h1>
          <p className="mt-3 leading-relaxed text-txt-dim">מקום אחד למחברות Gemini Notebook של הקורס — סיורים, מפגשים עיוניים ותכנים מקוונים. בוחרים תחום, מוצאים את המחברת ופותחים אותה ישירות.</p>
        </div>
        {isOwner && <button type="button" onClick={() => setManagerOpen((open) => !open)} aria-expanded={managerOpen} className="rounded-full border border-teal/40 bg-teal/10 px-4 py-2.5 text-sm font-extrabold text-teal transition hover:bg-teal/15 active:scale-[0.97]">{managerOpen ? "סגירת הניהול" : "+ הוספת מחברת"}</button>}
      </header>

      {isOwner && managerOpen && (
        <NotebookManager
          notebooks={storedNotebooks}
          dataError={dataError}
          onCreated={(notebook) => setStoredNotebooks((current) => [...current, notebook])}
          onUpdated={(notebook) => setStoredNotebooks((current) => current.map((item) => item.id === notebook.id ? notebook : item))}
          onDeleted={(id) => setStoredNotebooks((current) => current.filter((item) => item.id !== id))}
        />
      )}

      <section aria-label="סוג המחברות" className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {NOTEBOOK_MODES.map((mode) => {
            const isActive = activeMode === mode.id;
            const count = mode.id === "tours" ? tourNotebooks.length : mode.id === "theory" ? theoryNotebooks.length : onlineNotebooks.length;
            return (
              <button key={mode.id} type="button" onClick={() => selectMode(mode.id)} aria-pressed={isActive} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition duration-200 ease-out active:scale-[0.97] ${isActive ? "border-teal/45 bg-teal/10 text-teal shadow-[0_8px_20px_-14px_var(--teal)]" : "border-line bg-card text-txt-dim hover:bg-card-2 hover:text-txt"}`}>
                {mode.title}<span className="num opacity-75">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <SortControls order={sortOrder} onChange={setSortOrder} />

      {activeMode === "online" ? (
        <OnlineSection notebooks={sortedOnlineNotebooks} />
      ) : activeMode === "theory" ? (
        <TheorySection notebooks={sortedTheoryNotebooks} />
      ) : (
        <>
          <section aria-labelledby="tour-regions-heading" className="mb-6 rounded-[var(--r-md)] border border-line bg-card/55 p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div><h2 id="tour-regions-heading" className="text-lg text-txt">סיורים לפי אזור</h2><p className="mt-1 text-sm text-txt-dim">בחרו אזור כדי לצמצם את המחברות למרחב שטח אחד.</p></div>
              <span className="num rounded-full border border-line bg-card px-2.5 py-1 text-xs font-bold text-txt-dim">{shownNotebooks.length} מחברות</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
              <button type="button" onClick={() => setActiveRegion("all")} aria-pressed={activeRegion === "all"} className={`shrink-0 rounded-full border px-3 py-2 text-sm font-bold transition duration-200 ease-out active:scale-[0.97] ${activeRegion === "all" ? "border-teal/45 bg-teal/10 text-teal" : "border-line bg-card text-txt-dim hover:bg-card-2 hover:text-txt"}`}>כל האזורים</button>
              {regions.map((region) => {
                const count = tourNotebooks.filter((notebook) => notebook.region === region.id).length;
                const isActive = activeRegion === region.id;
                return <button key={region.id} type="button" onClick={() => setActiveRegion(region.id)} aria-pressed={isActive} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition duration-200 ease-out active:scale-[0.97] ${isActive ? toneClasses[region.tone] : "border-line bg-card text-txt-dim hover:bg-card-2 hover:text-txt"}`}>{region.title}<span className="num text-xs opacity-70">{count}</span></button>;
              })}
            </div>
          </section>

          <section aria-live="polite" aria-label="מחברות הסיורים">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl text-txt sm:text-2xl">{activeRegion === "all" ? "כל מחברות הסיורים" : activeRegionDetails?.title}</h2>
                {activeRegionDetails && <p className="mt-1 text-sm text-txt-dim">{activeRegionDetails.description}</p>}
              </div>
              <p className="text-xs font-bold text-txt-dim">{shownNotebooks.length} קישורים ישירים למחברות</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {shownNotebooks.map((notebook, index) => {
                const region = resolveTourRegion(notebook.region);
                return (
                  <a key={notebook.id} href={notebook.url} target="_blank" rel="noopener noreferrer" aria-label={`פתיחת המחברת ${notebook.title}`} style={{ animationDelay: `${index * 0.04}s` }} className="screen-in group relative flex min-h-60 flex-col overflow-hidden rounded-[var(--r-md)] border border-line bg-card p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-teal/45 hover:bg-card-2 hover:shadow-[var(--shadow)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal">
                    <span aria-hidden="true" className={`absolute inset-y-0 right-0 w-1 ${toneClasses[region.tone].split(" ")[1]}`} />
                    <div className="mb-5 flex items-center justify-between gap-3"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${toneClasses[region.tone]}`}><PinIcon />{region.title}</span><span className="num text-xs font-bold text-txt-dim">{notebook.date}</span></div>
                    <h3 className="text-lg leading-snug text-txt">{notebook.title}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-txt-dim"><span className="font-bold text-txt">מוביל/ה:</span> {notebook.guide}</p>
                    <p className="mt-2 text-sm leading-relaxed text-txt-dim">{notebook.places}</p>
                    <CardAction />
                  </a>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
