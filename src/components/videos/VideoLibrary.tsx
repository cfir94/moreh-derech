"use client";

/**
 * ספריית הסרטונים (עיצוב מחדש, בקשת הבעלים 18.11): נכנסים ורואים סרטון.
 * הנגן עומד בראש הדף, ולידו (או מתחתיו בטלפון) הסרטונים של האוסף או "הבא בתור".
 * מתחתיו קרוסלה אחת של אוספים לפי סוג החומר, עם סינון לפי תחום. במקום שלוש שכבות של
 * בחירה (סוג → תחום → תת־נושא) לפני הנגן: לשונית אחת, שורת סינון אחת ושורת כרטיסים אחת.
 * הקישור הישיר (?video=…&part=…) נשמר.
 */
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { videoCount, videoGroups, type TopicTone, type VideoGroup, type VideoItem, type VideoPart } from "@/data/videos";
import { CLASS_VIDEO_SECTIONS, classRecordingCount, classVideoCount, type VideoSection } from "@/data/class-videos";
import { findVideoSelection, selectedVideoPart, videoPlayerUrl } from "@/lib/videoPlayback";
import { useClassMember } from "@/hooks/useClassMember";
import { LessonPlaylist } from "./LessonPlaylist";
import { YouTubePlayer } from "./YouTubePlayer";
import { Chevron } from "./Chevron";
import { InkIcon, type Wash } from "@/components/trail/Ink";
import type { FieldIconName } from "@/components/trail/FieldIcons";
import { kit, PenUnderline } from "@/components/trail/kit";
import { PageDecor } from "@/components/trail/PageDecor";
import s from "./videos.module.css";

const enrichmentSection: VideoSection = {
  id: "enrichment",
  title: "העשרה",
  description: "סדרות, הרצאות וסרטונים משלימים לפי נושאי הליבה של הקורס.",
  groups: videoGroups,
};
const classSections: VideoSection[] = [...CLASS_VIDEO_SECTIONS, enrichmentSection];
const publicSections: VideoSection[] = [enrichmentSection];

const SECTION_ICON = { theory: "notebooks", online: "videos", tours: "footprint", enrichment: "binoculars" } as const;
const TONE_WASH: Record<TopicTone, Wash> = { teal: "green", blue: "blue", violet: "blue", gold: "orange", rose: "red" };
const ALL = "all";
/** a drawing for a collection that has no still of its own (YouTube playlists), by its field */
const GROUP_ICON: Record<string, FieldIconName> = {
  "history-jerusalem": "scroll", archaeology: "trowel", "religions-communities": "dome", "art-architecture": "column",
  "geography-landscape": "hills", "water-nature-ecology": "leaf", "israel-guiding-skills": "flag",
};

type Entry = { item: VideoItem; group: VideoGroup };

function entriesOf(section: VideoSection): Entry[] {
  return section.groups.flatMap((group) => group.items.map((item) => ({ item, group })));
}

/** A still for the card: the first lesson of a collection, or the video itself. Playlists have none. */
function thumbOf(item: VideoItem) {
  if (item.parts?.length) return item.parts[0].id;
  const id = item.embedUrl.match(/youtube\.com\/embed\/([\w-]{11})(?:[?#]|$)/)?.[1];
  return id === "videoseries" ? undefined : id;
}

function kindLabel(item: VideoItem) {
  if (item.externalProvider) return `סדרה ב${item.externalProvider}`;
  if (item.parts?.length) return `${item.parts.length} סרטונים`;
  return item.type === "playlist" ? "פלייליסט" : "סרטון";
}

function firstWatchable(entries: Entry[]) {
  return (entries.find(({ item }) => !item.embedRestricted) ?? entries[0]).item;
}

function ExternalLinkIcon() {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M14 5h5v5M19 5l-8 8M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

/**
 * Course recordings are shown only to current classmates (see src/lib/classAccess.ts).
 * The key remounts the library once the session is read, so a classmate never keeps
 * the enrichment-only state that the static HTML starts with.
 */
export function VideoLibrary() {
  const classMember = useClassMember();
  return <VideoLibraryView key={classMember ? "class" : "public"} classMember={classMember} />;
}

function VideoLibraryView({ classMember }: { classMember: boolean }) {
  const sections = classMember ? classSections : publicSections;
  const total = (classMember ? classVideoCount : 0) + videoCount;
  const [sectionId, setSectionId] = useState(sections[0].id);
  const [category, setCategory] = useState<string>(ALL);
  const [videoId, setVideoId] = useState(() => firstWatchable(entriesOf(sections[0])).id);
  const [partId, setPartId] = useState(() => firstWatchable(entriesOf(sections[0])).parts?.[0]?.id ?? "");
  const [autoplay, setAutoplay] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const stageRef = useRef<HTMLElement>(null);

  const section = sections.find((x) => x.id === sectionId) ?? sections[0];
  const entries = useMemo(() => entriesOf(section), [section]);
  const shown = useMemo(() => category === ALL ? entries : entries.filter(({ group }) => group.id === category), [entries, category]);
  const all = useMemo(() => sections.flatMap(entriesOf), [sections]);
  const current = all.find(({ item }) => item.id === videoId) ?? entries[0];
  const video = current.item;
  const part = selectedVideoPart(video, partId);
  const partIndex = video.parts?.findIndex((p) => p.id === part?.id) ?? -1;
  const at = shown.findIndex(({ item }) => item.id === video.id);
  const upNext = at < 0 ? shown.slice(0, 5) : [...shown.slice(at + 1), ...shown.slice(0, at)].slice(0, 5);
  const showCategories = section.groups.length > 1;

  useEffect(() => {
    function readSelection() {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("video");
      if (!requested) return;
      const found = findVideoSelection(sections, requested);
      if (!found) return;
      setSectionId(found.section.id);
      setCategory(ALL);
      setVideoId(found.item.id);
      setPartId(selectedVideoPart(found.item, params.get("part") ?? undefined)?.id ?? "");
      setAutoplay(false);
    }
    const timer = window.setTimeout(readSelection, 0);
    window.addEventListener("popstate", readSelection);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("popstate", readSelection);
    };
  }, [sections]);

  function writeUrl(item: VideoItem, part?: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("video", item.id);
    if (part) url.searchParams.set("part", part);
    else url.searchParams.delete("part");
    window.history.replaceState(window.history.state, "", url);
  }

  function reveal() {
    requestAnimationFrame(() => {
      const stage = stageRef.current;
      if (!stage || stage.getBoundingClientRect().top >= 0) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      stage.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  }

  function choose(item: VideoItem, scroll = true) {
    const first = item.parts?.[0]?.id;
    setVideoId(item.id);
    setPartId(first ?? "");
    setAutoplay(false);
    writeUrl(item, first);
    if (scroll) reveal();
  }

  function pickSection(next: VideoSection) {
    setSectionId(next.id);
    setCategory(ALL);
    choose(firstWatchable(entriesOf(next)), false);
  }

  function pickCategory(id: string) {
    setCategory(id);
    const list = id === ALL ? entries : entries.filter(({ group }) => group.id === id);
    if (!list.some(({ item }) => item.id === video.id)) choose(firstWatchable(list), false);
  }

  function flip(step: 1 | -1) {
    if (!shown.length) return;
    const from = at < 0 ? (step === 1 ? -1 : 0) : at;
    choose(shown[(from + step + shown.length) % shown.length].item, false);
  }

  function pickPart(next: VideoPart) {
    setPartId(next.id);
    setAutoplay(true);
    writeUrl(video, next.id);
  }

  function onPartEnded() {
    const next = video.parts?.[partIndex + 1];
    if (autoAdvance && next) pickPart(next);
  }

  return (
    <main className={`screen-in ${s.page}`} dir="rtl">
      <PageDecor wide step={520} items={["videos", "talk", "binoculars", "notebooks", "signpost"]} />

      <header className={s.head} data-ground="videos">
        <div className={s.headTitle}>
          <div className={kit.titleWrap}>
            <h1 className={s.title}>ספריית הסרטונים</h1>
            <PenUnderline />
          </div>
          <p className={s.lede}>
            {classMember
              ? <><span className="num">{total}</span> אוספים: הקלטות הכיתה (<span className="num">{classRecordingCount}</span> סרטונים), קורסים מקוונים, סיורים והעשרה.</>
              : <><span className="num">{total}</span> סדרות, הרצאות וסרטונים משלימים לפי נושאי הקורס.</>}
          </p>
        </div>
        {sections.length > 1 && (
          <nav aria-label="סוג החומר" className={s.sections}>
            <span className={s.sectionsLabel}>מה לראות?</span>
            {sections.map((x) => {
              const on = x.id === section.id;
              return <button key={x.id} type="button" onClick={() => pickSection(x)} aria-pressed={on} className={`${kit.chip} ${on ? kit.chipOn : ""}`}>
                <InkIcon name={SECTION_ICON[x.id]} size={22} />
                {x.title}
                <span className="num">{entriesOf(x).length}</span>
              </button>;
            })}
          </nav>
        )}
      </header>

      <div className={s.layout}>
      <section ref={stageRef} aria-label="הנגן הנבחר" className={s.stage}>
        <div className={s.stageMain}>
          <div className={s.stageHead} aria-live="polite">
            <p className={s.where}>{section.title} · {current.group.category}</p>
            <h2 className={s.nowTitle}>{video.title}</h2>
          </div>
          <div className={s.screen}>
            {video.embedRestricted ? (
              <div className={s.blocked}>
                <p className={s.blockedTag}>{video.externalProvider ? `מקור רשמי של ${video.externalProvider}` : "מקור מומלץ עם זמינות משתנה"}</p>
                <p className={s.blockedTitle}>{video.externalProvider ? `הסדרה זמינה לצפייה באתר ${video.externalProvider}.` : "הפלייליסט אינו זמין כעת להטמעה."}</p>
                <p className={s.blockedText}>{video.externalProvider
                  ? `${video.externalProvider} חוסם הטמעה באתרים אחרים. הקישור פותח את כל פרקי הסדרה.`
                  : "הוא נשמר בספרייה כהמלצה של רכז הקורס. אפשר לפתוח אותו ישירות ביוטיוב."}</p>
                <a href={video.directUrl} target="_blank" rel="noopener noreferrer" className={s.blockedLink}>
                  פתיחה ב{video.externalProvider ?? "יוטיוב"} <ExternalLinkIcon />
                </a>
              </div>
            ) : (
              <YouTubePlayer
                key={`${video.id}-${part?.id ?? "single"}-${autoplay}`}
                src={videoPlayerUrl(video, partId, autoplay)}
                title={part?.title ?? video.title}
                onEnded={onPartEnded}
              />
            )}
          </div>
          <div className={s.info}>
            <div className={s.flip}>
              <button type="button" onClick={() => flip(-1)} className={s.step} aria-label="האוסף הקודם"><Chevron dir="prev" />הקודם</button>
              <span className={s.flipAt}><span className="num">{at + 1 || "–"}</span> / <span className="num">{shown.length}</span></span>
              <button type="button" onClick={() => flip(1)} className={`${s.step} ${s.stepNext}`} aria-label="האוסף הבא">הבא<Chevron dir="next" /></button>
            </div>
            <div className={s.meta}>
              <span className={s.kind}>{kindLabel(video)}</span>
              {video.recommendedByCoordinator && <span className={s.coord}>המלצת רכז הקורס</span>}
              <span className={s.source}>{video.source}</span>
            </div>
            {part && <p className={s.partNow}>סרטון <span className="num">{partIndex + 1}</span>: {part.title}</p>}
            <details className={s.about}>
              <summary>על האוסף וקישור למקור</summary>
              <p>{video.description}</p>
              <a href={video.directUrl} target="_blank" rel="noopener noreferrer">פתיחה ב{video.externalProvider ?? "יוטיוב"} <ExternalLinkIcon /></a>
            </details>
          </div>
        </div>

        <aside className={`${s.side} ${part ? "" : s.sideNext}`} aria-label={part ? "סרטוני האוסף" : "הבא בתור"}>
          {part ? (
            <LessonPlaylist
              key={video.id}
              item={video}
              selectedPart={part}
              onSelect={pickPart}
              autoAdvance={autoAdvance}
              onAutoAdvanceChange={setAutoAdvance}
            />
          ) : (
            <section aria-labelledby="up-next-heading" className={s.parts}>
              <div className={s.partsHead}><h3 id="up-next-heading" className={s.partsTitle}>הבא בתור</h3></div>
              <p className={s.desc}>{video.description}</p>
              <ol className={s.partsList}>
                {upNext.map(({ item, group }) => <li key={item.id}>
                  <button type="button" onClick={() => choose(item, false)} className={s.part}>
                    <Thumb item={item} icon={GROUP_ICON[group.id]} tone={item.subtopic?.tone} small />
                    <span className={s.partText}>
                      <span className={s.partNum}>{group.category}</span>
                      <span className={s.partName}>{item.title}</span>
                    </span>
                  </button>
                </li>)}
              </ol>
            </section>
          )}
        </aside>
      </section>

      <section aria-label="בחירת קורס או אוסף" className={s.browse}>
        <div className={s.browseHead}>
          <h2 className={s.browseTitle}>כל האוספים: {section.title}</h2>
          <p className={s.browseCount}><span className="num">{shown.length}</span> אוספים. לחיצה על אוסף פותחת אותו בנגן.</p>
        </div>
        {showCategories && (
          <label className={s.catPick}>
            <span>תחום:</span>
            <select value={category} onChange={(e) => pickCategory(e.target.value)}>
              <option value={ALL}>הכול ({entries.length})</option>
              {section.groups.map((g) => <option key={g.id} value={g.id}>{g.category} ({g.items.length})</option>)}
            </select>
          </label>
        )}
        <ol className={s.rail}>
          {shown.map(({ item, group }) => {
            const on = item.id === video.id;
            return <li key={item.id}>
              <button type="button" data-video-id={item.id} onClick={() => choose(item)} aria-pressed={on} className={s.card}>
                <Thumb item={item} icon={GROUP_ICON[group.id]} tone={item.subtopic?.tone} />
                <span className={s.cardBody}>
                  <span className={s.cardKind}>{on ? "בנגן עכשיו" : kindLabel(item)}</span>
                  <span className={s.cardTitle}>{item.title}</span>
                  <span className={s.cardWhere}>{showCategories ? group.category : item.subtopic?.title ?? group.category}</span>
                  {item.recommendedByCoordinator && <span className={s.coord}>המלצת רכז הקורס</span>}
                </span>
              </button>
            </li>;
          })}
        </ol>
      </section>
      </div>
    </main>
  );
}

function Thumb({ item, icon, tone, small = false }: { item: VideoItem; icon?: FieldIconName; tone?: TopicTone; small?: boolean }) {
  const still = thumbOf(item);
  return <span className={`${s.thumb} ${small ? s.thumbSmall : ""}`} aria-hidden>
    {still
      ? <Image src={`https://i.ytimg.com/vi/${still}/mqdefault.jpg`} alt="" width={320} height={180} unoptimized />
      : <span className={s.thumbDrawn}><InkIcon name={icon ?? (item.externalProvider ? "videos" : "binoculars")} size={small ? 30 : 46} tint={tone ? TONE_WASH[tone] : true} /></span>}
    {!small && <span className={s.play}><svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" /></svg></span>}
  </span>;
}
