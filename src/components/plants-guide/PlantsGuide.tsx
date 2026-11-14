"use client";
/* eslint-disable @next/next/no-img-element -- optional static-export photos have runtime paths */

import { useEffect, useMemo, useState } from "react";
import { AidHeader, PhotoFigure } from "@/components/learning-aid";
import { PLANTS, PLANT_GROUPS, type Plant, type PlantGroup } from "@/data/plants/plants";
import { MONTHS, parseSeasonMonths } from "./season";
import styles from "./plants-guide.module.css";
import { PageDecor } from "@/components/trail/PageDecor";

export type GuidePhoto = { src: string; caption: string; credit: string };
export type GuidePhotos = Record<string, GuidePhoto[]>;

const habits = [...new Set(PLANTS.map((plant) => plant.habit))];
const seasons = ["חורף", "אביב", "קיץ", "סתיו"];

function plantFromHash() {
  if (typeof window === "undefined") return null;
  return PLANTS.find((plant) => window.location.hash === `#plant-${plant.id}`) ?? null;
}

export function PlantsGuide({ photos }: { photos: GuidePhotos }) {
  const [group, setGroup] = useState<PlantGroup | "">("");
  const [habit, setHabit] = useState("");
  const [season, setSeason] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Plant | null>(null);
  const [month, setMonth] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => setSelected(plantFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      history.replaceState(null, "", `${location.pathname}${location.search}`);
      setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("he");
    return PLANTS.filter((plant) => (!group || plant.group === group)
      && (!habit || plant.habit === habit)
      && (!season || plant.season.includes(season))
      && (!needle || [plant.name, plant.sci, plant.sign, plant.habitat, plant.where].some((value) => value.toLocaleLowerCase("he").includes(needle))));
  }, [group, habit, season, query]);

  const monthPlants = month === null ? [] : PLANTS.filter((plant) => parseSeasonMonths(plant.season).includes(month));
  const openPlant = (plant: Plant) => {
    history.pushState(null, "", `#plant-${plant.id}`);
    setSelected(plant);
  };
  const closePlant = () => { history.replaceState(null, "", `${location.pathname}${location.search}`); setSelected(null); };

  return <main dir="rtl" className="relative mx-auto min-h-screen w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
    <PageDecor wide birds items={["flower","leaf","butterfly","tree","lake","binoculars"]} />
    <AidHeader slug="plants" title="מגדיר צמחים" subtitle="מצמצמים לפי מה שרואים בשטח, ומגיעים לצמח המתאים." stats={`${PLANTS.length} צמחים · ${Object.keys(PLANT_GROUPS).length} קבוצות`} />

    <section aria-labelledby="identify-title" className="rounded-lg border border-line bg-card p-4 sm:p-6">
      <h2 id="identify-title" className="text-2xl font-black">מה ראיתם בדרך?</h2>
      <p className="mt-1 text-txt-dim">בחרו רק מה שאתם יודעים. כל בחירה מצמצמת את התוצאות.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="font-bold">בית גידול
          <select value={group} onChange={(e) => setGroup(e.target.value as PlantGroup | "")} className="mt-1 min-h-11 w-full rounded-sm border border-line bg-sheet px-3 font-normal">
            <option value="">הכול</option>{Object.entries(PLANT_GROUPS).map(([id, value]) => <option key={id} value={id}>{value.title}</option>)}
          </select>
        </label>
        <label className="font-bold">עונה
          <select value={season} onChange={(e) => setSeason(e.target.value)} className="mt-1 min-h-11 w-full rounded-sm border border-line bg-sheet px-3 font-normal">
            <option value="">כל השנה</option>{seasons.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="font-bold">צורת חיים
          <select value={habit} onChange={(e) => setHabit(e.target.value)} className="mt-1 min-h-11 w-full rounded-sm border border-line bg-sheet px-3 font-normal">
            <option value="">הכול</option>{habits.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="font-bold">חיפוש חופשי
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="שם, סימן או מקום" className="mt-1 min-h-11 w-full rounded-sm border border-line bg-sheet px-3 font-normal placeholder:text-txt-dim" />
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
        <p aria-live="polite" className="font-bold text-txt-dim">נשארו {filtered.length} צמחים</p>
        <button type="button" onClick={() => { setGroup(""); setHabit(""); setSeason(""); setQuery(""); }} className="min-h-11 rounded-full border border-line px-4 font-bold">ניקוי סינון</button>
      </div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4">
        {filtered.map((plant) => <button key={plant.id} type="button" onClick={() => openPlant(plant)} className="overflow-hidden rounded-md border border-line bg-sheet text-right transition hover:border-teal">
          <div className="grid aspect-[4/3] place-items-center bg-card-2 text-sm font-bold text-txt-dim">{photos[plant.id]?.[0] ? <img src={photos[plant.id][0].src} alt="" className="h-full w-full object-cover" /> : "אין עדיין צילום"}</div>
          <span className="block px-3 pt-3 font-black">{plant.name}</span><i dir="ltr" className="block px-3 pb-3 text-sm text-txt-dim">{plant.sci}</i>
        </button>)}
      </div>
    </section>

    <section aria-labelledby="wheel-title" className="rounded-lg border border-line bg-card p-4 sm:p-6">
      <h2 id="wheel-title" className="text-2xl font-black">גלגל העונות</h2>
      <p className="mt-1 text-txt-dim">בחרו חודש כדי לראות מה פורח, מבשיל או בולט בו לפי המגדיר.</p>
      <div className={styles.wheel} role="group" aria-label="חודשי השנה">
        {MONTHS.map((name, index) => <button key={name} type="button" aria-pressed={month === index} onClick={() => setMonth(index)} style={{ "--month": index } as React.CSSProperties}>{name}</button>)}
        <div className={styles.wheelCenter}>{month === null ? "בחרו חודש" : <><strong>{MONTHS[month]}</strong><span>{monthPlants.length} צמחים</span></>}</div>
      </div>
      {month !== null && <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{monthPlants.map((plant) => <button key={plant.id} type="button" onClick={() => openPlant(plant)} className="min-h-11 rounded-sm border border-line bg-sheet px-4 py-3 text-right"><strong>{plant.name}</strong><span className="mt-1 block text-sm text-txt-dim">{plant.season}</span></button>)}</div>}
    </section>

    {selected && <><button type="button" aria-label="סגירת כרטיס הצמח" onClick={closePlant} className={styles.backdrop} /><aside role="dialog" aria-modal="true" aria-labelledby="plant-title" className={styles.sheet}>
      <div className="flex items-start justify-between gap-4"><div><h2 id="plant-title" className="text-3xl font-black">{selected.name}</h2><i dir="ltr" className="text-txt-dim">{selected.sci}</i></div><button type="button" onClick={closePlant} className="min-h-11 min-w-11 rounded-full border border-line text-xl" aria-label="סגירה">×</button></div>
      {photos[selected.id]?.map((photo) => <PhotoFigure key={photo.src} src={photo.src} alt={selected.name} caption={photo.caption} credit={photo.credit} />)}
      <dl className="space-y-4">
        <div className="rounded-md bg-card-2 p-4"><dt className="font-black text-teal">סימן מזהה</dt><dd className="mt-1 leading-7">{selected.sign}</dd></div>
        {[["עונה", selected.season], ["בית גידול", selected.habitat], ["איפה רואים בסיור", selected.where], ["כדאי לדעת", selected.fact]].map(([term, value]) => <div key={term}><dt className="font-black">{term}</dt><dd className="mt-1 leading-7 text-txt-dim">{value}</dd></div>)}
        {selected.confuse.length > 0 && <div><dt className="font-black">לא להתבלבל עם</dt><dd className="mt-2 space-y-2">{selected.confuse.map((item) => { const other = PLANTS.find((plant) => plant.id === item.with); return <div key={item.with} className="rounded-sm border border-line p-3"><button type="button" disabled={!other} onClick={() => other && openPlant(other)} className="min-h-11 font-black text-teal underline underline-offset-4">{other?.name ?? item.with}</button><p className="text-sm leading-6 text-txt-dim">{item.how}</p></div>; })}</dd></div>}
      </dl>
    </aside></>}
  </main>;
}
