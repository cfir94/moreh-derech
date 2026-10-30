/*
 * Hebrew crossword conventions. The grid holds base letters only: a final
 * letter (ך ם ן ף ץ) is the same square as its regular form where two words
 * cross, and is drawn final only at the end of a word. Niqqud, geresh and
 * quotation marks are not letters; spaces and maqaf split words, and the clue
 * shows the word lengths instead.
 */

const FINAL_TO_BASE: Record<string, string> = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
const BASE_TO_FINAL: Record<string, string> = Object.fromEntries(
  Object.entries(FINAL_TO_BASE).map(([final, base]) => [base, final]),
);

/** The base letter, or null for anything that is not a Hebrew letter. */
export function baseLetter(char: string): string | null {
  if (char.length !== 1 || char < "א" || char > "ת") return null;
  return FINAL_TO_BASE[char] ?? char;
}

export function finalForm(letter: string): string {
  return BASE_TO_FINAL[letter] ?? letter;
}

/** Each word of the answer as base letters; punctuation and niqqud dropped. */
export function answerWords(answer: string): string[][] {
  return answer
    .split(/[\s\-־]+/)
    .map((word) => [...word].map(baseLetter).filter((letter): letter is string => letter !== null))
    .filter((word) => word.length > 0);
}

export function answerLetters(answer: string): string[] {
  return answerWords(answer).flat();
}

/** Word lengths in reading order: "כנסיית הקבר" → [6, 4]. */
export function enumeration(answer: string): number[] {
  return answerWords(answer).map((word) => word.length);
}

/**
 * Physical key → Hebrew letter on the standard Israeli layout (SI-1452), so
 * typing works whether the keyboard is switched to Hebrew or to English.
 */
const CODE_TO_LETTER: Record<string, string> = {
  KeyE: "ק", KeyR: "ר", KeyT: "א", KeyY: "ט", KeyU: "ו", KeyI: "ן", KeyO: "ם", KeyP: "פ",
  KeyA: "ש", KeyS: "ד", KeyD: "ג", KeyF: "כ", KeyG: "ע", KeyH: "י", KeyJ: "ח", KeyK: "ל", KeyL: "ך", Semicolon: "ף",
  KeyZ: "ז", KeyX: "ס", KeyC: "ב", KeyV: "ה", KeyB: "נ", KeyN: "מ", KeyM: "צ", Comma: "ת", Period: "ץ",
};

export function letterFromKey(key: string, code: string): string | null {
  return baseLetter(key) ?? (CODE_TO_LETTER[code] ? baseLetter(CODE_TO_LETTER[code]) : null);
}

