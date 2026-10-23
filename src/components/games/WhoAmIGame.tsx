"use client";

import { useEffect, useRef, useState } from "react";
import { BOOKS, PEOPLE, PERIODS, type PeriodId, type BookId } from "@/data/who-am-i";
import { acceptsName, createRound, filterPool, score, type Answer, type AnswerMode, type Question } from "@/lib/whoAmI";
import styles from "./WhoAmIGame.module.css";

type Session = { questions: Question[]; index: number; answers: Answer[]; finished: boolean };
const allPeriods = PERIODS.map(period => period.id);
const byId = new Map(PEOPLE.map(person => [person.id, person]));
const answerLetters = ["א", "ב", "ג", "ד"];

export function WhoAmIGame() {
  const [selected, setSelected] = useState<PeriodId[]>(allPeriods);
  const [selectedBooks, setSelectedBooks] = useState<BookId[]>(BOOKS.map(book => book.id));
  const [length, setLength] = useState(10);
  const [mode, setMode] = useState<AnswerMode>("mixed");
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState("");
  const [hint, setHint] = useState(false);
  const [query, setQuery] = useState("");
  const questionRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLHeadingElement>(null);
  const pool = filterPool(PEOPLE, selected, selectedBooks);
  const question = session?.questions[session.index];
  const person = question ? byId.get(question.id)! : null;
  const answer = session?.answers[session.index];
  const stats = score(session?.answers ?? []);

  useEffect(() => {
    if (!session) return;
    if (session.finished) questionRef.current?.focus();
    else if (answer) feedbackRef.current?.focus();
    else questionRef.current?.focus();
  }, [session?.index, session?.finished, answer, session]);

  function start(reviewIds?: string[]) {
    const candidates = reviewIds ? PEOPLE.filter(person => reviewIds.includes(person.id)) : pool;
    const questions = createRound(candidates, reviewIds ? candidates.length : Math.min(length || candidates.length, candidates.length), mode, Math.random, pool);
    if (!questions.length) return;
    setInput(""); setHint(false);
    setSession({ questions, index: 0, answers: [], finished: false });
  }
  function submit(given: string, choice?: string) {
    if (!question || !person || answer) return;
    const correct = choice ? choice === person.id : acceptsName(person, given, PEOPLE);
    setSession(current => {
      if (!current || current.finished || current.answers[current.index]) return current;
      return { ...current, answers: [...current.answers, { id: person.id, correct, given, hinted: hint }] };
    });
  }
  function next() {
    setInput(""); setHint(false);
    setSession(current => current ? current.index + 1 === current.questions.length
      ? { ...current, finished: true }
      : { ...current, index: current.index + 1 } : null);
  }
  function toggle(period: PeriodId) {
    setSelected(current => current.includes(period) ? current.filter(id => id !== period) : [...current, period]);
  }

  const missed = session?.answers.filter(answer => !answer.correct).map(answer => answer.id) ?? [];
  const activePeriods = person ? PERIODS.filter(period => person.periods.includes(period.id) && selected.includes(period.id)) : [];

  return <section className={styles.game} data-who-am-i data-period={person?.periods[0] ?? "all"} dir="rtl">
    {!session && <>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>קולות מן העבר · משחק זיהוי</span>
          <h1>מי אני<span>?</span></h1>
          <p className={styles.lead}>המעשה מוכר.<br />אבל מי עומד מאחוריו?</p>
          <p>מלכים, מורדים, נביאים, חכמים ושליחים מספרים על עצמם.<br />קוראים את הרמז, בוחרים או מקלידים — וחושפים את הפנים שמאחורי השם.</p>
          <div className={styles.heroMeta}><span>{PEOPLE.length} דמויות</span><span>{BOOKS.length} מחברות</span><span>היסטוריה · יהדות · נצרות</span></div>
        </div>
        <div className={styles.art} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/moreh-derech/images/roman-people/portraits/titus.webp" alt="" />
          <span className={styles.seal}>מי<br />אני?</span>
          <span className={styles.artLabel}>הסיפור מתחיל ברמז אחד</span>
        </div>
      </header>

      <div className={styles.setup}>
        <div className={styles.sectionTitle}><span>01</span><h2>מה נרצה לתרגל?</h2>
          <button type="button" className={styles.textButton} onClick={() => setSelected(selected.length === allPeriods.length ? [] : allPeriods)}>
            {selected.length === allPeriods.length ? "ניקוי הבחירה" : "כל התחומים"}
          </button>
        </div>
        <p className={styles.muted}>אפשר לבחור תקופה, לימודי דת או שילוב ביניהם. בכל תחום אפשר להתמקד במחברות מסוימות.</p>
        <div className={styles.periodGrid} role="group" aria-label="בחירת תקופות">
          {PERIODS.filter(period => !["judaism", "christianity"].includes(period.id)).map(period => <button key={period.id} type="button" aria-pressed={selected.includes(period.id)}
            className={styles.periodCard} data-period={period.id} onClick={() => toggle(period.id)}>
            <span className={styles.periodIcon} aria-hidden="true">{period.icon}</span>
            <strong>{period.label}</strong><small>{period.dates}</small>
            <span className={styles.cardBottom}>{PEOPLE.filter(person => person.periods.includes(period.id)).length} דמויות <b aria-hidden="true">{selected.includes(period.id) ? "✓" : "+"}</b></span>
          </button>)}
        </div>
        <h3 className={styles.faithTitle}>אמונה, מסורת והדמויות שמאחוריהן</h3>
        <div className={styles.faithGrid} role="group" aria-label="לימודי יהדות ונצרות">{PERIODS.filter(period => ["judaism", "christianity"].includes(period.id)).map(period => <button key={period.id} type="button" aria-pressed={selected.includes(period.id)}
            className={styles.periodCard} data-period={period.id} onClick={() => toggle(period.id)}>
            <span className={styles.periodIcon} aria-hidden="true">{period.icon}</span>
            <strong>{period.label}</strong><small>{period.dates}</small>
            <span className={styles.cardBottom}>{PEOPLE.filter(person => person.periods.includes(period.id)).length} דמויות <b aria-hidden="true">{selected.includes(period.id) ? "✓" : "+"}</b></span>
          </button>)}</div>
        <details className={styles.bookFilter}>
          <summary>התמקדות לפי מחברת <span>{BOOKS.filter(book => book.periods.some(id => selected.includes(id)) && selectedBooks.includes(book.id)).length} נבחרו</span></summary>
          <div role="group" aria-label="בחירת מחברות">{BOOKS.filter(book => book.periods.some(id => selected.includes(id))).map(book =>
            <button type="button" key={book.id} aria-pressed={selectedBooks.includes(book.id)} onClick={() => setSelectedBooks(current => current.includes(book.id) ? current.filter(id => id !== book.id) : [...current, book.id])}>{book.label}<span aria-hidden="true">{selectedBooks.includes(book.id) ? " ✓" : " +"}</span></button>)}</div>
        </details>
        <p className={styles.bookNote}>רומא וביזנטיון הן שתי תקופות מתוך אותה מחברת. דמות שמופיעה בכמה מחברות תישאל פעם אחת בסבב.</p>
        <div className={styles.options}>
          <fieldset><legend>02 · איך נענה?</legend>
            <div className={styles.segmented}>{([["mixed", "הפתעה בכל שאלה"], ["choice", "אמריקאי"], ["typed", "הקלדת שם"]] as const).map(([value, label]) =>
              <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}>{label}</button>)}</div>
            <small>במצב המעורב שני סוגי השאלות מתחלפים בסדר אקראי.</small>
          </fieldset>
          <fieldset><legend>03 · אורך הסבב</legend>
            <div className={styles.segmented}>{[[10, "10 שאלות"], [20, "20 שאלות"], [0, "כל הדמויות"]].map(([value, label]) =>
              <button key={value} type="button" aria-pressed={length === value} onClick={() => setLength(Number(value))}>{label}</button>)}</div>
          </fieldset>
        </div>
        <div className={styles.launch}>
          <div><strong>{pool.length} דמויות בבחירה שלך</strong><small>{pool.length ? Math.min(length || pool.length, pool.length) + " שאלות בסבב · ללא הגבלת זמן" : "יש לבחור תחום ומחברת אחת לפחות"}</small></div>
          <button className={styles.primary} disabled={!pool.length} onClick={() => start()}>מתחילים לגלות <span aria-hidden="true">←</span></button>
        </div>
      </div>
      <details className={styles.catalog}>
        <summary>הדמויות והמחברות שמאחורי המשחק <span>{PEOPLE.length} דמויות</span></summary>
        <p>הרמזים מבוססים על שיעורי הקורס בעשר מחברות המקור. הם ניסוחים לימודיים בגוף ראשון, ואינם ציטוטים היסטוריים. סיפורים מקראיים ומסורות דתיות מסומנים בהתאם; ייצוג אמנותי מאוחר אינו עדות למראה האמיתי של הדמות.</p>
        <label className={styles.catalogSearch}>חיפוש דמות<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="שם, כינוי או מעשה…" /></label>
        {BOOKS.map(book => {
          const people = PEOPLE.filter(person => person.books.includes(book.id) && [person.name, ...person.aliases, ...person.clues].join(" ").includes(query.trim()));
          return <div key={book.id} className={styles.book}><h3>{book.label} <small>({people.length})</small></h3>
            <a href={book.href} target="_blank" rel="noreferrer">למחברת המקור ↗</a>
            <div className={styles.nameList}>{people.map(person => <span key={person.id}>{person.name}</span>)}</div>
          </div>;
        })}
      </details>
    </>}

    {session && !session.finished && question && person && <>
      <header className={styles.gameBar}>
        <button className={styles.textButton} onClick={() => setSession(null)}>← לבחירת תחומים</button>
        <span>שאלה <b>{session.index + 1}</b> מתוך {session.questions.length}</span>
        <span className={styles.score}>{stats.correct} נכונות <span aria-hidden="true">✦</span> רצף {stats.streak}</span>
      </header>
      <div className={styles.progress} role="progressbar" aria-label="התקדמות בסבב" aria-valuenow={session.answers.length} aria-valuemin={0} aria-valuemax={session.questions.length}>
        <span style={{ width: (session.answers.length / session.questions.length * 100) + "%" }} />
      </div>
      <div className={styles.questionLayout}>
        <div className={styles.mystery}>
          <div className={styles.questionMeta}><span>{activePeriods.map(period => period.label).join(" · ")}</span><span>{question.mode === "choice" ? "בחירה אמריקאית" : "הקלדת שם"}</span></div>
          <span className={styles.bigQuote} aria-hidden="true">״</span>
          <h2 ref={questionRef} tabIndex={-1} className={styles.clue} data-clue>{question.clue}</h2>
          <p className={styles.notQuote}>רמז לימודי בגוף ראשון · אינו ציטוט היסטורי</p>
          {!answer && <>
            {question.mode === "choice"
              ? <div className={styles.choices} aria-label="תשובות אפשריות">{question.choices.map((id, i) => <button key={id} data-choice={id} onClick={() => submit(byId.get(id)!.name, id)}>
                <span aria-hidden="true">{answerLetters[i]}</span>{byId.get(id)!.name}<b aria-hidden="true">←</b>
              </button>)}</div>
              : <form className={styles.answerForm} onSubmit={event => { event.preventDefault(); if (input.trim()) submit(input); }}>
                <label htmlFor="historical-name">מי הדמות?</label>
                <div><input id="historical-name" autoComplete="off" autoCorrect="off" spellCheck={false} value={input} onChange={event => setInput(event.target.value)} placeholder="שם הדמות כאן…" maxLength={120} /><button className={styles.primary} disabled={!input.trim()} type="submit">לבדיקת התשובה</button></div>
                <small>אפשר לכתוב בעברית או באנגלית, גם בכינוי מוכר. בשמות חוזרים יש לציין מספר או תפקיד.</small>
              </form>}
            <div className={styles.help}>
              <button type="button" className={styles.textButton} disabled={hint} onClick={() => setHint(true)}>✧ אפשר רמז נוסף</button>
              <button type="button" className={styles.textButton} onClick={() => submit("", "__skip__")}>לא זוכר/ת — לחשוף</button>
            </div>
            {hint && <p className={styles.hint} role="status">{person.role} · {person.date}<small>הרמז אינו מפחית ניקוד; השימוש בו יסומן בסיכום.</small></p>}
          </>}
          {answer && <div className={styles.response} data-feedback data-correct={answer.correct} aria-live="polite">
            <h3 tabIndex={-1} ref={feedbackRef}>{answer.correct ? "בדיוק! זיהית אותי." : answer.given ? "הפעם זו דמות אחרת." : "נזכור לפעם הבאה."}</h3>
            {!answer.correct && answer.given && <p>ענית: {answer.given}</p>}
            <p>התשובה היא <strong>{person.name}</strong>.</p>
            <button className={styles.primary} onClick={next}>{session.index + 1 === session.questions.length ? "לסיכום הסבב" : "לדמות הבאה"} <span aria-hidden="true">←</span></button>
          </div>}
        </div>
        <aside className={styles.identity} aria-label={answer ? "הדמות שנחשפה" : "הזהות עדיין מסתתרת"}>
          {!answer ? <div className={styles.locked}><div className={styles.silhouette} aria-hidden="true">?</div><span className={styles.eyebrow}>תיק דמות סגור</span><p>עוד רגע, שם יהפוך לפנים.</p><small>התמונה והסיפור ייחשפו<br />אחרי התשובה שלך.</small></div>
            : <div className={styles.revealed} data-reveal={person.id}>
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={person.portrait.localSrc} alt={person.portrait.alt} width={480} height={520} />
                <figcaption>{person.portrait.caption}</figcaption>
              </figure>
              <div className={styles.identityBody}>
                <span className={styles.eyebrow}>{person.role}</span><h3>{person.name}</h3><p className={styles.date}>{person.date}</p>
                <p className={styles.distinction}><b>הפרט שעושה סדר</b>{person.distinction}</p>
                <details className={styles.sources}><summary>מקורות וקרדיט לתמונה</summary>
                  {person.sources.map((source, i) => <a key={i} href={source.href} target="_blank" rel="noreferrer">{source.label} ↗</a>)}
                  {person.supplement && <a href={person.supplement} target="_blank" rel="noreferrer">מקור משלים ↗</a>}
                  <p>{person.portrait.note}</p>
                  <p>{person.portrait.credit}</p>
                  <a href={person.portrait.sourceUrl} target="_blank" rel="noreferrer">מקור התמונה ↗</a>
                  <a href={person.portrait.licenseUrl} target="_blank" rel="noreferrer">{person.portrait.license} ↗</a>
                </details>
              </div>
            </div>}
        </aside>
      </div>
    </>}

    {session?.finished && <div className={styles.summary} data-summary>
      <span className={styles.eyebrow}>הפנים כבר קצת יותר מוכרות</span>
      <h2 ref={questionRef} tabIndex={-1}>הסבב הושלם</h2>
      <div className={styles.resultRing}><strong>{stats.percent}<small>%</small></strong><span>דיוק בסבב</span></div>
      <p className={styles.resultLine}>זיהית {stats.correct} מתוך {stats.total} דמויות.</p>
      <div className={styles.resultMeta}><span>✦ רצף שיא: {stats.best}</span><span>✧ רמזים: {session.answers.filter(answer => answer.hinted).length}</span></div>
      <div className={styles.summaryActions}>
        {!!missed.length && <button className={styles.primary} onClick={() => start(missed)}>לחזור על {missed.length} דמויות לחיזוק</button>}
        <button className={styles.secondary} onClick={() => start()}>סבב חדש באותה בחירה</button>
        <button className={styles.textButton} onClick={() => setSession(null)}>לשנות תחומים או אופן משחק</button>
      </div>
      {!!missed.length && <div className={styles.review}><h3>אלה השמות שנפגוש שוב</h3>
        {missed.map(id => { const person = byId.get(id)!; return <div key={id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={person.portrait.localSrc} alt={person.portrait.alt} width={60} height={70} />
          <div><strong>{person.name}</strong><p>{person.clues[0]}</p></div>
        </div>; })}
      </div>}
      {!missed.length && <p className={styles.perfect}>כל הדמויות זוהו. אפשר להרחיב את התקופות או לנסות הקלדה בלבד.</p>}
      <p className={styles.muted}>הסיכום מתייחס לסבב הזה. היציאה מהעמוד מתחילה משחק חדש.</p>
    </div>}
  </section>;
}
