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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mb-8 text-fg-muted">{description}</p>

      <div className="rounded-card border border-dashed border-border-strong bg-bg-raised p-6">
        <p className="mb-4 text-sm font-medium text-fg-muted">
          מה מתוכנן לסקציה הזו:
        </p>
        <ul className="flex flex-col gap-2">
          {planned.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
              <span aria-hidden className="text-accent">
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
