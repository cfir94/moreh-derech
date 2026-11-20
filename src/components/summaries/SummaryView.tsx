import Link from "next/link";
import type { Summary } from "@/data/summaries/types";
import { topicOf } from "@/data/topics";
import { TOPIC_HUB } from "@/data/topic-hub";
import { PenUnderline } from "@/components/trail/kit";
import k from "@/components/trail/kit.module.css";
import s from "./summaries.module.css";

/** The topic quizzes of the hub rows that link to this summary. */
function quizzesFor(key: string) {
  const seen = new Map<string, string>();
  for (const group of TOPIC_HUB) {
    for (const topic of group.topics) {
      const linksHere = topic.links.some((l) => l.kind === "summary" && l.items.some((i) => i.href === `/summaries/${key}/`));
      if (!linksHere) continue;
      for (const l of topic.links) if (l.kind === "quiz") for (const i of l.items) seen.set(i.href, i.title);
    }
  }
  return [...seen].map(([href, title]) => ({ href, title }));
}

function sectionId(index: number) {
  return `section-${index + 1}`;
}

export function SummaryView({ summary }: { summary: Summary }) {
  const topic = topicOf(summary.key);
  const quizzes = quizzesFor(summary.key);

  return (
    <article className={s.summary} dir="rtl">
      <header className={s.top}>
        <div className={s.topInner}>
          <nav aria-label="פירורי לחם" className={s.crumbs}>
            <Link href="/summaries/">סיכומים</Link>
            <span aria-hidden> · </span>
            <span>{topic?.label ?? summary.title}</span>
          </nav>

          <div className={k.titleWrap}>
            <h1 className={s.title}>{summary.title}</h1>
            <PenUnderline />
          </div>

          <p className={s.lede}>{summary.lede}</p>
        </div>
      </header>

      <nav className={s.contents} aria-labelledby="contents-title">
        <h2 id="contents-title" className={s.contentsTitle}>
          בסיכום הזה
        </h2>
        <ol className={s.contentsList}>
          {summary.sections.map((section, index) => (
            <li key={section.title}>
              <a href={`#${sectionId(index)}`}>
                <span className={s.contentsNum} aria-hidden>
                  {index + 1}
                </span>
                <span>{section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className={s.sections}>
        {summary.sections.map((section, index) => (
          <section
            key={section.title}
            id={sectionId(index)}
            className={`${s.band} ${index % 2 ? s.bandTint : ""}`}
            aria-labelledby={`${sectionId(index)}-title`}
          >
            <div className={s.bandInner}>
              <h2
                id={`${sectionId(index)}-title`}
                className={s.sectionTitle}
              >
                <span className={s.sectionNum} aria-hidden>
                  {index + 1}
                </span>
                {section.title}
              </h2>

              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className={s.paragraph}>
                  {paragraph}
                </p>
              ))}

              {section.table && (
                <div className={s.tableWrap}>
                  <table className={s.table}>
                    <thead>
                      <tr>{section.table.head.map((h) => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join("|")}>{row.map((c, i) => <td key={i}>{c}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.remember.length > 0 && (
                <aside
                  className={s.remember}
                  aria-labelledby={`${sectionId(index)}-remember`}
                >
                  <h3
                    id={`${sectionId(index)}-remember`}
                    className={s.rememberTitle}
                  >
                    זכרו למבחן
                  </h3>
                  <ul>
                    {section.remember.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                </aside>
              )}
            </div>
          </section>
        ))}
      </div>

      {summary.terms.length > 0 && (
        <section className={s.glossary} aria-labelledby="glossary-title">
          <div className={s.wideInner}>
            <p className={s.eyebrow}>מילים שצריך להכיר</p>
            <h2 id="glossary-title" className={s.blockTitle}>
              מילון מושגים
            </h2>

            <dl className={s.terms}>
              {summary.terms.map(({ term, def }) => (
                <div key={term} className={s.term}>
                  <dt>{term}</dt>
                  <dd>{def}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {summary.sites.length > 0 && (
        <section className={s.sites} aria-labelledby="sites-title">
          <div className={s.readingInner}>
            <p className={s.eyebrow}>מן המחברת אל הסיור</p>
            <h2 id="sites-title" className={s.blockTitle}>
              איפה פוגשים את זה בשטח
            </h2>

            <ul className={s.siteList}>
              {summary.sites.map((site) => (
                <li key={site}>{site}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className={s.practice} aria-labelledby="practice-title">
        <div>
          <p className={s.practiceKicker}>עכשיו מתרגלים</p>
          <h2 id="practice-title" className={s.practiceTitle}>
            בדקו מה נשאר בזיכרון
          </h2>
          <p className={s.practiceText}>
            {quizzes.length > 0
              ? "שאלון הנושא בודק בדיוק את מה שקראתם. אחריו אפשר לעבור לשאלות האמיתיות ממבחני הרישוי."
              : "במאגר מבחני הרישוי אפשר לבחור תרגול לפי נושא ולענות על שאלות מכל מועדי הבחינה."}
          </p>
        </div>

        <div className={s.practiceLinks}>
          {quizzes.map((q) => (
            <Link key={q.href} href={q.href} className={s.practiceLink}>
              {q.title}
            </Link>
          ))}
          <Link
            href="/quizzes/past-exams/"
            className={quizzes.length > 0 ? s.practiceLinkAlt : s.practiceLink}
          >
            לשאלות ממבחני הרישוי
          </Link>
        </div>
      </section>
    </article>
  );
}
