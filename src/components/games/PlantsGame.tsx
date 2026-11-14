"use client";
/* eslint-disable @next/next/no-img-element -- static-export photos have runtime paths */
/*
 * משחק הצמחים (LA-32): סבבים של עשר שאלות מתוך 40 הצמחים של מגדיר הצמחים, עם צילומים
 * אמיתיים מוויקישיתוף (רק מאושרים). צמחים שטעו בהם חוזרים ראשונים בסבב הבא, והתוצאות
 * נרשמות במעקב תחת "plants-game".
 */
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { PLANTS, PLANT_GROUPS, type Plant } from "@/data/plants/plants";
import rawPhotos from "@/data/plants/photos.json";
import { createRound, KIND_LABELS, progressId, type PlantPhoto, type Question } from "@/lib/plantsGame";
import { recordAttempt, type RecordedAnswer } from "@/lib/progress";
import { withBasePath } from "@/lib/basePath";
import { domainStyle } from "@/lib/domains";
import { SIGN_STYLE } from "@/components/trail/kit";
import { PageDecor } from "@/components/trail/PageDecor";
import { ArtAnemone } from "@/components/trail/decor/games";

const PHOTOS: PlantPhoto[] = Object.values(rawPhotos as Record<string, (PlantPhoto & { status?: string })[]>)
  .flat().filter((p) => p.status === "approved");
const PHOTO_BY_ID = new Map(PHOTOS.map((p) => [p.id, p]));
const PLANT_BY_ID = new Map(PLANTS.map((p) => [p.id, p]));
const LETTERS = ["א", "ב", "ג", "ד"];
const primary = "min-h-12 rounded-full px-7 text-base font-extrabold text-on-accent transition active:scale-95";
const primaryStyle = SIGN_STYLE;

function prompt(q: Question, plant: Plant) {
  switch (q.kind) {
    case "photo": return "איזה צמח בתמונה?";
    case "sign": return `"${plant.sign}". איזה צמח זה?`;
    case "pair": return q.photo ? "מי מהשניים בתמונה?" : `מי מהשניים: ${plant.sign}?`;
    case "where": return `גדל ב: ${plant.habitat}. בסיור פוגשים אותו ב: ${plant.where}. איזה צמח זה?`;
  }
}

function Photo({ photo, revealed }: { photo: PlantPhoto; revealed: boolean }) {
  return <figure className="overflow-hidden paper-sheet">
    <div className="flex max-h-[52vh] justify-center bg-card-2">
      <img src={withBasePath(photo.src)} alt={revealed ? photo.alt : "צילום של צמח. איזה צמח זה?"} width={photo.width} height={photo.height} className="max-h-[52vh] w-auto object-contain" />
    </div>
    {revealed && <figcaption className="px-4 py-2 text-sm leading-6 text-txt-dim">
      {photo.caption} · צילום: {photo.author} · <a href={photo.licenseUrl || photo.source} target="_blank" rel="noreferrer" className="underline">{photo.license}</a>
    </figcaption>}
  </figure>;
}

type Session = { questions: Question[]; index: number; picked: (string | null)[] };

export function PlantsGame() {
  const [session, setSession] = useState<Session | null>(null);
  const [round, setRound] = useState(0);
  const missed = useRef<string[]>([]);
  const recorded = useRef(false);
  const q = session ? session.questions[session.index] : null;
  const picked = session && q ? session.picked[session.index] : null;
  const finished = session !== null && session.index >= session.questions.length;
  const correctCount = session ? session.questions.filter((x, i) => session.picked[i] === x.plant).length : 0;

  const start = () => {
    const questions = createRound(PLANTS, PHOTOS, { seed: Date.now() + round, missed: missed.current });
    recorded.current = false;
    setSession({ questions, index: 0, picked: [] });
    setRound(round + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const choose = (id: string) => {
    if (!session || picked) return;
    const next = [...session.picked]; next[session.index] = id;
    setSession({ ...session, picked: next });
  };

  const advance = () => {
    if (!session) return;
    const index = session.index + 1;
    if (index >= session.questions.length && !recorded.current) {
      recorded.current = true;
      const answers: RecordedAnswer[] = session.questions.map((x, i) => ({
        questionId: progressId(PLANTS, x.plant), question: `${KIND_LABELS[x.kind]}: ${PLANT_BY_ID.get(x.plant)?.name}`,
        category: PLANT_GROUPS[PLANT_BY_ID.get(x.plant)!.group].title, correct: session.picked[i] === x.plant,
      }));
      recordAttempt({ quiz: "plants-game", quizLabel: "משחק הצמחים", category: "הכל", answers });
      missed.current = session.questions.filter((x, i) => session.picked[i] !== x.plant).map((x) => x.plant);
    }
    setSession({ ...session, index });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const missedPlants = useMemo(() => finished && session ? session.questions.filter((x, i) => session.picked[i] !== x.plant).map((x) => PLANT_BY_ID.get(x.plant)!) : [], [finished, session]);

  return <main dir="rtl" style={domainStyle("plants-game")} className="relative mx-auto min-h-screen w-full max-w-2xl px-4 py-8">
    <PageDecor prints={false} items={["flower","leaf","butterfly"]} />
    <Link href="/games/" className="mb-4 inline-flex min-h-11 items-center text-base font-bold text-txt-dim hover:text-txt">→ כל המשחקים</Link>

    {!session && <section className="screen-in space-y-5">
      <div className="relative overflow-hidden paper-sheet p-6">
        <ArtAnemone aria-hidden width={92} height={92} className="text-txt" />
        <h1 className="grad-text mt-2 text-3xl font-black">זיהוי צמחים</h1>
        <p className="mt-2 text-base leading-7 text-txt-dim">עשר שאלות בכל סבב, מתוך {PLANTS.length} הצמחים שפוגשים בסיור: צילום אמיתי, סימן מזהה, &quot;מי מהשניים&quot; ואיפה הוא גדל. צמח שטעיתם בו יחזור בסבב הבא.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={start} className={primary} style={primaryStyle}>מתחילים</button>
        <Link href="/timelines/plants-guide/" className="inline-flex min-h-12 items-center rounded-full border border-line bg-card px-6 text-base font-bold">למגדיר הצמחים</Link>
      </div>
    </section>}

    {session && q && !finished && (() => {
      const plant = PLANT_BY_ID.get(q.plant)!;
      const photo = q.photo ? PHOTO_BY_ID.get(q.photo) : undefined;
      const right = picked === q.plant;
      return <section key={session.index} className="screen-in space-y-4" aria-live="polite">
        <div className="flex items-center justify-between text-sm font-bold text-txt-dim">
          <span className="num">{session.index + 1} / {session.questions.length}</span>
          <span>{KIND_LABELS[q.kind]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-track"><i className="block h-full rounded-full bg-mc transition-[width]" style={{ width: `${(session.index / session.questions.length) * 100}%` }} /></div>
        {photo && <Photo photo={photo} revealed={picked !== null} />}
        <h2 className="text-xl font-black leading-8">{prompt(q, plant)}</h2>
        <div className={`grid gap-3 ${q.choices.length === 2 ? "sm:grid-cols-2" : ""}`}>
          {q.choices.map((id, i) => {
            const p = PLANT_BY_ID.get(id)!;
            const state = picked === null ? "border-line bg-card-2" : id === q.plant ? "border-green bg-green/15" : id === picked ? "shake border-red bg-red/15" : "border-line bg-card-2 opacity-30";
            return <button key={id} type="button" disabled={picked !== null} onClick={() => choose(id)} className={`flex min-h-14 items-center gap-3 rounded-md border px-4 py-3 text-right text-base font-bold transition active:scale-95 ${state}`}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-card text-sm">{LETTERS[i]}</span>
              <span>{p.name}</span>
            </button>;
          })}
        </div>
        {picked !== null && <div className="screen-in space-y-2 paper-sheet p-4">
          <p className={`text-lg font-black ${right ? "text-green" : "text-red"}`}>{right ? "נכון!" : `זה ${plant.name}.`}</p>
          {q.how && <p className="text-base leading-7"><strong>איך מבדילים: </strong>{q.how}</p>}
          <p className="text-base leading-7 text-txt-dim"><strong className="text-txt">סימן מזהה: </strong>{plant.sign}</p>
          <p className="text-base leading-7 text-txt-dim">{plant.fact}</p>
          <button type="button" onClick={advance} className={`${primary} mt-2`} style={primaryStyle}>{session.index + 1 < session.questions.length ? "הבא" : "לתוצאות"}</button>
        </div>}
      </section>;
    })()}

    {finished && session && <section className="screen-in space-y-4">
      <div className="paper-sheet p-6 text-center">
        <ArtAnemone aria-hidden width={92} height={92} className="mx-auto text-txt" />
        <h1 className="mt-2 text-2xl font-black">סיימתם את הסבב</h1>
        <p className="mt-1 text-lg text-txt-dim"><span className="num font-black text-txt">{correctCount}</span> מתוך <span className="num">{session.questions.length}</span></p>
      </div>
      {missedPlants.length > 0 && <div className="paper-sheet p-5">
        <h2 className="text-lg font-black">לחזור עליהם</h2>
        <ul className="mt-2 space-y-2">
          {missedPlants.map((p) => <li key={p.id}>
            <Link href={`/timelines/plants-guide/#plant-${p.id}`} className="block rounded-md border border-line bg-card-2 p-3 hover:border-teal">
              <strong className="block">{p.name}</strong>
              <span className="text-sm leading-6 text-txt-dim">{p.sign}</span>
            </Link>
          </li>)}
        </ul>
        <p className="mt-3 text-sm text-txt-dim">הם יחזרו ראשונים בסבב הבא.</p>
      </div>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={start} className={primary} style={primaryStyle}>סבב נוסף</button>
        <Link href="/timelines/plants-guide/" className="inline-flex min-h-12 items-center rounded-full border border-line bg-card px-6 text-base font-bold">למגדיר הצמחים</Link>
      </div>
    </section>}
  </main>;
}
