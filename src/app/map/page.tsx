import type { Metadata } from "next";
import Link from "next/link";
import { withBasePath } from "@/lib/basePath";
import { SITES, ROWS, PERIODS } from "@/data/learning-map";
import styles from "./MapChooser.module.css";

export const metadata: Metadata = {
  title: "מפה — למידה או תכנון מסלול | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "שתי מפות: מפת למידה של אתרי בית שני, הרומית והביזנטית — מי בנה, מתי ואיך זוכרים — ומפת שטח לתכנון מסלול.",
};

// one dot per period, scattered over the land in the card's art
const DOTS = [["34%", "52%"], ["22%", "47%"], ["55%", "58%"], ["44%", "44%"], ["68%", "50%"], ["30%", "62%"]];

/**
 * "מפה" offers two different tools: the learning map, built for the exam, and
 * the offline field map that was here before, built for planning a route.
 */
export default function MapChooserPage() {
  return (
    <div className={`screen-in ${styles.page}`}>
      <header className={styles.head}>
        <h1 className="grad-text">מפה</h1>
        <p>שתי מפות לשתי מטרות: אחת ללמוד את האתרים לקראת המבחן, ואחת לתכנן יום בשטח.</p>
      </header>

      <div className={styles.cards}>
        <Link href="/map/learn" className={`${styles.card} ${styles.learn}`}>
          <span
            aria-hidden
            className={styles.art}
            style={{
              ["--art-light" as string]: `url(${withBasePath("/learning-map/country-light.webp")})`,
              ["--art-dark" as string]: `url(${withBasePath("/learning-map/country-dark.webp")})`,
            }}
          >
            {PERIODS.map((p, i) => (
              <i key={p.id} style={{ ["--c" as string]: p.color, ["--i" as string]: i, top: DOTS[i][0], right: DOTS[i][1] }} />
            ))}
          </span>
          <span className={styles.body}>
            <span className={styles.kicker}>ללמידה ולמבחן</span>
            <strong>מפת למידה</strong>
            <span className={styles.desc}>
              אתרי בית שני, התקופה הרומית והביזנטית על מפה מאוירת: מי בנה ומתי, מה רואים באתר, תמונות, טיפים לזכירה ותרגול בסגנון המבחן.
            </span>
            <span className={styles.meta}>
              {SITES.length} אתרים · {ROWS.length} שלבי בנייה · מפת ירושלים מוגדלת
            </span>
            <span className={styles.go}>לפתוח את מפת הלמידה ←</span>
          </span>
        </Link>

        <Link href="/map/route" className={`${styles.card} ${styles.route}`}>
          <span aria-hidden className={styles.routeArt}>
            <svg viewBox="0 0 200 140">
              <path d="M24 112 C 60 96, 52 64, 92 60 S 150 38, 176 22" />
              <circle cx="24" cy="112" r="7" />
              <circle cx="92" cy="60" r="6" />
              <circle cx="176" cy="22" r="7" />
            </svg>
          </span>
          <span className={styles.body}>
            <span className={styles.kicker}>לשטח</span>
            <strong>תכנון מסלול</strong>
            <span className={styles.desc}>
              מפת השטח המלאה: שכבות של אזורים, גיאולוגיה, טבע ואתרי ביקור, בניית מסלול ואיתור מה שקרוב אליכם — עובדת גם בלי רשת.
            </span>
            <span className={styles.meta}>מפה וקטורית · עובדת אופליין</span>
            <span className={styles.go}>לפתוח את מפת השטח ←</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
