"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./Architecture.module.css";

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

export function Plate({ id, numeral, title, lead, children }: { id: string; numeral: string; title: string; lead: ReactNode; children: ReactNode }) {
  return <section id={`ch-${id}`} className={styles.plate} aria-labelledby={`ch-${id}-title`}>
    <header className={styles.plateHead}>
      <span className={styles.plateNo} aria-hidden>TAB · {numeral}</span>
      <h2 id={`ch-${id}-title`}>{title}</h2>
      <p>{lead}</p>
    </header>
    {children}
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
