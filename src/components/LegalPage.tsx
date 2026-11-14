import Link from "next/link";
import { LEGAL_DOCS, LEGAL_UPDATED, type LegalDoc } from "@/data/legal";

/** תבנית אחידה לדפי המשפט: ניווט ביניהם, תוכן עניינים קצר, ותאריך עדכון. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="screen-in mx-auto max-w-2xl px-4 py-10">
      <nav aria-label="מסמכים" className="mb-6 flex flex-wrap gap-2 text-sm">
        {LEGAL_DOCS.map((d) => (
          <Link
            key={d.slug}
            href={`/legal/${d.slug}/`}
            aria-current={d.slug === doc.slug ? "page" : undefined}
            className={`rounded-full border px-3 py-1.5 font-bold ${d.slug === doc.slug ? "border-teal text-teal" : "border-line text-txt-dim hover:text-txt"}`}
          >
            {d.title}
          </Link>
        ))}
      </nav>
      <h1 className="grad-text mb-2 text-3xl">{doc.title}</h1>
      <p className="mb-2 text-sm text-txt-dim">עודכן: {LEGAL_UPDATED}</p>
      <p className="mb-8 leading-relaxed text-txt">{doc.intro}</p>
      {doc.sections.map((section, i) => (
        <section key={section.title} className="mb-6">
          <h2 className="mb-2 text-lg font-black text-txt">
            {i + 1}. {section.title}
          </h2>
          {section.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mb-2 leading-relaxed text-txt-dim">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
