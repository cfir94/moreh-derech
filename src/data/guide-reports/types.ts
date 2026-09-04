/** Types for tour-guide report (דוח סיור) content. */

export type ScheduleRow = {
  /** Row number in the day plan table (1-based). */
  n: number;
  /** Time range, e.g. "06:30 – 07:30". */
  time: string;
  /** Route / activity description (travel, walk, visit, break). */
  activity: string;
  /** Logistics: counts, toilets, vouchers, driver briefing, etc. */
  logistics: string;
};

export type GuidingUnit = {
  /** Site name. */
  site: string;
  /** Duration string, e.g. "20 דק׳". */
  duration: string;
  /** Condensed guiding content (up to ~180 words). */
  content: string;
  /** Methodological aids (maps, Bible, diagrams). */
  methods: string;
};

export type ExpandedUnit = {
  site: string;
  topic: string;
  /** Where the group stands during the talk. */
  location: string;
  /** Full expanded guiding text (up to ~400 words). */
  content: string;
};

export type TourReport = {
  slug: string;
  title: string;
  /** Short blurb for cards. */
  summary: string;
  region: string;
  schedule: ScheduleRow[];
  units: GuidingUnit[];
  expanded: ExpandedUnit;
};
