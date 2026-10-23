import { BOOKS, type BookId, type Person, type PeriodId } from "@/data/who-am-i";

export type AnswerMode = "mixed" | "choice" | "typed";
export type Question = { id: string; clue: string; mode: "choice" | "typed"; choices: string[] };
export type Answer = { id: string; correct: boolean; given: string; hinted: boolean };

const romanNumbers: Record<string, string> = { i: "1", ii: "2", iii: "3", iv: "4", vi: "6" };
const finalLetters: Record<string, string> = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };

export function normalizeName(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7]/g, "")
    .toLowerCase().replace(/הראשון/g, "1").replace(/השני/g, "2").replace(/השלישי/g, "3")
    .replace(/הרביעי/g, "4").replace(/החמישי/g, "5").replace(/השישי/g, "6")
    .replace(/\b(vi|iv|iii|ii|i)\b/g, value => romanNumbers[value] ?? value)
    .replace(/[ךםןףץ]/g, letter => finalLetters[letter])
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function acceptsName(person: Person, input: string, roster: Person[]): boolean {
  const normalized = normalizeName(input);
  if (!normalized) return false;
  const owners = roster.filter(candidate => [candidate.name, ...candidate.aliases].some(alias => normalizeName(alias) === normalized));
  return owners.length === 1 && owners[0].id === person.id;
}

export function shuffled<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const peerGroups: string[][] = [
  [
    "menachem",
    "simon-giora",
    "eleazar-simon",
    "judas",
    "mattathias",
    "bar-kokhba",
    "jonathan-hasm",
    "simon-hasm"
  ],
  [
    "matthew",
    "mark",
    "luke",
    "john-apostle"
  ],
  [
    "mary-virgin",
    "mary-magdalene",
    "mary-bethany",
    "martha",
    "elizabeth",
    "anna-prophetess"
  ],
  [
    "james-zebedee",
    "james-just",
    "peter",
    "john-apostle",
    "paul",
    "thomas",
    "judas-iscariot",
    "cleopas"
  ],
  [
    "maimonides",
    "joseph-karo",
    "rema",
    "jacob-asher",
    "rashi",
    "chafetz-chaim",
    "saadia",
    "ramchal"
  ],
  [
    "isaac-luria",
    "rashbi",
    "moses-leon",
    "besht",
    "vilna-gaon"
  ],
  [
    "abraham",
    "isaac",
    "jacob",
    "esau",
    "joseph-nazareth",
    "noah",
    "adam"
  ],
  [
    "chariton",
    "pachomius",
    "euthymius",
    "martyrius",
    "gerasimus",
    "francis",
    "benedict"
  ],
  [
    "herod-great",
    "archelaus",
    "antipas",
    "philip",
    "agrippa1",
    "agrippa2"
  ],
  [
    "jason",
    "menelaus",
    "jeshua",
    "caiaphas",
    "zechariah-priest",
    "theodotus",
    "eli"
  ]
];
function relevance(person: Person, candidate: Person): number {
  return (peerGroups.some(group => group.includes(person.id) && group.includes(candidate.id)) ? 100 : 0)
    + (person.kind && person.kind === candidate.kind ? 24 : 0)
    + (person.gender === candidate.gender ? 12 : 0)
    + (candidate.books.some(book => person.books.includes(book)) ? 8 : 0)
    + (candidate.periods.some(period => person.periods.includes(period)) ? 4 : 0);
}

export function createRound(pool: Person[], count: number, mode: AnswerMode, random: () => number = Math.random, distractorPool: Person[] = pool): Question[] {
  const selected = shuffled(pool, random).slice(0, count);
  // A shuffled, balanced mix guarantees both styles whenever a round has >= 2 questions.
  const modes = shuffled(selected.map((_, i) => i % 2 ? "typed" as const : "choice" as const), random);
  return selected.map((person, i) => {
    const others = distractorPool.filter(candidate => candidate.id !== person.id);
    // Shuffle before stable ranking so equally plausible alternatives remain varied.
    const distractors = shuffled(others, random).sort((a, b) => relevance(person, b) - relevance(person, a)).slice(0, 3);
    return {
      id: person.id,
      clue: person.clues[Math.floor(random() * person.clues.length)],
      mode: mode === "mixed" ? modes[i] : mode,
      choices: shuffled([person.id, ...distractors.map(candidate => candidate.id)], random),
    };
  });
}

export function filterPool(people: Person[], selected: PeriodId[], selectedBooks?: BookId[]): Person[] {
  const applicableBooks = selectedBooks && BOOKS.filter(book => selectedBooks.includes(book.id)
    && book.periods.some(period => selected.includes(period))).map(book => book.id);
  return people.filter(person => person.periods.some(period => selected.includes(period))
    && (!applicableBooks || person.books.some(book => applicableBooks.includes(book))));
}
export function score(answers: Answer[]) {
  let streak = 0, best = 0;
  for (const answer of answers) { streak = answer.correct ? streak + 1 : 0; best = Math.max(best, streak); }
  const correct = answers.filter(answer => answer.correct).length;
  return { correct, total: answers.length, streak, best, percent: answers.length ? Math.round(correct / answers.length * 100) : 0 };
}
