import type { Metadata } from "next";
import Link from "next/link";
import { InkIcon } from "@/components/trail/Ink";
import { PageDecor } from "@/components/trail/PageDecor";
import { BrowserFrame, Clip, Phone, Shot } from "@/components/landing/Media";
import { PricingCards } from "@/components/paywall/PricingCards";
import { EXAMS, MINISTRY_EXAMS } from "@/data/exams";
import { QUIZZES } from "@/data/quizzes";
import { withBasePath } from "@/lib/basePath";
import { LAUNCH, PRICES, SITE_URL } from "@/lib/launch";
import { SIGN_STYLE, SECTION_TONE } from "@/components/trail/kit";
import k from "@/components/trail/kit.module.css";
import { LiveButterfly, LiveFire, LiveFlower, LiveTree } from "@/components/trail/decor/live";
import type { FieldIconName } from "@/components/trail/FieldIcons";

export const metadata: Metadata = {
  title: { absolute: "אבן דרך למורי דרך | ללמוד למבחן ולתכנן את הסיור הבא" },
  description: `מפות לתכנון מסלול וללמידה, מאגרי מידע לסיורים, דוחות הדרכה, צירי זמן, מבחני רישוי, שאלונים ומשחקים. ${PRICES.trialDays} ימים ראשונים חינם, בלי כרטיס אשראי.`,
  openGraph: {
    title: "אבן דרך למורי דרך | ללמוד למבחן ולתכנן את הסיור הבא",
    description: `${PRICES.trialDays} ימים ראשונים חינם, בלי כרטיס אשראי.`,
    locale: "he_IL",
    type: "website",
    // כתובת מלאה של הבנייה הנוכחית, כדי שוואטסאפ יציג תמונה (גם לפני המעבר לדומיין).
    url: `${SITE_URL}/welcome/`,
    images: [{ url: `${SITE_URL}/marketing/og.jpg`, width: 1200, height: 630 }],
  },
};

const questionCount = QUIZZES.reduce((sum, quiz) => sum + quiz.questions.length, 0);
const round = (n: number) => (n >= 1000 ? `${Math.floor(n / 100) * 100}`.replace(/\B(?=(\d{3})+(?!\d))/, ",") : String(n));

const cta = "inline-flex items-center justify-center rounded-full px-7 py-4 text-base font-extrabold text-on-accent transition active:scale-95";
const ctaStyle = SIGN_STYLE;

/** What the site holds, in two shelves (owner, 19.11): the student's, then the working guide's. */
type Block = { href: string; icon: FieldIconName; tone: string; title: string; text: string };

const FOR_STUDENT: Block[] = [
  { href: "/quizzes/", icon: "quizzes", tone: SECTION_TONE.quizzes, title: "שאלונים", text: `${round(questionCount)}+ שאלות לפי נושא, עם הסבר לכל תשובה` },
  { href: "/exams/", icon: "exams", tone: SECTION_TONE.exams, title: "מבחנים מלאים", text: `${MINISTRY_EXAMS.length} מועדי רישוי ו־${EXAMS.length - MINISTRY_EXAMS.length} מבחני קורס, בתנאי אמת` },
  { href: "/quizzes/review/", icon: "review", tone: "var(--t-green)", title: "תרגול טעויות", text: "כל טעות חוזרת אליכם עד שעונים נכון" },
  { href: "/timelines/", icon: "timelines", tone: SECTION_TONE.aids, title: "עזרי למידה", text: "צירי זמן, אדריכלות בתלת־ממד, גאולוגיה ומגדירי שדה" },
  { href: "/map/learn/", icon: "map", tone: SECTION_TONE.map, title: "מפת למידה", text: "איפה זה, מי בנה ומתי, ותרגול על המפה" },
  { href: "/games/", icon: "games", tone: SECTION_TONE.games, title: "משחקים", text: "מי אני?, צמחים, טריוויה ותשבץ חדש בכל שבוע" },
  { href: "/summaries/", icon: "resources", tone: SECTION_TONE.topics, title: "סיכומים", text: "כל נושא בסילבוס בעמוד אחד" },
  { href: "/videos/", icon: "videos", tone: SECTION_TONE.videos, title: "סרטונים", text: "שיעורים, סיורים והעשרה, לפי נושא" },
];

const FOR_GUIDE: Block[] = [
  { href: "/map/route/", icon: "signpost", tone: SECTION_TONE.map, title: "בניית מסלול על מפה", text: "שכבות של אתרים, טבע וגאולוגיה, גם בלי רשת" },
  { href: "/tours/", icon: "notebooks", tone: SECTION_TONE.tours, title: "מאגרי מידע לסיורים", text: "חומר רקע לפי אזור ואתר, מכל סיורי הקורס" },
  { href: "/guide-reports/", icon: "guide-reports", tone: SECTION_TONE.reports, title: "עזרי הדרכה", text: "דוח סיור, יום סיור ויחידת הדרכה, עם טיוטות" },
  { href: "/timelines/plants-guide/", icon: "flower", tone: "var(--t-green)", title: "מגדירי שדה", text: "צמחים, בעלי חיים וסלעים, כמו שפוגשים אותם בשטח" },
  { href: "/community/", icon: "community", tone: SECTION_TONE.community, title: "קהילה", text: "פורום, השתלמויות וקורסים למורי דרך" },
  { href: "#moti", icon: "talk", tone: "var(--sign)", title: "מוטי", text: "מורה דרך ותיק שזמין לכל שאלה, בכל מסך" },
];

/** One for the student, one for the guide, and so on down the page. */
const FEATURES: {
  id: string;
  who: "student" | "guide";
  title: string;
  text: string;
  points: string[];
  media: React.ReactNode;
}[] = [
  {
    id: "practice",
    who: "student",
    title: "האתר זוכר מה עוד לא יושב לכם",
    text: `כל תשובה נשמרת בחשבון. טעיתם? השאלה חוזרת אליכם בתרגול הטעויות, מכל שאלון ומכל מבחן, עד שתענו נכון. ולכל טעות יש קישור לחומר שכדאי לחזור עליו.`,
    points: ["שאלון אחד לכל נושא בסילבוס", "הסבר אחרי כל שאלה", "ממשיכים מכל מכשיר"],
    media: (
      <BrowserFrame label="moreyderech.com/quizzes">
        <Clip name="quiz" label="סרטון: עונים על שאלה בשאלון ומקבלים משוב" />
      </BrowserFrame>
    ),
  },
  {
    id: "route",
    who: "guide",
    title: "בונים מסלול על מפת הארץ",
    text: "מפת שטח לתכנון יום סיור: פותחים שכבות של אתרים, שמורות, גאולוגיה ואזורים, מסמנים את התחנות ובודקים מה נמצא בדרך. המפה נשמרת בטלפון ועובדת גם כשאין קליטה.",
    points: ["שכבות מידע לבחירה", "תחנות ומסלול על המפה", "עובדת גם בלי רשת"],
    media: <RouteSketch />,
  },
  {
    id: "aids",
    who: "student",
    title: "עזרי למידה: לראות את החומר, לא רק לקרוא",
    text: "את מה שקשה לזכור מדף, רואים: צירי זמן לכל תקופה ואטלס של 3.6 מיליון שנה, מקדשים ואמות מים בתלת־ממד, מפה גאולוגית, קשתות וקמרונות, ומגדירי צמחים ובעלי חיים. בכל עזר יש גם תרגול.",
    points: ["צירי זמן ואטלס הזמן", "אדריכלות וגאולוגיה בתלת־ממד", "תרגול בתוך כל עזר"],
    media: (
      <BrowserFrame label="moreyderech.com/timelines/history-atlas">
        <Clip name="atlas" label="סרטון: גוללים באטלס הזמן" />
      </BrowserFrame>
    ),
  },
  {
    id: "tours",
    who: "guide",
    title: "כל החומר של הסיור, במקום אחד",
    text: "מאגרי מידע לכל סיורי הקורס, לפי אזור: מה רואים בכל אתר, מה מספרים שם ומה שואלים עליו. פותחים לפני הסיור, וחוזרים אליהם גם שנים אחרי המבחן.",
    points: ["לפי אזור ולפי אתר", "חומר עיוני לפי תחום", "פתוח מכל מכשיר"],
    media: (
      <BrowserFrame label="moreyderech.com/tours">
        <Shot src="d-tours.webp" alt="מאגרי המידע לסיורים, לפי אזור" />
      </BrowserFrame>
    ),
  },
  {
    id: "exams",
    who: "student",
    title: "מתאמנים על המבחן האמיתי",
    text: `${MINISTRY_EXAMS.length} מועדים של מבחן הרישוי ו־${EXAMS.length - MINISTRY_EXAMS.length} מבחני קורס. בלי לראות תשובות באמצע, עם הגשה בסוף, ציון ופירוט מלא.`,
    points: ["מפתח תשובות רשמי ככל שפורסם", "עברית, אנגלית וערבית לפי המועד", "כל טעות נכנסת לתרגול הטעויות"],
    media: (
      <BrowserFrame label="moreyderech.com/exams">
        <Shot src="d-exams.webp" alt="רשימת מועדי מבחן הרישוי באתר" />
      </BrowserFrame>
    ),
  },
  {
    id: "reports",
    who: "guide",
    title: "מכינים הדרכה, שלב אחר שלב",
    text: "איך כותבים דוח סיור, דוגמה מלאה, סימולטור של יום סיור ותרגול יחידת הדרכה. הטיוטות נשמרות בחשבון, וממשיכים אותן מכל מכשיר.",
    points: ["מדריך ודוגמה מלאה", "יום סיור ויחידת הדרכה", "טיוטות שנשמרות"],
    media: (
      <BrowserFrame label="moreyderech.com/guide-reports">
        <Shot src="d-reports.webp" alt="דוחות ההדרכה: הדרך, שלב אחר שלב" />
      </BrowserFrame>
    ),
  },
];

const WHO = {
  student: { label: "לתלמיד", tone: SECTION_TONE.quizzes },
  guide: { label: "למדריך", tone: SECTION_TONE.tours },
} as const;

/** The route map is being rebuilt, so for now a drawn route in its place (owner, 19.11). */
function RouteSketch() {
  return (
    <div className="paper-sheet overflow-hidden p-0">
      <svg viewBox="0 0 400 260" role="img" aria-label="איור: מסלול מסומן על מפה, עם שלוש תחנות" className="block h-auto w-full">
        <rect width="400" height="260" fill="var(--paper)" />
        <g fill="none" stroke="var(--ink-dim)" strokeOpacity="0.35" strokeWidth="1.3">
          <path d="M-10 210c60-30 110-10 160-40s90-70 150-60 80 30 120 10" />
          <path d="M-10 230c70-24 120-4 170-34s100-60 160-50 70 26 100 10" />
          <path d="M40 70c30-30 80-34 110-14s20 50-20 56-110-10-90-42z" />
          <path d="M62 72c20-18 54-20 72-8s12 30-14 34-72-6-58-26z" />
          <path d="M250 40c40-14 90 0 100 30s-40 44-80 34-60-50-20-64z" />
        </g>
        <path d="M30 248c30-20 40-60 80-80" fill="none" stroke="var(--t-blue)" strokeWidth="3" strokeOpacity="0.6" />
        <path d="M70 200C110 190 120 120 170 118S250 150 300 96" fill="none" stroke="var(--t-red)" strokeWidth="4" strokeDasharray="10 8" strokeLinecap="round" />
        {[[70, 200, "חניון"], [170, 118, "תצפית"], [300, 96, "מעיין"]].map(([x, y, t], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="M0 0c-9-12-13-19-13-25a13 13 0 0 1 26 0c0 6-4 13-13 25z" fill={["var(--t-green)", "var(--t-orange)", "var(--t-blue)"][i]} stroke="var(--ink)" strokeWidth="1.5" />
            <circle cy="-25" r="4.5" fill="var(--paint)" />
            <text y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--ink)">{t}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Shelf({ title, art, blocks }: { title: string; art: React.ReactNode; blocks: Block[] }) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-center gap-3">
        <span aria-hidden className="size-14">{art}</span>
        <h2 className="font-[family-name:var(--font-hand)] text-[length:clamp(2.6rem,5vw,3.6rem)] leading-none font-normal text-txt">{title}</h2>
      </div>
      <ul className={`grid gap-4 ${blocks.length > 6 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {blocks.map((b) => (
          <li key={b.title}>
            <Link href={b.href} className="paper-sheet flex h-full items-start gap-4 p-5 transition active:scale-95">
              <span aria-hidden className="grid size-14 flex-none place-items-center rounded-full text-[var(--paint)] shadow-[inset_0_0_0_3px_color-mix(in_srgb,var(--paint)_35%,transparent)]" style={{ background: b.tone }}>
                <InkIcon name={b.icon} size={32} />
              </span>
              <span>
                <span className="block text-xl font-black text-txt">{b.title}</span>
                <span className="mt-1 block text-base leading-snug text-txt-dim">{b.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const FAQ: [string, string][] = [
  ["למי האתר מיועד?", "לתלמידי קורס מורי דרך ולמורי דרך מורשים. יש בו כלים להכנה למבחן לצד מפות, מאגרי מידע ודוחות שחוזרים אליהם כשמכינים סיור."],
  [`מה קורה אחרי ${PRICES.trialDays} ימי הניסיון?`, "אם לא בחרתם מנוי, לא קורה דבר. לא מבקשים כרטיס אשראי לניסיון, ולכן אין חיוב אוטומטי. ההתקדמות שלכם נשמרת."],
  ["אילו כלים מתאימים להכנת סיור?", "מפת השטח עוזרת לבנות מסלול ולבדוק שכבות מידע. מאגרי המידע מרכזים חומר מסיורים ומשיעורים, ובדוחות ההדרכה אפשר לתרגל לוח זמנים ויחידות הדרכה ולשמור טיוטות."],
  ["איך משלמים?", "בעמוד המחירים בוחרים חצי שנה או שנה. חוזרים אליכם, והתשלום בביט. אין מנוי שמתחדש לבד: חודש לפני סוף התקופה מקבלים מייל, ומחליטים אם להמשיך."],
  ["זה מחליף את הקורס?", "לא. האתר משלים את הקורס ועוזר לחזור על החומר, לתרגל ולהתכונן למבחן. הכלים להכנת סיור נשארים זמינים גם לעבודה אחריו."],
  ["על מה מבוססות השאלות?", "על מבחני הרישוי הפומביים של משרד התיירות ועל נושאי הסילבוס. האתר אינו קשור למשרד התיירות."],
  ["זה עובד בטלפון?", "כן. האתר בנוי לטלפון, לטאבלט ולמחשב. נכנסים עם אותו חשבון, וההתקדמות והטעויות נשמרות בחשבון, כך שממשיכים מכל מכשיר."],
  ["מקבלים קבלה?", "כן, קבלה על כל תשלום."],
  ["למי פונים כשיש בעיה?", `כותבים ל-${LAUNCH.supportEmail}, ועונים בדרך כלל תוך יום עסקים.`],
];

export default function WelcomePage() {
  return (
    <div className="screen-in relative">
      <PageDecor birds step={560} figures={["roman", "nabataean", "monk"]} items={["flower", "binoculars", "tree", "canteen", "butterfly", "lake", "compass", "tent", "flower", "signpost"]} />
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 md:grid-cols-[1.05fr_1fr] md:pt-20">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-sm font-bold text-teal">
            לתלמידי הקורס · למורי דרך בעבודה
          </p>
          <h1 className="grad-text text-4xl leading-tight font-black sm:text-5xl">מתחילים בקורס. ממשיכים מכאן לשטח.</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-txt-dim">
            מתכוננים למבחן עם שאלונים, מבחני רישוי ועזרי למידה. אחר כך חוזרים למפות, למאגרי המידע ולדוחות כשבונים מסלול או מכינים הדרכה.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/login/" className={cta} style={ctaStyle}>
              לפתוח {PRICES.trialDays} ימי ניסיון
            </Link>
            <a href="#inside" className="rounded-full border border-line bg-card px-6 py-4 font-bold text-txt transition active:scale-95">
              לראות מה יש באתר
            </a>
          </div>
          <p className="mt-3 text-sm text-txt-dim">בלי כרטיס אשראי · בלי חיוב אוטומטי · עובד בטלפון</p>
        </div>
        <div className="relative">
          <BrowserFrame label="moreyderech.com">
            <Shot src="d-home.webp" alt="דף הבית של האתר" />
          </BrowserFrame>
          <div className="absolute -bottom-10 -left-4 w-[34%] sm:-left-8">
            <Phone src="m-quiz-feedback.webp" alt="שאלה בשאלון בטלפון, עם התשובה הנכונה מסומנת" />
          </div>
        </div>
      </section>

      {/* What's inside: the student's shelf, then the guide's */}
      <section id="inside" aria-label="מה יש באתר" className="mx-auto flex max-w-6xl scroll-mt-20 flex-col gap-14 px-4 py-12">
        <Shelf title="לתלמיד" art={<LiveFlower className={k.move_flower} />} blocks={FOR_STUDENT} />
        <Shelf title="למדריך" art={<LiveTree className={k.move_tree} />} blocks={FOR_GUIDE} />
      </section>

      {/* Features */}
      <div id="features" className="mx-auto flex max-w-6xl scroll-mt-20 flex-col gap-20 px-4 py-14">
        {FEATURES.map((f, i) => (
          <section key={f.id} aria-labelledby={`f-${f.id}`} className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div>
              <p className="mb-3 inline-block rounded-full px-3 py-1 text-sm font-extrabold text-[var(--paint)]" style={{ background: WHO[f.who].tone }}>{WHO[f.who].label}</p>
              <h2 id={`f-${f.id}`} className="font-[family-name:var(--font-hand)] text-[length:clamp(2.4rem,4.4vw,3.2rem)] leading-[1.1] font-normal text-txt">{f.title}</h2>
              <p className="mt-3 leading-relaxed text-txt-dim">{f.text}</p>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-txt">
                {f.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span aria-hidden className="text-teal">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>{f.media}</div>
          </section>
        ))}

        {/* Games */}
        <section aria-labelledby="f-games" className="relative">
          <LiveButterfly aria-hidden className={`absolute -top-6 left-2 hidden w-16 md:block ${k.move_butterfly}`} />
          <div className="text-center">
            <p className="mb-3 inline-block rounded-full px-3 py-1 text-sm font-extrabold text-[var(--paint)]" style={{ background: SECTION_TONE.games }}>משחקים</p>
            <h2 id="f-games" className="font-[family-name:var(--font-hand)] text-[length:clamp(2.4rem,4.4vw,3.2rem)] leading-[1.1] font-normal text-txt">לומדים גם כשמשחקים</h2>
            <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-txt-dim">
              תשבץ חדש בכל יום שישי מתוך חומר הקורס, &quot;מי אני?&quot; עם דמויות מהתנ&quot;ך ועד ביזנטיון, משחק הצמחים שמלמד לזהות בשטח, וטריוויה על כל הארץ.
            </p>
          </div>
          <div className="mt-8 grid items-center gap-6 md:grid-cols-[1.6fr_1fr]">
            <BrowserFrame label="moreyderech.com/games/crossword">
              <Clip name="crossword" label="סרטון: פותרים את תשבץ השבוע" />
            </BrowserFrame>
            <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-4">
              <Phone src="m-who-am-i.webp" alt="המשחק מי אני? בטלפון" />
              <Phone src="m-plants.webp" alt="משחק הצמחים בטלפון: איזה צמח בתמונה?" />
            </div>
          </div>
        </section>

        {/* Moti */}
        <section id="moti" aria-labelledby="f-moti" className="relative grid scroll-mt-20 items-center gap-8 rounded-2xl border border-line bg-card p-6 md:grid-cols-[240px_1fr] md:p-10">
          <LiveFire aria-hidden className={`absolute -bottom-5 left-6 hidden w-14 md:block ${k.move_community}`} />
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img src={withBasePath("/marketing/moti.webp")} alt="איור של מוטי, מורה הדרך הוותיק" width={220} height={275} loading="lazy" className="mx-auto h-auto w-44 md:w-full" />
          <div>
            <p className="mb-3 inline-block rounded-full px-4 py-1.5 text-base font-extrabold text-[var(--paint)]" style={{ background: "var(--sign)" }}>העוזר האישי שלכם</p>
            <h2 id="f-moti" className="font-[family-name:var(--font-hand)] text-[length:clamp(2.6rem,5vw,3.6rem)] leading-[1.1] font-normal text-txt">מוטי, מורה דרך ותיק שזמין לכל שאלה</h2>
            <p className="mt-3 text-lg leading-relaxed text-txt">
              מוטי מחכה בפינה של כל מסך באתר. שואלים אותו על אתר, תקופה, צמח או מושג. מתייעצים איתו לפני סיור, או מבקשים ממנו בוחן לפני המבחן. הוא עונה בכתב או בקול, לתלמידים ולמורי דרך כאחד.
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-base text-txt">
              {["כל שאלה על החומר, לא רק בוחן", "התייעצות לפני סיור", "בכתב או בקול, מכל מסך"].map((p) => (
                <li key={p} className="flex gap-2"><span aria-hidden className="text-teal">✓</span>{p}</li>
              ))}
            </ul>
            <p className="mt-4 text-base leading-relaxed text-txt-dim">
              ובעזרי הלמידה אפשר לדבר גם עם הורדוס, יוסף בן מתתיהו, הלנה ועוד דמויות היסטוריות, שבודקות במקורות לפני שהן עונות.
            </p>
          </div>
        </section>
      </div>

      {/* How it works */}
      <section aria-labelledby="how" className="mx-auto max-w-5xl px-4 py-14">
        <h2 id="how" className="mb-8 text-center font-[family-name:var(--font-hand)] text-[length:clamp(2.4rem,4.4vw,3.2rem)] leading-[1.1] font-normal text-txt">איך מתחילים</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ["נרשמים עם הפרטים", "שם, מייל, טלפון ומחזור. מקבלים קוד כניסה למייל, בלי סיסמה ובלי כרטיס אשראי."],
            [`${PRICES.trialDays} ימים כל הכלים פתוחים`, "מפות, מאגרי מידע, דוחות, שאלונים, מבחנים, צירים, משחקים ומוטי."],
            ["ממשיכים אם זה שימושי לכם", `בוחרים חצי שנה (${PRICES.halfyear} ₪) או שנה (${PRICES.yearly} ₪). חוזרים אליכם, והתשלום בביט.`],
          ].map(([title, text], i) => (
            <li key={title} className="paper-sheet p-5">
              <span className="mb-3 grid size-9 place-items-center rounded-full text-lg font-black text-on-accent" style={ctaStyle}>
                {i + 1}
              </span>
              <h3 className="text-lg font-black text-txt">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-txt-dim">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pricing */}
      <section aria-labelledby="pricing" className="mx-auto max-w-4xl px-4 py-14">
        <h2 id="pricing" className="mb-2 text-center font-[family-name:var(--font-hand)] text-[length:clamp(2.4rem,4.4vw,3.2rem)] leading-[1.1] font-normal text-txt">מנוי אחד ללימודים ולעבודה</h2>
        <p className="mb-8 text-center text-txt-dim">אחרי {PRICES.trialDays} ימי ניסיון חינם בוחרים חצי שנה או שנה. משלמים פעם אחת, בלי חיוב חודשי.</p>
        <PricingCards />
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 py-14">
        <h2 id="faq" className="mb-6 text-center font-[family-name:var(--font-hand)] text-[length:clamp(2.4rem,4.4vw,3.2rem)] leading-[1.1] font-normal text-txt">שאלות נפוצות</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group paper-sheet p-4">
              <summary className="cursor-pointer list-none font-bold text-txt">
                <span className="me-2 inline-block text-teal transition group-open:rotate-45">+</span>
                {q}
              </summary>
              <p className="mt-2 leading-relaxed text-txt-dim">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 pt-6 pb-20 text-center">
        <div className="rounded-2xl border border-line bg-card p-10">
          <h2 className="grad-text text-3xl font-black">למבחן, ולכל סיור שאחריו.</h2>
          <p className="mx-auto mt-3 max-w-xl text-txt-dim">נרשמים בדקה, ובתוך שבוע יודעים אם זה בשבילכם.</p>
          <Link href="/login/" className={`${cta} mt-6`} style={ctaStyle}>
            מתחילים {PRICES.trialDays} ימים חינם
          </Link>
        </div>
      </section>
    </div>
  );
}
