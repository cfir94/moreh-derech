import { pageMeta } from "@/lib/seo";
import { PLANTS } from "@/data/plants/plants";
import Link from "next/link";
import { ArtAnemone, ArtChurch, ArtCrossword, ArtLand, ArtRobes, ArtWho } from "@/components/trail/decor/games";
import { Prints } from "@/components/trail/Zones";
import g from "./games.module.css";
import { InkIcon } from "@/components/trail/Ink";
import { PageHead, Stamp, TrailPage } from "@/components/trail/kit";


const games = [
  {
    slug: "crossword",
    href: "/games/crossword",
    title: "תשבץ השבוע",
    description: "מאגר תשבצים שגדל בכל יום שישי, עם דמויות, אירועים, אתרים ומושגים מכל מאגרי המידע של הקורס.",
    meta: "תשבץ חדש מתווסף כל שבוע",
  },
  {
    slug: "who-am-i",
    href: "/games/who-am-i",
    title: "מי אני? — קולות מן העבר",
    description: "דמויות מההיסטוריה, היהדות והנצרות מספרות על עצמן. מזהים את השם בשאלה אמריקאית או בהקלדה — וחושפים תמונה וסיפור.",
    meta: "195 דמויות · 10 מאגרי מידע",
  },
  {
    slug: "robes-game",
    href: "/games/jerusalem-robes",
    title: "גלימות ירושלים",
    description: "מי עובר שם בסמטה? מזהים נזירים, כמרים ונזירות מכל הכנסיות בירושלים לפי הלבוש — בתמונות אמיתיות, עם מדריך שדה למזרח ולמערב.",
    meta: "14 קהילות · תמונות אמיתיות",
  },
  {
    slug: "geo-game",
    href: "/games/geography",
    title: "משחק אֶבֶן דֶּרֶךְ",
    description:
      "משחק אינטראקטיבי לתרגול ידיעת הארץ: אתרים, אזורים, גיאולוגיה, נחלים ועוד.",
    meta: "החשבון שלכם מחובר",
  },
  {
    slug: "church-game",
    href: "/games/churches",
    title: "זיהוי כנסיות",
    description:
      "משחק חזותי לזיהוי כנסיות, אתרים ורמזים מהמסורות הקתולית והאורתודוקסית.",
    meta: "משחק חזותי",
  },
  {
    slug: "plants-game",
    href: "/games/plants",
    title: "זיהוי צמחי ישראל",
    description:
      "סבבים של עשר שאלות: צילומים אמיתיים, סימן מזהה, זוגות שמתבלבלים בהם ובית הגידול. צמח שטעיתם בו חוזר ראשון.",
    meta: `${PLANTS.length} צמחים`,
  },
];

export const metadata = pageMeta({
  title: "משחקי לימוד למורי דרך",
  description: "משחקי לימוד ותרגול למורי דרך: זיהוי דמויות ואנשי דת, תשבצים, כנסיות, צמחי בר וידיעת הארץ, לחזרה מהנה על חומר הקורס והמבחן.",
  path: "/games",
});

const ART: Record<string, (p: React.SVGProps<SVGSVGElement>) => React.ReactElement> = {
  crossword: ArtCrossword,
  "who-am-i": ArtWho,
  "robes-game": ArtRobes,
  "geo-game": ArtLand,
  "church-game": ArtChurch,
  "plants-game": ArtAnemone,
};

/** A short name in the guide's hand; the full title stays as the link's accessible name. */
const SHORT: Record<string, string> = {
  "who-am-i": "מי אני?",
  "geo-game": "אבן דרך",
};

export default function GamesPage() {
  const [crossword, ...rest] = games;
  const CrosswordArt = ART.crossword;
  return (
    <TrailPage>
      <PageHead
        title="משחקים"
        art={<InkIcon name="games" size={72} />}
        lede="קופסת המשחקים שבתרמיל: חזרה על החומר בלי להרגיש שלומדים. ההתקדמות נשמרת בחשבון."
      />

      <Link href={crossword.href} className={g.featured} aria-label={crossword.title}>
        <CrosswordArt className={g.art} />
        <div>
          <h2 className={g.title}>{crossword.title}</h2>
          <p className={g.desc}>{crossword.description}</p>
          <div className={g.foot}>
            <span className={g.go}>לפתור את התשבץ</span>
            <span className={`${g.meta} pencil`}>{crossword.meta}</span>
          </div>
        </div>
        <Stamp tone="red" className={g.stamp}>
          חדש בכל שישי
        </Stamp>
      </Link>

      <div className={g.grid}>
        {rest.map((game) => {
          const Art = ART[game.slug];
          return (
            <Link key={game.href} href={game.href} className={g.card} aria-label={game.title}>
              {Art && <Art className={g.art} />}
              <div>
                <h2 className={g.title}>{SHORT[game.slug] ?? game.title}</h2>
                <p className={g.desc}>{game.description}</p>
                <div className={g.foot}>
                  <span className={g.go}>לשחק</span>
                  <span className={`${g.meta} pencil`}>{game.meta}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className={g.steps} data-zone="">
        <Prints
          shape="boot"
          align="xMinYMid meet"
          from={{ x: -20, y: 200 }}
          c1={{ x: 220, y: 240 }}
          c2={{ x: 180, y: 20 }}
          to={{ x: 520, y: 90 }}
          steps={8}
          size={2.3}
          spread={20}
          className={g.fill}
        />
      </div>
    </TrailPage>
  );
}
