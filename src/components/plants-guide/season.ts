export const MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"] as const;

const ranges: [RegExp, number[]][] = [
  [/ינואר[–-]פברואר/, [0, 1]],
  [/סוף החורף/, [1]],
  [/תחילת האביב/, [2]],
  [/בחורף/, [11, 0, 1]],
  [/באביב/, [2, 3, 4]],
  [/סביב פסח/, [2, 3]],
  [/בקיץ/, [5, 6, 7]],
  [/בסתיו/, [8, 9, 10]],
];

/** Extracts only periods that the source text states explicitly. */
export function parseSeasonMonths(season: string): number[] {
  const months = new Set<number>();
  for (const [pattern, values] of ranges) if (pattern.test(season)) values.forEach((month) => months.add(month));
  return [...months].sort((a, b) => a - b);
}
