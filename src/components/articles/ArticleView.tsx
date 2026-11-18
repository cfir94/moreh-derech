import Link from "next/link";
import type { Article } from "@/data/articles/types";
import { articleDate, relatedArticles } from "@/data/articles";
import { resolvePhoto } from "@/data/articles/photos";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import { withBasePath } from "@/lib/basePath";
import { PenUnderline } from "@/components/trail/kit";
import k from "@/components/trail/kit.module.css";
import { ArticlePhoto } from "./Photo";
import { ShareBar } from "./ShareBar";
import s from "./articles.module.css";

/**
 * מאמר אחד. הקטעים מתחלפים בין נייר לגוון אדמה (הלקח מ"תנ"ך ישראלי": צבע שמתחלף נותן לדף קצב),
 * והגוף נשאר עמודה רחבה וקריאה.
 */
export function ArticleView({ article }: { article: Article }) {
  const url = absoluteUrl(`/articles/${article.slug}`);
  const hero = resolvePhoto(article.hero);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.lede,
    datePublished: article.date,
    inLanguage: "he",
    image: absoluteUrl(hero.src),
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
  const related = relatedArticles(article.slug);
  return (
    <article className={s.article} dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className={s.top}>
        <div className={s.topInner}>
          <nav aria-label="פירורי לחם" className={s.crumbs}>
            <Link href="/articles/">מאמרים</Link>
            <span aria-hidden> · </span>
            <span>{article.category}</span>
          </nav>
          <div className={k.titleWrap}>
            <h1 className={s.title}>{article.title}</h1>
            <PenUnderline />
          </div>
          <p className={s.lede}>{article.lede}</p>
          <p className={s.meta}>
            <time dateTime={article.date}>{articleDate(article.date)}</time>
            <span aria-hidden> · </span>
            <span>{article.minutes} דקות קריאה</span>
          </p>
        </div>
      </header>

      <div className={s.heroWrap}>
        <ArticlePhoto photo={article.hero} caption={article.heroCaption} hero />
      </div>

      {article.news && (
        <aside className={s.news} aria-label="מה קרה">
          <p className={s.newsTag}>מה קרה</p>
          <p className={s.newsText}>{article.news.text}</p>
          <p className={s.newsSource}>
            מקור:{" "}
            {article.news.url ? <a href={article.news.url} target="_blank" rel="noopener noreferrer">{article.news.source}</a> : article.news.source}
          </p>
        </aside>
      )}

      {article.sections.map((sec, i) => (
        <section key={sec.title} className={`${s.band} ${i % 2 ? s.bandTint : ""}`} aria-labelledby={`sec-${i}`}>
          <div className={s.bandInner}>
            <h2 id={`sec-${i}`} className={s.secTitle}>
              <span className={s.secNum} aria-hidden>{i + 1}</span>
              {sec.title}
            </h2>
            {sec.paras.map((p) => <p key={p.slice(0, 40)} className={s.para}>{p}</p>)}
            {sec.quote && (
              <blockquote className={s.quote}>
                <p>{sec.quote.text}</p>
                <cite>{sec.quote.cite}</cite>
              </blockquote>
            )}
            {sec.photo && <ArticlePhoto photo={sec.photo} caption={sec.caption} />}
          </div>
        </section>
      ))}

      <section className={s.say} aria-labelledby="say-title">
        <h2 id="say-title" className={s.sayTitle}>מה אומרים לקבוצה</h2>
        <ul>{article.say.map((line) => <li key={line}>{line}</li>)}</ul>
      </section>

      {article.exam && (
        <section className={s.exam} aria-labelledby="exam-title">
          <h2 id="exam-title" className={s.examTitle}>למבחן</h2>
          <ul>{article.exam.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
      )}

      <section className={s.tools} aria-labelledby="tools-title">
        <h2 id="tools-title" className={s.toolsTitle}>להעמיק באתר</h2>
        <div className={s.toolRow}>
          {article.tools.map((t) => <Link key={t.href} href={t.href} className={s.tool}>{t.label}</Link>)}
        </div>
      </section>

      <div className={s.end}>
        <ShareBar title={article.title} url={url} />
        <section className={s.sources} aria-labelledby="sources-title">
          <h2 id="sources-title">מקורות</h2>
          <ul>
            {article.sources.map((src) => (
              <li key={src.label}>{src.url ? <a href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a> : src.label}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className={s.related} aria-labelledby="related-title">
        <h2 id="related-title" className={s.relatedTitle}>עוד מאמרים</h2>
        <div className={s.grid}>
          {related.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </div>
      </section>
    </article>
  );
}

export function ArticleCard({ article, big = false }: { article: Article; big?: boolean }) {
  const p = resolvePhoto(article.hero);
  return (
    <Link href={`/articles/${article.slug}/`} className={`${s.card} ${big ? s.cardBig : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBasePath(p.src)} alt="" loading="lazy" decoding="async" />
      <span className={s.cardBody}>
        <span className={s.cardMeta}>{article.category} · {articleDate(article.date)}</span>
        <span className={s.cardTitle}>{article.title}</span>
        <span className={s.cardLede}>{article.lede}</span>
        <span className={s.cardMore}>להמשיך לקרוא</span>
      </span>
    </Link>
  );
}
