import { FAMILIES, GROUPS, GROUP_BY_ID, type FamilyId, type Group, type GroupId } from "@/data/christian-dress/groups";
import { normalizeName, shuffled } from "@/lib/whoAmI";

export type Photo = {
  id: string; group: GroupId; src: string; width: number; height: number;
  author: string; license: string; licenseUrl: string; source: string; file: string;
  caption: string; alt: string; place?: string;
  /** Where the telling detail sits, in % of the photo, and how far to zoom on it. */
  focus?: [number, number, number];
  /** Too ambiguous for "who is this" on its own — kept for the field guide and the picking questions. */
  hard?: boolean;
};

/**
 * Every question shows at least one photo:
 * who — a photo, four communities; typed — a photo, type the community;
 * detail — the photo zoomed on the telling detail; pick — a community, four photos;
 * family — a photo, the four church families; site — a photo, four places;
 * sepulchre — four photos, the one whose community holds no rights in the Holy Sepulchre.
 */
export type QuestionKind = "who" | "typed" | "detail" | "pick" | "family" | "site" | "sepulchre";
export type Question =
  | { kind: "who" | "detail"; group: GroupId; photo: string; choices: GroupId[] }
  | { kind: "typed"; group: GroupId; photo: string }
  | { kind: "pick"; group: GroupId; photos: string[] }
  | { kind: "family"; group: GroupId; photo: string; choices: FamilyId[] }
  | { kind: "site"; group: GroupId; photo: string; choices: GroupId[] }
  | { kind: "sepulchre"; group: GroupId; photos: string[] };
export type Answer = { group: GroupId; correct: boolean; given: string };

export const KIND_LABELS: Record<QuestionKind, string> = {
  who: "מי בתמונה?",
  typed: "כתבו את השם",
  detail: "לפי פרט אחד",
  pick: "מצאו בתמונות",
  family: "לאיזו משפחה?",
  site: "איפה נפגוש אותם?",
  sepulchre: "כנסיית הקבר",
};

/** Groups a student mixes up, beyond the obvious "same family": the distractors the game prefers. */
const LOOKALIKES: Partial<Record<GroupId, GroupId[]>> = {
  "greek-orthodox": ["russian-orthodox", "armenian", "benedictine", "syriac"],
  "russian-orthodox": ["greek-orthodox", "benedictine", "coptic"],
  armenian: ["coptic", "syriac", "greek-orthodox"],
  coptic: ["syriac", "armenian", "ethiopian"],
  syriac: ["coptic", "armenian", "greek-orthodox"],
  ethiopian: ["coptic", "syriac", "greek-orthodox"],
  franciscan: ["carmelite", "benedictine", "dominican"],
  carmelite: ["franciscan", "trappist", "dominican"],
  dominican: ["trappist", "white-fathers", "carmelite"],
  trappist: ["dominican", "benedictine", "white-fathers"],
  benedictine: ["greek-orthodox", "trappist", "franciscan"],
  "white-fathers": ["dominican", "trappist", "missionaries-charity"],
  "missionaries-charity": ["white-fathers", "dominican", "russian-orthodox"],
  protestant: ["franciscan", "greek-orthodox", "dominican"],
};

/**
 * Pairs a photo cannot tell apart: the Coptic and the Syriac hood are nearly the
 * same garment, and in the street only the place decides. They are never offered
 * against each other, and are not asked as a typed answer.
 */
const TWINS: Partial<Record<GroupId, GroupId>> = { coptic: "syriac", syriac: "coptic" };

const stripArticle = (value: string) => value.replace(/^ה(?=.{3})/, "");

/** A typed answer counts when it names exactly one community: an alias, or a longer phrase that contains one. */
export function acceptsGroup(group: Group, input: string, roster: Group[] = GROUPS): boolean {
  const given = normalizeName(input);
  if (!given) return false;
  const forms = [given, stripArticle(given)];
  const matches = roster.filter(candidate => candidate.aliases.concat(candidate.name).some(alias => {
    const a = normalizeName(alias);
    return forms.includes(a) || forms.includes(stripArticle(a)) || (a.length >= 4 && given.includes(a));
  }));
  return matches.length === 1 && matches[0].id === group.id;
}

function choicesFor(target: GroupId, available: GroupId[], random: () => number): GroupId[] {
  const family = GROUP_BY_ID.get(target)!.family;
  const others = available.filter(id => id !== target && TWINS[target] !== id);
  const look = shuffled((LOOKALIKES[target] ?? []).filter(id => others.includes(id)), random);
  const kin = shuffled(others.filter(id => GROUP_BY_ID.get(id)!.family === family && !look.includes(id)), random);
  const rest = shuffled(others.filter(id => !look.includes(id) && !kin.includes(id)), random);
  // Two look-alikes at most, so one plainly different option keeps the question fair.
  const picked = [...look.slice(0, 2), ...kin, ...look.slice(2), ...rest].slice(0, 3);
  return shuffled([target, ...picked], random);
}

/**
 * Builds a round. Communities are dealt in shuffled order and recycled, so every
 * community in the pool comes up before any repeats; question kinds rotate the
 * same way, and a photo is not reused in a round while unused ones remain.
 */
export function createRound(
  photos: Photo[], groupIds: GroupId[], kinds: QuestionKind[], length: number, random: () => number = Math.random,
): Question[] {
  const byGroup = new Map<GroupId, Photo[]>();
  for (const photo of photos) if (groupIds.includes(photo.group)) byGroup.set(photo.group, [...(byGroup.get(photo.group) ?? []), photo]);
  const pool = groupIds.filter(id => byGroup.has(id));
  if (!pool.length || !kinds.length) return [];
  const used = new Set<string>();
  const take = (group: GroupId, filter: (photo: Photo) => boolean = () => true): Photo | undefined => {
    const list = byGroup.get(group)!.filter(filter);
    const fresh = list.filter(photo => !used.has(photo.id));
    const photo = (fresh.length ? fresh : list)[Math.floor(random() * (fresh.length ? fresh : list).length)];
    if (photo) used.add(photo.id);
    return photo;
  };
  const allSepulchre = GROUPS.filter(g => g.holySepulchre && byGroup.has(g.id)).map(g => g.id);
  const outsiders = GROUPS.filter(g => !g.holySepulchre && byGroup.has(g.id)).map(g => g.id);

  const questions: Question[] = [];
  let deck: GroupId[] = [];
  let kindDeck: QuestionKind[] = [];
  for (let guard = 0; questions.length < length && guard < length * 6; guard++) {
    if (!deck.length) deck = shuffled(pool, random);
    if (!kindDeck.length) kindDeck = shuffled(kinds, random);
    const group = deck[deck.length - 1];
    let kind = kindDeck.pop()!;
    if (kind === "typed" && TWINS[group]) kind = "who";
    const clear = (photo: Photo) => !photo.hard;
    let question: Question | null = null;
    if (kind === "who" || kind === "typed" || kind === "family" || kind === "site") {
      const photo = take(group, clear) ?? take(group);
      if (!photo) continue;
      if (kind === "who") question = { kind, group, photo: photo.id, choices: choicesFor(group, pool, random) };
      else if (kind === "typed") question = { kind, group, photo: photo.id };
      else if (kind === "family") question = { kind, group, photo: photo.id, choices: FAMILIES.map(f => f.id) };
      else question = { kind, group, photo: photo.id, choices: choicesFor(group, pool, random) };
    } else if (kind === "detail") {
      const photo = take(group, p => !!p.focus && p.focus[2] > 1.2 && !p.hard);
      if (!photo) continue;
      question = { kind, group, photo: photo.id, choices: choicesFor(group, pool, random) };
    } else if (kind === "pick") {
      if (pool.length < 4) continue;
      const others = choicesFor(group, pool, random).filter(id => id !== group);
      const chosen = [group, ...others].map(id => take(id, clear) ?? take(id));
      if (chosen.some(p => !p)) continue;
      question = { kind, group, photos: shuffled(chosen.map(p => p!.id), random) };
    } else {
      // The odd one out is the community being asked about; three of the six owners fill the rest.
      const outsider = outsiders.includes(group) ? group : outsiders[Math.floor(random() * outsiders.length)];
      if (!outsider || allSepulchre.length < 3) continue;
      const owners = shuffled(allSepulchre, random).slice(0, 3);
      const chosen = [outsider, ...owners].map(id => take(id, clear) ?? take(id));
      if (chosen.some(p => !p)) continue;
      question = { kind, group: outsider, photos: shuffled(chosen.map(p => p!.id), random) };
    }
    if (question.group === group) deck.pop();
    questions.push(question);
  }
  return questions;
}

export function score(answers: Answer[]) {
  let streak = 0, best = 0;
  for (const answer of answers) { streak = answer.correct ? streak + 1 : 0; best = Math.max(best, streak); }
  const correct = answers.filter(answer => answer.correct).length;
  return { correct, total: answers.length, streak, best, percent: answers.length ? Math.round(correct / answers.length * 100) : 0 };
}
