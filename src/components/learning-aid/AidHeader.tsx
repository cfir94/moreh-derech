import Link from "next/link";
import { domainStyle } from "@/lib/domains";

export type AidHeaderProps = {
  slug: string;
  title: string;
  subtitle: string;
  stats?: string;
};

export function AidHeader({ slug, title, subtitle, stats }: AidHeaderProps) {
  return <header className="rounded-lg border border-line bg-card px-5 py-5 sm:px-7" style={domainStyle(slug)}>
    <nav aria-label="פירורי לחם" className="text-sm font-bold text-txt-dim">
      <Link href="/timelines/" className="transition hover:text-txt">עזרי למידה</Link>
      <span aria-hidden> › </span><span>{title}</span>
    </nav>
    <h1 className="grad-text mt-2 text-3xl font-black sm:text-4xl">{title}</h1>
    <p className="mt-2 leading-7 text-txt-dim">{subtitle}</p>
    {stats && <p className="mt-2 text-sm font-bold text-mc">{stats}</p>}
  </header>;
}
