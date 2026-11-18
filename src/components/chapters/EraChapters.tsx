"use client";

/*
 * "פרקים במחברת" (בקשת הבעלים, 14.11): ציר תקופה שאינו רשימה ארוכה אלא מחברת שדה מחולקת לפרקים.
 *   * פס הזמן למעלה: כל התקופות, אחת מסומנת. זה השלד שזוכרים: מה בא אחרי מה.
 *   * פרק אחד בכל מסך: משפט אחד שמסכם, "שלושה דברים לזכור" (אירועי המפתח), ואז השביל: תחנות קצרות,
 *     שנה וכותרת בלבד. הפירוט נפתח בדף מחברת לצד השביל (בטלפון: מתחת לתחנה).
 *   * בסוף כל פרק: תרגול קצר על הפרק עצמו, ומעבר לפרק הבא.
 * הנתונים לא משתנים: כל ציר מעביר את התקופות, האירועים והתמונות שלו, ולשוניות נוספות משלו.
 * קישור ישיר (#RO-012) פותח את הפרק של האירוע ומסמן אותו, כמו קודם.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { matchesTempleQuery } from "@/data/second-temple";
import { AidTabs, PhotoFigure, PracticeDeck, type PracticeItem } from "@/components/learning-aid";
import { PageHead, Stamp, kit as k } from "@/components/trail/kit";
import { InkIcon } from "@/components/trail/Ink";
import type { FieldIconName } from "@/components/trail/FieldIcons";
import type { MarcherName } from "@/components/trail/Marchers";
import { PageDecor } from "@/components/trail/PageDecor";
import { RangeText } from "@/components/RangeText";
import type { EraPhoto } from "@/lib/eraPhotos";
import s from "./chapters.module.css";

export type ChapterEra = { id: string; title: string; range: string; note: string };
export type ChapterEvent = {
  id: string; era: string; date: string; title: string; kind: string;
  summary: string; body: string; tip?: string; sites?: string; key?: boolean; concept?: boolean;
};
export type ChapterKind = { id: string; title: string; icon: FieldIconName };
export type ChapterExtra = { id: string; label: string; count?: number; render: (query: string) => ReactNode };

export type EraChaptersProps = {
  title: string;
  lede: ReactNode;
  art: FieldIconName;
  decor: FieldIconName[];
  /** figures of the period marching at the foot of the page */
  marchers?: MarcherName[];
  /** the colour of this period's ink: chapter numbers, key stations, the remember-tags */
  accent: { light: string; dark: string };
  /** the period's own material laid over the notebook (owner, 18.11: keep them special, the layout matters
   *  more): a paved Roman road with milestones and an inscription plaque, or a Byzantine mosaic */
  material?: "roman" | "byzantine";
  eras: readonly ChapterEra[];
  events: readonly ChapterEvent[];
  kinds: readonly ChapterKind[];
  photos?: Record<string, EraPhoto>;
  idPattern: RegExp;
  practice: readonly PracticeItem[];
  quizSlug: string;
  practiceLabel: string;
  extras?: readonly ChapterExtra[];
  /** a sentence under the chapters about the sources and the neighbouring timelines */
  note?: ReactNode;
  /** more for the event's page, after "on the ground" (Second Temple: causes, consequences, the source) */
  more?: (id: string) => ReactNode;
};

const HEB = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ז׳", "ח׳", "ט׳", "י׳", "י״א", "י״ב"];
/** a Roman road counts its miles in Roman numerals */
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** Up to three things to carry away: key events that are also exam concepts first, then the other
 *  key events, then concepts; always shown in time order. */
export function rememberOf(events: readonly ChapterEvent[]): ChapterEvent[] {
  const rank = (e: ChapterEvent) => (e.key && e.concept ? 0 : e.key ? 1 : e.concept ? 2 : 3);
  const picked = events
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => rank(e) < 3)
    .sort((a, b) => rank(a.e) - rank(b.e) || a.i - b.i)
    .slice(0, 3);
  return picked.sort((a, b) => a.i - b.i).map(({ e }) => e);
}

const wideQuery = "(min-width: 1024px)";
function useWide() {
  return useSyncExternalStore(
    (on) => {
      const m = window.matchMedia(wideQuery);
      m.addEventListener("change", on);
      return () => m.removeEventListener("change", on);
    },
    () => window.matchMedia(wideQuery).matches,
    () => true,
  );
}

function EventPage({ event, kind, photo, onStep, step, more }: {
  event: ChapterEvent; kind?: ChapterKind; photo?: EraPhoto; more?: ReactNode;
  onStep: (dir: -1 | 1) => void; step: { prev: boolean; next: boolean };
}) {
  return <article className={s.page} aria-labelledby={`${event.id}-title`}>
    <p className={`${s.pageMeta} pencil`}>
      <span className={s.metaDate}><RangeText text={event.date} /></span>
      {kind && <span className={s.pageKind}><InkIcon name={kind.icon} size={20} />{kind.title}</span>}
      {event.concept && <span className={s.conceptTag}>מושג למבחן</span>}
    </p>
    <h3 id={`${event.id}-title`} className={s.pageTitle}>{event.title}</h3>
    <p className={s.pageLead}><RangeText text={event.summary} /></p>
    {photo && <PhotoFigure {...photo} className={s.pagePhoto} />}
    <p className={s.pageBody}><RangeText text={event.body} /></p>
    {event.tip && <aside className={s.tip} aria-label="לזכור לדרך">
      <span className={s.tipHead}><InkIcon name="pencil" size={22} />לזכור לדרך</span>
      <p><RangeText text={event.tip} /></p>
    </aside>}
    {event.sites && <p className={s.sites}><InkIcon name="map" size={22} /><span><b>בשטח:</b> {event.sites}</span></p>}
    {more}
    <div className={s.pageFoot}>
      <button type="button" className={s.stepBtn} disabled={!step.prev} onClick={() => onStep(-1)}><span aria-hidden>→</span> הקודם</button>
      <a className={`${s.permalink} pencil`} href={`#${event.id}`}>קישור ישיר</a>
      <button type="button" className={s.stepBtn} disabled={!step.next} onClick={() => onStep(1)}>הבא <span aria-hidden>←</span></button>
    </div>
  </article>;
}

export function EraChapters(p: EraChaptersProps) {
  const wide = useWide();
  const [view, setView] = useState("chapters");
  const [eraId, setEraId] = useState(p.eras[0].id);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [conceptOnly, setConceptOnly] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const kindOf = useMemo(() => new Map(p.kinds.map((x) => [x.id, x])), [p.kinds]);
  const byId = useMemo(() => new Map(p.events.map((e) => [e.id, e])), [p.events]);
  const eraIndex = p.eras.findIndex((e) => e.id === eraId);
  const era = p.eras[eraIndex];
  const eraEvents = useMemo(() => p.events.filter((e) => e.era === eraId), [p.events, eraId]);
  const remember = useMemo(() => rememberOf(eraEvents), [eraEvents]);
  const trail = eraEvents.filter((e) => (kind === "all" || e.kind === kind) && (!conceptOnly || e.concept));
  const num = (id: string) => Number(id.replace(/\D/g, ""));
  const eraOfNum = useMemo(() => new Map(p.events.map((e) => [num(e.id), e.era])), [p.events]);
  const chapterPractice = useMemo(() => p.practice.filter((q) => q.id < 2000 && eraOfNum.get(q.id % 1000) === eraId), [p.practice, eraOfNum, eraId]);
  const results = query ? p.events.filter((e) => matchesTempleQuery(Object.values(e).join(" "), query)) : [];

  // on a wide screen the side page always shows something: the first thing to remember
  const shown = selected && byId.get(selected)?.era === eraId ? selected : wide ? (remember[0] ?? eraEvents[0])?.id ?? null : null;

  const open = useCallback((id: string, opts: { scroll?: boolean; hash?: boolean } = {}) => {
    const e = byId.get(id);
    if (!e) return;
    setView("chapters"); setQuery(""); setKind("all"); setConceptOnly(false);
    setEraId(e.era); setSelected(id);
    if (opts.hash) history.replaceState(null, "", `#${id}`);
    // the station takes the focus too, so a keyboard or screen-reader user lands where the link pointed
    if (opts.scroll) window.setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ block: "center" });
      el?.focus({ preventScroll: true });
    }, 30);
  }, [byId]);

  const goEra = (id: string) => {
    setEraId(id); setSelected(null); setKind("all"); setConceptOnly(false); setQuery("");
    window.setTimeout(() => sheetRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 0);
  };

  // #RO-012: open the event's chapter and mark it, on load and on every hash change
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (p.idPattern.test(id) && byId.has(id)) open(id, { scroll: true });
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [p.idPattern, byId, open]);

  const tabs = [
    { id: "chapters", label: "הפרקים", count: p.eras.length },
    ...(p.extras ?? []).map((x) => ({ id: x.id, label: x.label, count: x.count })),
    { id: "practice", label: "תרגול על הכול", count: p.practice.length },
  ];

  const stepIn = (dir: -1 | 1) => {
    const list = trail.length ? trail : eraEvents;
    const i = list.findIndex((e) => e.id === shown);
    const next = list[i + dir];
    if (next) open(next.id, { hash: true, scroll: !wide });
  };
  const shownEvent = shown ? byId.get(shown) : undefined;
  const shownIndex = shownEvent ? (trail.length ? trail : eraEvents).findIndex((e) => e.id === shownEvent.id) : -1;
  const page = shownEvent && <EventPage
    key={shownEvent.id}
    event={shownEvent}
    kind={kindOf.get(shownEvent.kind)}
    photo={p.photos?.[shownEvent.id]}
    more={p.more?.(shownEvent.id)}
    onStep={stepIn}
    step={{ prev: shownIndex > 0, next: shownIndex >= 0 && shownIndex < (trail.length ? trail : eraEvents).length - 1 }}
  />;

  const style = { "--era-ink": p.accent.light, "--era-ink-dark": p.accent.dark } as CSSProperties;

  // a link to an event anywhere on the page (from a person, a site, a related event) opens it, even when
  // the address already holds that id and no hashchange would fire
  const onLink = (ev: React.MouseEvent<HTMLDivElement>) => {
    const a = (ev.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const id = a ? decodeURIComponent(a.getAttribute("href")!.slice(1)) : "";
    if (!a || !p.idPattern.test(id) || !byId.has(id)) return;
    ev.preventDefault();
    open(id, { hash: true, scroll: true });
  };

  return <div className={s.wrap} style={style} dir="rtl" onClick={onLink} data-material={p.material}>
    <PageDecor wide prints={false} items={p.decor} figures={p.marchers} />
    <PageHead
      section="aids"
      title={p.title}
      crumbs={[{ href: "/timelines/", label: "עזרי למידה" }]}
      lede={p.lede}
      art={<InkIcon name={p.art} />}
    />

    <AidTabs row tabs={tabs} active={view} onSelect={(id) => { setView(id); setQuery(""); }} />

    {view !== "practice" && <div className={s.tools}>
      <label className={s.search}>
        <InkIcon name="search" size={24} />
        <span className="sr-only">חיפוש</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={view === "chapters" ? "לחפש אירוע, דמות, אתר או שנה בכל הפרקים…" : "לחפש בתצוגה הזו…"} />
      </label>
    </div>}

    {view === "chapters" && <>
      <nav aria-label="פס הזמן: הפרקים" className={s.ribbonWrap}>
        <ol className={s.ribbon}>
          {p.eras.map((e, i) => {
            const on = e.id === eraId && !query;
            return <li key={e.id}>
              <button type="button" aria-current={on ? "step" : undefined} className={`${s.stop} ${on ? s.stopOn : ""}`} onClick={() => goEra(e.id)}>
                <span className={s.stopNum} aria-hidden>{p.material === "roman" ? ROMAN[i] : HEB[i]}</span>
                <span className={s.stopTitle}>{e.title}</span>
                <span className={s.stopRange}><RangeText text={e.range} /></span>
              </button>
            </li>;
          })}
        </ol>
      </nav>

      {query ? <section className={s.results} aria-label="תוצאות החיפוש">
        <p role="status" className={`${s.count} pencil`}>{results.length ? `${results.length} אירועים מתאימים` : "לא נמצאו אירועים מתאימים"}</p>
        {!results.length && <button type="button" className={s.stepBtn} onClick={() => setQuery("")}>לנקות את החיפוש</button>}
        {p.eras.map((e, i) => {
          const hits = results.filter((r) => r.era === e.id);
          if (!hits.length) return null;
          return <div key={e.id} className={s.resultGroup}>
            <h2 className={s.resultHead}><span className={s.resultNum}>פרק {HEB[i]}</span> {e.title}</h2>
            <ul>
              {hits.map((r) => <li key={r.id}>
                <button type="button" className={s.resultBtn} onClick={() => open(r.id, { scroll: true, hash: true })}>
                  <span className={s.resultDate}><RangeText text={r.date} /></span>
                  <span className={s.resultTitle}>{r.title}</span>
                </button>
              </li>)}
            </ul>
          </div>;
        })}
      </section> : <div ref={sheetRef} className={s.sheet} aria-labelledby={`chapter-${era.id}`}>
        <header className={s.chapterHead}>
          <p className={`${s.chapterNo} pencil`}>פרק {HEB[eraIndex]} מתוך {p.eras.length}</p>
          <h2 id={`chapter-${era.id}`} className={s.chapterTitle}>{era.title}</h2>
          <p className={s.chapterRange}><RangeText text={era.range} /></p>
          <p className={s.chapterNote}><RangeText text={era.note} /></p>
        </header>

        {remember.length > 0 && <section className={s.remember} aria-labelledby={`remember-${era.id}`}>
          <h3 id={`remember-${era.id}`} className={s.handHead}>{remember.length === 1 ? "דבר אחד לזכור" : remember.length === 2 ? "שני דברים לזכור" : "שלושה דברים לזכור"}</h3>
          <ol className={s.tags}>
            {remember.map((e) => <li key={e.id}>
              <button type="button" className={`${s.tag} ${shown === e.id ? s.tagOn : ""}`} onClick={() => open(e.id, { hash: true, scroll: !wide })}>
                <Stamp tone="red" className={s.tagStamp}><RangeText text={e.date} /></Stamp>
                <span className={s.tagTitle}>{e.title}</span>
                {e.tip && <span className={s.tagTip}><RangeText text={e.tip} /></span>}
              </button>
            </li>)}
          </ol>
        </section>}

        <section className={s.trailSection} aria-labelledby={`trail-${era.id}`}>
          <div className={s.trailHead}>
            <h3 id={`trail-${era.id}`} className={s.handHead}>השביל של הפרק</h3>
            <div className={s.filters} role="group" aria-label="סינון התחנות">
              <button type="button" aria-pressed={kind === "all"} className={`${k.chip} ${kind === "all" ? k.chipOn : ""}`} onClick={() => setKind("all")}><span className="pencil">הכול</span></button>
              {p.kinds.filter((x) => eraEvents.some((e) => e.kind === x.id)).map((x) => <button key={x.id} type="button" aria-pressed={kind === x.id} className={`${k.chip} ${kind === x.id ? k.chipOn : ""}`} onClick={() => setKind(kind === x.id ? "all" : x.id)}>
                <InkIcon name={x.icon} size={20} /><span className="pencil">{x.title}</span>
              </button>)}
              {eraEvents.some((e) => e.concept) && <button type="button" aria-pressed={conceptOnly} className={`${k.chip} ${conceptOnly ? k.chipOn : ""}`} onClick={() => setConceptOnly(!conceptOnly)}><span className="pencil">מושגים למבחן</span></button>}
            </div>
          </div>

          <div className={s.trailGrid}>
            <ol className={s.trail}>
              {trail.map((e) => {
                const on = e.id === shown;
                const kd = kindOf.get(e.kind);
                return <li key={e.id} id={e.id} tabIndex={-1} className={`${s.station} ${e.key ? s.stationKey : ""} ${on ? s.stationOn : ""}`}>
                  <button type="button" aria-expanded={on} aria-controls={on ? `${e.id}-title` : undefined} className={s.stationBtn}
                    onClick={() => (on && !wide ? setSelected(null) : open(e.id, { hash: true }))}>
                    <span className={s.marker} aria-hidden />
                    <span className={s.stationDate}><RangeText text={e.date} /></span>
                    <span className={s.stationTitle}>{e.title}</span>
                    {kd && <span className={s.stationKind} title={kd.title}><InkIcon name={kd.icon} size={22} /><span className="sr-only">{kd.title}</span></span>}
                  </button>
                  {on && !wide && page}
                </li>;
              })}
              {!trail.length && <li className={s.emptyTrail}>אין בפרק הזה תחנות מהסוג הזה.</li>}
            </ol>
            {wide && <div className={s.side}>{page}</div>}
          </div>
        </section>

        {chapterPractice.length >= 2 && <section className={s.check} aria-labelledby={`check-${era.id}`}>
          <h3 id={`check-${era.id}`} className={s.handHead}>בדקו את עצמכם על הפרק</h3>
          <PracticeDeck key={era.id} quizSlug={p.quizSlug} label={`${p.practiceLabel}: ${era.title}`} items={chapterPractice} />
        </section>}

        <nav className={s.chapterNav} aria-label="מעבר בין פרקים">
          {eraIndex > 0 ? <button type="button" className={s.navSign} onClick={() => goEra(p.eras[eraIndex - 1].id)}>
            <span className="pencil">→ הפרק הקודם</span><b>{p.eras[eraIndex - 1].title}</b>
          </button> : <span />}
          {eraIndex < p.eras.length - 1 && <button type="button" className={`${s.navSign} ${s.navNext}`} onClick={() => goEra(p.eras[eraIndex + 1].id)}>
            <span className="pencil">הפרק הבא ←</span><b>{p.eras[eraIndex + 1].title}</b>
          </button>}
        </nav>
      </div>}
    </>}

    {(p.extras ?? []).map((x) => view === x.id && <div key={x.id} className={s.extra}>{x.render(query)}</div>)}

    {view === "practice" && <div className={s.extra}>
      <PracticeDeck quizSlug={p.quizSlug} label={p.practiceLabel} items={p.practice} />
    </div>}

    {p.note && <p className={s.note}>{p.note}</p>}
    <p className={s.back}><Link href="/timelines/" className="pencil">← לכל עזרי הלמידה</Link></p>
  </div>;
}
