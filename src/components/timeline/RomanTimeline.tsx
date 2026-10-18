"use client";

import Link from "next/link";
import { ROMAN_EMPERORS, ROMAN_ERAS, ROMAN_EVENTS, ROMAN_KINDS, ROMAN_LEGIONS, ROMAN_SITES, type RomanEvent } from "@/data/roman";
import { matches, useEraTimeline } from "./useEraTimeline";
import styles from "./RomanTimeline.module.css";

const ID = /^RO-\d{3}$/;
const kindTitle = new Map(ROMAN_KINDS.map((kind) => [kind.id, kind.title]));
const views = [
  { id: "timeline", title: "הדרך", count: ROMAN_EVENTS.length },
  { id: "emperors", title: "הקיסרים והלגיונות", count: ROMAN_EMPERORS.length },
  { id: "sites", title: "אתרים בדרך", count: ROMAN_SITES.length },
];

/** Numbered milestones, the way a Roman road counts its miles. */
function roman(n: number) {
  const table: [number, string][] = [[50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [value, glyph] of table) while (n >= value) { out += glyph; n -= value; }
  return out;
}

function Milestone({ event }: { event: RomanEvent }) {
  return <article id={event.id} tabIndex={-1} className={`${styles.stop} ${event.key ? styles.keyStop : ""}`}>
    <div className={styles.milestone} aria-hidden>
      <span className={styles.mp}>M·P</span>
      <span className={styles.mpNum}>{roman(Number(event.id.slice(3)))}</span>
    </div>
    <details className={styles.tabula}>
      <summary>
        <span className={styles.meta}><span className={styles.date}>{event.date}</span><span className={styles.kind}>{kindTitle.get(event.kind)}</span>{event.concept && <span className={styles.concept} title="מופיע ברשימת המושגים של היחידה">מושג למבחן</span>}</span>
        <h3>{event.title}<span className={styles.plus} aria-hidden>＋</span></h3>
        <span className={styles.summary}>{event.summary}</span>
      </summary>
      <div className={styles.body}>
        <p>{event.body}</p>
        <div className={styles.tip}><span>לזכור לדרך</span><p>{event.tip}</p></div>
        {event.sites && <p className={styles.sites}><strong>בשטח:</strong> {event.sites}</p>}
        <a className={styles.permalink} href={`#${event.id}`}>קישור ישיר · {event.id}</a>
      </div>
    </details>
  </article>;
}

export function RomanTimeline() {
  const t = useEraTimeline(ROMAN_EVENTS, ID);
  const empty = <div className={styles.empty}><h2>לא נמצאו אירועים מתאימים</h2><p>אפשר לשנות את החיפוש או להרחיב את התקופה.</p><button type="button" onClick={t.reset}>להציג את כל האירועים</button></div>;

  return <div className={styles.page} dir="rtl">
    <div className={styles.breadcrumb}><Link href="/timelines">צירי זמן</Link><span aria-hidden> / </span><span>התקופה הרומית</span></div>

    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>SENATVS POPVLVSQVE ROMANVS</p>
        <h1>התקופה הרומית</h1>
        <p className={styles.subtitle}>מפומפיוס ועד קונסטנטינוס · 63 לפנה״ס – 324 לספירה</p>
        <p className={styles.lead}>ארבע מאות שנה של לגיונות, ערים וקיסרים: החורבן ויבנה, בר כוכבא ואיליה קפיטולינה, המשנה בציפורי והדרך אל הנצרות. כל אבן מיל היא אירוע — לחצו כדי לקרוא את הכתובת.</p>
        <a className={styles.start} href="#roman-road">לצאת לדרך <span aria-hidden>↓</span></a>
      </div>
      <div className={styles.heroArt} aria-hidden>
        <svg viewBox="0 0 420 320" fill="none">
          <path d="M60 300V120h300v180" stroke="currentColor" strokeWidth="3" />
          <path d="M40 120h340M50 104h320M60 88h300M40 120l10-16M380 120l-10-16" stroke="currentColor" strokeWidth="2" />
          <path d="M150 300V200a60 60 0 0 1 120 0v100" stroke="currentColor" strokeWidth="3" />
          <path d="M162 300V202a48 48 0 0 1 96 0v98" stroke="currentColor" strokeOpacity=".5" />
          <path d="M80 300V140M100 300V140M320 300V140M340 300V140" stroke="currentColor" strokeOpacity=".7" />
          <path d="M74 140h32M314 140h32M74 296h32M314 296h32" stroke="currentColor" strokeWidth="2" />
          <text x="210" y="80" textAnchor="middle" fill="currentColor" fontFamily="Georgia, serif" fontSize="20" letterSpacing="6">S·P·Q·R</text>
          <path d="M108 56c20-28 52-40 102-40s82 12 102 40" stroke="currentColor" strokeOpacity=".55" strokeDasharray="1 7" strokeWidth="3" strokeLinecap="round" />
          <path d="M20 312h380" stroke="currentColor" strokeDasharray="14 6" />
        </svg>
      </div>
      <div className={styles.stats}>
        <div><strong>{ROMAN_EVENTS.length}</strong><span>אבני מיל</span></div>
        <div><strong>{ROMAN_EVENTS.filter((event) => event.concept).length}</strong><span>מושגים מרשימת המבחן</span></div>
        <div><strong>{ROMAN_EMPERORS.length}</strong><span>קיסרים</span></div>
        <div><strong>{ROMAN_SITES.length}</strong><span>אתרים לסיור</span></div>
      </div>
    </header>

    <p className={styles.note}>הציר מבוסס על הרצאות אייל מירון ביחידות בית שני והתקופה הרומית, על רשימות המושגים של הקורס ועל סיורי ירושלים. אירועי 37 לפנה״ס–66 לספירה מוצגים בקצרה; הפירוט המלא נמצא ב<Link href="/timelines/second-temple">ציר בית שני</Link>. התקופה הבאה — ב<Link href="/timelines/byzantine">ציר התקופה הביזנטית</Link>.</p>

    <section id="roman-road" className={styles.workspace} aria-label="עיון בתקופה הרומית">
      <nav className={styles.views} aria-label="תצוגות התקופה הרומית">{views.map((view) => <button key={view.id} type="button" aria-pressed={t.view === view.id} onClick={() => { t.setView(view.id); t.setQuery(""); }}>{view.title}<small>{view.count}</small></button>)}</nav>
      <div className={styles.toolbar}>
        <label className={styles.search}><span aria-hidden>⌕</span><span className={styles.srOnly}>חיפוש בתצוגה הנוכחית</span><input type="search" value={t.query} onChange={(event) => t.setQuery(event.target.value)} placeholder={t.view === "timeline" ? "לחפש אירוע, דמות, אתר או שנה…" : "לחפש בתצוגה הנוכחית…"} /></label>
        {t.view === "timeline" && <>
          <label className={styles.select}>נושא<select value={t.kind} onChange={(event) => t.setKind(event.target.value)}><option value="all">כל הנושאים</option>{ROMAN_KINDS.map((kind) => <option key={kind.id} value={kind.id}>{kind.title}</option>)}</select></label>
          <label className={styles.check}><input type="checkbox" checked={t.keyOnly} onChange={(event) => t.setKeyOnly(event.target.checked)} />אירועי מפתח</label>
          <label className={styles.check}><input type="checkbox" checked={t.conceptOnly} onChange={(event) => t.setConceptOnly(event.target.checked)} />מושגים למבחן</label>
        </>}
      </div>

      {t.view === "timeline" && <>
        <nav className={styles.eras} aria-label="סינון לפי תקופה">
          <button type="button" aria-pressed={t.era === "all"} onClick={() => t.setEra("all")}><b>כל הדרך</b><small>63 לפנה״ס – 324</small></button>
          {ROMAN_ERAS.map((era) => <button key={era.id} type="button" aria-pressed={t.era === era.id} onClick={() => t.setEra(era.id)}><b>{era.title}</b><small>{era.range}</small></button>)}
        </nav>
        <div className={styles.status}><p role="status">{t.visible.length} מתוך {ROMAN_EVENTS.length} אירועים</p>{t.filtered && <button type="button" onClick={t.reset}>ניקוי סינון</button>}</div>
        {t.visible.length === 0 && empty}
        {ROMAN_ERAS.map((era) => {
          const events = t.visible.filter((event) => event.era === era.id);
          if (!events.length) return null;
          return <section key={era.id} className={styles.era} aria-labelledby={`era-${era.id}`}>
            <header className={styles.eraStone}><span className={styles.latin}>{era.latin}</span><h2 id={`era-${era.id}`}>{era.title}</h2><p className={styles.range}>{era.range}</p><p>{era.note}</p></header>
            <div className={styles.road}>{events.map((event) => <Milestone key={event.id} event={event} />)}</div>
          </section>;
        })}
      </>}

      {t.view === "emperors" && <div className={styles.panel}>
        <header className={styles.panelIntro}><h2>הקיסרים</h2><p>הקיסרים שהשפיעו ישירות על ארץ ישראל — ומה כל אחד מהם השאיר כאן.</p></header>
        <div className={styles.coins}>{ROMAN_EMPERORS.filter((emperor) => matches(emperor, t.query)).map((emperor) => <article key={emperor.name} className={styles.coinCard}>
          <div className={styles.coin} aria-hidden><span>{emperor.latin}</span></div>
          <div><h3>{emperor.name}</h3><p className={styles.reign}>{emperor.reign}</p><p>{emperor.note}</p></div>
        </article>)}</div>
        <header className={styles.panelIntro}><h2>הלגיונות</h2><p>הצבא הרומי שחנה בארץ — והשאיר את שמו על המפה.</p></header>
        <div className={styles.legions}>{ROMAN_LEGIONS.filter((legion) => matches(legion, t.query)).map((legion) => <article key={legion.latin} className={styles.legion}><span className={styles.latinTag}>{legion.latin}</span><h3>{legion.name}</h3><p>{legion.note}</p></article>)}</div>
      </div>}

      {t.view === "sites" && <div className={styles.panel}>
        <header className={styles.panelIntro}><h2>אתרים בדרך</h2><p>היכן פוגשים את התקופה הרומית בשטח — לסיור, לדוח ולמבחן.</p></header>
        <div className={styles.signs}>{ROMAN_SITES.filter((site) => matches(site, t.query)).map((site) => <article key={site.name} className={styles.sign}>
          <div className={styles.signHead}><h3>{site.name}</h3>{site.latin && <span>{site.latin}</span>}</div>
          <p className={styles.region}>{site.region}</p><p>{site.what}</p>
        </article>)}</div>
      </div>}
    </section>

    <footer className={styles.footer}><span>אבן דרך למורי דרך · התקופה הרומית</span><Link href="/timelines">לכל צירי הזמן ←</Link></footer>
  </div>;
}
