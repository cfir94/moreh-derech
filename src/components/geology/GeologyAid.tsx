"use client";
/* eslint-disable @next/next/no-img-element -- static-export photos have runtime paths */

import { useEffect, useMemo, useRef, useState } from "react";
import { AidHeader, AidTabs, PhotoFigure, PracticeDeck, useHashTab, type PracticeItem } from "@/components/learning-aid";
import { useTheme } from "@/components/ThemeToggle";
import { AGES, ROCKS, ROCK_FAMILIES, SOILS, type AgeId, type RockFamily } from "@/data/geology/geology";
import { withBasePath } from "@/lib/basePath";
import type { ReliefViewer, Unit } from "./relief3d";
import { GSI_CREDIT, gsiAge } from "@/data/geology/gsi";
import { GSI_UNITS } from "@/data/geology/gsi-units";
import styles from "./geology.module.css";
import { PageDecor } from "@/components/trail/PageDecor";

export type GeoPhoto = { src: string; caption: string; credit: string; alt: string };
export type GeoPhotos = Record<string, GeoPhoto[]>;

type Level = "basic" | "advanced" | "official";
type UnitInfo = Unit & { summary: string; description: string; rockClass: string; sources: { title: string; url: string }[] };

const TABS = [
  { id: "map", label: "המפה בתלת־ממד" },
  { id: "ages", label: "עמוד הזמן" },
  { id: "rocks", label: "סלעים", count: ROCKS.length },
  { id: "soils", label: "קרקעות", count: SOILS.length },
  { id: "practice", label: "תרגול" },
] as const;
type TabId = (typeof TABS)[number]["id"];
const TAB_IDS = TABS.map((t) => t.id);

const AGE_BY_ID = new Map(AGES.map((a) => [a.id, a]));
const ageOrder = (id: string) => AGES.findIndex((a) => a.id === id);

function Extra() {
  return <span className="mr-2 rounded-full border border-line px-2 py-0.5 text-sm font-bold text-txt-dim" title="ידע כללי שאינו בחומר הקורס">השלמה</span>;
}

function Swatch({ color }: { color: string }) {
  return <span aria-hidden className={styles.swatch} style={{ background: color }} />;
}

// ------------------------------------------------------------------ the map

type RawGeometry = { type: string; coordinates: unknown };
const polygonsOf = (g: RawGeometry) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates) as Unit["rings"];

/** The official map: thousands of polygons, gathered into one unit per formation. */
function officialUnits(features: { properties: Record<string, unknown>; geometry: RawGeometry }[]): UnitInfo[] {
  const byCode = new Map<number, UnitInfo>();
  for (const f of features) {
    const code = Number(f.properties.c);
    const meta = GSI_UNITS[code];
    if (!meta || !f.geometry) continue;
    let unit = byCode.get(code);
    if (!unit) {
      const age = gsiAge(meta.en);
      unit = {
        id: `gsi-${code}`, name: meta.he || meta.en, color: meta.color, age, rings: [],
        summary: `${meta.symbol} · ${meta.en}`, description: "", rockClass: meta.symbol,
        sources: [{ title: GSI_CREDIT.text, url: GSI_CREDIT.url }],
      };
      byCode.set(code, unit);
    }
    unit.rings.push(...polygonsOf(f.geometry));
  }
  return [...byCode.values()];
}

function useUnits(level: Level) {
  const [cache, setCache] = useState<Partial<Record<Level, UnitInfo[]>>>({});
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (cache[level]) return;
    let live = true;
    const path = level === "official" ? "/geology/gsi-200k.geojson" : `/embeds/map/js/data/geology_${level}.geojson`;
    fetch(withBasePath(path))
      .then((r) => r.json())
      .then((data: { features: { properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown } }[] }) => {
        if (!live) return;
        const units = (level === "official" ? officialUnits(data.features) : data.features.map((f) => {
          const p = f.properties;
          return {
            id: String(p.id), name: String(p.name_he), color: String(p.color), age: String(p.age_class),
            rings: polygonsOf(f.geometry),
            summary: String(p.rock_summary_he ?? ""), description: String(p.description_he ?? ""),
            rockClass: String(p.rock_class_he ?? ""),
            sources: Array.isArray(p.sources) ? (p.sources as { title: string; url: string }[]) : [],
          } satisfies UnitInfo;
        })).sort((a, b) => ageOrder(a.age) - ageOrder(b.age) || a.name.localeCompare(b.name, "he"));
        setCache((c) => ({ ...c, [level]: units }));
      })
      .catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [level, cache]);
  return { units: cache[level], failed };
}

function ReliefMap({ focusAge, onAge }: { focusAge: AgeId | null; onAge: (age: AgeId | null) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<ReliefViewer | null>(null);
  const theme = useTheme();
  const themeRef = useRef(theme);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [level, setLevel] = useState<Level>("basic");
  const [picked, setPicked] = useState<string | null>(null);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [lift, setLift] = useState(5);
  const { units, failed } = useUnits(level);
  const unitsRef = useRef(units);

  useEffect(() => {
    let disposed = false;
    import("./relief3d").then(async ({ createReliefViewer, loadReliefAssets }) => {
      const assets = await loadReliefAssets(withBasePath);
      if (disposed || !host.current) return;
      try {
        const v = createReliefViewer(host.current, assets, {
          onPick: (id) => setPicked(id),
          onHover: (id, x, y) => setHover(id ? { id, x, y } : null),
        }, themeRef.current);
        viewer.current = v;
        if (unitsRef.current) v.setUnits(unitsRef.current);
        setStatus("ready");
      } catch {
        setStatus("failed");
      }
    }).catch(() => !disposed && setStatus("failed"));
    return () => { disposed = true; viewer.current?.dispose(); viewer.current = null; };
  }, []);

  useEffect(() => { unitsRef.current = units; if (units) viewer.current?.setUnits(units); }, [units, status]);
  useEffect(() => { themeRef.current = theme; viewer.current?.setTheme(theme); }, [theme, status]);
  useEffect(() => { viewer.current?.setFocus({ unit: picked, age: picked ? null : focusAge }); }, [picked, focusAge, units, status]);
  useEffect(() => { viewer.current?.setExaggeration(lift); }, [lift, status]);

  const info = units?.find((u) => u.id === picked) ?? null;
  const hoverName = hover && units?.find((u) => u.id === hover.id)?.name;
  const age = info ? AGE_BY_ID.get(info.age as AgeId) : focusAge ? AGE_BY_ID.get(focusAge) : null;
  const choose = (id: string | null) => { setPicked(id); if (id) onAge(null); };

  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="רמת פירוט" className="flex rounded-full border border-line bg-card p-1">
          {([["basic", "פשוטה"], ["advanced", "מפורטת"], ["official", "רשמית"]] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={level === id} onClick={() => { setLevel(id); setPicked(null); }} className={`min-h-11 rounded-full px-5 font-bold transition active:scale-95 ${level === id ? "bg-mc text-on-accent" : "text-txt-dim"}`}>{label}</button>)}
        </div>
        <label className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-bold">
          הגבהה <span className="num">×{lift}</span>
          <input type="range" min={1} max={10} value={lift} onChange={(e) => setLift(Number(e.target.value))} className="w-24 accent-[var(--color-mc)]" aria-label="הגבהת התבליט" />
        </label>
        <button type="button" onClick={() => viewer.current?.resetView()} className="min-h-11 rounded-full border border-line bg-card px-4 font-bold active:scale-95">מבט מלא</button>
      </div>
      <div className={styles.stage}>
        <div ref={host} className={styles.canvasHost} role="img" aria-label="מפה גאולוגית תלת־ממדית של ארץ ישראל. גררו לסיבוב, גלגלו או צבטו לזום, והקישו על אזור כדי לקרוא עליו. רשימת האזורים נמצאת גם מתחת למפה." />
        {(status === "loading" || (!units && !failed)) && status !== "failed" && <div className={styles.note} role="status">בונה את התבליט…</div>}
        {(status === "failed" || failed) && <div className={styles.note} role="status">הדפדפן הזה לא מציג תלת־ממד. את האזורים אפשר לקרוא ברשימה שמתחת.</div>}
        {hover && hoverName && <div className={styles.tooltip} style={{ transform: `translate(${hover.x}px, ${hover.y}px)` }}>{hoverName}</div>}
        <p className={styles.hint}>גררו לסיבוב · גלגלת או צביטה לזום · הקישו על אזור</p>
      </div>
      <p className="text-sm leading-5 text-txt-dim">{level === "official"
        ? <>השכבה הרשמית: <a href={GSI_CREDIT.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{GSI_CREDIT.text}</a>, בצבעים של המפה המודפסת. הקווים מוכללים לתצוגה ארצית.</>
        : "צבעי האזורים הם צבעי גיל הסלע, כמו במפות גאולוגיות. תחומי היחידות סכמטיים: הכללה ללימוד, לא מיפוי מדויק."} גבהים: Mapzen Terrain Tiles.</p>
    </div>

    <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start" aria-live="polite">
      {info ? <article className="screen-in paper-sheet p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-black">{info.name}</h2>
          <button type="button" onClick={() => setPicked(null)} aria-label="סגירה" className="min-h-11 min-w-11 rounded-full border border-line text-lg">×</button>
        </div>
        {age && <button type="button" onClick={() => { location.hash = "ages"; }} className="mt-2 flex items-center gap-2 text-sm font-bold text-mc underline-offset-4 hover:underline"><Swatch color={age.color} />{age.name} · {age.when}</button>}
        <p className="mt-3 font-bold leading-7">{info.summary}</p>
        <p className="mt-2 leading-7 text-txt-dim">{info.description}</p>
        {info.sources.length > 0 && <p className="mt-3 text-sm text-txt-dim">מקור: {info.sources.map((s, i) => <span key={s.url}>{i > 0 && " · "}<a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">{s.title}</a></span>)}</p>}
      </article> : age ? <article className="paper-sheet p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-txt-dim"><Swatch color={age.color} />מוצג רק:</p>
        <h2 className="mt-1 text-xl font-black">{age.name}</h2>
        <p className="mt-2 leading-7 text-txt-dim">{age.story}</p>
        <button type="button" onClick={() => onAge(null)} className="mt-3 min-h-11 rounded-full border border-line px-4 font-bold">כל התקופות</button>
      </article> : <article className="paper-sheet p-5">
        <h2 className="text-xl font-black">איך קוראים את המפה</h2>
        <p className="mt-2 leading-7 text-txt-dim">כל צבע הוא גיל: ורוד הוא הסלע העתיק ביותר, בהרי אילת; ירוק הוא חבורת יהודה, שדרת ההר; צהוב הוא הצעיר, בעמקים ובחוף. הקישו על אזור, או בחרו מהרשימה.</p>
      </article>}

      <nav aria-label="אזורי המפה" className="paper-sheet p-2">
        <ul className="max-h-[22rem] space-y-1 overflow-y-auto">
          {units?.map((u) => <li key={u.id}>
            <button type="button" aria-pressed={picked === u.id} onClick={() => choose(picked === u.id ? null : u.id)} className={`flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-right transition ${picked === u.id ? "bg-card-2 font-black" : "hover:bg-card-2"}`}>
              <Swatch color={u.color} />
              <span className="min-w-0 flex-1"><span className="block">{u.name}</span><span className="block text-sm text-txt-dim">{AGE_BY_ID.get(u.age as AgeId)?.name} · {u.rockClass}</span></span>
            </button>
          </li>)}
        </ul>
      </nav>
    </aside>
  </div>;
}

// ------------------------------------------------------------------ ages

function AgesColumn({ onShow }: { onShow: (age: AgeId) => void }) {
  const youngestFirst = [...AGES].reverse();
  return <section aria-labelledby="ages-title" className="space-y-3">
    <div className="paper-sheet p-5">
      <h2 id="ages-title" className="text-2xl font-black">עמוד הזמן של ארץ ישראל</h2>
      <p className="mt-1 leading-7 text-txt-dim">כמו בחתך בשטח: הצעיר למעלה, העתיק למטה. כל שכבה מספרת איזו סביבה הייתה כאן כשהסלע נוצר.</p>
    </div>
    <ol className="space-y-2">
      {youngestFirst.map((age) => <li key={age.id} className={`${styles.layer} rounded-lg border border-line bg-card`}>
        <span aria-hidden className={styles.band} style={{ background: age.color }} />
        <div className="min-w-0 flex-1 p-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-black">{age.name}{age.extra && <Extra />}</h3>
            <span className="text-sm font-bold text-txt-dim">{age.when}</span>
          </div>
          <p className="mt-1 leading-7">{age.story}</p>
          <dl className="mt-2 grid gap-1 text-sm leading-6 sm:grid-cols-2">
            <div><dt className="inline font-bold">סלעים: </dt><dd className="inline text-txt-dim">{age.rocks}</dd></div>
            <div><dt className="inline font-bold">בסיור: </dt><dd className="inline text-txt-dim">{age.where}</dd></div>
          </dl>
          <button type="button" onClick={() => onShow(age.id)} className="mt-2 min-h-11 rounded-full border border-line px-4 text-sm font-bold active:scale-95">הראו במפה</button>
        </div>
      </li>)}
    </ol>
  </section>;
}

// ------------------------------------------------------------------ rocks & soils

function RocksList({ photos }: { photos: GeoPhotos }) {
  const [family, setFamily] = useState<RockFamily | "">("");
  const list = ROCKS.filter((r) => !family || r.family === family);
  const nameOf = (id: string) => ROCKS.find((r) => r.id === id)?.name ?? id;
  return <section aria-labelledby="rocks-title" className="space-y-4">
    <div className="paper-sheet p-5">
      <h2 id="rocks-title" className="text-2xl font-black">סלעים</h2>
      <p className="mt-1 leading-7 text-txt-dim">שלוש משפחות, לפי הדרך שבה הסלע נוצר. בכל כרטיס: הסימן בשטח, הבדיקה, ומה מספרים עליו בסיור.</p>
      <div role="group" aria-label="סינון לפי משפחה" className="mt-4 flex flex-wrap gap-2">
        {([["", "הכול"], ...Object.entries(ROCK_FAMILIES).map(([id, f]) => [id, f.title])] as [RockFamily | "", string][]).map(([id, label]) => <button key={id || "all"} type="button" aria-pressed={family === id} onClick={() => setFamily(id)} className={`min-h-11 rounded-full border px-4 font-bold transition active:scale-95 ${family === id ? "border-mc bg-mc text-on-accent" : "border-line"}`}>{label}</button>)}
      </div>
      {family && <p className="mt-3 text-sm leading-6 text-txt-dim">{ROCK_FAMILIES[family].how}</p>}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {list.map((rock) => {
        const photo = photos[rock.id]?.[0];
        return <article key={rock.id} id={`rock-${rock.id}`} className="scroll-mt-36 overflow-hidden paper-sheet">
          {photo && <img src={withBasePath(photo.src)} alt={photo.alt || rock.name} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
          <div className="p-5">
            <p className="text-sm font-bold text-txt-dim">{ROCK_FAMILIES[rock.family].title} · {rock.kind}</p>
            <h3 className="mt-1 text-xl font-black">{rock.name}{rock.extra && <Extra />}</h3>
            <p className="mt-2 leading-7"><strong>סימן בשטח: </strong>{rock.sign}</p>
            <p className="mt-1 leading-7 text-txt-dim"><strong className="text-txt">בסיור: </strong>{rock.tour}</p>
            <details className="mt-3 border-t border-line pt-2 text-sm leading-7">
              <summary className="min-h-11 cursor-pointer py-2 font-bold text-mc">איך נוצר ואיך בודקים</summary>
              <p><strong>איך נוצר: </strong><span className="text-txt-dim">{rock.how}</span></p>
              <p><strong>בדיקה: </strong><span className="text-txt-dim">{rock.test}</span></p>
              <p><strong>איפה בארץ: </strong><span className="text-txt-dim">{rock.where}</span></p>
              {rock.confuse?.map((c) => <p key={c.with}><strong>לא להתבלבל עם <a href={`#rock-${c.with}`} onClick={(e) => { e.preventDefault(); document.getElementById(`rock-${c.with}`)?.scrollIntoView({ behavior: "smooth" }); }} className="text-mc underline underline-offset-4">{nameOf(c.with)}</a>: </strong><span className="text-txt-dim">{c.how}</span></p>)}
              {photo && <p className="mt-2 text-sm text-txt-dim">{photo.caption} · צילום: {photo.credit}</p>}
            </details>
          </div>
        </article>;
      })}
    </div>
  </section>;
}

function SoilsList({ photos }: { photos: GeoPhotos }) {
  return <section aria-labelledby="soils-title" className="space-y-4">
    <div className="paper-sheet p-5">
      <h2 id="soils-title" className="text-2xl font-black">קרקעות</h2>
      <p className="mt-1 leading-7 text-txt-dim">הקרקע היא הסלע אחרי בליה, והיא שקובעת מה צומח ואיפה התיישבו. כך קוראים את הנוף מחלון האוטובוס.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {SOILS.map((soil) => {
        const photo = photos[`soil-${soil.id}`]?.[0];
        return <article key={soil.id} id={`soil-${soil.id}`} className="overflow-hidden paper-sheet">
          {photo && <PhotoFigure src={photo.src} alt={photo.alt || soil.name} caption={photo.caption} credit={photo.credit} />}
          <div className="p-5">
            <h3 className="text-xl font-black">{soil.name}{soil.extra && <Extra />}</h3>
            <p className="mt-1 text-sm font-bold text-txt-dim">מ{soil.parent}</p>
            <dl className="mt-3 space-y-2 leading-7">
              <div><dt className="inline font-bold">איך נראית: </dt><dd className="inline text-txt-dim">{soil.look}</dd></div>
              <div><dt className="inline font-bold">איפה: </dt><dd className="inline text-txt-dim">{soil.where}</dd></div>
              <div><dt className="inline font-bold">מה זה אומר בנוף: </dt><dd className="inline text-txt-dim">{soil.meaning}</dd></div>
            </dl>
          </div>
        </article>;
      })}
    </div>
  </section>;
}

// ------------------------------------------------------------------ page

export function GeologyAid({ photos, practice }: { photos: GeoPhotos; practice: PracticeItem[] }) {
  const [tab, setTab] = useHashTab<TabId>(TAB_IDS, "map");
  const [focusAge, setFocusAge] = useState<AgeId | null>(null);
  const stats = useMemo(() => `${AGES.length} תקופות · ${ROCKS.length} סלעים · ${SOILS.length} קרקעות`, []);

  return <main dir="rtl" className="relative mx-auto min-h-screen w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
    <PageDecor wide items={["hammer","strata","hills","lake","handaxe"]} />
    <AidHeader slug="geology" title="גאולוגיה של ארץ ישראל" subtitle="מה בנוי מה, ומתי. מפה בתלת־ממד, עמוד הזמן, הסלעים והקרקעות שרואים בסיור." stats={stats} />
    <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-6">
      <AidTabs tabs={TABS} active={tab} onSelect={setTab} />
      <div role="tabpanel" aria-labelledby={`aid-tab-${tab}`} className="mt-4 min-w-0 lg:mt-0">
        {tab === "map" && <ReliefMap focusAge={focusAge} onAge={setFocusAge} />}
        {tab === "ages" && <AgesColumn onShow={(age) => { setFocusAge(age); setTab("map"); }} />}
        {tab === "rocks" && <RocksList photos={photos} />}
        {tab === "soils" && <SoilsList photos={photos} />}
        {tab === "practice" && <section className="space-y-3">
          <p className="paper-sheet p-4 leading-7 text-txt-dim">עשר שאלות משאלון הגאולוגיה. התשובות נרשמות במעקב שלכם, ושאלה שטעיתם בה תחזור בתרגול הטעויות.</p>
          <PracticeDeck quizSlug="geology" label="גיאולוגיה" items={practice} />
        </section>}
      </div>
    </div>
  </main>;
}
