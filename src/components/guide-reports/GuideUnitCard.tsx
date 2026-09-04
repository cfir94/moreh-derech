import type { GuideUnit } from "@/data/guide-reports";

export function GuideUnitCard({ unit }: { unit: GuideUnit }) {
  return (
    <article className="rounded-lg border border-line bg-card p-4">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base">
          <span className="num ml-1.5 text-txt-dim">{unit.n}.</span>
          {unit.site}
        </h3>
        <span className="rounded-full border border-line bg-card-2 px-2.5 py-1 text-[11px] font-extrabold text-mc">
          {unit.duration}
        </span>
      </header>
      <p className="mb-3 text-[13px] leading-relaxed whitespace-pre-wrap">
        {unit.content}
      </p>
      {unit.methods && (
        <p className="rounded-md border border-dashed border-line bg-card-2/50 px-3 py-2 text-[12px] text-txt-dim">
          <span className="font-extrabold text-txt">אמצעים מתודיים: </span>
          {unit.methods}
        </p>
      )}
    </article>
  );
}
