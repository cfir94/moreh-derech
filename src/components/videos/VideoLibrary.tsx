"use client";

/**
 * עיצוב "שכבות של דרך": ספריית צפייה מאופקת, שקופה למחצה ומכוונת משימה.
 * אזור נגן יחיד שומר על טעינה מהירה; הבחירה והתגיות משתמשות בטוקני העיצוב הקיימים.
 */
import { useMemo, useRef, useState } from "react";
import {
  videoCount,
  videoGroups,
  type TopicTone,
  type VideoGroup,
  type VideoItem,
  type VideoSubtopic,
} from "@/data/videos";

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

const subtopicAccentClasses: Record<
  TopicTone,
  { dot: string; bar: string; chip: string; ring: string }
> = {
  teal: {
    dot: "bg-teal",
    bar: "bg-teal",
    chip: "border-teal/30 bg-teal/10 text-teal",
    ring: "ring-teal/45",
  },
  blue: {
    dot: "bg-blue",
    bar: "bg-blue",
    chip: "border-blue/30 bg-blue/10 text-blue",
    ring: "ring-blue/45",
  },
  violet: {
    dot: "bg-violet",
    bar: "bg-violet",
    chip: "border-violet/30 bg-violet/10 text-violet",
    ring: "ring-violet/45",
  },
  gold: {
    dot: "bg-gold",
    bar: "bg-gold",
    chip: "border-gold/30 bg-gold/10 text-gold",
    ring: "ring-gold/45",
  },
  rose: {
    dot: "bg-rose",
    bar: "bg-rose",
    chip: "border-rose/30 bg-rose/10 text-rose",
    ring: "ring-rose/45",
  },
};

const generalSubtopic: VideoSubtopic = {
  id: "general",
  title: "העשרה כללית",
  description: "מקורות העשרה בנושאי הקורס.",
  tone: "teal",
};

function groupItemsBySubtopic(items: VideoItem[]) {
  return items.reduce<{ subtopic: VideoSubtopic; items: VideoItem[] }[]>(
    (groups, item) => {
      const subtopic = item.subtopic ?? generalSubtopic;
      const existingGroup = groups.find((group) => group.subtopic.id === subtopic.id);
      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        groups.push({ subtopic, items: [item] });
      }
      return groups;
    },
    [],
  );
}

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

function CoordinatorRecommendation() {
  return (
    <span className="rounded-full border border-gold/35 bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
      המלצת רכז הקורס
    </span>
  );
}

function playerUrl(item: VideoItem) {
  const separator = item.embedUrl.includes("?") ? "&" : "?";
  return `${item.embedUrl}${separator}rel=0&modestbranding=1`;
}

export function VideoLibrary() {
  const firstItem = videoGroups[0].items[0];
  const [activeCategory, setActiveCategory] = useState(videoGroups[0].id);
  const [activeVideoId, setActiveVideoId] = useState(firstItem.id);
  const [activeSubtopicByGroup, setActiveSubtopicByGroup] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        videoGroups.map((group) => [group.id, groupItemsBySubtopic(group.items)[0].subtopic.id]),
      ),
  );
  const playerRef = useRef<HTMLElement>(null);

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
      const firstSubtopic = groupItemsBySubtopic(group.items)[0];
      setActiveSubtopicByGroup((current) => ({
        ...current,
        [group.id]: firstSubtopic.subtopic.id,
      }));
      const firstEmbeddable = firstSubtopic.items.find((item) => !item.embedRestricted);
      setActiveVideoId(firstEmbeddable?.id ?? group.items[0].id);
    }
  }

  function selectSubtopic(group: VideoGroup, subtopic: VideoSubtopic) {
    setActiveCategory(group.id);
    setActiveSubtopicByGroup((current) => ({ ...current, [group.id]: subtopic.id }));
  }

  function scrollToPlayer() {
    requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      playerRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  function scrollCarousel(groupId: string, direction: "previous" | "next") {
    const carousel = document.getElementById(`carousel-${groupId}`);
    if (!carousel) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    carousel.scrollBy({
      left: direction === "next" ? -360 : 360,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  function selectVideo(item: VideoItem, group: VideoGroup) {
    setActiveCategory(group.id);
    setActiveVideoId(item.id);
    setActiveSubtopicByGroup((current) => ({
      ...current,
      [group.id]: (item.subtopic ?? generalSubtopic).id,
    }));
    scrollToPlayer();
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
          {videoCount} מקורות צפייה שנבחרו לפי נושאי הליבה של קורס מורי הדרך —
          היסטוריה, ארכאולוגיה, דתות, אמנות, גאוגרפיה, טבע ומקצוע ההדרכה.
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

      <section ref={playerRef} aria-label="הנגן הנבחר" className="mb-10 scroll-mt-5 overflow-hidden rounded-[var(--r-lg)] border border-line bg-card shadow-[var(--shadow)]">
        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
          <div className="relative aspect-video min-h-[13rem] bg-[#07131c]">
            {activeVideo.embedRestricted ? (
              <div className="absolute inset-0 flex flex-col justify-center bg-[radial-gradient(circle_at_78%_20%,rgba(234,179,8,0.22),transparent_32%),linear-gradient(135deg,#07131c,#122b35)] p-7 text-right text-white sm:p-10">
                <span className="mb-4 w-fit rounded-full border border-gold/50 bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold">
                  מקור מומלץ עם זמינות משתנה
                </span>
                <h2 className="max-w-md text-xl leading-snug sm:text-2xl">
                  הפלייליסט אינו זמין כעת להטמעה ממיקום זה.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
                  הוא נשמר בספרייה כהמלצה ישירה של רכז הקורס. אפשר לנסות לפתוח אותו ישירות ביוטיוב.
                </p>
                <a
                  href={activeVideo.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-gold px-3.5 py-2.5 text-sm font-bold text-[#07131c] transition duration-200 ease-out hover:brightness-110 active:scale-[0.97]"
                >
                  פתיחה ביוטיוב
                  <ExternalLinkIcon />
                </a>
              </div>
            ) : (
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
            )}
          </div>
          <div className="flex flex-col justify-between p-5 sm:p-6">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${activeAccent.chip}`}>
                  {activeVideo.type === "playlist" ? <PlaylistIcon /> : <PlayIcon />}
                  {kindLabel(activeVideo)}
                </span>
                {activeVideo.recommendedByCoordinator && <CoordinatorRecommendation />}
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

              {(() => {
                const subtopicGroups = groupItemsBySubtopic(group.items);
                const activeSubtopicGroup =
                  subtopicGroups.find(
                    ({ subtopic }) => subtopic.id === activeSubtopicByGroup[group.id],
                  ) ?? subtopicGroups[0];
                const { subtopic, items } = activeSubtopicGroup;
                const subtopicAccent = subtopicAccentClasses[subtopic.tone];

                return (
                  <div className="overflow-hidden rounded-[var(--r-md)] border border-line bg-card/45">
                    <div className="border-b border-line/80 bg-card/30 p-3 sm:p-4">
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold tracking-wide text-txt-dim">בחירת תת־נושא</p>
                          <p className="mt-1 text-sm text-txt-dim">בחרו תחום, ואז מקור צפייה מהקרוסלה.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => scrollCarousel(group.id, "previous")}
                            aria-label={`הצגת מקורות קודמים ב${subtopic.title}`}
                            className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-bold text-txt-dim transition duration-200 ease-out hover:border-teal/45 hover:text-txt active:scale-[0.97]"
                          >
                            הקודם
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollCarousel(group.id, "next")}
                            aria-label={`הצגת מקורות נוספים ב${subtopic.title}`}
                            className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-bold text-txt-dim transition duration-200 ease-out hover:border-teal/45 hover:text-txt active:scale-[0.97]"
                          >
                            הבא
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label={`תתי־נושאים ב${group.category}`}>
                        {subtopicGroups.map(({ subtopic: optionSubtopic, items: optionItems }) => {
                          const optionAccent = subtopicAccentClasses[optionSubtopic.tone];
                          const isActive = optionSubtopic.id === subtopic.id;
                          return (
                            <button
                              key={optionSubtopic.id}
                              type="button"
                              onClick={() => selectSubtopic(group, optionSubtopic)}
                              aria-pressed={isActive}
                              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition duration-200 ease-out active:scale-[0.97] ${
                                isActive
                                  ? `${optionAccent.chip} shadow-[0_7px_18px_-12px_var(--teal)]`
                                  : "border-line bg-card text-txt-dim hover:border-teal/45 hover:text-txt"
                              }`}
                            >
                              <span className={`size-2 rounded-full ${optionAccent.dot}`} aria-hidden="true" />
                              {optionSubtopic.title}
                              <span className="num text-xs opacity-70">{optionItems.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`size-2.5 rounded-full ${subtopicAccent.dot}`} aria-hidden="true" />
                          <div>
                            <h3 className="text-base font-black text-txt">{subtopic.title}</h3>
                            <p className="mt-0.5 text-xs text-txt-dim">{subtopic.description}</p>
                          </div>
                        </div>
                        <span className={`num rounded-full border px-2.5 py-1 text-xs font-bold ${subtopicAccent.chip}`}>
                          {items.length} מקורות
                        </span>
                      </div>

                      <div
                        id={`carousel-${group.id}`}
                        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:thin]"
                      >
                        {items.map((item, index) => {
                          const isSelected = item.id === activeVideo.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => selectVideo(item, group)}
                              aria-pressed={isSelected}
                              className={`group relative flex min-h-52 w-[min(19rem,82vw)] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--r-md)] border p-4 text-right transition duration-200 ease-out active:scale-[0.985] ${
                                isSelected
                                  ? `border-transparent bg-card-2 ring-2 ${subtopicAccent.ring} shadow-[var(--shadow)]`
                                  : "border-line bg-card hover:-translate-y-0.5 hover:border-teal/45 hover:bg-card-2 hover:shadow-[var(--shadow)]"
                              }`}
                            >
                              <span className={`absolute inset-y-0 right-0 w-1 ${subtopicAccent.bar}`} aria-hidden="true" />
                              <div className="mb-5 flex items-center justify-between gap-3 pl-1">
                                <span className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-bold ${subtopicAccent.chip}`}>
                                  {item.type === "playlist" ? <PlaylistIcon /> : <PlayIcon />}
                                  {kindLabel(item)}
                                </span>
                                <span className="num text-xs font-bold text-txt-dim">{String(index + 1).padStart(2, "0")}</span>
                              </div>
                              <div className="mb-2">{item.recommendedByCoordinator && <CoordinatorRecommendation />}</div>
                              <h4 className="line-clamp-2 text-base leading-snug text-txt">{item.title}</h4>
                              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-txt-dim">{item.description}</p>
                              <span className="mt-auto pt-4 text-xs font-bold text-txt-dim">{item.source}</span>
                              <span
                                className={`absolute bottom-4 left-4 flex size-8 items-center justify-center rounded-full border transition duration-200 ${
                                  isSelected
                                    ? `${subtopicAccent.chip}`
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
                    </div>
                  </div>
                );
              })()}
            </section>
          );
        })}
      </div>
    </main>
  );
}
