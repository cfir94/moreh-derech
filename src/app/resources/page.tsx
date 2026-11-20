import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { SUMMARIES, getSummary } from "@/data/summaries";
import { TOPICS } from "@/data/topics";
import { QUIZZES } from "@/data/quizzes";
import { kit, PenUnderline } from "@/components/trail/kit";
import { PageDecor } from "@/components/trail/PageDecor";

export const metadata = pageMeta({
  title: "סיכומים וחומרי לימוד",
  description: "סיכום לכל נושא בסילבוס של מורי הדרך, ומה נשאל עליו בפועל במבחני הרישוי.",
  path: "/resources",
});

export default function ResourcesPage() {

  // How often each subject actually comes up in the licensing exams we hold —
  // the honest answer to "what should I study first".
  const bank = QUIZZES.find((q) => q.slug === "past-exams")?.questions ?? [];
  const bankSize = bank.length;
  const byTopic = TOPICS.map((t) => ({
    ...t,
    count: bank.filter((q) => q.topic === t.key).length,
  }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-10">
      <PageDecor items={["resources", "notebooks", "pencil", "scroll"]} />
      <header className="screen-in mb-7">
        <div className={`${kit.titleWrap} mb-2`}>
          <h1 className="grad-text text-3xl">סיכומים וחומרי לימוד</h1>
          <PenUnderline />
        </div>
        <p className="mb-3 max-w-2xl leading-relaxed text-txt-dim">
          סיכום לכל נושא בסילבוס, שכתבנו בעצמנו מחומרי הקורס: התמונה הגדולה, תאריכים,
          דמויות, אתרים ומה לזכור למבחן. <span className="num">{SUMMARIES.length}</span> מתוך{" "}
          <span className="num">{TOPICS.length}</span> נושאים כבר כאן, והשאר בדרך.
        </p>
      </header>


      <section className="mb-8">
        <h2 className="mb-1.5 text-sm font-bold tracking-[0.05em] text-txt-dim">
          לפי נושא: כמה נשאל עליו במבחנים, ומה לקרוא
        </h2>
        <p className="mb-3 max-w-2xl text-sm leading-relaxed text-txt-dim">
          מספר השאלות הוא מתוך{" "}
          <span className="num">{bankSize}</span> שאלות מבחני הרישוי שבאתר —
          כלומר כמה באמת נשאלו על הנושא הזה במבחנים שבידינו. אפשר לתרגל כל נושא
          בנפרד ב
          <Link
            href="/quizzes/past-exams"
            className="font-bold text-teal hover:underline"
          >
            שאלון מבחני הרישוי
          </Link>{" "}
          (מתג &quot;לפי נושא&quot;).
        </p>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {byTopic.map(({ key, label, count }) => (
            <li
              key={key}
              className="flex items-center gap-2.5 rounded-sm border border-line bg-card px-3.5 py-2.5"
            >
              <span className="num w-9 shrink-0 text-[13px] font-extrabold text-gold">
                {count}
              </span>
              <span className="flex-1 text-[13px] font-bold">{label}</span>
              {getSummary(key) ? (
                <Link href={`/summaries/${key}/`} className="shrink-0 text-sm font-bold text-teal hover:underline">
                  לסיכום
                </Link>
              ) : (
                <span className="shrink-0 text-xs text-txt-dim">בקרוב</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-7 text-[13px] text-txt-dim">
        רוצים לבדוק את עצמכם על מה שלמדתם?{" "}
        <Link href="/quizzes" className="font-bold text-teal hover:underline">
          למאגר השאלונים
        </Link>{" "}
        או{" "}
        <Link href="/exams" className="font-bold text-teal hover:underline">
          למבחן רישוי מלא
        </Link>
      </p>
    </div>
  );
}
