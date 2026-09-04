import type { ExpandedUnit } from "@/data/guide-reports";

export function ExpandedUnitBlock({ unit }: { unit: ExpandedUnit }) {
  return (
    <article className="rounded-lg border border-line bg-card p-5">
      <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="font-extrabold text-txt-dim">האתר</dt>
        <dd>{unit.site}</dd>
        <dt className="font-extrabold text-txt-dim">הנושא</dt>
        <dd>{unit.topic}</dd>
        <dt className="font-extrabold text-txt-dim">מיקום הקבוצה</dt>
        <dd className="leading-relaxed">{unit.groupPosition}</dd>
      </dl>
      <h3 className="mb-2 text-sm font-extrabold text-txt-dim">תוכן ההדרכה</h3>
      <div className="space-y-3 text-[13.5px] leading-relaxed whitespace-pre-wrap">
        {unit.content.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  );
}
