"use client";

/**
 * עיצוב "שכבות של דרך": ספריית צפייה מאופקת, שקופה למחצה ומכוונת משימה.
 * אזור נגן יחיד שומר על טעינה מהירה; הבחירה והתגיות משתמשות בטוקני העיצוב הקיימים.
 */
import { useMemo, useState } from "react";
import { videoCount, videoGroups, type VideoGroup, type VideoItem } from "@/data/videos";

const accentClasses = {
  teal: {
    dot: "bg-teal",
    bar: "bg-teal",
    chip: "border-teal/30 bg-teal/10 text-teal",
    ring: "ring-teal/50",
  },
  blue: {
    dot: "bg-blue",
    bar: "bg-blue",
    chip: "border-blue/30 bg-blue/10 text-blue",
    ring: "ring-blue/50",
  },
  violet: {
    dot: "bg-violet",
    bar: "bg-violet",
    chip: "border-violet/30 bg-violet/10 text-violet",
    ring: "ring-violet/50",
  },
  gold: {
    dot: "bg-gold",
    bar: "bg-gold",
    chip: "border-gold/30 bg-gold/10 text-gold",
    ring: "ring-gold/50",
  },
} as const;

function PlayIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none">
      <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" />
    </svg>
  );
}

function PlaylistIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h11M4 12h11M4 18h7M18 10v8l4-4-4-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 5h5v5M19 5l-8 8M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function kindLabel(item: VideoItem) {
  return item.type === "playlist" ? "פלייליסט" : "סרטון";
}

function playerUrl(item: VideoItem) {
  const separator = item.embedUrl.includes("?") ? "&" : "?";
  return `${item.embedUrl}${separator}rel=0&modestbranding=1`;
}

export function VideoLibrary() {
  const firstItem = videoGroups[0].items[0];
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeVideoId, setActiveVideoId] = useState(firstItem.id);

  const activeVideo = useMemo(
    () =>
      videoGroups
        .flatMap((group) => group.items)
        .find((item) => item.id === activeVideoId) ?? firstItem,
    [activeVideoId, firstItem],
  );

  const activeGroup = useMemo(
    () => videoGroups.find((group) => group.items.some((item) => item.id === activeVideo.id)),
    [activeVideo],
  );

  const visibleGroups = useMemo(
    () =>
      activeCategory === "all"
        ? videoGroups
        : videoGroups.filter((group) => group.id === activeCategory),
    [activeCategory],
  );

  function selectCategory(group: VideoGroup | null) {
    setActiveCategory(group?.id ?? "all");
    if (group) {
      setActiveVideoId(group.items[0].id);
    }
  }

  function selectVideo(item: VideoItem, group: VideoGroup) {
    setActiveCategory(group.id);
    setActiveVideoId(item.id);
  }

  const activeAccent = accentClasses[activeGroup?.accent ?? "teal"];

  return (
    <main className="screen-in mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10" dir="rtl">
      <header className="mb-8 max-w-3xl">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-teal">
          <span className="h-px w-8 bg-teal" aria-hidden="true" />
          מרכז הלמידה
        </div>
        <h1 className="grad-text text-3xl leading-tight sm:text-4xl">סרטונים מומלצים</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-txt-dim">
          מקורות צפייה שנבחרו לפי נושאי הליבה של קורס מורי הדרך — היסטוריה, דתות,
          גיאולוגיה, טבע וירושלים.
        </p>
      </header>

      <section aria-label="סינון לפי תחום" className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          <button
            type="button"
            onClick={() => selectCategory(null)}
            aria-pressed={activeCategory === "all"}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition duration-200 ease-out active:scale-[0.97] ${
              activeCategory === "all"
                ? "border-teal bg-teal text-on-accent shadow-[0_7px_18px_-10px_var(--teal)]"
                : "border-line bg-card text-txt-dim hover:border-teal/50 hover:text-txt"
            }`}
          >
            הכול <span className="num mr-1 opacity-75">{videoCount}</span>
          </button>
          {videoGroups.map((group) => {
            const accent = accentClasses[group.accent];
            const isActive = activeCategory === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => selectCategory(group)}
                aria-pressed={isActive}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition duration-200 ease-out active:scale-[0.97] ${
                  isActive
                    ? `border-current ${accent.chip} shadow-[0_7px_18px_-12px_var(--teal)]`
                    : "border-line bg-card text-txt-dim hover:border-line hover:bg-card-2 hover:text-txt"
                }`}
              >
                <span className={`size-2 rounded-full ${accent.dot}`} aria-hidden="true" />
                {group.category}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="הנגן הנבחר" className="mb-10 overflow-hidden rounded-[var(--r-lg)] border border-line bg-card shadow-[var(--shadow)]">
        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
          <div className="relative aspect-video min-h-[13rem] bg-[#07131c]">
            <iframe
              key={activeVideo.id}
              src={playerUrl(activeVideo)}
              title={activeVideo.title}
              className="absolute inset-0 size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="flex flex-col justify-between p-5 sm:p-6">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${activeAccent.chip}`}>
                  {activeVideo.type === "playlist" ? <PlaylistIcon /> : <PlayIcon />}
                  {kindLabel(activeVideo)}
                </span>
                <span className="text-xs text-txt-dim">{activeVideo.source}</span>
              </div>
              <h2 className="text-xl leading-snug text-txt sm:text-2xl">{activeVideo.title}</h2>
              <p className="mt-3 leading-relaxed text-txt-dim">{activeVideo.description}</p>
            </div>
            <a
              href={activeVideo.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border border-line bg-card-2 px-3.5 py-2.5 text-sm font-bold text-txt transition duration-200 ease-out hover:border-teal/60 hover:bg-teal/10 hover:text-teal active:scale-[0.97]"
            >
              פתיחה ביוטיוב
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      </section>

      <div className="space-y-10" aria-live="polite">
        {visibleGroups.map((group) => {
          const accent = accentClasses[group.accent];
          return (
            <section key={group.id} aria-labelledby={`${group.id}-heading`}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`h-5 w-1 rounded-full ${accent.bar}`} aria-hidden="true" />
                    <h2 id={`${group.id}-heading`} className="text-xl text-txt sm:text-2xl">
                      {group.category}
                    </h2>
                  </div>
                  <p className="pr-3 text-sm text-txt-dim">{group.intro}</p>
                </div>
                <span className="num rounded-full border border-line bg-card px-2.5 py-1 text-xs font-bold text-txt-dim">
                  {group.items.length} מקורות
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item, index) => {
                  const isSelected = item.id === activeVideo.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectVideo(item, group)}
                      aria-pressed={isSelected}
                      className={`group relative flex min-h-48 flex-col overflow-hidden rounded-[var(--r-md)] border p-4 text-right transition duration-200 ease-out active:scale-[0.985] ${
                        isSelected
                          ? `border-transparent bg-card-2 ring-2 ${accent.ring} shadow-[var(--shadow)]`
                          : "border-line bg-card hover:-translate-y-0.5 hover:border-teal/45 hover:bg-card-2 hover:shadow-[var(--shadow)]"
                      }`}
                    >
                      <span className={`absolute inset-y-0 right-0 w-1 ${accent.bar}`} aria-hidden="true" />
                      <div className="mb-5 flex items-center justify-between gap-3 pl-1">
                        <span className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-bold ${accent.chip}`}>
                          {item.type === "playlist" ? <PlaylistIcon /> : <PlayIcon />}
                          {kindLabel(item)}
                        </span>
                        <span className="num text-xs font-bold text-txt-dim">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <h3 className="line-clamp-2 text-base leading-snug text-txt">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-txt-dim">{item.description}</p>
                      <span className="mt-auto pt-4 text-xs font-bold text-txt-dim">{item.source}</span>
                      <span
                        className={`absolute bottom-4 left-4 flex size-8 items-center justify-center rounded-full border transition duration-200 ${
                          isSelected
                            ? `${accent.chip}`
                            : "border-line text-txt-dim group-hover:border-teal/50 group-hover:bg-teal/10 group-hover:text-teal"
                        }`}
                        aria-hidden="true"
                      >
                        <PlayIcon />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
