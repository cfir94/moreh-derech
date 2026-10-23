"use client";

import { Children, createContext, isValidElement, useContext, useState, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import styles from "./Architecture.module.css";
import studio from "./Studio.module.css";

export { styles };

export function cx(...names: (string | false | null | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

export type PartInfo = { title: string; latin?: string; text: string; site?: string };

/**
 * One active part per drawing. Hover, focus and tap all pick a part, so the
 * same drawing works with a mouse, a keyboard and a finger.
 */
export function usePick<T extends string>(initial: T) {
  const [active, setActive] = useState<T>(initial);
  const bind = (id: T, label: string, extra?: string) => ({
    className: cx(styles.part, active === id && styles.hot, extra),
    tabIndex: 0,
    role: "button" as const,
    "aria-label": label,
    "aria-pressed": active === id,
    "data-part": id,
    onMouseEnter: () => setActive(id),
    onFocus: () => setActive(id),
    onClick: () => setActive(id),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActive(id); }
    },
  });
  return { active, setActive, bind };
}

/**
 * A titled group inside a plate. On the long page it is just its children;
 * in the studio each Section becomes a tab of its chapter.
 */
export function Section({ children }: { title: string; children: ReactNode }) {
  return <>{children}</>;
}

export type ExtraSection = { title: string; node: ReactNode; last?: boolean };
/** Studio mode: chapters render as tabbed screens, and may get extra tabs (the 3D models). */
export const StudioContext = createContext<{ on: boolean; extras: Record<string, ExtraSection[]> }>({ on: false, extras: {} });

export function Plate({ id, numeral, title, lead, children }: { id: string; numeral: string; title: string; lead: ReactNode; children: ReactNode }) {
  const ctx = useContext(StudioContext);
  if (ctx.on) return <StudioPlate id={id} numeral={numeral} title={title} lead={lead}>{children}</StudioPlate>;
  return <section id={`ch-${id}`} className={styles.plate} aria-labelledby={`ch-${id}-title`}>
    <header className={styles.plateHead}>
      <span className={styles.plateNo} aria-hidden>TAB · {numeral}</span>
      <h2 id={`ch-${id}-title`}>{title}</h2>
      <p>{lead}</p>
    </header>
    {children}
  </section>;
}

function StudioPlate({ id, numeral, title, lead, children }: { id: string; numeral: string; title: string; lead: ReactNode; children: ReactNode }) {
  const { extras } = useContext(StudioContext);
  const own = Children.toArray(children)
    .filter((child): child is ReactElement<{ title: string; children: ReactNode }> => isValidElement(child) && child.type === Section)
    .map((child) => ({ title: child.props.title, node: child.props.children }));
  const extra = extras[id] ?? [];
  const pages = [...extra.filter((e) => !e.last), ...own, ...extra.filter((e) => e.last)];
  const [page, setPage] = useState(0);
  const current = pages[Math.min(page, pages.length - 1)];
  return <section id={`ch-${id}`} className={studio.chapter} aria-labelledby={`ch-${id}-title`}>
    <header className={studio.chapterHead}>
      <span className={studio.numeral} aria-hidden>{numeral}</span>
      <div><h2 id={`ch-${id}-title`}>{title}</h2><p>{lead}</p></div>
    </header>
    {pages.length > 1 && <div className={studio.subtabs} role="tablist" aria-label={`חלקי הלוח: ${title}`}>
      {pages.map((p, i) => <button key={p.title} type="button" role="tab" aria-selected={i === page} onClick={() => setPage(i)}>{p.title}</button>)}
    </div>}
    <div key={current.title} className={cx(studio.page, styles.studioInner)} role="tabpanel" aria-label={current.title}>{current.node}</div>
  </section>;
}

export function Info({ info, children, label = "הסבר" }: { info: PartInfo; children?: ReactNode; label?: string }) {
  return <aside className={styles.info} aria-live="polite" aria-label={label}>
    <p className={styles.infoKicker}>{label}</p>
    <h3>{info.title}{info.latin && <span className={styles.latin}>{info.latin}</span>}</h3>
    <p>{info.text}</p>
    {info.site && <p className={styles.infoSite}><strong>בארץ:</strong> {info.site}</p>}
    {children}
  </aside>;
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; title: string }[]; onChange: (id: T) => void; label: string }) {
  return <div className={styles.seg} role="group" aria-label={label}>
    {options.map((option) => <button key={option.id} type="button" aria-pressed={value === option.id} onClick={() => onChange(option.id)}>{option.title}</button>)}
  </div>;
}

/** A small list of tappable chips that drive the same picker as the drawing. */
export function PartList<T extends string>({ ids, info, active, onPick }: { ids: T[]; info: Record<T, PartInfo>; active: T; onPick: (id: T) => void }) {
  return <ul className={styles.partList}>
    {ids.map((id, i) => <li key={id}><button type="button" aria-pressed={active === id} onClick={() => onPick(id)}><span aria-hidden>{i + 1}</span>{info[id].title}</button></li>)}
  </ul>;
}
