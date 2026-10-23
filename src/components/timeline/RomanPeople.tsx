"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { COMPARISONS, ERAS, PORTRAITS, ROMAN_PEOPLE, ROLES, SOURCES, filterPeople, portraitUrl, type RomanPerson } from "@/data/roman-people";
import s from "./RomanPeople.module.css";

function Portrait({ person, large = false }: { person: RomanPerson; large?: boolean }) {
  const portrait = PORTRAITS[person.id];
  const [failed, setFailed] = useState(false);
  return <div data-portrait={person.id} className={`${s.portrait} ${large ? s.largePortrait : ""}`}>
    {(!portrait || failed) && <span className={s.monogram} aria-label={`מונוגרמה של ${person.name}`}><span aria-hidden>❧</span><b>{person.latin.split(" ")[0].slice(0, 2)}</b><span aria-hidden>❧</span></span>}
    {portrait && !failed && <a href={portraitUrl(portrait)} target="_blank" rel="noreferrer" aria-label={`הגדלת התמונה של ${person.name}`}><img src={portraitUrl(portrait)} alt={portrait.alt} loading="lazy" width="500" height="660" style={{ objectFit: portrait.fit ?? "cover" }} onError={() => setFailed(true)} /></a> /* eslint-disable-line @next/next/no-img-element */}
    <span className={s.portraitCaption}>{portrait && !failed ? portrait.caption : failed ? "התמונה לא נטענה" : "לא נמצא דיוקן מזוהה"}</span>
  </div>;
}

function EraArtwork({ era }: { era: RomanPerson["era"] }) {
  const index = { conquest: 0, empire: 1, byzantine: 2 }[era];
  return <span className={s.eraArt} data-era-art={era} aria-hidden="true">
    <img src="/moreh-derech/images/roman-people/era-emblems.webp" alt="" width="1536" height="564" style={{ left: `${-index * 100}%` }} />{/* eslint-disable-line @next/next/no-img-element */}
  </span>;
}

function PersonDetail({ person, compact = false }: { person: RomanPerson; compact?: boolean }) {
  const portrait = PORTRAITS[person.id];
  return <article className={`${s.detail} ${compact ? s.compact : ""}`} data-era={person.era} data-person-detail={person.id}>
    <div className={s.detailTop}>
      <div className={s.effigy}><Portrait key={person.id} person={person} large={!compact} />{portrait && <a className={s.imageSource} href={portrait.sourceUrl} target="_blank" rel="noreferrer">מקור התמונה ↗</a>}</div>
      <div className={s.identity}>
        <p className={s.latin} lang="la" dir="ltr">{person.latin}</p>
        <h2>{person.name}</h2>
        <p className={s.role}>{person.role}</p>
        <p className={s.date}>{person.date}</p>
      </div>
    </div>
    <div className={s.detailBody}>
      <section className={s.factPanel}>
      <p className={s.sectionLabel}>הדבר לזכור</p>
      <h3>{person.hook}</h3>
      <p className={s.action}>{person.action}</p>
      </section>
      <section className={s.factPanel}>
      <div className={s.memory}><span aria-hidden>✦</span><div><b>וו לזיכרון</b><p>{person.memory}</p></div></div>
      </section>
      <section className={s.factPanel}>
      <p className={s.trap}><b>שמים לב להבדל</b>{person.trap}</p>
      </section>
      {!compact && <details className={s.more}><summary>עוד הקשר ומקורות <span aria-hidden>＋</span></summary>
        <p>{person.extra}</p>{!portrait && <p>לא נמצא דיוקן מזוהה במקורות שנבדקו. המונוגרמה היא סימן זיכרון בלבד.</p>}{portrait && <p>{portrait.alt}. {portrait.note} <a href={portrait.sourceUrl} target="_blank" rel="noreferrer">מקור</a> · {portrait.credit} · <a href={portrait.licenseUrl} target="_blank" rel="noreferrer">{portrait.license}</a></p>}
        <ul>{person.sources.map(id => <li key={id}>{SOURCES[id].href ? <a href={SOURCES[id].href} target="_blank" rel="noreferrer">{SOURCES[id].title} ↗</a> : SOURCES[id].title}</li>)}</ul>
      </details>}
    </div>
  </article>;
}

function Practice({ people, onEraChange }: { people: RomanPerson[]; onEraChange: (era: RomanPerson["era"]) => void }) {
  const [deck, setDeck] = useState(people);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [missed, setMissed] = useState<RomanPerson[]>([]);
  const [remembered, setRemembered] = useState(0);
  const focus = useRef<HTMLHeadingElement>(null);
  function start(next: RomanPerson[], shuffle = false) {
    const cards = [...next];
    if (shuffle) for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    setDeck(cards); setIndex(0); setRevealed(false); setMissed([]); setRemembered(0);
    if (cards[0]) onEraChange(cards[0].era);
  }
  function answer(knew: boolean) {
    if (knew) setRemembered(n => n + 1); else setMissed(items => [...items, deck[index]]);
    setIndex(n => n + 1); setRevealed(false);
    if (deck[index + 1]) onEraChange(deck[index + 1].era);
    requestAnimationFrame(() => focus.current?.focus());
  }
  if (!people.length) return null;
  if (index >= deck.length) return <section className={s.practice} aria-live="polite">
    <span className={s.bigMark} aria-hidden>❧</span><h2 ref={focus} tabIndex={-1}>הסבב הושלם</h2>
    <p>זכרת {remembered} מתוך {deck.length} דמויות.</p>
    <div className={s.practiceActions}>{missed.length > 0 && <button className={s.primary} onClick={() => start(missed, true)}>חזרה על {missed.length} דמויות לחיזוק</button>}<button onClick={() => start(people, true)}>סבב חדש בערבוב</button></div>
  </section>;
  const person = deck[index];
  const clue = person.id === "tiberius" ? "הורדוס אנטיפס ייסד את טבריה וקרא לעיר על שמו. מי הקיסר?" : person.action;
  return <section className={s.practice} data-era={person.era}>
    <div className={s.practiceMeta}><span>כרטיס {index + 1} מתוך {deck.length}</span><button onClick={() => start(people, true)}>ערבוב והתחלה מחדש ↻</button></div>
    <div className={s.progress} role="progressbar" aria-label="התקדמות בסבב" aria-valuemin={0} aria-valuemax={deck.length} aria-valuenow={index}><span style={{ width: `${index / deck.length * 100}%` }} /></div>
    <p className={s.sectionLabel}>{ERAS.find(era => era.id === person.era)?.label} · {person.date}</p>
    <h2 ref={focus} tabIndex={-1}>מי הדמות — ומה היה התפקיד שלה?</h2>
    <p className={s.clue}>{clue}</p>
    {!revealed ? <button className={s.primary} onClick={() => setRevealed(true)}>לחשוף את התשובה</button> : <div className={s.answer} aria-live="polite">
      <div className={s.answerIdentity}><Portrait key={person.id} person={person} /><div><h3>{person.name}</h3><p>{person.role}</p></div></div>
      <p className={s.memory}>{person.memory}</p><p className={s.trap}>{person.trap}</p>
      <div className={s.practiceActions}><button className={s.primary} onClick={() => answer(true)}>זכרתי ✓</button><button onClick={() => answer(false)}>צריך חיזוק ↻</button></div>
    </div>}
    <p className={s.practiceFoot}>נסה להגיד בקול: שם, תפקיד, פעולה אחת. אחר כך חשוף ובדוק.</p>
  </section>;
}

function subscribeDesktop(callback: () => void) {
  const media = window.matchMedia("(min-width: 980px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function desktopSnapshot() { return window.matchMedia("(min-width: 980px)").matches; }
function serverSnapshot() { return false; }

export function RomanPeople() {
  const [mode, setMode] = useState("timeline");
  const [era, setEra] = useState("all");
  const [role, setRole] = useState("all");
  const [query, setQuery] = useState("");
  const [core, setCore] = useState(false);
  const [selectedId, setSelectedId] = useState("pompey");
  const [pairId, setPairId] = useState(COMPARISONS[0].id);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [practiceEra, setPracticeEra] = useState<RomanPerson["era"] | null>(null);
  const desktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, serverSnapshot);
  const browseVisible = desktop || browseOpen;
  const searchId = useId();
  const roleId = useId();
  const pairSelectId = useId();
  const browseId = useId();
  const detailRef = useRef<HTMLDivElement>(null);
  const people = useMemo(() => filterPeople(query, era, role, core), [query, era, role, core]);
  const selected = people.find(person => person.id === selectedId) ?? people[0];
  const pair = COMPARISONS.find(item => item.id === pairId)!;
  const position = selected ? people.findIndex(person => person.id === selected.id) : -1;
  const visualEra = mode === "practice" ? practiceEra ?? people[0]?.era ?? "conquest" : mode === "compare" ? ROMAN_PEOPLE.find(person => person.id === pair.people[0])!.era : selected?.era ?? "conquest";
  const chapter = ERAS.find(item => item.id === visualEra)!;
  function choose(id: string) {
    setSelectedId(id);
    setBrowseOpen(false);
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  }
  function move(direction: number) { const next = people[position + direction]; if (next) setSelectedId(next.id); }
  function clear() { setQuery(""); setRole("all"); setEra("all"); setCore(false); setBrowseOpen(false); setPracticeEra(null); }
  return <div className={s.page} dir="rtl" data-roman-people data-visual-era={visualEra} data-mode={mode}>
    <div className={s.pageInner}>
    <div className={s.topline}><Link className={s.back} href="/timelines">← לכל צירי הזמן</Link><span className={s.museumLabel} aria-hidden>PERSONAE · ROMA</span></div>
    <header className={s.hero}>
      <div className={s.heroText}><p className={s.eyebrow}><span aria-hidden>SPQR</span> תיק הדמויות · רומא בארץ ישראל</p>
        <h1>מי זה מי <span>ברומא?</span></h1>
        <p className={s.intro}>כל השמות נשמעים אותו דבר?<br />{" "}מחברים לכל דמות <strong>תפקיד, מעשה וּוו לזיכרון.</strong></p>
        <p className={s.range}>מפומפיוס ב־63 לפנה״ס ועד הכיבוש המוסלמי במאה ה־7</p>
        <div className={s.heroMeta}><span><b>{ROMAN_PEOPLE.length}</b> דמויות</span><span><b>3</b> פרקים</span><span><b>{COMPARISONS.length}</b> השוואות</span></div>
      </div>
      <div className={s.chapterSeal}><EraArtwork era={visualEra} /><div><span>{chapter.label}</span><small>{chapter.dates}</small></div></div>
    </header>

    <div className={s.modes} aria-label="מצבי לימוד">{[["timeline", "01", "להכיר את הדמויות"], ["compare", "02", "להבדיל בין שמות"], ["practice", "03", "לבדוק מה זכרתי"]].map(([id, number, label]) => <button key={id} aria-pressed={mode === id} onClick={() => { setMode(id); setPracticeEra(null); }}><span>{number}</span>{label}</button>)}</div>

    {mode !== "compare" && <>
      <div className={s.eras} aria-label="סינון לפי תקופה"><button className={s.allEras} aria-pressed={era === "all"} onClick={() => { setEra("all"); setPracticeEra(null); }}>כל<br /><b>התקופות</b></button>{ERAS.map(item => <button key={item.id} data-era={item.id} aria-pressed={era === item.id} onClick={() => { setEra(item.id); setPracticeEra(null); }}><EraArtwork era={item.id} /><div><b>{item.label}</b><small>{item.dates}</small></div></button>)}</div>
      <div className={s.filters}>
        <div className={s.search}><label htmlFor={searchId}>חיפוש דמות, אירוע או מקום</label><input id={searchId} type="search" placeholder="למשל: גליל, פילטוס, אוקטביאנוס…" value={query} onChange={event => { setQuery(event.target.value); setPracticeEra(null); setBrowseOpen(Boolean(event.target.value)); }} /></div>
        <div><label htmlFor={roleId}>תפקיד</label><select id={roleId} value={role} onChange={event => { setRole(event.target.value); setPracticeEra(null); }}><option value="all">כל התפקידים</option>{Object.entries(ROLES).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></div>
        <label className={s.coreToggle}><input type="checkbox" checked={core} onChange={event => { setCore(event.target.checked); setPracticeEra(null); }} />רק דמויות הליבה</label>
      </div>
      <div className={s.resultLine}><span role="status">{people.length} דמויות{core ? " · מסלול ליבה" : " · כולל דמויות להשלמת הרצף"}</span>{(query || era !== "all" || role !== "all" || core) && <button onClick={clear}>ניקוי הסינון ×</button>}</div>
    </>}

    {mode === "compare" ? <section className={s.comparison}>
      <div className={s.compareHeading}><div><p className={s.sectionLabel}>שני שמות. הבדל אחד לזכור.</p><h2>מי מתבלבל עם מי?</h2></div><div><label htmlFor={pairSelectId}>בחר זוג להשוואה</label><select id={pairSelectId} value={pairId} onChange={event => setPairId(event.target.value)}>{COMPARISONS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div></div>
      <div className={s.compareRule}><span aria-hidden>↔</span><p>{pair.rule}</p></div>
      <div className={s.compareGrid}>{pair.people.map(id => <PersonDetail key={id} person={ROMAN_PEOPLE.find(person => person.id === id)!} compact />)}</div>
    </section> : !people.length ? <div className={s.empty}><h2>לא נמצאו דמויות מתאימות</h2><button onClick={clear}>להציג את כולן</button></div> : mode === "practice" ? <Practice key={`${query}-${era}-${role}-${core}`} people={people} onEraChange={setPracticeEra} /> : <section className={s.atlas} aria-label="ציר הדמויות">
      <div className={s.navigator}><button className={s.stepButton} aria-label="הדמות הקודמת" disabled={position <= 0} onClick={() => move(-1)}><span aria-hidden>→</span><span>הקודמת</span></button><span className={s.position}>{position + 1} / {people.length}</span><button className={s.browseToggle} aria-expanded={browseVisible} aria-controls={browseId} onClick={() => setBrowseOpen(open => !open)}><span>{position + 1} / {people.length}</span>בחירת דמות <span aria-hidden>{browseVisible ? "−" : "+"}</span></button><button className={s.stepButton} aria-label="הדמות הבאה" disabled={position >= people.length - 1} onClick={() => move(1)}><span>הבאה</span><span aria-hidden>←</span></button></div>
      <div className={s.timeline} id={browseId} hidden={!browseVisible}><div className={s.timelineHeading}><h2>רצף הדמויות</h2><span>בוחרים שם ומגלים את הסיפור</span></div><p className={s.timelineNote}>{query.trim() ? "בחיפוש, התאמות לשם מופיעות לפני אזכורים בתוכן." : "מסודר לפי האירוע המוצג, לא לפי שנות כהונה. כמה תפקידים פועלים במקביל."}</p>
        <div className={s.timelineList}>{ERAS.map(item => { const group = people.filter(person => person.era === item.id); return group.length ? <div key={item.id} data-era={item.id}><h3 className={s.groupTitle}><span>{item.mark}</span>{item.label}</h3><ol>{group.map(person => <li key={person.id}><button data-person-button={person.id} aria-pressed={selected?.id === person.id} onClick={() => choose(person.id)}><span className={s.timelineDot} aria-hidden /><span className={s.timelineEntry}><span className={s.entryDate}>{person.date}</span><span className={s.entryName}>{person.name}<span className={s.entryRole}>{person.roles.map(id => ROLES[id].symbol).join(" ")}</span></span><span className={s.entryHook}>{person.hook}</span></span><span className={s.entryArrow} aria-hidden>←</span></button></li>)}</ol></div> : null; })}</div>
      </div>
      <div ref={detailRef} className={s.detailColumn} aria-live="polite" tabIndex={0} aria-label="הדמות הנבחרת. חץ שמאלה לדמות הבאה, חץ ימינה לקודמת" onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowLeft") { event.preventDefault(); move(1); } if (event.key === "ArrowRight") { event.preventDefault(); move(-1); } }}>{selected && <PersonDetail key={selected.id} person={selected} />}<div className={s.studyTip}><b>שיטת שלוש המילים</b><p>קרא את השם, אמור את התפקיד, הוסף מעשה אחד. רק אז המשך לדמות הבאה.</p></div></div>
    </section>}

    <section className={s.roleGuide}><h2>לפני שזוכרים שם, מבינים תפקיד</h2><div>{Object.entries(ROLES).map(([id, item]) => <article key={id}><span aria-hidden>{item.symbol}</span><h3>{item.label}</h3><p>{item.description}</p></article>)}</div><details><summary>ואיפה הורדוס, אנטיפס ואגריפס?</summary><p>הורדוס הגדול ואגריפס הראשון היו מלכי חסות מקומיים תחת רומא. אנטיפס היה טטררך בגליל ובעבר הירדן. הם חלק מהסיפור, בתפקיד נפרד מהקיסר ומן הנציב. אוגוסטוס מאשר את הורדוס; אנטיפס בונה את טבריה על שם טיבריוס; קלאודיוס מעניק לאגריפס את יהודה ב־41.</p></details></section>
    <footer className={s.footer}><p>הבסיס: הקלטות מחברות בית שני והתקופה הרומית־ביזנטית. התאריכים בכרטיסים מציינים את האירוע או התקופה הנדונים. טיפי הזיכרון הם אסוציאציות ללמידה.</p>
      <details><summary>מקורות, השלמות וקרדיט לתמונות</summary><p>השלמות חיצוניות ממוקדות מסומנות במקורות הדמות: טיבריוס וטבריה, תיקון קלאודיוס, נירון והרקליוס. דמויות המוזכרות בשיעור רק להשלמת הרצף מסומנות כדמויות נוספות וניתנות להסתרה במסלול הליבה.</p><ul>{Object.entries(SOURCES).map(([id, source]) => <li key={id}>{source.href ? <a href={source.href} target="_blank" rel="noreferrer">{source.title} ↗</a> : <b>{source.title}</b>} — {source.detail}</li>)}</ul><h3>דיוקנאות באמנות</h3><p>35 תמונות של פסלים, מטבעות, פסיפסים וציורים. לחיצה על תמונה פותחת אותה להגדלה. יצירות מאוחרות וייחוסים מסופקים מסומנים; אין לראות בהם תיעוד ודאי של מראה הדמות. התמונות הוקטנו והומרו ל־WebP, והמסגרת עשויה לחתוך את התצוגה. לכל תמונה נשמר הרישיון המקורי. לפלורוס לא נמצא דיוקן מזוהה במקורות שנבדקו.</p><ul>{Object.entries(PORTRAITS).map(([id, portrait]) => <li key={id}><a href={portrait.sourceUrl} target="_blank" rel="noreferrer">{ROMAN_PEOPLE.find(person => person.id === id)?.name} · {portrait.alt}</a> — {portrait.credit} · <a href={portrait.licenseUrl} target="_blank" rel="noreferrer">{portrait.license}</a></li>)}</ul><p>איורי הקסדות, החרבות והצלב נוצרו לצורכי עיצוב בעזרת בינה מלאכותית; הם איורים סמליים, ולא תיעוד של ממצא מסוים.</p></details>
      <div className={s.related}><Link href="/timelines/second-temple">ציר בית שני ←</Link><Link href="/timelines/roman">הציר הרומי המלא ←</Link><Link href="/timelines/byzantine">הציר הביזנטי המלא ←</Link></div>
    </footer>
    </div>
  </div>;
}
