import Link from "next/link";
import { domainOf, domainStyle } from "@/lib/domains";
import { InkIcon } from "@/components/trail/Ink";
import { Blazes, Stamp } from "@/components/trail/kit";
import s from "./sectionCard.module.css";

/**
 * A card in the trail design: a sheet of paper laid on the map at a slight angle, the subject's ink
 * drawing in a pencilled ring, an inked stamp for a tag, and progress as trail blazes. It lifts and
 * straightens under the hand (the house gesture).
 */
export function SectionCard({
  href,
  slug,
  title,
  description,
  meta,
  badge,
  progress,
  index = 0,
}: {
  href: string;
  slug: string;
  title: string;
  description: string;
  meta?: string;
  badge?: string;
  /** 0-100; renders the trail blazes when present. */
  progress?: { pct: number; label: string };
  index?: number;
}) {
  const { ink } = domainOf(slug);

  return (
    <Link
      href={href}
      style={{ ...domainStyle(slug), animationDelay: `${0.02 + index * 0.04}s` }}
      className={`screen-in ${s.card} ${index % 2 ? s.alt : ""}`}
    >
      <div className={s.top}>
        <span aria-hidden className={s.mark}>
          <InkIcon name={ink} size={36} />
        </span>
        {badge ? (
          <Stamp tone={badge === "רשמי" ? "blue" : badge === "לא רשמי" ? "red" : "brown"}>{badge}</Stamp>
        ) : (
          // a painted trail blaze in the subject's colour: white, colour, white
          <span aria-hidden className={s.blaze} />
        )}
      </div>

      <h3 className={`${s.title} ${title.length <= 22 ? s.hand : ""}`}>{title}</h3>
      <p className={s.desc}>{description}</p>

      {progress ? (
        <Blazes pct={progress.pct} label={progress.label} className={s.foot} />
      ) : (
        meta && <div className={`${s.foot} ${s.meta} pencil`}>{meta}</div>
      )}
    </Link>
  );
}
