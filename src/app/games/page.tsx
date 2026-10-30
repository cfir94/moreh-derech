import type { Metadata } from "next";
import { SectionCard } from "@/components/SectionCard";

export const metadata: Metadata = {
  title: "משחקים | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "משחקי זיהוי ותרגול למורי דרך",
};

const games = [
  {
    slug: "crossword",
    href: "/games/crossword",
    title: "תשבץ השבוע",
    description: "תשבץ חדש בכל יום שישי, עם דמויות, אירועים, אתרים ומושגים מכל מחברות הקורס.",
    meta: "מתחלף כל שבוע",
  },
  {
    slug: "who-am-i",
    href: "/games/who-am-i",
    title: "מי אני? — קולות מן העבר",
    description: "דמויות מההיסטוריה, היהדות והנצרות מספרות על עצמן. מזהים את השם בשאלה אמריקאית או בהקלדה — וחושפים תמונה וסיפור.",
    meta: "195 דמויות · 10 מחברות",
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
      "משחק בלשי ללימוד וזיהוי צמחי בר ישראליים בעזרת תמונות, רמזים ועזרי זיכרון.",
    meta: "28 צמחים",
  },
];

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold text-gold">מרכז המשחקים</p>
        <h1 className="grad-text mb-3 text-4xl">משחקים</h1>
        <p className="max-w-2xl leading-relaxed text-txt-dim">
          בחרו משחק והמשיכו לשחק בתוך אֶבֶן דֶּרֶךְ, כשהסרגל העליון נשאר זמין.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game, index) => (
          <SectionCard key={game.href} index={index} {...game} />
        ))}
      </div>
    </div>
  );
}
