"use client";

/**
 * עיצוב החיפוש: שכבת „מצפן” קומפקטית מעל האתר — שדה אחד ותוצאות שמסומנות
 * בבירור לפי סוג החומר, כדי לעבור ממונח כמו „מגידו” ישר למחברת, סרטון או תרגול.
 */
import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";
import type { SearchResult } from "@/lib/siteSearch";

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4.5">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5">
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const kindTone: Record<SearchResult["kind"], string> = {
  notebook: "border-teal/35 bg-teal/10 text-teal",
  video: "border-blue/35 bg-blue/10 text-blue",
  quiz: "border-violet/35 bg-violet/10 text-violet",
  exam: "border-gold/35 bg-gold/10 text-gold",
  resource: "border-rose/35 bg-rose/10 text-rose",
  timeline: "border-blue/35 bg-blue/10 text-blue",
  tool: "border-line bg-card-2 text-txt-dim",
};

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const cleaned = query.trim();
    if (cleaned.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void import("@/lib/siteSearch")
        .then(({ searchSite }) => searchSite(cleaned))
        .then((nextResults) => {
          if (!cancelled) setResults(nextResults);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const close = () => setOpen(false);
  const updateQuery = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="חיפוש בכל חומרי האתר" className="flex h-[42px] shrink-0 items-center gap-2 rounded-[14px] border border-line bg-card px-3 text-sm font-bold text-txt-dim transition hover:border-teal/45 hover:bg-card-2 hover:text-txt active:scale-[0.97]">
        <SearchIcon />
        <span className="hidden xl:inline">חיפוש</span>
        <kbd className="hidden rounded border border-line bg-sheet px-1.5 py-0.5 text-[10px] font-bold text-txt-dim 2xl:inline">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/65 px-3 pb-5 pt-[8vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="חיפוש בכל חומרי האתר" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <div className="flex max-h-[84vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--r-lg)] border border-line bg-sheet shadow-[var(--shadow)]" dir="rtl">
            <div className="border-b border-line p-3 sm:p-4">
              <div className="flex items-center gap-3 rounded-[var(--r-md)] border border-teal/35 bg-card px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-teal/35">
                <SearchIcon />
                <input ref={inputRef} type="search" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="חפשו מקום, תקופה, דת או נושא — למשל מגידו" className="min-w-0 flex-1 bg-transparent text-base text-txt outline-none placeholder:text-txt-dim" />
                <button type="button" onClick={close} aria-label="סגירת החיפוש" className="grid size-9 shrink-0 place-items-center rounded-full text-txt-dim transition hover:bg-card-2 hover:text-txt active:scale-90"><CloseIcon /></button>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-txt-dim">
                <span>מחברות, סרטונים, שאלונים, מבחנים, סיכומים וצירי זמן</span>
                {query.trim().length >= 2 && !loading && <span className="num font-bold">{results.length} תוצאות</span>}
              </div>
            </div>

            <div className="overflow-y-auto p-3 sm:p-4">
              {query.trim().length < 2 ? (
                <div className="py-10 text-center">
                  <p className="font-bold text-txt">כל החומרים במקום אחד</p>
                  <p className="mt-2 text-sm text-txt-dim">נסו לחפש „מגידו”, „נצרות”, „גאולוגיה” או „ירושלים”.</p>
                </div>
              ) : loading ? (
                <div className="py-10 text-center text-sm font-bold text-txt-dim">מחפש בכל מאגרי הלימוד…</div>
              ) : results.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="font-bold text-txt">לא נמצאו חומרים מתאימים</p>
                  <p className="mt-2 text-sm text-txt-dim">אפשר לנסות שם מקום קצר יותר או מונח כללי יותר.</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {results.map((result) => (
                    <a key={result.id} href={result.external ? result.href : withBasePath(result.href)} target={result.external ? "_blank" : undefined} rel={result.external ? "noopener noreferrer" : undefined} onClick={close} className="group rounded-[var(--r-md)] border border-line bg-card p-3.5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-teal/40 hover:bg-card-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${kindTone[result.kind]}`}>{result.kindLabel}</span>
                        <span className="text-xs font-bold text-teal opacity-0 transition group-hover:opacity-100">פתיחה ←</span>
                      </div>
                      <h3 className="text-sm font-black leading-snug text-txt sm:text-base">{result.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-txt-dim sm:text-sm">{result.description}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
