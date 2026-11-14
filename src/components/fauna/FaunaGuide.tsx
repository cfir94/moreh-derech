"use client";
/* eslint-disable @next/next/no-img-element -- static-export photos have runtime paths */
/*
 * מגדיר החי והציפורים (LA-80/81), באותו מבנה כמו מגדיר הצמחים: מצמצמים לפי קבוצה ואזור,
 * מקישים על כרטיס ונפתח כרטיס שדה. הקישור לכרטיס הוא #animal-<id>.
 */
import { useEffect, useMemo, useState } from "react";
import { AidHeader, PhotoFigure } from "@/components/learning-aid";
import { ANIMALS, ANIMAL_GROUPS, REGIONS, STATUS_LABEL, type Animal, type AnimalGroup, type Region } from "@/data/fauna/animals";
import { withBasePath } from "@/lib/basePath";
import styles from "./fauna.module.css";
import { PageDecor } from "@/components/trail/PageDecor";

export type FaunaPhoto = { src: string; caption: string; credit: string; alt: string };
export type FaunaPhotos = Record<string, FaunaPhoto[]>;

const fromHash = () => typeof window === "undefined" ? null : ANIMALS.find((a) => window.location.hash === `#animal-${a.id}`) ?? null;

function Extra() {
  return <span className="mr-2 rounded-full border border-line px-2 py-0.5 text-sm font-bold text-txt-dim" title="ידע כללי שאינו בחומר הקורס">השלמה</span>;
}

export function FaunaGuide({ photos }: { photos: FaunaPhotos }) {
  const [group, setGroup] = useState<AnimalGroup | "">("");
  const [region, setRegion] = useState<Region | "">("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Animal | null>(null);

  useEffect(() => {
    const sync = () => setSelected(fromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const list = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("he");
    return ANIMALS.filter((a) => (!group || a.group === group)
      && (!region || a.regions.includes(region) || a.regions.includes("everywhere"))
      && (!needle || [a.name, a.sci, a.sign, a.where, a.fact].some((v) => v.toLocaleLowerCase("he").includes(needle))));
  }, [group, region, query]);

  const open = (a: Animal) => { history.pushState(null, "", `#animal-${a.id}`); setSelected(a); };
  function close() { history.replaceState(null, "", `${location.pathname}${location.search}`); setSelected(null); }
  const byId = (id: string) => ANIMALS.find((a) => a.id === id);

  return <main dir="rtl" className="relative mx-auto min-h-screen w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
    <PageDecor wide birds prints="hoof" items={["ibex","binoculars","butterfly","footprint","hills","lake"]} />
    <AidHeader slug="fauna" title="מגדיר החי והציפורים" subtitle="מי זה שם על הסלע? מצמצמים לפי קבוצה ואזור, ומגיעים לכרטיס שדה קצר." stats={`${ANIMALS.length} בעלי חיים · ${Object.keys(ANIMAL_GROUPS).length} קבוצות`} />

    <section aria-labelledby="fauna-filter" className="paper-sheet p-4 sm:p-6">
      <h2 id="fauna-filter" className="text-2xl font-black">מה ראיתם?</h2>
      <div role="group" aria-label="קבוצה" className="mt-4 flex flex-wrap gap-2">
        {([["", "הכול", "✨"], ...Object.entries(ANIMAL_GROUPS).map(([id, g]) => [id, g.title, g.icon])] as [AnimalGroup | "", string, string][]).map(([id, label, icon]) =>
          <button key={id || "all"} type="button" aria-pressed={group === id} onClick={() => setGroup(id)} className={`min-h-12 rounded-full border px-4 text-base font-bold transition active:scale-95 ${group === id ? "border-teal bg-teal/15" : "border-line"}`}>
            <span aria-hidden>{icon}</span> {label}
          </button>)}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="font-bold">אזור
          <select value={region} onChange={(e) => setRegion(e.target.value as Region | "")} className="mt-1 min-h-12 w-full rounded-sm border border-line bg-sheet px-3 font-normal">
            <option value="">כל הארץ</option>
            {(Object.entries(REGIONS) as [Region, string][]).filter(([id]) => id !== "everywhere").map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        <label className="font-bold">חיפוש חופשי
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="שם, סימן או מקום" className="mt-1 min-h-12 w-full rounded-sm border border-line bg-sheet px-3 font-normal placeholder:text-txt-dim" />
        </label>
      </div>
      <p aria-live="polite" className="mt-4 border-t border-line pt-4 font-bold text-txt-dim">נמצאו {list.length}</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4">
        {list.map((a) => <button key={a.id} type="button" onClick={() => open(a)} className="overflow-hidden rounded-md border border-line bg-sheet text-right transition hover:border-teal active:scale-[.98]">
          <div className="grid aspect-[4/3] place-items-center bg-card-2 text-4xl">{photos[a.id]?.[0] ? <img src={withBasePath(photos[a.id][0].src)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span aria-hidden>{ANIMAL_GROUPS[a.group].icon}</span>}</div>
          <span className="block px-3 pt-3 text-base font-black">{a.name}</span>
          <i dir="ltr" className="block px-3 pb-3 text-sm text-txt-dim">{a.sci}</i>
        </button>)}
      </div>
    </section>

    {selected && <><button type="button" aria-label="סגירת הכרטיס" onClick={close} className={styles.backdrop} />
      <aside role="dialog" aria-modal="true" aria-labelledby="animal-title" className={styles.sheet}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-txt-dim">{ANIMAL_GROUPS[selected.group].icon} {ANIMAL_GROUPS[selected.group].title}{selected.status && ` · ${STATUS_LABEL[selected.status]}`}</p>
            <h2 id="animal-title" className="text-3xl font-black">{selected.name}{selected.extra && <Extra />}</h2>
            <i dir="ltr" className="text-txt-dim">{selected.sci}</i>
          </div>
          <button type="button" onClick={close} className="min-h-11 min-w-11 rounded-full border border-line text-xl" aria-label="סגירה">×</button>
        </div>
        {photos[selected.id]?.map((p) => <PhotoFigure key={p.src} src={p.src} alt={p.alt || selected.name} caption={p.caption} credit={p.credit} />)}
        <dl className="space-y-4">
          <div className="rounded-md bg-card-2 p-4"><dt className="font-black text-teal">סימן מזהה</dt><dd className="mt-1 leading-7">{selected.sign}</dd></div>
          <div><dt className="font-black">איפה ומתי פוגשים</dt><dd className="mt-1 leading-7 text-txt-dim">{selected.where}</dd></div>
          <div><dt className="font-black">כדאי לדעת</dt><dd className="mt-1 leading-7 text-txt-dim">{selected.fact}</dd></div>
          <div><dt className="font-black">אזור</dt><dd className="mt-1 leading-7 text-txt-dim">{selected.regions.map((r) => REGIONS[r]).join(" · ")}</dd></div>
          {selected.confuse?.length ? <div><dt className="font-black">לא להתבלבל עם</dt><dd className="mt-2 space-y-2">{selected.confuse.map((c) => {
            const other = byId(c.with);
            return <div key={c.with} className="rounded-sm border border-line p-3">
              <button type="button" disabled={!other} onClick={() => other && open(other)} className="min-h-11 font-black text-teal underline underline-offset-4">{other?.name ?? c.with}</button>
              <p className="text-sm leading-6 text-txt-dim">{c.how}</p>
            </div>;
          })}</dd></div> : null}
        </dl>
      </aside></>}
  </main>;
}
