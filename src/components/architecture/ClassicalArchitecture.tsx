"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ARCH_CHAPTERS, ARCH_MILESTONES, ARCH_PERIODS, ARCH_TERMS, matchesArchTerm, type ArchTerm } from "@/data/classical-architecture";
import { cx, styles } from "./shared";
import { OrdersLab } from "./OrdersLab";
import { TemplesLab } from "./TemplesLab";
import { CityLab } from "./CityLab";
import { RoadsLab, WaterLab } from "./RoadsWaterLab";
import { EntertainmentLab } from "./EntertainmentLab";
import { BathsLab, DecorLab } from "./BathsDecorLab";
import { BurialLab, PurityLab } from "./PurityBurialLab";
import { ChurchesLab, SynagoguesLab } from "./SacredLab";

const chapterTitle = new Map(ARCH_CHAPTERS.map((c) => [c.id, c]));
const periodTitle = new Map(ARCH_PERIODS.map((p) => [p.id, p.title]));

function openTerm(hash: string) {
  if (!hash.startsWith("#t-")) return;
  const target = document.getElementById(hash.slice(1));
  if (!(target instanceof HTMLDetailsElement)) return;
  target.open = true;
  target.scrollIntoView({ block: "center" });
  target.querySelector("summary")?.focus({ preventScroll: true });
}

function HeroArt() {
  return <svg viewBox="0 0 420 300" fill="none" className={styles.heroSvg} aria-hidden>
    <path className={styles.draw} d="M40 270h340M50 258h320M60 246h300" />
    <path className={styles.draw} d="M70 118L210 50L350 118Z M92 112L210 64L328 112" />
    <path className={styles.draw} d="M66 118h288v12H66Z M72 130h276v22H72Z M72 152h276v14H72Z" />
    {[96, 150, 210, 270, 324].map((x, i) => <path key={x} className={styles.draw} style={{ animationDelay: `${0.3 + i * 0.12}s` }} d={`M${x - 11} 246 L${x - 9} 176 h18 L${x + 11} 246 M${x - 14} 166 h28 l-3 10 h-22 Z M${x - 4} 240 v-60 M${x + 4} 240 v-60`} />)}
    {[0, 1, 2, 3].map((i) => <path key={i} className={styles.draw} d={`M${92 + i * 66} 152v14M${110 + i * 66} 152v14`} />)}
    <path className={styles.dim} d="M24 50v220M18 50h12M18 270h12 M396 166v80 M390 166h12M390 246h12" />
    <text x={14} y={164} className={styles.dimText} transform="rotate(-90 14 164)">H</text>
    <text x={410} y={210} className={styles.dimText}>1:9</text>
    <circle cx={210} cy={92} r={8} className={styles.draw} />
  </svg>;
}

function Timeline() {
  const [open, setOpen] = useState(ARCH_MILESTONES[7].id);
  return <section className={styles.timeline} aria-labelledby="arch-timeline">
    <header className={styles.timelineHead}>
      <h2 id="arch-timeline">ציר הזמן האדריכלי</h2>
      <div className={styles.legend}>{ARCH_PERIODS.map((p) => <span key={p.id} className={styles[`p_${p.id}`]}><i aria-hidden />{p.title} <small>{p.range}</small></span>)}</div>
    </header>
    <ol className={styles.ribbon}>
      {ARCH_MILESTONES.map((m) => {
        const ch = chapterTitle.get(m.chapter)!;
        return <li key={m.id} className={cx(styles.stop, styles[`p_${m.period}`], open === m.id && styles.stopOpen)}>
          <button type="button" aria-expanded={open === m.id} onClick={() => setOpen(m.id)}>
            <span className={styles.stopDate}>{m.date}</span>
            <b>{m.title}</b>
          </button>
          {open === m.id && <div className={styles.stopBody}>
            <p>{m.text}</p>
            <p className={styles.small}>{periodTitle.get(m.period)} · <a href={`#ch-${ch.id}`}>לוח {ch.numeral} — {ch.title} ←</a></p>
          </div>}
        </li>;
      })}
    </ol>
  </section>;
}

function copyText(term: ArchTerm) {
  return `${term.term}${term.latin ? ` (${term.latin})` : ""} — ${term.text}${term.site ? ` אתר בארץ: ${term.site}.` : ""}`;
}

function Glossary() {
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState("all");
  const [listOnly, setListOnly] = useState(false);
  const [copied, setCopied] = useState("");
  const visible = ARCH_TERMS.filter((t) => (chapter === "all" || t.chapter === chapter) && (!listOnly || t.list) && matchesArchTerm(t, query));

  useEffect(() => {
    const onHash = () => openTerm(window.location.hash);
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const copy = async (term: ArchTerm) => {
    try { await navigator.clipboard.writeText(copyText(term)); setCopied(term.id); } catch { setCopied(""); }
  };

  return <section id="glossary" className={styles.glossary} aria-labelledby="glossary-title">
    <header className={styles.plateHead}>
      <span className={styles.plateNo} aria-hidden>INDEX</span>
      <h2 id="glossary-title">מילון המושגים</h2>
      <p>כל המושגים מן המטלה של בת־ציון זיו — הסבר קצר (עד חמש שורות, כמו שהמטלה דורשת) ואתר בארץ. ההסבר והאתר מן ההרצאות, אלא אם צוין אחרת.</p>
    </header>
    <div className={styles.toolbar}>
      <label className={styles.search}><span aria-hidden>⌕</span><span className={styles.srOnly}>חיפוש מושג</span><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="לחפש מושג, אתר או מילה…" /></label>
      <label className={styles.select}>לוח<select value={chapter} onChange={(e) => setChapter(e.target.value)}><option value="all">כל הלוחות</option>{ARCH_CHAPTERS.map((c) => <option key={c.id} value={c.id}>{c.numeral} · {c.title}</option>)}</select></label>
      <label className={styles.toggle}><input type="checkbox" checked={listOnly} onChange={(e) => setListOnly(e.target.checked)} />רק מרשימת המטלה</label>
    </div>
    <p className={styles.count} role="status">{visible.length} מושגים</p>
    {visible.length === 0 && <div className={styles.empty}><p>לא נמצא מושג מתאים.</p><button type="button" className={styles.linkBtn} onClick={() => { setQuery(""); setChapter("all"); setListOnly(false); }}>להציג הכל</button></div>}
    <div className={styles.terms}>{visible.map((t) => {
      const ch = chapterTitle.get(t.chapter)!;
      return <details key={t.id} id={`t-${t.id}`} className={styles.term}>
        <summary>
          <span className={styles.termName}>{t.term}{t.latin && <span className={styles.latin}>{t.latin}</span>}</span>
          <span className={styles.badges}>{t.list && <span className={styles.badgeList} title="מופיע ברשימת המטלה">מטלה</span>}{!t.lecture && <span className={styles.badgeExtra} title="לא הוסבר בהקלטות ההרצאה — ההסבר מן הספרות">השלמה</span>}</span>
        </summary>
        <p>{t.text}</p>
        {t.site && <p className={styles.infoSite}><strong>בארץ:</strong> {t.site}</p>}
        <div className={styles.termFoot}>
          <a href={`#ch-${ch.id}`}>לשרטוט — לוח {ch.numeral} ←</a>
          <button type="button" className={styles.linkBtn} onClick={() => copy(t)}>{copied === t.id ? "הועתק ✓" : "העתקה לתשובה"}</button>
        </div>
      </details>;
    })}</div>
    <Flashcards />
  </section>;
}

const CARDS = ARCH_TERMS.filter((t) => t.list);

function Flashcards() {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [tally, setTally] = useState({ known: 0, again: 0 });
  const card = CARDS[index];
  const next = (knew: boolean) => {
    setTally((t) => (knew ? { ...t, known: t.known + 1 } : { ...t, again: t.again + 1 }));
    let n = Math.floor(Math.random() * CARDS.length);
    if (n === index) n = (n + 1) % CARDS.length;
    setIndex(n);
    setShown(false);
  };
  return <div className={styles.flash} aria-label="כרטיסיות תרגול">
    <h3 className={styles.subTitle}>כרטיסיות — האם אתם יודעים להסביר?</h3>
    <div className={styles.card}>
      <p className={styles.cardTerm}>{card.term}{card.latin && <span className={styles.latin}>{card.latin}</span>}</p>
      {shown ? <>
        <p>{card.text}</p>
        {card.site && <p className={styles.infoSite}><strong>בארץ:</strong> {card.site}</p>}
        <div className={styles.controls}>
          <button type="button" className={styles.action} onClick={() => next(true)}>ידעתי</button>
          <button type="button" className={styles.action} onClick={() => next(false)}>עוד לא</button>
        </div>
      </> : <button type="button" className={styles.action} onClick={() => setShown(true)}>להציג את ההסבר</button>}
    </div>
    <p className={styles.small} role="status">ידעתי: {tally.known} · לחזור: {tally.again} · {CARDS.length} מושגים במטלה</p>
  </div>;
}

export function ClassicalArchitecture() {
  const listCount = ARCH_TERMS.filter((t) => t.list).length;
  return <div className={styles.page} dir="rtl">
    <div className={styles.breadcrumb}><Link href="/timelines">צירי זמן</Link><span aria-hidden> / </span><span>מושגי יסוד באדריכלות קלאסית</span></div>

    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>VITRVVIVS · DE ARCHITECTVRA</p>
        <h1>מושגי יסוד באדריכלות קלאסית</h1>
        <p className={styles.subtitle}>שולחן השרטוט — מהסדר הדורי ועד הגלוסקמה</p>
        <p className={styles.lead}>יחידה 6 בקורס, בשרטוטים שאפשר לגעת בהם: לרחף מעל חלקי עמוד, לבחור איך אמת מים עוברת עמק, להזניק מרכבה בהיפודרום ולהכשיר מקווה. כל מושג מרשימת המטלה — עם אתר בארץ.</p>
        <a className={styles.start} href="#plates">לפתוח את הלוחות <span aria-hidden>↓</span></a>
      </div>
      <div className={styles.heroArt}><HeroArt /></div>
      <div className={styles.stats}>
        <div><strong>{ARCH_CHAPTERS.length}</strong><span>לוחות</span></div>
        <div><strong>{listCount}</strong><span>מושגים מהמטלה</span></div>
        <div><strong>{ARCH_TERMS.length}</strong><span>מושגים במילון</span></div>
        <div><strong>{ARCH_MILESTONES.length}</strong><span>ציוני דרך</span></div>
      </div>
    </header>

    <p className={styles.note}>מבוסס על שלוש הרצאות היחידה &quot;מושגים בסיסיים בארכיאולוגיה והארכיטקטורה של העולם הקלאסי&quot; ועל דף המטלה של בת־ציון זיו. מושגים מן המטלה שלא הוסברו בהקלטות (סקלום, אורנה, מונרה, אקרוטריות, בולאוטריון ובתי הכנסת) מסומנים &quot;השלמה&quot; — כדאי לאמת מול המצגת. לרקע ההיסטורי: <Link href="/timelines/roman">ציר התקופה הרומית</Link> ו<Link href="/timelines/byzantine">ציר התקופה הביזנטית</Link>.</p>

    <nav id="plates" className={styles.plates} aria-label="לוחות">
      {ARCH_CHAPTERS.map((c) => <a key={c.id} href={`#ch-${c.id}`}><span>{c.numeral}</span><b>{c.title}</b><small>{c.short}</small></a>)}
      <a href="#glossary" className={styles.plateIndex}><span>⌕</span><b>מילון</b><small>כל המושגים + כרטיסיות</small></a>
    </nav>

    <Timeline />
    <OrdersLab />
    <TemplesLab />
    <CityLab />
    <RoadsLab />
    <WaterLab />
    <EntertainmentLab />
    <BathsLab />
    <DecorLab />
    <PurityLab />
    <BurialLab />
    <SynagoguesLab />
    <ChurchesLab />
    <Glossary />

    <footer className={styles.footer}><span>אבן דרך למורי דרך · אדריכלות קלאסית</span><a href="#plates">↑ ללוחות</a><Link href="/timelines">לכל צירי הזמן ←</Link></footer>
  </div>;
}
