import { pageMeta } from "@/lib/seo";
import { PLANTS } from "@/data/plants/plants";
import { SectionCard } from "@/components/SectionCard";
import { InkIcon } from "@/components/trail/Ink";
import { PageHead, SignLink, TrailPage } from "@/components/trail/kit";


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

export default function GamesPage() {
  const [crossword, ...rest] = games;
  return (
    <TrailPage>
      <PageHead
        title="משחקים"
        art={<InkIcon name="games" size={112} />}
        lede="קופסת המשחקים שבתרמיל: חזרה על החומר בלי להרגיש שלומדים. ההתקדמות נשמרת בחשבון."
      />
      <div className="mb-10">
        <SignLink
          href={crossword.href}
          icon="quizzes"
          title={crossword.title}
          sub={crossword.meta}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((game, index) => (
          <SectionCard key={game.href} index={index} {...game} />
        ))}
      </div>
    </TrailPage>
  );
}
