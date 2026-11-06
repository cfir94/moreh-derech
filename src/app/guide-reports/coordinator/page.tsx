import Link from "next/link";
import { EMPHASIS_AREAS, SESSION_DATE } from "@/data/guide-reports/coordinator-session";

export const metadata = {
  title: "דגשי הרכז לחלק ב׳",
};

export default function CoordinatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/guide-reports" className="mb-4 inline-block text-[13px] font-bold text-txt-dim hover:underline">
        ← דוחות הדרכה
      </Link>
      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">דגשי הרכז לחלק ב׳</h1>
        <p className="leading-relaxed text-txt-dim">
          מתוך השיעור של {SESSION_DATE} על החלק השני של המבחן העיוני — כתיבת יום הדרכה. נקודה שמסומנת
          ״המלצה אישית״ היא האסטרטגיה של הרכז, לא כלל של משרד התיירות.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/guide-reports/workshop" className="rounded-full px-5 py-2.5 text-sm font-extrabold text-on-accent transition active:scale-95" style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)" }}>
            לתרגל בסדנה ←
          </Link>
          <Link href="/guide-reports/drills" className="rounded-full border border-line bg-card-2 px-5 py-2.5 text-sm font-extrabold transition active:scale-95">
            תרגילי מיקוד
          </Link>
        </div>
      </header>

      <nav className="mb-8 flex flex-wrap gap-1.5">
        {EMPHASIS_AREAS.map((a) => (
          <a key={a.id} href={`#${a.id}`} className="rounded-full border border-line bg-card px-3 py-1.5 text-[12px] font-bold text-txt-dim hover:bg-card-2">
            {a.icon} {a.title}
          </a>
        ))}
      </nav>

      {EMPHASIS_AREAS.map((a) => (
        <section key={a.id} id={a.id} className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl">{a.icon} {a.title}</h2>
          <div className="flex flex-col gap-3">
            {a.items.map((e) => (
              <article key={e.id} id={e.id} className="scroll-mt-20 rounded-lg border border-line bg-card p-4">
                <h3 className="mb-2 text-[15px]">
                  {e.title}
                  {e.advice && <span className="mr-2 rounded-full border border-line px-2 py-0.5 text-[11px] font-bold text-txt-dim">המלצה אישית</span>}
                </h3>
                <ul className="flex flex-col gap-1.5 text-[13.5px] leading-relaxed text-txt-dim">
                  {e.points.map((p) => <li key={p} className="flex gap-2"><span aria-hidden className="text-teal">◆</span><span>{p}</span></li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
