"use client";

import Link from "next/link";
import { BYZ_COUNCILS, BYZ_EMPERORS, BYZ_ERAS, BYZ_EVENTS, BYZ_KINDS, BYZ_PILGRIMS, BYZ_SITES, type ByzEvent } from "@/data/byzantine";
import { matches, useEraTimeline } from "./useEraTimeline";
import styles from "./ByzantineTimeline.module.css";

const ID = /^BY-\d{3}$/;
const kindTitle = new Map(BYZ_KINDS.map((kind) => [kind.id, kind.title]));
const siteType = { church: "כנסייה", monastery: "מנזר", synagogue: "בית כנסת", city: "עיר" } as const;
const views = [
  { id: "timeline", title: "ציר הזמן", count: BYZ_EVENTS.length },
  { id: "emperors", title: "קיסרים ומועצות", count: BYZ_EMPERORS.length + BYZ_COUNCILS.length },
  { id: "sites", title: "כנסיות, מנזרים ובתי כנסת", count: BYZ_SITES.length },
  { id: "pilgrims", title: "צליינים", count: BYZ_PILGRIMS.length },
];

function Panel({ event }: { event: ByzEvent }) {
  return <article id={event.id} tabIndex={-1} className={`${styles.item} ${event.key ? styles.keyItem : ""}`}>
    <span className={styles.marker} aria-hidden />
    <div className={styles.frame}>
      <details className={styles.panel}>
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
    </div>
  </article>;
}

export function ByzantineTimeline() {
  const t = useEraTimeline(BYZ_EVENTS, ID);

  return <div className={styles.page} dir="rtl">
    <div className={styles.breadcrumb}><Link href="/timelines">עזרי למידה</Link><span aria-hidden> / </span><span>התקופה הביזנטית</span></div>

    <header className={styles.hero}>
      <div className={styles.apse}>
        <svg className={styles.chiRho} viewBox="0 0 120 120" aria-hidden fill="none">
          <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="2" />
          <circle cx="60" cy="60" r="44" stroke="currentColor" strokeOpacity=".45" />
          <path d="M60 22v76M36 42l48 36M84 42L36 78" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M60 22c14 0 20 8 20 16s-6 16-20 16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <p className={styles.greek}>ΙΕΡΟΥΣΑΛΗΜ · ΑΓΙΑ ΠΟΛΙΣ</p>
        <h1>התקופה הביזנטית</h1>
        <p className={styles.subtitle}>מקונסטנטינוס ועד הכיבוש המוסלמי · 324–638</p>
        <p className={styles.lead}>שלוש מאות שנה שבהן הארץ נעשתה ״ארץ הקודש״: כנסיות ומנזרים, צליינים ומפת מידבא — ולצידם התלמוד הירושלמי, בתי הכנסת עם גלגלי המזלות, ומרידות השומרונים.</p>
        <a className={styles.start} href="#byzantine-mosaic">להיכנס <span aria-hidden>↓</span></a>
      </div>
      <div className={styles.stats}>
        <div><strong>{BYZ_EVENTS.length}</strong><span>אירועים</span></div>
        <div><strong>{BYZ_EVENTS.filter((event) => event.concept).length}</strong><span>מושגים מרשימת המבחן</span></div>
        <div><strong>{BYZ_COUNCILS.length}</strong><span>מועצות כנסייה</span></div>
        <div><strong>{BYZ_SITES.length}</strong><span>אתרים לסיור</span></div>
      </div>
    </header>

    <p className={styles.note}>הציר מבוסס על הרצאת אייל מירון על התקופה הביזנטית, על הרצאות האדריכלות הקלאסית ועל רשימות המושגים של הקורס. התקופה הקודמת — ב<Link href="/timelines/roman">ציר התקופה הרומית</Link>.</p>

    <section id="byzantine-mosaic" className={styles.workspace} aria-label="עיון בתקופה הביזנטית">
      <nav className={styles.views} aria-label="תצוגות התקופה הביזנטית">{views.map((view) => <button key={view.id} type="button" aria-pressed={t.view === view.id} onClick={() => { t.setView(view.id); t.setQuery(""); }}>{view.title}<small>{view.count}</small></button>)}</nav>
      <div className={styles.toolbar}>
        <label className={styles.search}><span aria-hidden>⌕</span><span className={styles.srOnly}>חיפוש בתצוגה הנוכחית</span><input type="search" value={t.query} onChange={(event) => t.setQuery(event.target.value)} placeholder={t.view === "timeline" ? "לחפש אירוע, דמות, אתר או שנה…" : "לחפש בתצוגה הנוכחית…"} /></label>
        {t.view === "timeline" && <>
          <label className={styles.select}>נושא<select value={t.kind} onChange={(event) => t.setKind(event.target.value)}><option value="all">כל הנושאים</option>{BYZ_KINDS.map((kind) => <option key={kind.id} value={kind.id}>{kind.title}</option>)}</select></label>
          <label className={styles.check}><input type="checkbox" checked={t.keyOnly} onChange={(event) => t.setKeyOnly(event.target.checked)} />אירועי מפתח</label>
          <label className={styles.check}><input type="checkbox" checked={t.conceptOnly} onChange={(event) => t.setConceptOnly(event.target.checked)} />מושגים למבחן</label>
        </>}
      </div>

      {t.view === "timeline" && <>
        <nav className={styles.eras} aria-label="סינון לפי תקופה">
          <button type="button" aria-pressed={t.era === "all"} onClick={() => t.setEra("all")}><b>כל התקופה</b><small>324–641</small></button>
          {BYZ_ERAS.map((era) => <button key={era.id} type="button" aria-pressed={t.era === era.id} onClick={() => t.setEra(era.id)}><b>{era.title}</b><small>{era.range}</small></button>)}
        </nav>
        <div className={styles.status}><p role="status">{t.visible.length} מתוך {BYZ_EVENTS.length} אירועים</p>{t.filtered && <button type="button" onClick={t.reset}>ניקוי סינון</button>}</div>
        {t.visible.length === 0 && <div className={styles.empty}><h2>לא נמצאו אירועים מתאימים</h2><p>אפשר לשנות את החיפוש או להרחיב את התקופה.</p><button type="button" onClick={t.reset}>להציג את כל האירועים</button></div>}
        {BYZ_ERAS.map((era) => {
          const events = t.visible.filter((event) => event.era === era.id);
          if (!events.length) return null;
          return <section key={era.id} className={styles.era} aria-labelledby={`era-${era.id}`}>
            <header className={styles.niche}><span className={styles.nicheGreek}>{era.greek}</span><h2 id={`era-${era.id}`}>{era.title}</h2><p className={styles.range}>{era.range}</p><p>{era.note}</p></header>
            <div className={styles.column}>{events.map((event) => <Panel key={event.id} event={event} />)}</div>
          </section>;
        })}
      </>}

      {t.view === "emperors" && <div className={styles.view}>
        <header className={styles.viewIntro}><h2>הקיסרים</h2><p>מי שלט בקונסטנטינופול — ומה זה שינה בארץ.</p></header>
        <div className={styles.icons}>{BYZ_EMPERORS.filter((emperor) => matches(emperor, t.query)).map((emperor) => <article key={emperor.name} className={styles.icon}>
          <div className={styles.halo} aria-hidden><span>{emperor.greek}</span></div>
          <h3>{emperor.name}</h3><p className={styles.reign}>{emperor.reign}</p><p>{emperor.note}</p>
        </article>)}</div>
        <header className={styles.viewIntro}><h2>מועצות הכנסייה</h2><p>המועצות האקומניות שעיצבו את הנצרות — ואת הפילוג בין העדות שבכנסיית הקבר.</p></header>
        <ol className={styles.councils}>{BYZ_COUNCILS.filter((council) => matches(council, t.query)).map((council) => <li key={council.name}><span className={styles.councilYear}>{council.year}</span><div><h3>{council.name}</h3><p className={styles.place}>{council.place}</p><p>{council.decision}</p></div></li>)}</ol>
      </div>}

      {t.view === "sites" && <div className={styles.view}>
        <header className={styles.viewIntro}><h2>כנסיות, מנזרים ובתי כנסת</h2><p>היכן פוגשים את התקופה הביזנטית בשטח.</p></header>
        <div className={styles.tiles}>{BYZ_SITES.filter((site) => matches(site, t.query)).map((site) => <article key={site.name} className={`${styles.tile} ${styles[site.type] ?? ""}`}>
          <span className={styles.tileType}>{siteType[site.type]}</span><h3>{site.name}</h3><p>{site.what}</p>
        </article>)}</div>
      </div>}

      {t.view === "pilgrims" && <div className={styles.view}>
        <header className={styles.viewIntro}><h2>צליינים ומקורות</h2><p>מי ביקר, מי כתב — ומה אנחנו יודעים בזכותם על ארץ הקודש הביזנטית.</p></header>
        <ol className={styles.councils}>{BYZ_PILGRIMS.filter((pilgrim) => matches(pilgrim, t.query)).map((pilgrim) => <li key={pilgrim.name}><span className={styles.councilYear}>{pilgrim.when}</span><div><h3>{pilgrim.name}</h3><p>{pilgrim.note}</p></div></li>)}</ol>
      </div>}
    </section>

    <footer className={styles.footer}><span>אבן דרך למורי דרך · התקופה הביזנטית</span><Link href="/timelines">לכל עזרי הלמידה ←</Link></footer>
  </div>;
}
