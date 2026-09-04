import { EXAMPLE_SODOM } from "./example-sodom";
import type { TourReport } from "./types";

export type { ScheduleRow, GuidingUnit, ExpandedUnit, TourReport } from "./types";

/** All filled example reports available in the section. */
export const EXAMPLE_REPORTS: TourReport[] = [EXAMPLE_SODOM];

export function getExampleReport(slug: string): TourReport | undefined {
  return EXAMPLE_REPORTS.find((r) => r.slug === slug);
}
