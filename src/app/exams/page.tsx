import Link from "next/link";
import { EXAMS } from "@/data/exams";
import { LANG_META } from "@/data/exams/types";
import { SectionCard } from "@/components/SectionCard";

export default function ExamsPage() {
  const official = EXAMS.filter((e) => e.keySource === "official");
  const derived = EXAMS.filter((e) => e.keySource === "derived");
  const course = EXAMS.filter((e) => e.keySource === "course");
  const total = EXAMS.reduce((s, e) => s + e.questions.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">מבחני רישוי — מבחן מלא</h1>
        <p className="max-w-2xl leading-relaxed text-txt-dim">
          <span className="num">{official.length + derived.length}</span> מועדי
          מבחן של משרד התיירות ועוד{" "}
          <span className="num">{course.length}</span> מבחני תרגול של הקורס,{" "}
          <span className="num">{total}</span> שאלות בסך הכל, בתנאים של
          המבחן האמיתי: התשובה לא נחשפת בזמן המענה, אפשר לנוע קדימה ואחורה
          ולשנות תשובות, וההגשה בסוף היא זו שנותנת את הציון.
        </p>
      </header>

      <h2 className="mb-3 text-sm font-bold tracking-[0.05em] text-txt-dim">
        עם מפתח תשובות רשמי
      </h2>
      <div className="mb-9 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {official.map((exam, i) => (
          <SectionCard
            key={exam.slug}
            index={i}
            href={`/exams/${exam.slug}`}
            slug="exams"
            title={exam.date}
            description={exam.languages
              .map((l) => LANG_META[l].name)
              .join(" · ")}
            meta={`${exam.questions.length} שאלות`}
          />
        ))}
      </div>

      <h2 className="mb-1.5 text-sm font-bold tracking-[0.05em] text-txt-dim">
        בלי מפתח רשמי — תשובות שנקבעו על ידי המערכת
      </h2>
      <p className="mb-3 max-w-2xl text-[12.5px] leading-relaxed text-txt-dim">
        למועדים האלה משרד התיירות מעולם לא פרסם פתרון. השאלות מקוריות, אבל
        התשובות המסומנות בהם נקבעו על ידי המערכת — ייתכנו טעויות, ובמסך התוצאות
        מסומנות התשובות שפחות ודאיות. שווה לתרגל, לא שווה לשנן בעיניים עצומות.
      </p>
      <div className="mb-9 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {derived.map((exam, i) => (
          <SectionCard
            key={exam.slug}
            index={i}
            href={`/exams/${exam.slug}`}
            slug="past-exams"
            title={exam.date}
            description="תשובות לא רשמיות · עברית"
            badge="לא רשמי"
            meta={`${exam.questions.length} שאלות`}
          />
        ))}
      </div>

      <h2 className="mb-1.5 text-sm font-bold tracking-[0.05em] text-txt-dim">
        מבחני תרגול של הקורס
      </h2>
      <p className="mb-3 max-w-2xl text-[12.5px] leading-relaxed text-txt-dim">
        לא מבחני משרד התיירות, אלא מבחני תרגול שנכתבו לקורס — עם שאלות השלמה
        לצד שאלות אמריקאיות, ועם <b>הסבר לכל תשובה</b>. שאלות ההשלמה נבדקות
        בהתאמה גמישה, ואפשר לסמן ידנית תשובה כנכונה אם ניסחתם אותה אחרת.
      </p>
      <div className="mb-9 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {course.map((exam, i) => (
          <SectionCard
            key={exam.slug}
            index={i}
            href={`/exams/${exam.slug}`}
            slug="quizzes"
            title={exam.label.he}
            description={`${exam.questions.filter((q) => q.kind === "fill").length} שאלות השלמה · הסבר לכל תשובה`}
            meta={`${exam.questions.length} שאלות`}
          />
        ))}
      </div>

      <div className="rounded-md border border-line bg-card p-4 text-[12.5px] leading-relaxed text-txt-dim">
        <p className="mb-2">
          <b className="text-txt">מה עוד חסר?</b> לקיץ 2020, קיץ 2022, קיץ 2024,
          חורף 2025 וקיץ 2025 אין בידינו לא מפתח ולא פתרון — הם לא כאן.
        </p>
        <p>
          במועדים עם מפתח רשמי, שאלה שסימונה במפתח אינו חד-משמעי נשמטת, ולכן
          חלקם קצרים מ-<span className="num">33</span> שאלות. רוצים לתרגל שאלות
          בודדות מכל השנים, עם תשובה מיד?{" "}
          <Link
            href="/quizzes/past-exams"
            className="font-bold text-teal hover:underline"
          >
            שאלון מבחני הרישוי
          </Link>
        </p>
      </div>
    </div>
  );
}
