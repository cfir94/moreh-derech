import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { withBasePath } from "@/lib/basePath";
import { SITES, ROWS, PERIODS } from "@/data/learning-map";
import styles from "./MapChooser.module.css";
import { PageHead } from "@/components/trail/kit";
import { PageDecor } from "@/components/trail/PageDecor";
import { InkCompass } from "@/components/trail/Ink";


// one dot per period, scattered over the land in the card's art
const DOTS = [["34%", "52%"], ["22%", "47%"], ["55%", "58%"], ["44%", "44%"], ["68%", "50%"], ["30%", "62%"]];

/**
 * "מפה" offers two different tools: the learning map, built for the exam, and
 * the offline field map that was here before, built for planning a route.
 */
export const metadata = pageMeta({
  title: "מפות למידה ותכנון מסלול",
  description: "בחרו בין מפה מאוירת ללימוד אתרי בית שני, התקופה הרומית והביזנטית, לבין מפת שטח וקטורית עם שכבות מידע לבניית מסלול סיור בארץ.",
  path: "/map",
});

export default function MapChooserPage() {
  return (
    <div className={`screen-in relative ${styles.page}`}>
      <PageDecor birds items={["compass", "hills", "signpost", "lake", "binoculars"]} step={300} />
      <PageHead section="map" title="מפה" lede="מפה אחת ללמוד למבחן, ומפה אחת לתכנן יום בשטח." art={<InkCompass live />} />

      {/* the route map is heavy (scripts, 3MB of layers): fetch it while the user is still choosing (owner, 20.11) */}
      {["embeds/map/index.html", "embeds/map/js/app.js", "embeds/map/vendor/maplibre/maplibre-gl.mjs", "embeds/map/vendor/maplibre/maplibre-gl-shared.mjs",
        "embeds/map/js/data/sites.geojson", "embeds/map/js/data/visitor_sites.geojson", "embeds/map/js/data/regions.geojson",
        "embeds/map/js/data/tours.json"].map((f) => (
        <link key={f} rel="prefetch" href={withBasePath(`/${f}`)} />
      ))}
      <link rel="preconnect" href="https://cfir94.github.io" crossOrigin="" />
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
            <span className={styles.go}>לפתוח את מפת הלמידה</span>
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
            <span className={styles.go}>לפתוח את מפת השטח</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
