import Link from "next/link";
import { FEATURED_RESOURCES, RESOURCE_GROUPS } from "@/data/resources";
import { ResourceCredit, ResourceList } from "@/components/ResourceList";
import { domainStyle } from "@/lib/domains";

export const metadata = {
  title: "סיכומים וחומרי לימוד",
};

export default function ResourcesPage() {
  const total =
    FEATURED_RESOURCES.length +
    RESOURCE_GROUPS.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">סיכומים וחומרי לימוד</h1>
        <p className="mb-3 max-w-2xl leading-relaxed text-txt-dim">
          <span className="num">{total}</span> חומרים חופשיים לכל נושא בסילבוס
          של הקורס: סיכום להרצאה, דוחות סיור לפי אתר, מסלולים לדוגמה לחלק ב',
          מצגות ומפות. השאלונים והמבחנים כאן בודקים ידע — הדף הזה הוא איפה
          לומדים אותו.
        </p>
        <ResourceCredit className="max-w-2xl" />
      </header>

      <section className="mb-8">
        <h2 className="mb-2.5 text-sm font-bold tracking-[0.05em] text-txt-dim">
          הכי שימושי לקורס
        </h2>
        <ResourceList items={FEATURED_RESOURCES} slug="guide-reports" />
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        {RESOURCE_GROUPS.map((group, i) => (
          <section
            key={group.slug}
            style={{ ...domainStyle(group.slug), animationDelay: `${i * 0.03}s` }}
            className="screen-in relative overflow-hidden rounded-lg border border-line bg-card p-4"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-mc opacity-[0.16] blur-[6px]"
            />
            <div className="relative">
              <h2 className="mb-1 text-base">{group.title}</h2>
              <p className="mb-3 text-[12px] leading-relaxed text-txt-dim">
                {group.description}
              </p>
              <ResourceList items={group.items} slug={group.slug} />
            </div>
          </section>
        ))}
      </div>

      <p className="mt-7 text-[13px] text-txt-dim">
        רוצים לבדוק את עצמכם על מה שלמדתם?{" "}
        <Link href="/quizzes" className="font-bold text-teal hover:underline">
          למאגר השאלונים
        </Link>{" "}
        או{" "}
        <Link href="/exams" className="font-bold text-teal hover:underline">
          למבחן רישוי מלא
        </Link>
      </p>
    </div>
  );
}
