"use client";

/*
 * הציר הרומי כ"פרקים במחברת" (EraChapters, בקשת הבעלים 14.11): שבעה פרקים, בכל אחד שלושה דברים
 * לזכור, שביל של תחנות ודף פירוט, ותרגול קצר. הנתונים ב-src/data/roman/index.ts לא השתנו.
 */
import Link from "next/link";
import { ROMAN_EMPERORS, ROMAN_ERAS, ROMAN_EVENTS, ROMAN_KINDS, ROMAN_LEGIONS, ROMAN_SITES } from "@/data/roman";
import { EraChapters, type ChapterKind } from "@/components/chapters/EraChapters";
import x from "@/components/chapters/extras.module.css";
import { InkIcon } from "@/components/trail/Ink";
import { RangeText } from "@/components/RangeText";
import type { EraPhoto } from "@/lib/eraPhotos";
import { eraPractice } from "@/lib/eraPractice";
import { matches } from "./useEraTimeline";

const ICONS: Record<string, ChapterKind["icon"]> = { war: "tower", rule: "crown", jewish: "menorah", build: "column", christian: "church" };
const KINDS = ROMAN_KINDS.map((k) => ({ ...k, icon: ICONS[k.id] }));
const PRACTICE = eraPractice(ROMAN_EVENTS, ROMAN_ERAS);

export function RomanTimeline({ photos = {} }: { photos?: Record<string, EraPhoto> }) {
  return <EraChapters
    title="התקופה הרומית"
    lede="מפומפיוס ועד קונסטנטינוס, 63 לפנה״ס – 324 לספירה: החורבן ויבנה, בר כוכבא ואיליה קפיטולינה, המשנה בציפורי והדרך אל הנצרות. שבעה פרקים, ובכל אחד שלושה דברים לזכור."
    art="milestone"
    decor={["milestone", "column", "gate", "temple", "arch"]}
    accent={{ light: "#9b3324", dark: "#f0a08c" }}
    eras={ROMAN_ERAS}
    events={ROMAN_EVENTS}
    kinds={KINDS}
    photos={photos}
    idPattern={/^RO-\d{3}$/}
    practice={PRACTICE}
    quizSlug="roman"
    practiceLabel="הציר הרומי: תרגול"
    extras={[
      {
        id: "emperors", label: "הקיסרים והלגיונות", count: ROMAN_EMPERORS.length,
        render: (q) => <>
          <section className={x.section} aria-labelledby="roman-emperors">
            <h2 id="roman-emperors" className={x.head}>הקיסרים</h2>
            <p className={x.intro}>הקיסרים שהשפיעו ישירות על ארץ ישראל, ומה כל אחד מהם השאיר כאן.</p>
            <ul className={x.grid}>{ROMAN_EMPERORS.filter((e) => matches(e, q)).map((e) => <li key={e.name} className={x.item}>
              <span className={x.coin} aria-hidden>{e.latin}</span>
              <div><h3>{e.name}</h3><p className={x.when}><RangeText text={e.reign} /></p><p>{e.note}</p></div>
            </li>)}</ul>
          </section>
          <section className={x.section} aria-labelledby="roman-legions">
            <h2 id="roman-legions" className={x.head}>הלגיונות</h2>
            <p className={x.intro}>הצבא הרומי שחנה בארץ, והשאיר את שמו על המפה.</p>
            <ul className={x.grid}>{ROMAN_LEGIONS.filter((l) => matches(l, q)).map((l) => <li key={l.latin} className={`${x.item} ${x.single}`}>
              <div><span className={x.seal}>{l.latin}</span><h3 className="mt-2">{l.name}</h3><p>{l.note}</p></div>
            </li>)}</ul>
          </section>
        </>,
      },
      {
        id: "sites", label: "אתרים בדרך", count: ROMAN_SITES.length,
        render: (q) => <section className={x.section} aria-labelledby="roman-sites">
          <h2 id="roman-sites" className={x.head}>אתרים בדרך</h2>
          <p className={x.intro}>היכן פוגשים את התקופה הרומית בשטח: לסיור, לדוח ולמבחן.</p>
          <ul className={x.grid}>{ROMAN_SITES.filter((site) => matches(site, q)).map((site) => <li key={site.name} className={x.item}>
            <span className={x.icon} aria-hidden><InkIcon name="signpost" size={34} /></span>
            <div><h3>{site.name}</h3><p className={x.when}>{site.region}{site.latin ? ` · ${site.latin}` : ""}</p><p>{site.what}</p></div>
          </li>)}</ul>
        </section>,
      },
    ]}
    note={<>הציר מבוסס על הרצאות אייל מירון ביחידות בית שני והתקופה הרומית, על רשימות המושגים של הקורס ועל סיורי ירושלים. אירועי 37 לפנה״ס–66 לספירה מוצגים בקצרה; הפירוט המלא ב<Link href="/timelines/second-temple">ציר בית שני</Link>. התקופה הבאה: <Link href="/timelines/byzantine">ציר התקופה הביזנטית</Link>.</>}
  />;
}
