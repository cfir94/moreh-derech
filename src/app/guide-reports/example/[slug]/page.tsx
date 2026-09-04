import Link from "next/link";
import { notFound } from "next/navigation";
import { REPORTS, reportBySlug } from "@/data/guide-reports";
import { ScheduleTable } from "@/components/guide-reports/ScheduleTable";
import { GuideUnitCard } from "@/components/guide-reports/GuideUnitCard";
import { ExpandedUnitBlock } from "@/components/guide-reports/ExpandedUnitBlock";
import { domainStyle } from "@/lib/domains";

export function generateStaticParams() {
  return REPORTS.map((r) => ({ slug: r.slug }));
}

export default async function ExampleReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = reportBySlug(slug);
  if (!report) notFound();

  return (
    <div
      className="screen-in mx-auto max-w-3xl px-4 py-10"
      style={domainStyle("guide-reports")}
    >
      <p className="mb-2 text-[12px] font-semibold text-txt-dim">
        <Link href="/guide-reports" className="hover:text-txt">
          דוחות הדרכה
        </Link>
        {" · "}
        דוגמה
      </p>
      <h1 className="grad-text mb-2 text-3xl">{report.title}</h1>
      <p className="mb-2 text-sm text-txt-dim">{report.summary}</p>
      <p className="mb-8 text-[12px] font-bold text-mc">{report.region}</p>

      {/* Part I */}
      <section className="mb-10">
        <h2 className="mb-1 text-xl">חלק I — תוכנית יום הטיול</h2>
        <p className="mb-4 text-[12.5px] text-txt-dim">
          לוח זמנים · מסלול ופעילות · תיאומים ומנהלות
        </p>
        <ScheduleTable rows={report.schedule} />
      </section>

      {/* Part II */}
      <section className="mb-10">
        <h2 className="mb-1 text-xl">חלק II — יחידות הדרכה קצרות</h2>
        <p className="mb-4 text-[12.5px] text-txt-dim">
          {report.units.length} יחידות · כוללות את חמש המ״מים ואמצעים מתודיים
        </p>
        <div className="flex flex-col gap-4">
          {report.units.map((u) => (
            <GuideUnitCard key={u.n} unit={u} />
          ))}
        </div>
      </section>

      {/* Part III */}
      <section className="mb-10">
        <h2 className="mb-1 text-xl">חלק III — יחידת הדרכה מורחבת</h2>
        <p className="mb-4 text-[12.5px] text-txt-dim">
          העמקה בתחנה אחת · עד כ־400 מילים
        </p>
        <ExpandedUnitBlock unit={report.expanded} />
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/guide-reports/how-to"
          className="rounded-full border border-line bg-card-2 px-6 py-3.5 text-sm font-extrabold transition active:scale-95"
        >
          חזרה למדריך הלימוד
        </Link>
        <Link
          href="/guide-reports"
          className="rounded-full border border-line bg-card-2 px-6 py-3.5 text-sm font-extrabold transition active:scale-95"
        >
          כל הדוחות
        </Link>
      </div>
    </div>
  );
}
