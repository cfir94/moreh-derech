import type { Metadata } from "next";
import Link from "next/link";
import { BrowserFrame, Clip, Phone, Shot } from "@/components/landing/Media";
import { PricingCards } from "@/components/paywall/PricingCards";
import { EXAMS, MINISTRY_EXAMS } from "@/data/exams";
import { QUIZZES } from "@/data/quizzes";
import { withBasePath } from "@/lib/basePath";
import { LAUNCH, PRICES, SITE_URL } from "@/lib/launch";

export const metadata: Metadata = {
  title: { absolute: "אבן דרך למורי דרך — כל ההכנה למבחן הרישוי במקום אחד" },
  description: `מבחני רישוי אמיתיים בתנאי אמת, אלפי שאלות לפי נושא, תרגול טעויות חכם, צירי זמן, מפות ומשחקים. ${PRICES.trialDays} ימים ראשונים חינם, בלי כרטיס אשראי.`,
  openGraph: {
    title: "אבן דרך למורי דרך — כל ההכנה למבחן הרישוי במקום אחד",
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
const ctaStyle = { background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)", boxShadow: "0 12px 30px -10px var(--teal)" };

const FEATURES: {
  id: string;
  kicker: string;
  title: string;
  text: string;
  points: string[];
  media: React.ReactNode;
}[] = [
  {
    id: "exams",
    kicker: "מבחן רישוי",
    title: "מתאמנים על המבחן האמיתי, בתנאים אמיתיים",
    text: `${MINISTRY_EXAMS.length} מועדים של מבחן הרישוי של משרד התיירות, ועוד ${EXAMS.length - MINISTRY_EXAMS.length} מבחני קורס. בלי לראות תשובות באמצע, עם הגשה בסוף, ציון ופירוט מלא.`,
    points: ["מפתח תשובות רשמי ככל שפורסם", "עברית, אנגלית וערבית לפי המועד", "כל טעות נכנסת אוטומטית לתרגול הטעויות"],
    media: (
      <BrowserFrame label="moreyderech.com/exams">
        <Shot src="d-exams.webp" alt="רשימת מועדי מבחן הרישוי באתר" />
      </BrowserFrame>
    ),
  },
  {
    id: "practice",
    kicker: "תרגול חכם",
    title: "האתר זוכר מה עוד לא יושב לכם",
    text: `${round(questionCount)}+ שאלות לפי נושאי הסילבוס. טעיתם? השאלה חוזרת אליכם בסבב "תרגול טעויות", עד שתענו נכון. כל טעות מפנה לחומר שכדאי לחזור עליו.`,
    points: ["שאלון אחד לכל נושא בסילבוס", "הסבר אחרי כל שאלה", "התקדמות אישית לכל משתמש"],
    media: (
      <BrowserFrame label="moreyderech.com/quizzes">
        <Clip name="quiz" label="סרטון: עונים על שאלה בשאלון ומקבלים משוב" />
      </BrowserFrame>
    ),
  },
  {
    id: "atlas",
    kicker: "צירי זמן",
    title: "3.6 מיליון שנה על ציר אחד",
    text: "אטלס הזמן מחבר את כל מה שלומדים, מראשית האדם ועד הכיבוש המוסלמי: דמויות, אילן יוחסין, אירועים ואיורים. לצדו צירים מעוצבים לתקופה הרומית, הביזנטית, בית שני ועוד.",
    points: ["מי היה אבא של מי, ומי מלך אחרי מי", "זום חופשי בזמן", "אירועים עם תמונות מהשטח"],
    media: (
      <BrowserFrame label="moreyderech.com/timelines/history-atlas">
        <Clip name="atlas" label="סרטון: גוללים באטלס הזמן" />
      </BrowserFrame>
    ),
  },
  {
    id: "map",
    kicker: "מפת למידה",
    title: "איפה זה, מי בנה ומתי",
    text: "אתרי בית שני, התקופה הרומית והביזנטית על מפה מאוירת. לכל אתר: מי בנה ומתי, מה רואים בשטח, ניסוחי מבחן ותמונה. ויש גם תרגול: \"איפה זה?\" ו\"מה זה?\".",
    points: ["סינון לפי תקופה, בונה ודת", "ירושלים בגיליון מוגדל", "תרגול שמחזיר את מה שטעיתם בו"],
    media: (
      <BrowserFrame label="moreyderech.com/map/learn">
        <Shot src="d-learn-map.webp" alt="מפת הלמידה: רשימת אתרים לצד מפה מאוירת" />
      </BrowserFrame>
    ),
  },
  {
    id: "architecture",
    kicker: "אדריכלות קלאסית",
    title: "סדרים, מקדשים ואמות מים, בתלת-ממד",
    text: "12 לוחות אינטראקטיביים: מושגי היסוד של האדריכלות הקלאסית, מהעמוד הדורי ועד הבסיליקה. מסובבים, לוחצים על חלק ומקבלים הסבר קצר שאפשר לזכור.",
    points: ["מודלים בתלת-ממד", "מילון מושגים מרשימת המטלה", "תמונות מהשטח עם קרדיט"],
    media: (
      <BrowserFrame label="moreyderech.com/timelines/classical-architecture">
        <Clip name="architecture" label="סרטון: עמוד בתלת-ממד מסתובב" />
      </BrowserFrame>
    ),
  },
];

const FAQ: [string, string][] = [
  ["מה קורה אחרי שבוע הניסיון?", "כלום, אם לא בחרתם מנוי. לא מבקשים כרטיס אשראי לניסיון, ולכן אין חיוב אוטומטי. ההתקדמות שלכם נשמרת."],
  ["איך מבטלים מנוי?", "כפתור אחד באזור האישי. המנוי לא יתחדש, והגישה נמשכת עד סוף התקופה ששולמה."],
  ["זה מחליף את הקורס?", "לא. האתר משלים את הקורס: הוא עוזר לחזור על החומר, לתרגל ולהגיע למבחן מוכנים."],
  ["על מה מבוססות השאלות?", "על מבחני הרישוי הפומביים של משרד התיירות ועל נושאי הסילבוס. האתר אינו קשור למשרד התיירות."],
  ["זה עובד בטלפון?", "כן. האתר בנוי לטלפון, לטאבלט ולמחשב, ונכנסים עם אותו חשבון בכולם. ההתקדמות והטעויות נשמרות בחשבון, וממשיכים מכל מכשיר מאיפה שעצרתם."],
  ["מקבלים חשבונית?", "כן. חשבונית או קבלה נשלחת במייל אחרי כל תשלום."],
  ["למי פונים כשיש בעיה?", `כותבים ל-${LAUNCH.supportEmail}, ועונים בדרך כלל תוך יום עסקים.`],
];

export default function WelcomePage() {
  return (
    <div className="screen-in">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 md:grid-cols-[1.05fr_1fr] md:pt-20">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-bold text-teal">
            לתלמידי קורס מורי דרך · לקראת מבחן הרישוי
          </p>
          <h1 className="grad-text text-4xl leading-tight font-black sm:text-5xl">כל ההכנה למבחן מורי הדרך, במקום אחד</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-txt-dim">
            מבחני רישוי אמיתיים, אלפי שאלות לפי נושא, צירי זמן, מפות ומשחקים. ותרגול שזוכר בדיוק מה עוד צריך לחזור עליו.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/login/" className={cta} style={ctaStyle}>
              {PRICES.trialDays} ימים ראשונים חינם
            </Link>
            <a href="#features" className="rounded-full border border-line bg-card px-6 py-4 font-bold text-txt transition active:scale-95">
              מה יש באתר?
            </a>
          </div>
          <p className="mt-3 text-sm text-txt-dim">בלי כרטיס אשראי · ביטול בלחיצה · עובד בטלפון</p>
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

      {/* Numbers */}
      <section aria-label="במספרים" className="mx-auto max-w-5xl px-4 py-8">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            [`${round(questionCount)}+`, "שאלות תרגול"],
            [String(MINISTRY_EXAMS.length), "מועדי מבחן רישוי"],
            [String(EXAMS.length - MINISTRY_EXAMS.length), "מבחני קורס"],
            ["13", "דמויות לשיחה, כולל מוטי"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border border-line bg-card p-4 text-center">
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="block text-3xl font-black text-txt">{value}</span>
                <span className="text-sm text-txt-dim">{label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Features */}
      <div id="features" className="mx-auto flex max-w-6xl scroll-mt-20 flex-col gap-20 px-4 py-14">
        {FEATURES.map((f, i) => (
          <section key={f.id} aria-labelledby={`f-${f.id}`} className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div>
              <p className="mb-2 text-sm font-bold text-teal">{f.kicker}</p>
              <h2 id={`f-${f.id}`} className="text-3xl leading-tight font-black text-txt">{f.title}</h2>
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
        <section aria-labelledby="f-games" className="text-center">
          <p className="mb-2 text-sm font-bold text-teal">משחקים</p>
          <h2 id="f-games" className="text-3xl font-black text-txt">לומדים גם כשמשחקים</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-txt-dim">
            &quot;מי אני?&quot; עם דמויות מהתנ&quot;ך ועד ביזנטיון, &quot;גלימות ירושלים&quot; לזיהוי אנשי דת לפי הלבוש, ותשבץ חדש בכל שבוע מתוך חומר הקורס.
          </p>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-4 sm:gap-8">
            <Phone src="m-who-am-i.webp" alt="המשחק מי אני? בטלפון" />
            <Phone src="m-robes.webp" alt="המשחק גלימות ירושלים בטלפון" />
            <Phone src="m-crossword.webp" alt="תשבץ השבוע בטלפון" />
          </div>
        </section>

        {/* Moti */}
        <section aria-labelledby="f-moti" className="grid items-center gap-8 rounded-2xl border border-line bg-card p-6 md:grid-cols-[220px_1fr] md:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img src={withBasePath("/marketing/moti.webp")} alt="איור של מוטי, מורה הדרך הוותיק" width={220} height={275} loading="lazy" className="mx-auto h-auto w-44 md:w-full" />
          <div>
            <p className="mb-2 text-sm font-bold text-teal">מוטי</p>
            <h2 id="f-moti" className="text-3xl font-black text-txt">מורה דרך ותיק שבוחן אתכם, בכתב או בקול</h2>
            <p className="mt-3 leading-relaxed text-txt-dim">
              שואלים את מוטי כל שאלה על החומר, או מבקשים ממנו בוחן בנושא מסוים. ואפשר לדבר גם עם הורדוס, עם יוסף בן מתתיהו, עם הלנה ועוד תשע דמויות היסטוריות, שמחפשות במקורות לפני שהן עונות.
            </p>
          </div>
        </section>
      </div>

      {/* How it works */}
      <section aria-labelledby="how" className="mx-auto max-w-5xl px-4 py-14">
        <h2 id="how" className="mb-8 text-center text-3xl font-black text-txt">איך מתחילים</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ["נרשמים עם מייל", "מקבלים קוד כניסה למייל. בלי סיסמה ובלי כרטיס אשראי."],
            [`${PRICES.trialDays} ימים הכול פתוח`, "שאלונים, מבחנים, צירים, מפות, משחקים ומוטי."],
            ["ממשיכים אם מתאים", `${PRICES.halfyear} ₪ לחצי שנה או ${PRICES.yearly} ₪ לשנה. בלי חיוב אוטומטי.`],
          ].map(([title, text], i) => (
            <li key={title} className="rounded-lg border border-line bg-card p-5">
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
        <h2 id="pricing" className="mb-2 text-center text-3xl font-black text-txt">מחיר פשוט, וכל הכלים פתוחים</h2>
        <p className="mb-8 text-center text-txt-dim">אחרי {PRICES.trialDays} ימי ניסיון חינם.</p>
        <PricingCards />
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 py-14">
        <h2 id="faq" className="mb-6 text-center text-3xl font-black text-txt">שאלות נפוצות</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-lg border border-line bg-card p-4">
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
          <h2 className="grad-text text-3xl font-black">המבחן מתקרב. מתחילים להתכונן היום.</h2>
          <p className="mx-auto mt-3 max-w-xl text-txt-dim">נרשמים בדקה, ובתוך שבוע כבר יודעים מה עוד חסר.</p>
          <Link href="/login/" className={`${cta} mt-6`} style={ctaStyle}>
            מתחילים {PRICES.trialDays} ימים חינם
          </Link>
        </div>
      </section>
    </div>
  );
}
