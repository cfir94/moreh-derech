/*
 * משחק הצמחים (LA-32): בניית סבב. פונקציות טהורות, כדי שהבדיקה תראה בדיוק מה השחקן יראה.
 * הנתונים ב-src/data/plants/plants.ts, והתמונות המאושרות ב-src/data/plants/photos.json.
 *
 * ארבעה סוגי שאלות: מי בתמונה, מי לפי הסימן המזהה, "מי מהשניים" (זוג שמתבלבלים בו, עם ההסבר
 * מ-`confuse`), ואיפה פוגשים אותו. שאלת תמונה רק לצמח שיש לו תמונה מאושרת, ולכן בלי תמונות
 * הסבב יוצא כולו טקסט ועדיין שלם.
 */
import type { Plant } from "@/data/plants/plants";

export type PlantPhoto = { id: string; plant: string; src: string; caption: string; alt: string; width: number; height: number; author: string; license: string; licenseUrl?: string; source: string };
export type Kind = "photo" | "sign" | "pair" | "where";
export const KIND_LABELS: Record<Kind, string> = { photo: "מי בתמונה", sign: "לפי הסימן", pair: "מי מהשניים", where: "איפה פוגשים" };

export type Question = {
  kind: Kind;
  plant: string;
  /** מזהי צמחים כאפשרויות; אחד מהם הוא `plant`. */
  choices: string[];
  photo?: string;
  /** בשאלת "מי מהשניים": איך מבדילים. */
  how?: string;
};

/** מחולל מספרים קבוע לפי זרע, כדי שבדיקה תשחזר סבב. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}

function shuffle<T>(xs: readonly T[], rand: () => number) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** מסיחים: קודם צמחים מאותה קבוצה (הם הקשים), ואחר כך כל השאר. */
function distractors(plant: Plant, all: readonly Plant[], n: number, rand: () => number) {
  const same = shuffle(all.filter((p) => p.id !== plant.id && p.group === plant.group), rand);
  const rest = shuffle(all.filter((p) => p.id !== plant.id && p.group !== plant.group), rand);
  return [...same, ...rest].slice(0, n).map((p) => p.id);
}

export function photosByPlant(photos: readonly PlantPhoto[]) {
  const map = new Map<string, PlantPhoto[]>();
  for (const p of photos) map.set(p.plant, [...(map.get(p.plant) ?? []), p]);
  return map;
}

export function makeQuestion(plant: Plant, kind: Kind, all: readonly Plant[], photos: Map<string, PlantPhoto[]>, rand: () => number): Question | null {
  const byId = new Map(all.map((p) => [p.id, p]));
  if (kind === "photo") {
    const list = photos.get(plant.id);
    if (!list?.length) return null;
    const photo = list[Math.floor(rand() * list.length)];
    return { kind, plant: plant.id, photo: photo.id, choices: shuffle([plant.id, ...distractors(plant, all, 3, rand)], rand) };
  }
  if (kind === "pair") {
    const pair = plant.confuse.find((c) => byId.has(c.with));
    if (!pair) return null;
    const list = photos.get(plant.id);
    const photo = list?.length ? list[Math.floor(rand() * list.length)].id : undefined;
    return { kind, plant: plant.id, photo, choices: shuffle([plant.id, pair.with], rand), how: pair.how };
  }
  return { kind, plant: plant.id, choices: shuffle([plant.id, ...distractors(plant, all, 3, rand)], rand) };
}

/**
 * סבב: צמחים שטעו בהם קודם בראש, ואחריהם השאר בסדר אקראי. לכל צמח סוג שאלה שמתאים לו,
 * והסוגים מתחלפים כדי שהסבב לא יהיה חד־גוני.
 */
export function createRound(all: readonly Plant[], photos: readonly PlantPhoto[], opts: { length?: number; seed?: number; missed?: readonly string[]; kinds?: readonly Kind[] } = {}): Question[] {
  const { length = 10, seed = Date.now(), missed = [], kinds = ["photo", "sign", "pair", "where"] } = opts;
  const rand = rng(seed);
  const byPlant = photosByPlant(photos);
  const missedSet = new Set(missed);
  const order = [...shuffle(all.filter((p) => missedSet.has(p.id)), rand), ...shuffle(all.filter((p) => !missedSet.has(p.id)), rand)];
  const out: Question[] = [];
  let k = Math.floor(rand() * kinds.length);
  for (const plant of order) {
    if (out.length >= length) break;
    for (let tries = 0; tries < kinds.length; tries++) {
      const q = makeQuestion(plant, kinds[(k + tries) % kinds.length], all, byPlant, rand);
      if (q) { out.push(q); k = (k + tries + 1) % kinds.length; break; }
    }
  }
  return out;
}

/** מזהה מספרי יציב לשאלה במעקב: מיקום הצמח ברשימה (1 ומעלה). צמח חדש נוסף רק בסוף הרשימה. */
export function progressId(all: readonly Plant[], plantId: string) {
  return all.findIndex((p) => p.id === plantId) + 1;
}
