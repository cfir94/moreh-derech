export function PlaceholderSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="mb-6 text-neutral-600">{description}</p>
      <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-neutral-500">
        הסקציה הזו בבנייה — התוכן ישולב כאן בשלב הבא.
      </div>
    </div>
  );
}
