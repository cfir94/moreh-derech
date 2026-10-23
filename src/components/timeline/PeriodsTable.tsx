"use client";

import Link from "next/link";
import { useId, useMemo, useState, type CSSProperties } from "react";
import {
  HISTORY_FRAMES, LITERATURE_FRAMES, PERIOD_GROUPS, PERIOD_ROWS,
  filterPeriodRows, type PeriodRow,
} from "@/data/periods";
import s from "./PeriodsTable.module.css";

function eraStyle(id: string): CSSProperties {
  return { "--era-color": PERIOD_GROUPS.find(group => group.id === id)?.color } as CSSProperties;
}

function DateLabel({ row }: { row: PeriodRow }) {
  return <span className={s.date}>
    {row.approximate && <span className={s.approximate}>סביב</span>}
    <span className={s.datePart}><bdi dir="ltr">{row.number}</bdi><small>{row.suffix}</small></span>
    {row.through && <><span className={s.until}>עד</span><span className={s.datePart}><bdi dir="ltr">{row.through.number}</bdi><small>{row.through.suffix}</small></span></>}
  </span>;
}

function RowNote({ row }: { row: PeriodRow }) {
  if (!row.note) return null;
  return <details className={s.rowNote}>
    <summary>{row.originalDate ? "דיוק תיארוך" : "הערה והקשר"}<span aria-hidden>＋</span></summary>
    <div>
      {row.originalDate && <p className={s.original}>במסמך המקורי: <bdi>{row.originalDate}</bdi></p>}
      <p>{row.note}</p>
      {row.source && <p className={s.noteSource}>{row.source.href
        ? <a href={row.source.href} target="_blank" rel="noreferrer">{row.source.title} ↗</a>
        : row.source.title}</p>}
    </div>
  </details>;
}

function spanAt(rows: PeriodRow[], index: number, key: "political" | "historical" | "literature") {
  if (index > 0 && rows[index - 1][key] === rows[index][key]) return 0;
  let end = index + 1;
  while (end < rows.length && rows[end][key] === rows[index][key]) end++;
  return end - index;
}

export function PeriodsTable() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const searchId = useId();
  const rows = useMemo(() => filterPeriodRows(query, group), [query, group]);
  const reset = () => { setQuery(""); setGroup("all"); };

  return <div className={s.page} dir="rtl" data-periods-page>
    <Link className={s.back} href="/timelines"><span aria-hidden>→</span> לכל עזרי הלמידה</Link>

    <header className={s.hero}>
      <div className={s.heroText}>
        <p className={s.eyebrow}><span aria-hidden /> מהמקרא אל ראשית האסלאם</p>
        <h1>טבלת <span>התקופות</span></h1>
        <p className={s.intro}>האירועים ברצף אחד, לצד השלטונות, המסגרות ההיסטוריות ותקופות היצירה היהודית.</p>
        <div className={s.heroMeta}><span><strong>{PERIOD_ROWS.length}</strong> ציוני דרך</span><i aria-hidden /><span><strong>{PERIOD_GROUPS.length}</strong> תקופות שלטוניות</span><i aria-hidden /><span>שלוש חלוקות מקבילות</span></div>
      </div>
      <div className={s.eraMap} aria-label="סדר התקופות השלטוניות">
        <div className={s.mapHeading}><span>סדר התקופות</span><span>מוקדם ← מאוחר</span></div>
        <ol>{PERIOD_GROUPS.map((era, index) => <li key={era.id} style={eraStyle(era.id)}>
          <span className={s.mapIndex} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
          <span className={s.mapBar} aria-hidden />
          <span>{era.label}</span>
        </li>)}</ol>
      </div>
    </header>

    <section className={s.workspace} aria-labelledby="periods-table-heading">
      <div className={s.controls}>
        <div className={s.controlsTop}>
          <div><p className={s.overline}>למצוא את המקום ברצף</p><h2 id="periods-table-heading">אירועים ותקופות</h2></div>
          <div className={s.search}>
            <label htmlFor={searchId} className={s.srOnly}>חיפוש בטבלת התקופות</label>
            <svg aria-hidden viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
            <input id={searchId} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="חיפוש אירוע, שנה או תקופה…" />
          </div>
        </div>
        <div className={s.filters} role="group" aria-label="סינון לפי תקופה שלטונית">
          <button type="button" aria-pressed={group === "all"} onClick={() => setGroup("all")}>כל התקופות <span>{PERIOD_ROWS.length}</span></button>
          {PERIOD_GROUPS.map(era => <button type="button" key={era.id} style={eraStyle(era.id)} aria-pressed={group === era.id} onClick={() => setGroup(era.id)}><i aria-hidden />{era.label}<span>{PERIOD_ROWS.filter(row => row.political === era.id).length}</span></button>)}
        </div>
        <div className={s.resultBar}>
          <p role="status" aria-live="polite">מציגים <strong>{rows.length}</strong> מתוך {PERIOD_ROWS.length} ציוני דרך</p>
          {(query || group !== "all") ? <button type="button" onClick={reset}>ניקוי סינון ×</button> : <span>מן המוקדם למאוחר</span>}
        </div>
      </div>

      {rows.length > 0 ? <>
        <div className={s.tableView}>
          <table>
            <caption className={s.srOnly}>טבלת התקופות — השוואה בין תקופה שלטונית, שנה, אירוע, מסגרת היסטורית ותקופת יצירה. תאריכי העריכה מקורבים; חלק מן הטווחים חופפים.</caption>
            <colgroup><col className={s.politicalColumn} /><col className={s.dateColumn} /><col className={s.eventColumn} /><col className={s.historyColumn} /><col className={s.literatureColumn} /></colgroup>
            <thead><tr><th scope="col">תקופה שלטונית</th><th scope="col">שנה</th><th scope="col">אירוע היסטורי</th><th scope="col">מסגרת היסטורית</th><th scope="col">תקופות יצירה</th></tr></thead>
            <tbody>{rows.map((row, index) => {
              const politicalSpan = spanAt(rows, index, "political");
              const historicalSpan = spanAt(rows, index, "historical");
              const literatureSpan = spanAt(rows, index, "literature");
              const era = PERIOD_GROUPS.find(era => era.id === row.political)!;
              return <tr key={row.id} data-period-row={row.id} style={eraStyle(row.political)} className={politicalSpan ? s.groupStart : undefined}>
                {politicalSpan > 0 && <td rowSpan={politicalSpan} className={s.politicalCell}><div><span className={s.eraDot} aria-hidden /><strong>{era.label}</strong><small><bdi dir="ltr">{era.range}</bdi></small></div></td>}
                <td className={s.yearCell}><DateLabel row={row} /></td>
                <th scope="row" className={s.eventCell}><span>{row.event}</span><RowNote row={row} /></th>
                {historicalSpan > 0 && <td rowSpan={historicalSpan} className={s.historyCell}><span>{HISTORY_FRAMES[row.historical]}</span></td>}
                {literatureSpan > 0 && <td rowSpan={literatureSpan} className={s.literatureCell}><strong>{LITERATURE_FRAMES[row.literature].label}</strong><small>{LITERATURE_FRAMES[row.literature].note}</small></td>}
              </tr>;
            })}</tbody>
          </table>
        </div>

        <ol className={s.mobileView} aria-label="אירועים בטבלת התקופות">
          {rows.map((row, index) => {
            const era = PERIOD_GROUPS.find(era => era.id === row.political)!;
            const startsGroup = index === 0 || rows[index - 1].political !== row.political;
            return <li key={row.id} data-period-card={row.id} style={eraStyle(row.political)}>
              {startsGroup && <div className={s.mobileEra}><span className={s.eraDot} aria-hidden /><h3>{era.label}</h3><span><bdi dir="ltr">{era.range}</bdi></span></div>}
              <article className={s.eventCard}>
                <div className={s.cardTop}><DateLabel row={row} /><span className={s.cardIndex} aria-hidden>{String(PERIOD_ROWS.indexOf(row) + 1).padStart(2, "0")}</span></div>
                <h4>{row.event}</h4>
                <dl><div><dt>היסטוריה</dt><dd>{HISTORY_FRAMES[row.historical]}</dd></div><div><dt>יצירה</dt><dd>{LITERATURE_FRAMES[row.literature].label}</dd></div></dl>
                <RowNote row={row} />
              </article>
            </li>;
          })}
        </ol>
      </> : <div className={s.empty}><span aria-hidden>⌕</span><h3>לא נמצאו אירועים מתאימים</h3><p>אפשר לנסות שם אירוע, שנה או תקופה אחרת.</p><button type="button" onClick={reset}>להציג את כל התקופות</button></div>}
    </section>

    <aside className={s.readingNote}><span className={s.noteIcon} aria-hidden>i</span><div><strong>החלוקות מקבילות, הגבולות לא תמיד זהים.</strong><p>תקופות שלטון, מסגרות היסטוריות ותקופות יצירה אינן חופפות במדויק. תאריכי עריכת המשנה והתלמודים מוצגים בקירוב; ספרות שנערכה בבבל מופיעה כאן לצד המתרחש בארץ.</p></div></aside>
    <details className={s.sources}><summary>על הטבלה ומקורות התיארוך <span aria-hidden>＋</span></summary><div><p>מבוסס על המסמך ״טבלת התקופות״. השורה שכללה גם את המרד וגם את המדינה החשמונאית פוצלה לשני ציוני דרך. פרס הופרדה מאשור ובבל, ושמות העמודות הובהרו.</p><p>תוקנו תאריכים בהצהרת כורש, בכיבוש אלכסנדר, במשבר המאה השלישית, במרד גאלוס ובכיבוש הפרסי. השינויים מצוינים בשורות עצמן לצד התאריך המקורי. חומר הקורס נבדק במחברות בית שני ורומית־ביזנטית.</p><p>״רקע למשנה ותקופת התנאים״ כולל גם את התקופה שקדמה לתנאים; פעילות התנאים עצמם מזוהה בעיקר עם המאות הראשונה והשנייה לספירה. <a href="https://www.jewishencyclopedia.com/articles/14238-tanna" target="_blank" rel="noreferrer">להרחבה על התנאים והאמוראים ↗</a></p></div></details>
  </div>;
}
