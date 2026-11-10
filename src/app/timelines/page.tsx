import { pageMeta } from "@/lib/seo";
import { SectionCard } from "@/components/SectionCard";
import { LEARNING_AID_GROUPS } from "@/data/learning-aids";

export const metadata = pageMeta({
  title: "צירי זמן ועזרי למידה",
  description: "צירי זמן וכלים אינטראקטיביים ללימוד ההיסטוריה והארכאולוגיה של ארץ ישראל, מאדם קדמון ועד התקופה הביזנטית, עם דמויות, אירועים ומושגים.",
  path: "/timelines",
});

export default function TimelinesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">עזרי למידה</h1>
        <p className="max-w-2xl text-txt-dim">
          צירי זמן, טבלאות השוואה, כלי זיכרון והדמיות לפי נושא —
          ללמידה, להבנה ולחזרה על החומר.
        </p>
      </header>

      <div className="space-y-10">
        {LEARNING_AID_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`} className="mb-1 text-2xl font-black">
              {group.title}
            </h2>
            <p className="mb-4 text-sm text-txt-dim">{group.description}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.aids.map((aid, index) => (
                <SectionCard key={aid.href} index={index} {...aid} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
