import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { EXAMS } from "@/data/exams";
import { LANG_META } from "@/data/exams/types";
import { SectionCard } from "@/components/SectionCard";
import { ExamGroup } from "@/components/ExamGroup";
import { InkIcon } from "@/components/trail/Ink";
import { PageHead, TrailPage } from "@/components/trail/kit";

/** The blocks the course examined separately; see tools/import_course_exams.py. */
const FIRST_BLOCK = "חי, צומח, גיאולוגיה, פרהיסטוריה, מבוא לארכיאולוגיה וברונזה";
const THIRD_BLOCK =
  "בית שני, התקופה הרומית, התקופה הביזנטית וארכיאולוגיה קלאסית";

function fills(exam: { questions: { kind?: string }[] }) {
  const n = exam.questions.filter((q) => q.kind === "fill").length;
  return n ? `${n} שאלות השלמה · הסבר לכל תשובה` : "הסבר לכל תשובה";
}

export const metadata = pageMeta({
  title: "מבחני רישוי מלאים",
  description: "מבחני רישוי מלאים למורי דרך ממועדים קודמים ומבחני הקורס, בתנאי אמת, עם שאלות רב־ברירה והשלמה, הגשה, ציון והסברים לתשובות.",
  path: "/exams",
});

export default function ExamsPage() {
  const official = EXAMS.filter((e) => e.keySource === "official");
  const derived = EXAMS.filter((e) => e.keySource === "derived");
  const course = EXAMS.filter((e) => e.keySource === "course");
  const firstBlock = course.filter((e) => e.subjects === FIRST_BLOCK);
  const thirdBlock = course.filter((e) => e.subjects === THIRD_BLOCK);
  const secondBlock = course.filter(
    (e) => e.subjects !== FIRST_BLOCK && e.subjects !== THIRD_BLOCK,
  );
  const total = EXAMS.reduce((s, e) => s + e.questions.length, 0);

  return (
    <TrailPage>
      <PageHead
        title="מבחן מלא"
        art={<InkIcon name="exams" size={112} />}
        lede={
          <>
            <span className="num">{official.length + derived.length}</span> מועדי מבחן של משרד התיירות ועוד{" "}
            <span className="num">{course.length}</span> מבחני תרגול של הקורס,{" "}
            <span className="num">{total.toLocaleString("he-IL")}</span> שאלות, בתנאים של המבחן האמיתי: התשובה לא
            נחשפת בזמן המענה, אפשר לנוע קדימה ואחורה, והציון ניתן רק בהגשה.
          </>
        }
      />

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
            badge="רשמי"
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
        title={`מבחני הקורס — ${THIRD_BLOCK}`}
        count={thirdBlock.length}
        open
        note="לקראת המבחן הקרוב, לפי דגשי הרכז: הרצאות אייל מירון, רשימות
          המושגים של כל יחידה וסיורי ארז בירושלים. 50 פריטים בכל מבחן, מהם
          12 שאלות השלמה."
      >
        {thirdBlock.map((exam, i) => (
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

      <div className="mt-10 max-w-3xl rounded-[5px] bg-[var(--paper)] p-5 text-[1.05rem] leading-relaxed text-txt-dim shadow-[0_0_0_1px_var(--line),var(--shadow)]">
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
    </TrailPage>
  );
}
