/** A small drawn chevron. In RTL "previous" points right and "next" points left. */
export function Chevron({ dir }: { dir: "prev" | "next" }) {
  return <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === "next" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>;
}
