import Link from "next/link";
import { HUB_KINDS, TOPIC_HUB, type HubGroup, type HubItem, type HubLink } from "@/data/topic-hub";

/*
 * "לפי נושא" (בקשת הבעלים 10.11): שורה לכל נושא, וכפתור לכל סוג תוכן. קהל היעד הוא 40–60, ולכן:
 * טקסט גדול, כפתורים גבוהים עם מילה ולא רק אייקון, ובלי תפריטים נסתרים מעבר לרשימה אחת קצרה.
 */

const button =
  "flex min-h-12 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full sm:inline-flex sm:gap-2 sm:w-auto sm:justify-start border border-line bg-card-2 px-3 py-2.5 text-base font-bold text-txt transition hover:border-teal sm:px-4 active:scale-95";

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
      <span aria-hidden className="text-lg">{kind.icon}</span>
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
        <span className="num rounded-full bg-card px-2 text-sm text-txt-dim">{link.items.length}</span>
        <span aria-hidden className="text-sm text-txt-dim transition group-open:rotate-180">▾</span>
      </summary>
      <ul className="mt-2 flex min-w-60 flex-col gap-1 rounded-[var(--r-md)] border border-line bg-sheet p-2 shadow-2xl sm:absolute sm:z-30">
        {link.items.map((item) => (
          <li key={item.href}>
            <ItemLink item={item} className="flex min-h-11 items-center justify-between gap-3 rounded-md px-3 py-2 text-base text-txt hover:bg-card-2">
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
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2">
            <h2 id={`hub-${group.id}`} className="text-2xl font-black text-txt">{group.title}</h2>
            <p className="text-base text-txt-dim">{group.note}</p>
          </div>
          <ul className="flex flex-col gap-3">
            {group.topics.map((topic) => (
              <li
                key={topic.id}
                id={`topic-${topic.id}`}
                className="scroll-mt-24 rounded-[var(--r-lg)] border border-line bg-card p-4 sm:p-5 md:grid md:grid-cols-[15rem_1fr] md:items-center md:gap-5"
              >
                <div className="mb-3 flex items-center gap-3 md:mb-0">
                  <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-card-2 text-2xl">{topic.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-black leading-tight text-txt">{topic.title}</h3>
                    {!compact && <p className="text-base text-txt-dim">{topic.sub}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {topic.links.length === 1 && topic.links[0].items.length > 1
                    ? // רק סוג תוכן אחד (סיורים): כל פריט ככפתור גלוי, בלי רשימה נפתחת.
                      topic.links[0].items.map((item) => (
                        <ItemLink key={item.href} item={item} className={`${button} col-span-2 min-w-0 whitespace-normal! text-center sm:col-span-1`}>
                          <span aria-hidden className="text-lg">{HUB_KINDS[topic.links[0].kind].icon}</span>
                          {item.title}
                          {item.external && <span aria-hidden className="text-sm text-txt-dim">↗</span>}
                        </ItemLink>
                      ))
                    : topic.links.map((linkItem) => <HubButton key={linkItem.kind} link={linkItem} />)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
