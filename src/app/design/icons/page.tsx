import { InkIcon } from "@/components/trail/Ink";
import { PATHS, type FieldIconName } from "@/components/trail/FieldIcons";

export const metadata = { title: "סט האייקונים", robots: { index: false } };

/** Every ink icon of the site on one sheet, at the sizes it is used in: for review by eye. */
export default function IconSheet() {
  const names = Object.keys(PATHS) as FieldIconName[];
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="grad-text mb-6">סט האייקונים</h1>
      <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-8">
        {names.map((n) => (
          <li key={n} className="flex flex-col items-center gap-2 text-center">
            <span className="grid size-[84px] place-items-center rounded-full border-[1.5px] border-dashed border-[color-mix(in_srgb,var(--ink)_55%,transparent)]">
              <InkIcon name={n} size={52} />
            </span>
            <span className="flex items-center gap-2 text-sm text-txt-dim" dir="ltr">
              <InkIcon name={n} size={24} />
              {n}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
