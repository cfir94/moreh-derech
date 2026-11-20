import type { Summary } from "./types";
import minorities from "./minorities";
import christianity from "./christianity";
import islam from "./islam";
import judaism from "./judaism";

export const SUMMARIES: Summary[] = [judaism, christianity, islam, minorities];

export function getSummary(key: string): Summary | undefined {
  return SUMMARIES.find((summary) => summary.key === key);
}
