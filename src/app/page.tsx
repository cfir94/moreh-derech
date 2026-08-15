import Link from "next/link";

const sections = [
  {
    href: "/quizzes",
    title: "מאגר שאלונים",
    description: "שאלונים אמריקאיים לפי קטגוריות מהחומר הנבחן.",
  },
  {
    href: "/guide-reports",
    title: "דוחות הדרכה",
    description: "לפי דרישות משרד התיירות + סימולציית בניית מסלול.",
  },
  {
    href: "/videos",
    title: "סרטונים מומלצים",
    description: "קישורים לסרטונים שמומלץ לצפות בהם.",
  },
  {
    href: "/timelines",
    title: "צירי זמן",
    description: "תקופות, נצרות, תולדות ירושלים ועוד.",
  },
  {
    href: "/map",
    title: "מפה אינטראקטיבית",
    description: "מפת ישראל עם נקודות ציון והסברים.",
  },
  {
    href: "/me",
    title: "אזור אישי",
    description: "מעקב התקדמות, טעויות חוזרות ומה נשאר לתרגל.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">מורי דרך</h1>
      <p className="mb-10 max-w-xl text-neutral-600">
        המקום המרכזי לכל מה שתלמיד בקורס מורי דרך צריך — שאלונים, דוחות
        הדרכה, צירי זמן, מפה אינטראקטיבית ומעקב התקדמות אישי.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-lg border border-neutral-200 p-5 transition hover:border-neutral-400 hover:shadow-sm"
          >
            <h2 className="mb-1 font-semibold">{section.title}</h2>
            <p className="text-sm text-neutral-600">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
