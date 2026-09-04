/** Types for standard Israeli tour-guide course reports (דוחות סיור). */

/** One row in Part I — the day's schedule table. */
export type ScheduleRow = {
  /** 1-based row number in the table. */
  n: number;
  /** e.g. "06:30 – 07:30" */
  time: string;
  /** Route / activity description (up to ~25 words). May include on-the-way guiding. */
  activity: string;
  /** Logistics / coordination notes (up to ~25 words). */
  logistics: string;
};

/** One short guiding unit in Part II (עד ~180 מילים). */
export type GuideUnit = {
  /** 1-based unit number. */
  n: number;
  /** Site name, e.g. "הר סדום — שביל הדגים". */
  site: string;
  /** Duration label, e.g. "20 דק׳". */
  duration: string;
  /** Condensed field-guiding text; should cover the five מ״מים. */
  content: string;
  /** Method aids (maps, Bible, diagrams…), up to ~20 words. */
  methods: string;
};

/** Part III — one expanded guiding unit (עד ~400 מילים). */
export type ExpandedUnit = {
  site: string;
  topic: string;
  /** Where the group stands while being guided. */
  groupPosition: string;
  /** Full teaching text: opening, field references, methods, closing. */
  content: string;
};

export type TourReport = {
  slug: string;
  title: string;
  /** Short blurb for cards / index. */
  summary: string;
  /** Region tag for filtering later. */
  region: string;
  schedule: ScheduleRow[];
  units: GuideUnit[];
  expanded: ExpandedUnit;
};
