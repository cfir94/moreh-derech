"use client";

/*
 * בית שני כ"פרקים במחברת" (EraChapters, בקשת הבעלים 14.11): תשעה פרקים מהשיבה ועד אחרי החורבן,
 * בכל אחד עד שלושה אירועי מפתח לזכור, שביל של תחנות ודף פירוט, ותרגול קצר על הפרק.
 * הנתונים (research.json) לא השתנו; דף האירוע מציג גם סיבות, תוצאות, אנשים, ארכאולוגיה,
 * הסתייגויות תיארוך ומקור, כמו קודם.
 */
import Link from "next/link";
import { SECOND_TEMPLE as research, TEMPLE_EVENTS, TEMPLE_PERIODS, type TempleEvent } from "@/data/second-temple";
import { EraChapters, type ChapterEvent, type ChapterKind } from "@/components/chapters/EraChapters";
import x from "@/components/chapters/extras.module.css";
import t from "@/components/chapters/temple.module.css";
import { InkIcon } from "@/components/trail/Ink";
import type { EraPhoto } from "@/lib/eraPhotos";
import { templePractice } from "@/lib/templePractice";
import { matches } from "./useEraTimeline";

const PRACTICE = templePractice();

/** The old filter's categories, now the kinds of station on the trail. An event belongs to the first that matches. */
const CATEGORIES: (ChapterKind & { pattern: RegExp | null })[] = [
  { id: "conflict", title: "מלחמות ומרידות", icon: "tower", pattern: /קרב|מרד|מצור|מלחמה|חורבן|דיכוי|הגליה/ },
  { id: "rule", title: "שלטון והנהגה", icon: "crown", pattern: /שלטון|מינוי|מלכות|מנהיגות|כהונה|ירושה/ },
  { id: "building", title: "בנייה ומקדש", icon: "temple", pattern: /בנייה|בניית|מקדש|מזבח|חומה|ארמון|נמל|ריצוף/ },
  { id: "society", title: "עלייה, דת וחברה", icon: "scroll", pattern: /עלייה|שיבה|דת|חברה|תרגום|פולחן|רפורמ/ },
  { id: "other", title: "עוד", icon: "jar", pattern: null },
];
const kindOf = (e: TempleEvent) => CATEGORIES.find((c) => c.pattern?.test(`${e.kind} ${e.title}`))?.id ?? "other";

const EVENTS: ChapterEvent[] = TEMPLE_EVENTS.map((e) => ({
  id: e.id, era: e.period, date: e.date, title: e.title, kind: kindOf(e),
  summary: e.summary, body: e.body, tip: e.takeaway, sites: e.places, key: e.anchor,
}));
const ERAS = TEMPLE_PERIODS.map(({ id, title, range, note }) => ({ id, title, range, note }));
const byId = new Map(TEMPLE_EVENTS.map((e) => [e.id, e]));
const title = (id: string) => byId.get(id)?.title;

function Related({ text }: { text: string }) {
  const ids = [...new Set(text.match(/ST-\d{3}/g) ?? [])].filter((id) => byId.has(id));
  if (!ids.length) return null;
  return <div className={t.related}>{ids.map((id) => <a key={id} href={`#${id}`}>{title(id)} <span aria-hidden>←</span></a>)}</div>;
}

function More({ id }: { id: string }) {
  const e = byId.get(id);
  if (!e) return null;
  return <>
    <div className={t.fields}>
      {e.causes && <div className={t.field}><h4>מה הוביל לאירוע?</h4><p>{e.causes}</p></div>}
      {e.consequences && <div className={t.field}><h4>מה השתנה בעקבותיו?</h4><p>{e.consequences}</p></div>}
      {e.people && <div className={t.field}><h4>אנשים וסמכויות</h4><p>{e.people}</p>{e.rule && <p className={t.muted}>{e.rule}</p>}</div>}
      {e.archaeology && <div className={t.field}><h4>מה מצאו בשטח</h4><p>{e.archaeology}</p></div>}
    </div>
    {(e.warning || e.caution) && <div className={t.caution}>
      <b>תיארוך והסתייגויות</b>
      {e.warning && <span>{e.warning} </span>}{e.precision}. {e.caution}
    </div>}
    <Related text={e.connections ?? ""} />
    <p className={t.source} dir="auto">מקור ומילות איתור: {e.source}</p>
  </>;
}

export function SecondTempleTimeline({ photos = {} }: { photos?: Record<string, EraPhoto> }) {
  return <EraChapters
    marchers={["priest"]}
    title="בית שני"
    lede="מן השיבה אל החורבן: עליות וממלכות, אנשים ומאבקים, ואבנים שסיפרו היסטוריה. תשעה פרקים, מהרקע האשורי והבבלי ועד אחרי שנת 70, ובכל אחד הדברים שכדאי לזכור."
    art="temple"
    decor={["menorah", "column", "gate", "scroll", "jar", "temple"]}
    accent={{ light: "#7a5418", dark: "#e9c27a" }}
    eras={ERAS}
    events={EVENTS}
    kinds={CATEGORIES}
    photos={photos}
    idPattern={/^ST-\d{3}$/}
    practice={PRACTICE}
    quizSlug="second-temple"
    practiceLabel="בית שני: תרגול ציר"
    more={(id) => <More id={id} />}
    extras={[
      {
        id: "people", label: "אנשי התקופה", count: research.people.length,
        render: (q) => <section className={x.section} aria-labelledby="st-people">
          <h2 id="st-people" className={x.head}>אנשי התקופה</h2>
          <p className={x.intro}>מי פעל, מי ירש, ומי פעל במקביל. שנות הפעילות בחומר אינן בהכרח שנות חיים, וחלק מהערכים הם קבוצת דמויות.</p>
          <details className={t.details}><summary>רצפי ההנהגה והסמכויות המקבילות</summary>{research.successions.map((text, i) => <p key={i}>{text}</p>)}</details>
          <ul className={x.grid}>{research.people.filter((person) => matches(person, q)).map((person) => <li key={person.id} className={`${x.item} ${x.single}`}>
            <div>
              <h3>{person.name}</h3>
              <p className={x.when}>{person.role}{person.mentionOnly ? " · אזכור בלבד" : ""}</p>
              {person.relationships && <p>{person.relationships}</p>}
              <p>{person.summary}</p>
              <Related text={person.summary} />
            </div>
          </li>)}</ul>
          {!research.people.filter((person) => matches(person, q)).length && <p className={x.intro} role="status">לא נמצאו דמויות התואמות לחיפוש.</p>}
        </section>,
      },
      {
        id: "sites", label: "אתרים וממצאים", count: research.sites.length,
        render: (q) => <section className={x.section} aria-labelledby="st-sites">
          <h2 id="st-sites" className={x.head}>אתרים וממצאים</h2>
          <p className={x.intro}>מהסיפור אל השטח. זיהוי מסורתי, שחזור מודרני וממצא מתוארך אינם אותה ראיה.</p>
          <ul className={x.grid}>{research.sites.filter((site) => matches(site, q)).map((site) => <li key={site.id} className={x.item}>
            <span className={x.icon} aria-hidden><InkIcon name="trowel" size={34} /></span>
            <div><h3>{site.name}</h3><p>{site.context}</p>{site.caution && <p className={x.when}>{site.caution}</p>}<Related text={site.context} /></div>
          </li>)}</ul>
          {!research.sites.filter((site) => matches(site, q)).length && <p className={x.intro} role="status">לא נמצאו אתרים התואמים לחיפוש.</p>}
        </section>,
      },
      {
        id: "processes", label: "התמונה הרחבה", count: research.processes.length,
        render: (q) => <section className={x.section} aria-labelledby="st-processes">
          <h2 id="st-processes" className={x.head}>התמונה הרחבה</h2>
          <p className={x.intro}>החוטים שמחברים את האירועים: תהליכים שנמשכים לאורך זמן וחוצים חילופי שלטון.</p>
          <ul className={x.grid}>{research.processes.filter((process) => matches(process, q)).map((process) => <li key={process.id} className={`${x.item} ${x.single}`} style={process.table.length ? { gridColumn: "1 / -1" } : undefined}>
            <div>
              <h3>{process.title}</h3>
              {process.paragraphs.map((paragraph, i) => <p key={i}>{paragraph.replace(/^\* /, "")}</p>)}
              {process.table.length > 0 && <div className={t.tableWrap}><table>
                <caption>השוואת הקבוצות לפי עמדת ההרצאה בלבד</caption>
                <thead><tr>{process.table[0].map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr></thead>
                <tbody>{process.table.slice(1).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
              </table></div>}
              <Related text={process.paragraphs.join(" ")} />
            </div>
          </li>)}</ul>
        </section>,
      },
      {
        id: "sources", label: "מקורות ודיוק",
        render: (q) => <section className={x.section} aria-labelledby="st-sources">
          <h2 id="st-sources" className={x.head}>מקורות ודיוק</h2>
          <div className={t.method}>
            <p>הציר מבוסס על תיק המחקר שנאסף מהמחברת ב־15.10.2026. בכל אירוע מופיעים שם קובץ ומילות איתור בתמלול. לא היו חותמות זמן או עמודים יציבים, ולכן הקישור פותח את המחברת כולה.</p>
            <p>״מדויק לפי המקור״ מציין שנה שנמסרה בחומר, ולא הסכמה מחקרית. הסיכום הוא מקור נגזר; דף המטלה מציין מה ללמוד ואינו מספק תשובות.</p>
            <a href={research.notebookUrl} target="_blank" rel="noopener noreferrer">למחברת תקופת הבית השני ↗</a>
          </div>
          <h3 className={t.subhead}>שמונת מקורות המחברת</h3>
          <ul className={x.grid}>{research.sources.filter((source) => matches(source, q)).map((source) => <li key={source.id} className={`${x.item} ${x.single}`}>
            <div><h4 dir="auto" className="text-lg font-black">{source.title}</h4><p className={x.when}>{source.type}</p><p>{source.coverage}</p></div>
          </li>)}</ul>
          <h3 className={t.subhead}>מה עדיין חסר?</h3>
          <div className={t.caution}><b>יוחנן בן זכאי וההמשכיות לאחר החורבן · ST-086</b>רשומת יעד לימוד בלבד. דף המטלה אינו מפרט את מעשיו, ולכן אין בציר אירוע היסטורי מלא או סיפור על יבנה המבוסס על אזכור זה.</div>
          {research.gaps.filter((gap) => matches(gap, q)).map((gap) => <details key={gap.id} className={t.details}><summary>{gap.topic}</summary><p>{gap.coverage}</p><p>{gap.guidance}</p></details>)}
          <h3 className={t.subhead}>מחלוקות ובקרת התוכן</h3>
          {research.issues.filter((issue) => matches(issue, q)).map((issue) => <details key={issue.id} className={t.details}><summary>{issue.topic}</summary><p>{issue.decision}</p><p className={t.source}>מקור ואיתור: {issue.source}</p></details>)}
        </section>,
      },
    ]}
    note={<>עיקר הציר עוסק בשיבת ציון ועד חורבן שנת 70; הרקע הקדום ואחרית המרד הם פרקים נפרדים. התאריכים לפי חומר הקורס, וכשיש קירוב או קושי במקור הם מסומנים בדף האירוע. התקופה הבאה: <Link href="/timelines/roman">ציר התקופה הרומית</Link>.</>}
  />;
}
