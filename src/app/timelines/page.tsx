import { pageMeta } from "@/lib/seo";
import { SectionCard } from "@/components/SectionCard";
import { LEARNING_AID_GROUPS } from "@/data/learning-aids";
import { domainOf } from "@/lib/domains";
import { InkIcon } from "@/components/trail/Ink";
import { Chip, PageHead, SectionHead, TrailPage } from "@/components/trail/kit";

export const metadata = pageMeta({
  title: "צירי זמן ועזרי למידה",
  description: "צירי זמן וכלים אינטראקטיביים ללימוד ההיסטוריה והארכאולוגיה של ארץ ישראל, מאדם קדמון ועד התקופה הביזנטית, עם דמויות, אירועים ומושגים.",
  path: "/timelines",
});

export default function TimelinesPage() {
  return (
    <TrailPage>
      <PageHead
        title="עזרי למידה"
        art={<InkIcon name="timelines" size={72} />}
        lede="מדף הכלים: צירי זמן, אטלס, אדריכלות, גאולוגיה ומגדירי שדה. ללמוד, להבין ולחזור על החומר."
      >
        <nav aria-label="קבוצות עזרי הלמידה" className="mt-6 flex flex-wrap gap-2.5">
          {LEARNING_AID_GROUPS.map((g) => (
            <Chip key={g.id} href={`#group-${g.id}`}>
              {g.title}
            </Chip>
          ))}
        </nav>
      </PageHead>

      <div className="space-y-12">
        {LEARNING_AID_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`} className="scroll-mt-24">
            <div className="relative">
              <SectionHead id={`group-${group.id}`} title={group.title} note={group.description} />
              <span aria-hidden className="absolute top-1 left-0 hidden gap-3 opacity-60 md:inline-flex">
                {[...new Set(group.aids.map((aid) => domainOf(aid.slug).ink))].slice(0, 3).map((ink) => (
                  <InkIcon key={ink} name={ink} size={44} />
                ))}
              </span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.aids.map((aid, index) => (
                <SectionCard key={aid.href} index={index} {...aid} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </TrailPage>
  );
}
