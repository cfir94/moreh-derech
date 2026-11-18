"use client";

/*
 * הציר הביזנטי כ"פרקים במחברת" (EraChapters, בקשת הבעלים 14.11): חמישה פרקים, בכל אחד שלושה
 * דברים לזכור, שביל של תחנות ודף פירוט, ותרגול קצר. הנתונים ב-src/data/byzantine/index.ts לא השתנו.
 */
import Link from "next/link";
import { BYZ_COUNCILS, BYZ_EMPERORS, BYZ_ERAS, BYZ_EVENTS, BYZ_KINDS, BYZ_PILGRIMS, BYZ_SITES } from "@/data/byzantine";
import { EraChapters, type ChapterKind } from "@/components/chapters/EraChapters";
import x from "@/components/chapters/extras.module.css";
import { InkIcon } from "@/components/trail/Ink";
import { RangeText } from "@/components/RangeText";
import type { EraPhoto } from "@/lib/eraPhotos";
import { eraPractice } from "@/lib/eraPractice";
import { matches } from "./useEraTimeline";

const ICONS: Record<string, ChapterKind["icon"]> = { empire: "crown", war: "tower", jewish: "menorah", church: "church", pilgrim: "footprint" };
const KINDS = BYZ_KINDS.map((k) => ({ ...k, icon: ICONS[k.id] }));
const PRACTICE = eraPractice(BYZ_EVENTS, BYZ_ERAS);
const SITE: Record<string, { title: string; icon: ChapterKind["icon"] }> = {
  church: { title: "כנסייה", icon: "church" },
  monastery: { title: "מנזר", icon: "cross" },
  synagogue: { title: "בית כנסת", icon: "menorah" },
  city: { title: "עיר", icon: "gate" },
};

export function ByzantineTimeline({ photos = {} }: { photos?: Record<string, EraPhoto> }) {
  return <EraChapters
    title="התקופה הביזנטית"
    lede="מקונסטנטינוס ועד הכיבוש המוסלמי, 324–638: שלוש מאות שנה שבהן הארץ נעשתה ״ארץ הקודש״. כנסיות ומנזרים, צליינים ומפת מידבא, ולצידם התלמוד הירושלמי, בתי הכנסת עם גלגלי המזלות ומרידות השומרונים. חמישה פרקים, ובכל אחד שלושה דברים לזכור."
    art="church"
    decor={["church", "cross", "dome", "menorah", "footprint"]}
    accent={{ light: "#8a5a12", dark: "#e8c472" }}
    eras={BYZ_ERAS}
    events={BYZ_EVENTS}
    kinds={KINDS}
    photos={photos}
    idPattern={/^BY-\d{3}$/}
    practice={PRACTICE}
    quizSlug="byzantine"
    practiceLabel="הציר הביזנטי: תרגול"
    extras={[
      {
        id: "emperors", label: "קיסרים ומועצות", count: BYZ_EMPERORS.length + BYZ_COUNCILS.length,
        render: (q) => <>
          <section className={x.section} aria-labelledby="byz-emperors">
            <h2 id="byz-emperors" className={x.head}>הקיסרים</h2>
            <p className={x.intro}>מי שלט בקונסטנטינופול, ומה זה שינה בארץ.</p>
            <ul className={x.grid}>{BYZ_EMPERORS.filter((e) => matches(e, q)).map((e) => <li key={e.name} className={x.item}>
              <span className={x.coin} aria-hidden>{e.greek}</span>
              <div><h3>{e.name}</h3><p className={x.when}><RangeText text={e.reign} /></p><p>{e.note}</p></div>
            </li>)}</ul>
          </section>
          <section className={x.section} aria-labelledby="byz-councils">
            <h2 id="byz-councils" className={x.head}>מועצות הכנסייה</h2>
            <p className={x.intro}>המועצות האקומניות שעיצבו את הנצרות, ואת הפילוג בין העדות שבכנסיית הקבר.</p>
            <ul className={x.grid}>{BYZ_COUNCILS.filter((c) => matches(c, q)).map((c) => <li key={c.name} className={`${x.item} ${x.single}`}>
              <div><span className={x.seal}><RangeText text={c.year} /></span><h3 className="mt-2">{c.name}</h3><p className={x.when}>{c.place}</p><p>{c.decision}</p></div>
            </li>)}</ul>
          </section>
        </>,
      },
      {
        id: "sites", label: "כנסיות, מנזרים ובתי כנסת", count: BYZ_SITES.length,
        render: (q) => <section className={x.section} aria-labelledby="byz-sites">
          <h2 id="byz-sites" className={x.head}>כנסיות, מנזרים ובתי כנסת</h2>
          <p className={x.intro}>היכן פוגשים את התקופה הביזנטית בשטח.</p>
          <ul className={x.grid}>{BYZ_SITES.filter((site) => matches(site, q)).map((site) => <li key={site.name} className={x.item}>
            <span className={x.icon} aria-hidden><InkIcon name={SITE[site.type]?.icon ?? "signpost"} size={34} /></span>
            <div><h3>{site.name}</h3><p className={x.when}>{SITE[site.type]?.title}</p><p>{site.what}</p></div>
          </li>)}</ul>
        </section>,
      },
      {
        id: "pilgrims", label: "צליינים", count: BYZ_PILGRIMS.length,
        render: (q) => <section className={x.section} aria-labelledby="byz-pilgrims">
          <h2 id="byz-pilgrims" className={x.head}>צליינים ומקורות</h2>
          <p className={x.intro}>מי ביקר, מי כתב, ומה אנחנו יודעים בזכותם על ארץ הקודש הביזנטית.</p>
          <ul className={x.grid}>{BYZ_PILGRIMS.filter((p) => matches(p, q)).map((p) => <li key={p.name} className={x.item}>
            <span className={x.icon} aria-hidden><InkIcon name="footprint" size={34} /></span>
            <div><h3>{p.name}</h3><p className={x.when}><RangeText text={p.when} /></p><p>{p.note}</p></div>
          </li>)}</ul>
        </section>,
      },
    ]}
    note={<>הציר מבוסס על הרצאת אייל מירון על התקופה הביזנטית, על הרצאות האדריכלות הקלאסית ועל רשימות המושגים של הקורס. התקופה הקודמת: <Link href="/timelines/roman">ציר התקופה הרומית</Link>.</>}
  />;
}
