import { RESOURCE_SOURCE, type Resource } from "@/data/resources-types";
import { domainStyle } from "@/lib/domains";

/**
 * A list of links to someone else's material. It says so plainly: each row is
 * marked as leaving the site, and the source is credited wherever it appears.
 */
export function ResourceList({
  items,
  slug = "resources",
}: {
  items: Resource[];
  slug?: string;
}) {
  return (
    <ul className="flex flex-col gap-1.5" style={domainStyle(slug)}>
      {items.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 rounded-sm border border-line bg-card px-3.5 py-3 transition hover:bg-card-2 active:scale-[0.99]"
          >
            <span aria-hidden className="mt-0.5 text-[13px] text-mc">
              ↗
            </span>
            <span>
              <b className="block text-[14px] leading-snug">{item.title}</b>
              {item.note && (
                <span className="mt-0.5 block text-[12px] leading-relaxed text-txt-dim">
                  {item.note}
                </span>
              )}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** One line of credit, used under any list of her material. */
export function ResourceCredit({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[12px] leading-relaxed text-txt-dim ${className}`}>
      החומרים הם של{" "}
      <a
        href={RESOURCE_SOURCE.page}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-teal hover:underline"
      >
        {RESOURCE_SOURCE.name}
      </a>{" "}
      ומתפרסמים באתר שלה. הקישורים כאן פותחים את המקור — שום דבר לא הועתק לכאן.
    </p>
  );
}
