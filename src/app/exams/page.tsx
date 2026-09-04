import Link from "next/link";
import { EXAMS } from "@/data/exams";
import { LANG_META } from "@/data/exams/types";
import { SectionCard } from "@/components/SectionCard";
import { ExamGroup } from "@/components/ExamGroup";

/** The blocks the course examined separately; see tools/import_course_exams.py. */
const FIRST_BLOCK = "חי, צומח, גיאולוגיה, פרהיסטוריה, מבוא לארכיאולוגיה וברונזה";

function fills(exam: { questions: { kind?: string }[] }) {
  const n = exam.questions.filter((q) => q.kind === "fill").length;
  return n ? `${n} שאלות השלמה · הסבר לכל תשובה` : "הסבר לכל תשובה";
}

export default function ExamsPage() {
  const official = EXAMS.filter((e) => e.keySource === "official");
  const derived = EXAMS.filter((e) => e.keySource === "derived");
  const course = EXAMS.filter((e) => e.keySource === "course");
  const firstBlock = course.filter((e) => e.subjects === FIRST_BLOCK);
  const secondBlock = course.filter((e) => e.subjects !== FIRST_BLOCK);
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

      <ExamGroup
        title="משרד התיירות — עם מפתח תשובות רשמי"
        count={official.length}
        open
      >
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
      </ExamGroup>

      <ExamGroup
        title="משרד התיירות — בלי מפתח רשמי"
        count={derived.length}
        note="למועדים האלה משרד התיירות מעולם לא פרסם פתרון. השאלות מקוריות, אבל
          התשובות המסומנות בהם נקבעו על ידי המערכת — ייתכנו טעויות, ובמסך
          התוצאות מסומנות התשובות שפחות ודאיות. שווה לתרגל, לא שווה לשנן
          בעיניים עצומות."
      >
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
      </ExamGroup>

      <ExamGroup
        title={`מבחני הקורס — ${FIRST_BLOCK}`}
        count={firstBlock.length}
        note="מבחני התרגול של הבלוק הראשון: שאלות אמריקאיות לצד שאלות השלמה,
          עם הסבר לכל תשובה. שאלות ההשלמה נבדקות בהתאמה גמישה, ואפשר לסמן
          ידנית תשובה כנכונה אם ניסחתם אותה אחרת."
      >
        {firstBlock.map((exam, i) => (
          <SectionCard
            key={exam.slug}
            index={i}
            href={`/exams/${exam.slug}`}
            slug="quizzes"
            title={exam.label.he}
            description={fills(exam)}
            meta={`${exam.questions.length} שאלות`}
          />
        ))}
      </ExamGroup>

      <ExamGroup
        title="מבחני הקורס — יהדות, נצרות, ברזל וגבולות"
        count={secondBlock.length}
        note="מבחני הבלוק השני — דגשי הרכז והמבחנים הנושאיים. אלה המבחנים
          הארוכים (50 פריטים), ובהם החלק הגדול של שאלות ההשלמה."
      >
        {secondBlock.map((exam, i) => (
          <SectionCard
            key={exam.slug}
            index={i}
            href={`/exams/${exam.slug}`}
            slug="quizzes"
            title={exam.label.he}
            description={fills(exam)}
            meta={`${exam.questions.length} שאלות`}
          />
        ))}
      </ExamGroup>

      <div className="mt-6 rounded-md border border-line bg-card p-4 text-[12.5px] leading-relaxed text-txt-dim">
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
