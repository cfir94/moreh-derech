export function PlaceholderSection({
  title,
  description,
  planned,
}: {
  title: string;
  description: string;
  planned: string[];
}) {
  return (
    <div className="screen-in mx-auto max-w-2xl px-4 py-10">
      <h1 className="grad-text mb-2 text-3xl">{title}</h1>
      <p className="mb-8 text-txt-dim">{description}</p>

      <div className="rounded-lg border border-dashed border-line bg-card p-6">
        <p className="mb-4 text-sm font-bold text-txt-dim">
          מה מתוכנן לסקציה הזו:
        </p>
        <ul className="flex flex-col gap-2">
          {planned.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
              <span aria-hidden className="text-teal">
                ◆
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
