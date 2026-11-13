import Link from "next/link";
import { HUB_KINDS, TOPIC_HUB, type HubGroup, type HubItem, type HubLink } from "@/data/topic-hub";
import { QUIZZES } from "@/data/quizzes";
import { TopicProgress } from "./TopicProgress";
import { InkIcon } from "@/components/trail/Ink";
import type { FieldIconName } from "@/components/trail/FieldIcons";
import s from "./topicHub.module.css";

/** Each subject's ink drawing (trail design), in place of the emoji. */
const TOPIC_INK: Record<string, FieldIconName> = {
  geology: "hammer", flora: "flower", fauna: "ibex", geography: "hills",
  prehistory: "handaxe", archaeology: "trowel", bronze: "jar", iron: "crown",
  "second-temple": "menorah", "roman-byzantine": "column", "classical-architecture": "temple",
  "early-islam": "dome", medieval: "tower", ottoman: "gate", modern: "flag", overview: "timelines",
  judaism: "scroll", christianity: "cross", islam: "minaret", minorities: "tent", jerusalem: "gate",
  "guide-reports": "guide-reports", exam: "exams",
};

/** One drawing per group, in the margin of its heading: it belongs to the group's subject. */
const GROUP_INK: Record<string, FieldIconName[]> = {
  nature: ["flower", "ibex", "hammer"],
  periods: ["handaxe", "jar", "column"],
  religions: ["scroll", "cross", "minaret"],
  guiding: ["signpost"],
};

const KIND_INK: Record<string, FieldIconName> = {
  quiz: "quizzes", notebook: "notebooks", summary: "resources", aid: "timelines",
  map: "map", game: "games", practice: "review",
};

/*
 * "לפי נושא" (בקשת הבעלים 10.11): שורה לכל נושא, וכפתור לכל סוג תוכן. קהל היעד הוא 40–60, ולכן:
 * טקסט גדול, כפתורים גבוהים עם מילה ולא רק אייקון, ובלי תפריטים נסתרים מעבר לרשימה אחת קצרה.
 */

const button = s.button;

function ItemLink({ item, className, children }: { item: HubItem; className: string; children: React.ReactNode }) {
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
  ) : (
    <Link href={item.href} className={className}>{children}</Link>
  );
}

function HubButton({ link }: { link: HubLink }) {
  const kind = HUB_KINDS[link.kind];
  const face = (
    <>
      <InkIcon name={KIND_INK[link.kind] ?? "milestone"} size={22} />
      {kind.label}
    </>
  );
  if (link.items.length === 1) {
    const item = link.items[0];
    return (
      <ItemLink item={item} className={button}>
        {face}
        <span className="sr-only">: {item.title}</span>
        {item.external && <span aria-hidden className="text-sm text-txt-dim">↗</span>}
      </ItemLink>
    );
  }
  return (
    <details className="group relative open:col-span-2">
      <summary className={`${button} cursor-pointer list-none`}>
        {face}
        <span className="num rounded-full px-2 text-sm text-txt-dim ring-1 ring-[var(--line)]">{link.items.length}</span>
        <span aria-hidden className="text-sm text-txt-dim transition group-open:rotate-180">▾</span>
      </summary>
      <ul className={s.menu}>
        {link.items.map((item) => (
          <li key={item.href}>
            <ItemLink item={item} className={s.menuItem}>
              {item.title}
              {item.external && <span aria-hidden className="text-sm text-txt-dim">↗</span>}
            </ItemLink>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function TopicHub({ compact = false, groups = TOPIC_HUB }: { compact?: boolean; groups?: HubGroup[] }) {
  return (
    <div className="flex flex-col gap-10" data-topic-hub>
      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`hub-${group.id}`}>
          <div className={s.groupHead}>
            <h2 id={`hub-${group.id}`} className={s.groupTitle}>{group.title}</h2>
            <p className={s.groupNote}>{group.note}</p>
            {GROUP_INK[group.id] && (
              <span aria-hidden className={s.groupArt}>
                {GROUP_INK[group.id].map((n) => (
                  <InkIcon key={n} name={n} size={46} />
                ))}
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-4">
            {group.topics.map((topic) => {
              const quizHref = topic.links.find((link) => link.kind === "quiz")?.items[0]?.href;
              const quizSlug = quizHref?.match(/^\/quizzes\/([^/]+)\/?$/)?.[1];
              const quizData = quizSlug ? QUIZZES.find((quiz) => quiz.slug === quizSlug) : undefined;

              return (
              <li
                key={topic.id}
                id={`topic-${topic.id}`}
                className={s.topic}
              >
                <div className="mb-3 flex items-center gap-3 md:mb-0">
                  <span aria-hidden className={s.mark}>
                    <InkIcon name={TOPIC_INK[topic.id] ?? "signpost"} size={32} />
                  </span>
                  <div className="min-w-0">
                    <h3 className={s.topicTitle}>{topic.title}</h3>
                    {!compact && <p className="text-base text-txt-dim">{topic.sub}</p>}
                    {quizData && <TopicProgress quiz={quizData.slug} total={quizData.questions.length} />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {topic.links.length === 1 && topic.links[0].items.length > 1
                    ? // רק סוג תוכן אחד (סיורים): כל פריט ככפתור גלוי, בלי רשימה נפתחת.
                      topic.links[0].items.map((item) => (
                        <ItemLink key={item.href} item={item} className={`${button} col-span-2 min-w-0 whitespace-normal! text-center sm:col-span-1`}>
                          <InkIcon name={KIND_INK[topic.links[0].kind] ?? "milestone"} size={22} />
                          {item.title}
                          {item.external && <span aria-hidden className="text-sm text-txt-dim">↗</span>}
                        </ItemLink>
                      ))
                    : topic.links.map((linkItem) => <HubButton key={linkItem.kind} link={linkItem} />)}
                </div>
              </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
