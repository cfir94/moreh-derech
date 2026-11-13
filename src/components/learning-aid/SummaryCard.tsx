import { Stamp } from "@/components/trail/kit";
import type { ReactNode } from "react";

export type SummaryCardProps = {
  id: string;
  title: string;
  date?: string;
  summary: string;
  tags?: readonly string[];
  concept?: boolean;
  thumb?: ReactNode;
  children?: ReactNode;
};

export function SummaryCard({ id, title, date, summary, tags = [], concept, thumb, children }: SummaryCardProps) {
  return <article id={id} className="scroll-mt-36 rounded-[5px] bg-[var(--paper)] p-5 shadow-[0_0_0_1px_var(--line),var(--shadow)]">
    <div className="flex gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {date && <span className="pencil text-base text-txt-dim">{date}</span>}
          {concept && <Stamp tone="red">מושג למבחן</Stamp>}
        </div>
        <h2 className="text-[1.3rem] leading-snug font-black">{title}</h2>
        <p className="mt-2 text-[1.08rem] leading-relaxed text-txt-dim">{summary}</p>
      </div>
      {thumb && <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-card-2">{thumb}</div>}
    </div>
    {tags.length > 0 && <ul aria-label="תגיות" className="mt-3 flex flex-wrap gap-2">{tags.slice(0, 3).map((tag) => <li key={tag} className="rounded-full border border-dashed border-line px-3 py-1 text-sm text-txt-dim">{tag}</li>)}</ul>}
    {children && <details className="mt-3 border-t border-dashed border-line pt-2 text-base leading-7 text-txt-dim">
      <summary className="min-h-11 cursor-pointer py-2 font-[family-name:var(--font-note)] font-bold text-[var(--t-red)] underline underline-offset-4">עוד</summary>
      <div className="screen-in pb-1">{children}</div>
    </details>}
  </article>;
}
