import Link from "next/link";
import { EXAMS } from "@/data/exams";
import { LANG_META } from "@/data/exams/types";
import { SectionCard } from "@/components/SectionCard";

export default function ExamsPage() {
  const total = EXAMS.reduce((s, e) => s + e.questions.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">מבחני רישוי — מבחן מלא</h1>
        <p className="max-w-2xl leading-relaxed text-txt-dim">
          <span className="num">{EXAMS.length}</span> מועדי מבחן של משרד
          התיירות, <span className="num">{total}</span> שאלות בסך הכל, בתנאים של
          המבחן האמיתי: התשובה לא נחשפת בזמן המענה, אפשר לנוע קדימה ואחורה
          ולשנות תשובות, וההגשה בסוף היא זו שנותנת את הציון. כל השאלות והתשובות
          נלקחו ממפתחות התשובות הרשמיים.
        </p>
      </header>

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {EXAMS.map((exam, i) => (
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

      <div className="rounded-md border border-line bg-card p-4 text-[12.5px] leading-relaxed text-txt-dim">
        <p className="mb-2">
          <b className="text-txt">למה חלק מהמועדים חסרים?</b> מבחן נכלל כאן רק
          כשיש בידינו את <b>מפתח התשובות הרשמי</b> שלו. למועדי קיץ 2020, קיץ
          2022, קיץ 2024, חורף 2025 וקיץ 2025 יש רק את השאלות — ותשובה מנוחשת
          לקראת מבחן רישוי גרועה מכלום.
        </p>
        <p>
          מאותה סיבה, שאלה בודדת שבה סימון התשובה במפתח אינו חד-משמעי נשמטת
          מהמועד שלה, ולכן חלק מהמועדים קצרים מ-<span className="num">33</span>{" "}
          שאלות. רוצים לתרגל שאלות בודדות מכל השנים, עם תשובה מיד?{" "}
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
