import { embedUrl } from "@/lib/basePath";

const quizzes = [
  {
    slug: "general",
    title: "שאלון כללי למורי דרך",
    description: "מאגר שאלות רב-נושאי המכסה את עיקרי חומר הקורס.",
  },
  {
    slug: "geology",
    title: "גיאולוגיה",
    description: "טקטוניקת לוחות, סלעים, בקע ים המלח וגיאומורפולוגיה של ארץ ישראל.",
  },
  {
    slug: "history",
    title: "היסטוריה",
    description: "שאלות היסטוריה לאורך התקופות הנלמדות בקורס.",
  },
  {
    slug: "iron-age",
    title: "תקופת הברזל",
    description: "ממלכות ישראל ויהודה, ערים מרכזיות וממצאים מהתקופה.",
  },
];

export default function QuizzesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">מאגר שאלונים</h1>
      <p className="mb-8 text-neutral-600">
        שאלונים אמריקאיים (רב-ברירה) לפי קטגוריות מהחומר הנבחן במבחן מורי
        דרך. כל שאלון נפתח בעמוד נפרד; בסיום השאלון התוצאה נשמרת אוטומטית
        ומופיעה באזור האישי שלכם.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quizzes.map((q) => (
          <a
            key={q.slug}
            href={embedUrl(`quizzes/${q.slug}/`)}
            className="rounded-lg border border-neutral-200 p-5 transition hover:border-neutral-400 hover:shadow-sm"
          >
            <h2 className="mb-1 font-semibold">{q.title}</h2>
            <p className="text-sm text-neutral-600">{q.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
