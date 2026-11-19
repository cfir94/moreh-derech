import type { Summary } from "./types";
import minorities from "./minorities";
import christianity from "./christianity";

export const SUMMARIES: Summary[] = [christianity, minorities];

export function getSummary(key: string): Summary | undefined {
  return SUMMARIES.find((summary) => summary.key === key);
}
