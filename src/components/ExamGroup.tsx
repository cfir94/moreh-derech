import type { ReactNode } from "react";

/**
 * One collapsible band on the exams page.
 *
 * The page grew to thirty-odd cards and read as a wall of links, so each group
 * of sittings now opens on demand. It is a plain <details>: the site is a
 * static export, and this way the groups still open with JavaScript off and the
 * browser's own find-in-page can reach a closed one.
 */
export function ExamGroup({
  title,
  count,
  note,
  open = false,
  children,
}: {
  title: string;
  /** How many exams are inside — shown so a closed group still says something. */
  count: number;
  /** The caveat that used to sit under the heading, e.g. "no official key". */
  note?: ReactNode;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={open}
      className="group mb-3 overflow-hidden rounded-lg border border-line"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2.5 bg-card px-4 py-3.5 transition-colors hover:bg-card-2 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="text-[13px] text-txt-dim transition-transform duration-200 group-open:-rotate-90"
        >
          ◀
        </span>
        <h2 className="flex-1 text-sm font-bold tracking-[0.05em]">{title}</h2>
        <span className="num rounded-full border border-line bg-card px-2.5 py-0.5 text-[11px] font-bold text-txt-dim">
          {count}
        </span>
      </summary>

      <div className="border-t border-line px-4 pt-3.5 pb-4">
        {note && (
          <p className="mb-3 max-w-2xl text-[12.5px] leading-relaxed text-txt-dim">
            {note}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{children}</div>
      </div>
    </details>
  );
}
