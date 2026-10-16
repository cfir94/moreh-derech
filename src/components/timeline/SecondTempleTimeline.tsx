"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { SECOND_TEMPLE as research, TEMPLE_EVENTS, TEMPLE_PERIODS, matchesTempleQuery, type TempleEvent } from "@/data/second-temple";
import styles from "./SecondTempleTimeline.module.css";

type View = "timeline" | "people" | "sites" | "processes" | "sources";
const views: { id: View; title: string; count?: number }[] = [
  { id: "timeline", title: "ציר הזמן", count: TEMPLE_EVENTS.length },
  { id: "people", title: "אנשי התקופה", count: research.people.length },
  { id: "sites", title: "אתרים וממצאים", count: research.sites.length },
  { id: "processes", title: "התמונה הרחבה", count: research.processes.length },
  { id: "sources", title: "מקורות ודיוק" },
];
const categories = [
  { id: "all", title: "כל הנושאים", pattern: null },
  { id: "conflict", title: "מלחמות ומרידות", pattern: /קרב|מרד|מצור|מלחמה|חורבן|דיכוי|הגליה/ },
  { id: "rule", title: "שלטון והנהגה", pattern: /שלטון|מינוי|מלכות|מנהיגות|כהונה|ירושה/ },
  { id: "building", title: "בנייה ומקדש", pattern: /בנייה|בניית|מקדש|מזבח|חומה|ארמון|נמל|ריצוף/ },
  { id: "society", title: "עלייה, דת וחברה", pattern: /עלייה|שיבה|דת|חברה|תרגום|פולחן|רפורמ/ },
];
const eventById = new Map(TEMPLE_EVENTS.map((event) => [event.id, event]));

function revealEvent(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const details = target.querySelector("details");
  if (details) details.open = true;
  target.scrollIntoView({ block: "start" });
  target.focus({ preventScroll: true });
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className={styles.field}><h4>{label}</h4><div>{children}</div></div>;
}

function EventLinks({ text, onJump }: { text: string; onJump: (id: string) => void }) {
  const ids = [...new Set(text.match(/ST-\d{3}/g) ?? [])].filter((id) => eventById.has(id));
  if (!ids.length) return null;
  return <div className={styles.related}>{ids.map((id) => <a key={id} href={`#${id}`} onClick={(event) => { event.preventDefault(); onJump(id); }}>{eventById.get(id)!.title}<span aria-hidden> ←</span></a>)}</div>;
}

function EventCard({ event, onJump }: { event: TempleEvent; onJump: (id: string) => void }) {
  return <article id={event.id} tabIndex={-1} className={`${styles.event} ${event.anchor ? styles.anchorEvent : ""}`}>
    <span className={styles.eventDot} aria-hidden />
    <details>
      <summary className={styles.eventSummary}>
        <span className={styles.eventTop}><span className={styles.date}>{event.date}</span><span className={styles.kind}>{event.kind}</span></span>
        <h3 className={styles.eventTitle}>{event.title}<span className={styles.plus} aria-hidden>＋</span></h3>
        <span className={styles.summaryText}>{event.summary}</span>
        {event.warning && <span className={styles.warning}><strong>דיוק במקור:</strong> {event.warning}</span>}
      </summary>
      <div className={styles.eventBody}>
        <p className={styles.bodyLead}>{event.body}</p>
        <div className={styles.takeaway}><span>נקודה לדרך</span><p>{event.takeaway}</p></div>
        <div className={styles.fieldGrid}>
          <Field label="מה הוביל לאירוע?">{event.causes}</Field>
          <Field label="מה השתנה בעקבותיו?">{event.consequences}</Field>
          <Field label="אנשים וסמכויות">{event.people}<p className={styles.muted}>{event.rule}</p></Field>
          <Field label="בשטח">{event.places}<p className={styles.muted}>{event.archaeology}</p></Field>
        </div>
        <div className={styles.caution}><strong>תיארוך והסתייגויות</strong><p>{event.precision}. {event.caution}</p></div>
        <EventLinks text={event.connections ?? ""} onJump={onJump} />
        <footer className={styles.eventSource}><span>מקור ומילות איתור</span><p dir="auto">{event.source}</p><a href={`#${event.id}`}>קישור ישיר לאירוע</a></footer>
      </div>
    </details>
  </article>;
}

export function SecondTempleTimeline() {
  const [view, setView] = useState<View>("timeline");
  const [period, setPeriod] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [anchorsOnly, setAnchorsOnly] = useState(false);
  const selectedCategory = categories.find((entry) => entry.id === category)!;
  const visibleEvents = TEMPLE_EVENTS.filter((event) =>
    (period === "all" || event.period === period) &&
    (!anchorsOnly || event.anchor) &&
    (!selectedCategory.pattern || selectedCategory.pattern.test(`${event.kind} ${event.title}`)) &&
    matchesTempleQuery(Object.values(event).join(" "), query));
  const search = (value: unknown) => matchesTempleQuery(JSON.stringify(value), query);

  useEffect(() => {
    const revealCurrent = () => {
      const id = window.location.hash.slice(1);
      if (/^ST-\d{3}$/.test(id)) revealEvent(id);
    };
    const onHash = () => {
      if (!eventById.has(window.location.hash.slice(1))) return;
      setView("timeline"); setPeriod("all"); setCategory("all"); setQuery(""); setAnchorsOnly(false);
      window.setTimeout(revealCurrent, 0);
    };
    revealCurrent();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function jump(id: string) {
    setView("timeline"); setPeriod("all"); setCategory("all"); setQuery(""); setAnchorsOnly(false);
    window.setTimeout(() => { window.location.hash = id; revealEvent(id); }, 0);
  }

  function reset() { setQuery(""); setPeriod("all"); setCategory("all"); setAnchorsOnly(false); }

  return <div className={styles.page} dir="rtl">
    <div className={styles.breadcrumb}><Link href="/timelines">צירי זמן</Link><span aria-hidden> / </span><span>בית שני</span></div>
    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><span aria-hidden>◆</span> אבן דרך · מסע בזמן</p>
        <h1>בית שני</h1>
        <p className={styles.heroSubtitle}>מן השיבה אל החורבן</p>
        <p className={styles.heroDescription}>עליות וממלכות, אנשים ומאבקים, אבנים שסיפרו היסטוריה. מסע בעקבות התקופה שעיצבה את ירושלים ואת הארץ.</p>
        <a className={styles.start} href="#temple-content">לצאת לדרך <span aria-hidden>↓</span></a>
      </div>
      <div className={styles.heroArt} aria-hidden>
        <svg viewBox="0 0 450 310" fill="none"><circle cx="230" cy="130" r="112" stroke="currentColor" strokeOpacity=".16"/><circle cx="230" cy="130" r="130" stroke="currentColor" strokeOpacity=".08"/><path d="M40 280h370M60 268h330M80 256h290M100 244h250M118 232h215M118 224V103h215v121M107 103h237V88H107zM119 82h213l-16-15H135z" stroke="currentColor" strokeWidth="2"/><path d="M178 224V140h95v84M188 224v-74h75v74M202 224v-64h47v64M215 224v-54h21v54" stroke="currentColor" strokeOpacity=".6"/><path d="M133 120h28v104h-28zM290 120h28v104h-28zM126 114h41M284 114h40M126 229h41M284 229h40M147 125v92M304 125v92M119 181h50M283 181h49M119 153h50M283 153h49" stroke="currentColor"/><path d="M225 40l4 7-4 7-4-7zM88 167l4 7-4 7-4-7zM368 149l3 6-3 6-3-6z" stroke="currentColor" strokeOpacity=".55"/><path d="M36 294h380" stroke="currentColor" strokeDasharray="2 6"/></svg>
        <span>שיבה · מקדש · ממלכה · מרד</span>
      </div>
      <div className={styles.heroStats}>
        <div><strong>{TEMPLE_EVENTS.length}</strong><span>אירועים ותהליכים מתוארכים</span></div>
        <div><strong>{research.people.length}</strong><span>ערכים במפתח הדמויות</span></div>
        <div><strong>{research.sites.length}</strong><span>אתרים וממצאים</span></div>
        <div><strong>{research.sources.length}</strong><span>מקורות בחומר הקורס</span></div>
      </div>
    </header>

    <div className={styles.introNote}><span aria-hidden>◈</span><p>עיקר הציר עוסק בשיבת ציון ועד חורבן שנת 70. הרקע הקדום ואחרית המרד מוצגים בפרקים נפרדים. התאריכים הם לפי חומר הקורס; כשיש קירוב או קושי במקור, הם מסומנים לצד האירוע.</p></div>

    <section id="temple-content" className={styles.workspace} aria-label="עיון בתקופת בית שני">
      <nav className={styles.viewNav} aria-label="תצוגות בית שני">{views.map((item) => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => { setView(item.id); setQuery(""); }}><span>{item.title}</span>{item.count !== undefined && <small>{item.count}</small>}</button>)}</nav>
      <div className={styles.searchRow}>
        <label className={styles.search}><span aria-hidden>⌕</span><span className={styles.srOnly}>חיפוש בתצוגה הנוכחית</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={view === "timeline" ? "לחפש אירוע, דמות, מקום או שנה…" : "לחפש בתצוגה הנוכחית…"} /></label>
        {view === "timeline" && <label className={styles.checkbox}><input type="checkbox" checked={anchorsOnly} onChange={(event) => setAnchorsOnly(event.target.checked)} />אירועי מפתח בלבד</label>}
      </div>

      {view === "timeline" && <div className={styles.timelineLayout}>
        <aside className={styles.periodNav} aria-label="סינון לפי תקופה">
          <p>פרקי המסע</p>
          <button type="button" aria-pressed={period === "all"} onClick={() => setPeriod("all")}><span className={styles.periodMark}>◈</span><span>המסע המלא<small>כל התקופות</small></span></button>
          {TEMPLE_PERIODS.map((entry, index) => <button key={entry.id} type="button" aria-pressed={period === entry.id} onClick={() => setPeriod(entry.id)} style={{ "--period-color": entry.color } as CSSProperties}><span className={styles.periodMark}>{String(index + 1).padStart(2, "0")}</span><span>{entry.title}<small>{entry.range}</small></span></button>)}
        </aside>
        <div className={styles.timelineMain}>
          <div className={styles.filters}><label>נושא<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}</select></label><p role="status">{visibleEvents.length} מתוך {TEMPLE_EVENTS.length} אירועים</p>{(query || period !== "all" || category !== "all" || anchorsOnly) && <button type="button" onClick={reset}>ניקוי סינון</button>}</div>
          <p className={styles.scaleNote}>הרצף מוצג לפי פרקי התקופה. המרווחים בין הכרטיסים אינם מייצגים משך זמן; טווחים ותהליכים עשויים לחפוף.</p>
          {visibleEvents.length === 0 && <div className={styles.empty}><h2>לא נמצאו אירועים מתאימים</h2><p>אפשר לשנות את החיפוש או להרחיב את התקופה.</p><button type="button" onClick={reset}>להציג את כל האירועים</button></div>}
          {TEMPLE_PERIODS.map((entry, index) => {
            const events = visibleEvents.filter((event) => event.period === entry.id);
            if (!events.length) return null;
            return <section key={entry.id} className={styles.periodSection} style={{ "--period-color": entry.color } as CSSProperties} aria-labelledby={`period-${entry.id}`}>
              <header className={styles.periodHeading}><span className={styles.chapterNumber}>{String(index + 1).padStart(2, "0")}</span><div><p>{entry.range}</p><h2 id={`period-${entry.id}`}>{entry.title}</h2><span>{entry.note}</span></div><small>{events.length} אירועים</small></header>
              <div className={styles.eventRail}>{events.map((event) => <EventCard key={event.id} event={event} onJump={jump} />)}</div>
            </section>;
          })}
        </div>
      </div>}

      {view === "people" && <div className={styles.secondary}>
        <header className={styles.sectionIntro}><p>מי פעל, מי ירש, ומי פעל במקביל?</p><h2>אנשי התקופה</h2><span>שנות הפעילות בחומר אינן בהכרח שנות חיים. חלק מהערכים כוללים קבוצת דמויות.</span></header>
        <details className={styles.wideDetail}><summary>רצפי ההנהגה והסמכויות המקבילות</summary>{research.successions.map((text, index) => <p key={index}>{text}</p>)}</details>
        <div className={styles.directory}>{research.people.filter(search).map((person) => <article key={person.id} className={styles.directoryCard}>
          <div className={styles.cardId}>{person.id}{person.mentionOnly && <span>אזכור בלבד · חסר פירוט</span>}</div><h3>{person.name}</h3><p className={styles.role}>{person.role}</p><p>{person.relationships}</p><p>{person.summary}</p><EventLinks text={person.summary} onJump={jump} /><p className={styles.sourceLine}>מקור: {person.source}</p>
        </article>)}</div>
        {!research.people.filter(search).length && <p className={styles.empty} role="status">לא נמצאו דמויות התואמות לחיפוש.</p>}
      </div>}

      {view === "sites" && <div className={styles.secondary}>
        <header className={styles.sectionIntro}><p>מהסיפור אל השטח</p><h2>אתרים וממצאים</h2><span>ממצא יכול לתמוך בחלק מן הסיפור. זיהוי מסורתי, שחזור מודרני וממצא מתוארך אינם אותה ראיה.</span></header>
        <div className={styles.directory}>{research.sites.filter(search).map((site) => <article key={site.id} className={styles.directoryCard}><span className={styles.cardId}>{site.id}</span><h3>{site.name}</h3><p>{site.context}</p><p className={styles.siteCaution}>{site.caution}</p><EventLinks text={site.context} onJump={jump} /><p className={styles.sourceLine}>מקור ואיתור: {site.source}</p></article>)}</div>
        {!research.sites.filter(search).length && <p className={styles.empty} role="status">לא נמצאו אתרים התואמים לחיפוש.</p>}
      </div>}

      {view === "processes" && <div className={styles.secondary}>
        <header className={styles.sectionIntro}><p>החוטים שמחברים את האירועים</p><h2>התמונה הרחבה</h2><span>תהליכים נמשכים לאורך זמן וחוצים חילופי שלטון. הם אינם נקודה אחת על הציר.</span></header>
        <div className={styles.processList}>{research.processes.filter(search).map((process) => <article key={process.id} className={styles.processCard}><span className={styles.cardId}>{process.id}</span><h3>{process.title}</h3>{process.paragraphs.map((paragraph, index) => <p key={index}>{paragraph.replace(/^\* /, "")}</p>)}{process.table.length > 0 && <div className={styles.tableWrap}><table><caption>השוואת הקבוצות לפי עמדת ההרצאה בלבד</caption><thead><tr>{process.table[0].map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr></thead><tbody>{process.table.slice(1).map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>}<EventLinks text={process.paragraphs.join(" ")} onJump={jump} /></article>)}</div>
        {!research.processes.filter(search).length && <p className={styles.empty} role="status">לא נמצאו תהליכים התואמים לחיפוש.</p>}
      </div>}

      {view === "sources" && <div className={styles.secondary}>
        <header className={styles.sectionIntro}><p>לקרוא את הסיפור, וגם את המקור</p><h2>מקורות ודיוק</h2><span>הציר מבוסס על תיק המחקר שנאסף מהמחברת ב־15.10.2026. לא בוצע כאן אימות היסטורי חיצוני.</span></header>
        <div className={styles.method}><h3>איך לקרוא את ההפניות?</h3><p>בכל אירוע מופיעים שם קובץ ומילות איתור בתמלול. במחקר לא היו חותמות זמן, עמודים או קישורי קטע יציבים, ולכן הקישור להלן פותח את המחברת כולה. התמלולים נבדקו במחקר; האודיו עצמו לא הושמע.</p><p>״מדויק לפי המקור״ מציין שנה שנמסרה בחומר, ולא הסכמה מחקרית. הסיכום הוא מקור נגזר; דף המטלה מציין מה ללמוד ואינו מספק כשלעצמו תשובות.</p><a href={research.notebookUrl} target="_blank" rel="noopener noreferrer">למחברת תקופת הבית השני ↗</a></div>
        <h3 className={styles.subheading}>שמונת מקורות המחברת</h3>
        <div className={styles.directory}>{research.sources.filter(search).map((source) => <article key={source.id} className={styles.directoryCard}><span className={styles.cardId}>{source.id}</span><h4 dir="auto">{source.title}</h4><p>{source.type}</p><p>{source.coverage}</p></article>)}</div>
        <h3 className={styles.subheading}>מה עדיין חסר?</h3>
        <div className={styles.gapNotice}><strong>יוחנן בן זכאי וההמשכיות לאחר החורבן · ST-086</strong><p>רשומת יעד לימוד בלבד. דף המטלה אינו מפרט את מעשיו, ולכן אין בציר אירוע היסטורי מלא או סיפור על יבנה המבוסס על אזכור זה.</p></div>
        {research.gaps.filter(search).map((gap) => <details key={gap.id} className={styles.wideDetail}><summary>{gap.topic}<small>{gap.id}</small></summary><p>{gap.coverage}</p><p>{gap.guidance}</p></details>)}
        <h3 className={styles.subheading}>מחלוקות ובקרת התוכן</h3>
        {research.issues.filter(search).map((issue) => <details key={issue.id} className={styles.wideDetail}><summary>{issue.topic}<small>{issue.id}</small></summary><p>{issue.decision}</p><p className={styles.sourceLine}>מקור ואיתור: {issue.source}</p></details>)}
      </div>}
    </section>
    <footer className={styles.pageFooter}><span>אבן דרך למורי דרך · תקופת בית שני</span><Link href="/timelines">לכל צירי הזמן ←</Link></footer>
  </div>;
}
