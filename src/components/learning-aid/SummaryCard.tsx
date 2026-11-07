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
  return <article id={id} className="scroll-mt-36 rounded-lg border border-line bg-card p-5">
    <div className="flex gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {date && <span className="rounded-full bg-card-2 px-2.5 py-1 text-xs font-bold text-txt-dim">{date}</span>}
          {concept && <span className="rounded-full bg-mc px-2.5 py-1 text-xs font-bold text-on-accent">מושג למבחן</span>}
        </div>
        <h2 className="text-lg font-black">{title}</h2>
        <p className="mt-2 leading-7 text-txt-dim">{summary}</p>
      </div>
      {thumb && <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-card-2">{thumb}</div>}
    </div>
    {tags.length > 0 && <ul aria-label="תגיות" className="mt-3 flex flex-wrap gap-2">{tags.slice(0, 3).map((tag) => <li key={tag} className="rounded-full border border-line px-2.5 py-1 text-xs text-txt-dim">{tag}</li>)}</ul>}
    {children && <details className="mt-3 border-t border-line pt-3 text-sm leading-7 text-txt-dim">
      <summary className="min-h-11 cursor-pointer py-2 font-bold text-mc">עוד</summary>
      <div className="screen-in pb-1">{children}</div>
    </details>}
  </article>;
}
