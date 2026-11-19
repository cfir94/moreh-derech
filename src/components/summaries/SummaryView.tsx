import Link from "next/link";
import type { Summary } from "@/data/summaries/types";
import { topicOf } from "@/data/topics";
import { PenUnderline } from "@/components/trail/kit";
import k from "@/components/trail/kit.module.css";
import s from "./summaries.module.css";

function sectionId(index: number) {
  return `section-${index + 1}`;
}

export function SummaryView({ summary }: { summary: Summary }) {
  const topic = topicOf(summary.key);

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
            במאגר מבחני הרישוי אפשר לבחור תרגול לפי נושא ולענות על שאלות מכל
            מועדי הבחינה.
          </p>
        </div>

        <Link href="/quizzes/past-exams/" className={s.practiceLink}>
          לשאלות ממבחני הרישוי
        </Link>
      </section>
    </article>
  );
}
