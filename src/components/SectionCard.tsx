import Link from "next/link";
import { domainOf, domainStyle } from "@/lib/domains";

/**
 * The geo-game's mode card: a translucent tile over the lit ground, with the
 * subject's colour bleeding in as a blurred orb behind the top corner and an
 * optional progress bar in the same hue.
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
  /** 0-100; renders the mode-progress bar when present. */
  progress?: { pct: number; label: string };
  index?: number;
}) {
  const { icon } = domainOf(slug);

  return (
    <Link
      href={href}
      style={{ ...domainStyle(slug), animationDelay: `${0.02 + index * 0.04}s` }}
      className="screen-in group relative flex min-h-[136px] flex-col overflow-hidden rounded-lg border border-line bg-card p-4 transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.965]"
    >
      {/* The orb is the card's identity — same trick as the game's ::after. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-8 -left-8 h-28 w-28 rounded-full bg-mc opacity-[0.18] blur-[6px] transition-opacity group-hover:opacity-30"
      />

      <div className="mb-2 flex items-start justify-between gap-2">
        <span aria-hidden className="text-[26px] leading-none">
          {icon}
        </span>
        {badge && (
          <span className="rounded-full border border-line bg-card-2 px-2.5 py-1 text-[11px] font-extrabold text-mc">
            {badge}
          </span>
        )}
      </div>

      <h3 className="mb-1 text-base">{title}</h3>
      <p className="flex-1 text-[11.5px] leading-relaxed text-txt-dim">
        {description}
      </p>

      {progress ? (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-gold">
          <span className="num">{progress.label}</span>
          <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-track">
            <i
              className="block h-full rounded-full bg-mc"
              style={{ width: `${progress.pct}%` }}
            />
          </span>
        </div>
      ) : (
        meta && (
          <div className="mt-2.5 text-[11px] font-bold text-txt-dim">{meta}</div>
        )
      )}
    </Link>
  );
}
