import type { ReactNode } from "react";
import s from "./examGroup.module.css";

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
    <details open={open} className={`group ${s.group}`}>
      <summary className={s.summary}>
        <span className={s.sign}>
          <span aria-hidden className={s.caret}>
            ◀
          </span>
          <h2 className={s.title}>{title}</h2>
          <span className={`num ${s.count}`}>{count}</span>
        </span>
      </summary>

      <div className={s.body}>
        {note && <p className={s.note}>{note}</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      </div>
    </details>
  );
}
