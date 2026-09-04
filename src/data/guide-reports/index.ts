import { EXAMPLE_SODOM } from "./example-sodom";
import type { TourReport } from "./types";

export type { ScheduleRow, GuideUnit, ExpandedUnit, TourReport } from "./types";

/** All worked example reports available in the section. */
export const REPORTS: TourReport[] = [EXAMPLE_SODOM];

export function reportBySlug(slug: string): TourReport | undefined {
  return REPORTS.find((r) => r.slug === slug);
}
