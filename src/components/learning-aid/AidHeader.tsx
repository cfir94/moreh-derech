import Link from "next/link";
import { domainOf, domainStyle } from "@/lib/domains";
import { InkIcon } from "@/components/trail/Ink";
import { kit, PenUnderline } from "@/components/trail/kit";

export type AidHeaderProps = {
  slug: string;
  title: string;
  subtitle: string;
  stats?: string;
};

/** The head of a learning aid, in the trail design: pencil crumbs, the title in the guide's hand, the subject's ink drawing. */
export function AidHeader({ slug, title, subtitle, stats }: AidHeaderProps) {
  const long = title.length > 26;
  return <header className="relative pt-2 pb-2" style={domainStyle(slug)}>
    <nav aria-label="פירורי לחם" className="pencil text-base text-txt-dim">
      <Link href="/timelines/" className="underline underline-offset-4 transition hover:text-txt">עזרי למידה</Link>
      <span aria-hidden> › </span><span>{title}</span>
    </nav>
    <div className={kit.titleWrap}>
      <h1 className={long ? "mt-2 max-w-4xl text-[length:clamp(1.9rem,4vw,2.7rem)] leading-tight font-black" : "grad-text mt-2"}>{title}</h1>
      <PenUnderline />
    </div>
    <p className="max-w-3xl text-lg leading-relaxed text-txt-dim">{subtitle}</p>
    {stats && <p className="pencil mt-2 text-base text-txt-dim">{stats}</p>}
    <span aria-hidden className="pointer-events-none absolute top-2 left-0 hidden opacity-80 sm:block">
      <InkIcon name={domainOf(slug).ink} size={96} />
    </span>
  </header>;
}
