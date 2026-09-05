"use client";

/**
 * עיצוב "שכבות של דרך": ניווט נושאי קודם לצפייה, נגן יחיד קומפקטי, וקרוסלת מקורות בהמשך.
 * הסדר מכוון לסריקה מהירה: קטגוריה → תת־נושא → מקור פעיל → מקורות משלימים.
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
  if (item.externalProvider) return "סדרה";
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

function firstEmbeddableItem(items: VideoItem[]) {
  return items.find((item) => !item.embedRestricted) ?? items[0];
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

  const selectedGroup = useMemo(
    () => videoGroups.find((group) => group.id === activeCategory) ?? videoGroups[0],
    [activeCategory],
  );
  const subtopicGroups = useMemo(
    () => groupItemsBySubtopic(selectedGroup.items),
    [selectedGroup],
  );
  const activeSubtopicGroup = useMemo(
    () =>
      subtopicGroups.find(
        ({ subtopic }) => subtopic.id === activeSubtopicByGroup[selectedGroup.id],
      ) ?? subtopicGroups[0],
    [activeSubtopicByGroup, selectedGroup.id, subtopicGroups],
  );
  const activeVideo = useMemo(
    () =>
      videoGroups
        .flatMap((group) => group.items)
        .find((item) => item.id === activeVideoId) ?? firstItem,
    [activeVideoId, firstItem],
  );

  const activeAccent = accentClasses[selectedGroup.accent];
  const activeSubtopic = activeSubtopicGroup.subtopic;
  const subtopicAccent = subtopicAccentClasses[activeSubtopic.tone];

  function selectCategory(group: VideoGroup) {
    const firstSubtopic = groupItemsBySubtopic(group.items)[0];
    const nextItem = firstEmbeddableItem(firstSubtopic.items);
    setActiveCategory(group.id);
    setActiveSubtopicByGroup((current) => ({ ...current, [group.id]: firstSubtopic.subtopic.id }));
    setActiveVideoId(nextItem.id);
  }

  function selectSubtopic(subtopic: VideoSubtopic) {
    const nextSubtopicGroup = subtopicGroups.find(
      (group) => group.subtopic.id === subtopic.id,
    );
    if (!nextSubtopicGroup) return;

    setActiveSubtopicByGroup((current) => ({ ...current, [selectedGroup.id]: subtopic.id }));
    setActiveVideoId(firstEmbeddableItem(nextSubtopicGroup.items).id);
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

  function scrollCarousel(direction: "previous" | "next") {
    const carousel = document.getElementById(`carousel-${selectedGroup.id}`);
    if (!carousel) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    carousel.scrollBy({
      left: direction === "next" ? -330 : 330,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  function selectVideo(item: VideoItem) {
    setActiveVideoId(item.id);
    scrollToPlayer();
  }

  return (
    <main className="screen-in mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10" dir="rtl">
      <header className="mb-7 max-w-3xl">
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

      <section aria-label="סינון לפי תחום" className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {videoGroups.map((group) => {
            const accent = accentClasses[group.accent];
            const isActive = selectedGroup.id === group.id;
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

      <section aria-labelledby={`${selectedGroup.id}-heading`} className="mb-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className={`h-5 w-1 rounded-full ${activeAccent.bar}`} aria-hidden="true" />
              <h2 id={`${selectedGroup.id}-heading`} className="text-xl text-txt sm:text-2xl">
                {selectedGroup.category}
              </h2>
            </div>
            <p className="pr-3 text-sm text-txt-dim">{selectedGroup.intro}</p>
          </div>
          <span className="num rounded-full border border-line bg-card px-2.5 py-1 text-xs font-bold text-txt-dim">
            {selectedGroup.items.length} מקורות
          </span>
        </div>

        <div className="rounded-[var(--r-md)] border border-line bg-card/55 p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold tracking-wide text-txt-dim">בחירת תת־נושא</p>
            <span className={`num rounded-full border px-2.5 py-1 text-xs font-bold ${subtopicAccent.chip}`}>
              {activeSubtopicGroup.items.length} מקורות
            </span>
          </div>
          <div
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]"
            aria-label={`תתי־נושאים ב${selectedGroup.category}`}
          >
            {subtopicGroups.map(({ subtopic, items }) => {
              const optionAccent = subtopicAccentClasses[subtopic.tone];
              const isActive = subtopic.id === activeSubtopic.id;
              return (
                <button
                  key={subtopic.id}
                  type="button"
                  onClick={() => selectSubtopic(subtopic)}
                  aria-pressed={isActive}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition duration-200 ease-out active:scale-[0.97] ${
                    isActive
                      ? `${optionAccent.chip} shadow-[0_7px_18px_-12px_var(--teal)]`
                      : "border-line bg-card text-txt-dim hover:border-teal/45 hover:text-txt"
                  }`}
                >
                  <span className={`size-2 rounded-full ${optionAccent.dot}`} aria-hidden="true" />
                  {subtopic.title}
                  <span className="num text-xs opacity-70">{items.length}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        ref={playerRef}
        aria-label="הנגן הנבחר"
        className="mx-auto mb-5 max-w-5xl scroll-mt-5 overflow-hidden rounded-[var(--r-lg)] border border-line bg-card shadow-[var(--shadow)]"
      >
        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(15rem,0.7fr)]">
          <div className="relative aspect-video min-h-[10rem] bg-[#07131c]">
            {activeVideo.embedRestricted ? (
              <div className="absolute inset-0 flex flex-col justify-center bg-[radial-gradient(circle_at_78%_20%,rgba(234,179,8,0.22),transparent_32%),linear-gradient(135deg,#07131c,#122b35)] p-5 text-right text-white sm:p-7">
                <span className="mb-3 w-fit rounded-full border border-gold/50 bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold">
                  {activeVideo.externalProvider
                    ? `מקור רשמי של ${activeVideo.externalProvider}`
                    : "מקור מומלץ עם זמינות משתנה"}
                </span>
                <h2 className="max-w-md text-lg leading-snug sm:text-xl">
                  {activeVideo.externalProvider
                    ? `הסדרה זמינה לצפייה באתר ${activeVideo.externalProvider}.`
                    : "הפלייליסט אינו זמין כעת להטמעה ממיקום זה."}
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/70">
                  {activeVideo.externalProvider
                    ? `${activeVideo.externalProvider} חוסם הטמעה בתוך אתרים חיצוניים. הקישור פותח את כל פרקי הסדרה באיכות המקורית.`
                    : "הוא נשמר בספרייה כהמלצה ישירה של רכז הקורס. אפשר לנסות לפתוח אותו ישירות ביוטיוב."}
                </p>
                <a
                  href={activeVideo.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-gold px-3.5 py-2.5 text-sm font-bold text-[#07131c] transition duration-200 ease-out hover:brightness-110 active:scale-[0.97]"
                >
                  פתיחה ב{activeVideo.externalProvider ?? "יוטיוב"}
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
          <div className="flex flex-col justify-between p-4 sm:p-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${activeAccent.chip}`}>
              {activeVideo.type === "playlist" ? <PlaylistIcon /> : <PlayIcon />}
                  {kindLabel(activeVideo)}
                </span>
                {activeVideo.recommendedByCoordinator && <CoordinatorRecommendation />}
                <span className="text-xs text-txt-dim">{activeVideo.source}</span>
              </div>
              <h2 className="text-lg leading-snug text-txt sm:text-xl">{activeVideo.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-txt-dim">{activeVideo.description}</p>
            </div>
            <a
              href={activeVideo.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg border border-line bg-card-2 px-3.5 py-2.5 text-sm font-bold text-txt transition duration-200 ease-out hover:border-teal/60 hover:bg-teal/10 hover:text-teal active:scale-[0.97]"
            >
              פתיחה ב{activeVideo.externalProvider ?? "יוטיוב"}
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby={`${selectedGroup.id}-${activeSubtopic.id}-carousel-heading`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`size-2.5 rounded-full ${subtopicAccent.dot}`} aria-hidden="true" />
            <div>
              <h3 id={`${selectedGroup.id}-${activeSubtopic.id}-carousel-heading`} className="text-base font-black text-txt">
                מקורות נוספים: {activeSubtopic.title}
              </h3>
              <p className="mt-0.5 text-xs text-txt-dim">{activeSubtopic.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel("previous")}
              aria-label={`הצגת מקורות קודמים ב${activeSubtopic.title}`}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-bold text-txt-dim transition duration-200 ease-out hover:border-teal/45 hover:text-txt active:scale-[0.97]"
            >
              הקודם
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel("next")}
              aria-label={`הצגת מקורות נוספים ב${activeSubtopic.title}`}
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-bold text-txt-dim transition duration-200 ease-out hover:border-teal/45 hover:text-txt active:scale-[0.97]"
            >
              הבא
            </button>
          </div>
        </div>

        <div
          id={`carousel-${selectedGroup.id}`}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:thin]"
        >
          {activeSubtopicGroup.items.map((item, index) => {
            const isSelected = item.id === activeVideo.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectVideo(item)}
                aria-pressed={isSelected}
                className={`group relative flex min-h-44 w-[min(17rem,80vw)] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--r-md)] border p-4 text-right transition duration-200 ease-out active:scale-[0.985] ${
                  isSelected
                    ? `border-transparent bg-card-2 ring-2 ${subtopicAccent.ring} shadow-[var(--shadow)]`
                    : "border-line bg-card hover:-translate-y-0.5 hover:border-teal/45 hover:bg-card-2 hover:shadow-[var(--shadow)]"
                }`}
              >
                <span className={`absolute inset-y-0 right-0 w-1 ${subtopicAccent.bar}`} aria-hidden="true" />
                <div className="mb-4 flex items-center justify-between gap-3 pl-1">
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
      </section>
    </main>
  );
}
