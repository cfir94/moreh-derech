import Link from "next/link";
import { EXAMS } from "@/data/exams";
import { EXAM_LANGS, LANG_META } from "@/data/exams/types";
import { SectionCard } from "@/components/SectionCard";

export default function ExamsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">מבחני רישוי — מבחן מלא</h1>
        <p className="max-w-2xl leading-relaxed text-txt-dim">
          מבחן שלם של משרד התיירות, בתנאים של המבחן האמיתי: התשובה לא נחשפת
          בזמן המענה, אפשר לנוע קדימה ואחורה ולשנות תשובות, וההגשה בסוף היא זו
          שנותנת את הציון. השאלות והתשובות נלקחו ממפתחות התשובות הרשמיים.
        </p>
      </header>

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {EXAMS.map((exam, i) => (
          <SectionCard
            key={exam.slug}
            index={i}
            href={`/exams/${exam.slug}`}
            slug="exams"
            title={exam.label.he}
            description={`${exam.questions.length} שאלות · ${EXAM_LANGS.map(
              (l) => LANG_META[l].name,
            ).join(" · ")}`}
            meta="מבחן מלא"
          />
        ))}
      </div>

      <p className="text-[13px] text-txt-dim">
        רוצים לתרגל שאלות בודדות מכל השנים, עם תשובה מיד?{" "}
        <Link
          href="/quizzes/past-exams"
          className="font-bold text-teal hover:underline"
        >
          שאלון מבחני הרישוי
        </Link>
      </p>
    </div>
  );
}
