import { pageMeta } from "@/lib/seo";
import { ARTICLES } from "@/data/articles";
import { ArticleCard } from "@/components/articles/ArticleView";
import { PenUnderline } from "@/components/trail/kit";
import s from "@/components/articles/articles.module.css";

export const metadata = pageMeta({
  title: "מאמרים למורי דרך",
  description: "מאמרים קצרים למורי דרך ולתלמידי הקורס: אקטואליה, ארכאולוגיה, נצרות, אדריכלות וטבע, עם מה שאומרים לקבוצה בשטח ומה שואלים במבחן.",
  path: "/articles",
});

export default function ArticlesPage() {
  const [first, ...rest] = ARTICLES;
  return (
    <div dir="rtl">
      <header className={`${s.top} ${s.indexTop}`}>
        <div className={s.topInner}>
          <h1 className={s.title}>מאמרים</h1>
          <PenUnderline />
          <p className={s.lede}>
            סיפורים קצרים מהשטח ומהחדשות, למורי דרך ולתלמידי הקורס. בכל מאמר: מה קרה, מה אומרים לקבוצה, ומה שואלים במבחן.
          </p>
        </div>
      </header>
      <div className={s.indexBody}>
        <div className={s.grid}>
          <ArticleCard article={first} big />
          {rest.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </div>
      </div>
    </div>
  );
}
