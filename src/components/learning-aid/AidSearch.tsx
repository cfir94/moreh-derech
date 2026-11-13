"use client";

export function AidSearch({ value, onChange, placeholder = "חיפוש בעזר הלמידה…" }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return <div className="relative">
    <label htmlFor="aid-search" className="sr-only">חיפוש בעזר הלמידה</label>
    <input id="aid-search" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label="חיפוש בעזר הלמידה" className="min-h-12 w-full rounded-full border-[1.5px] border-line bg-[var(--paper)] py-2.5 pl-12 pr-5 text-lg text-txt outline-none transition placeholder:text-txt-dim focus:border-[var(--ink)]" />
    {value && <button type="button" onClick={() => onChange("")} aria-label="ניקוי החיפוש" className="absolute left-2 top-1/2 min-h-9 min-w-9 -translate-y-1/2 rounded-full text-txt-dim transition hover:bg-card-2 hover:text-txt active:scale-95">×</button>}
  </div>;
}
