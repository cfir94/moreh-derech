export type ScriptureSection = {
  reference: string;
  quote: string;
};

export type TimelineEvent = {
  id: string;
  title: string;
  /** Scripture reference, or a date/era label depending on the timeline. */
  reference: string;
  body: string;
  quote?: string;
  takeaway?: string;
  kind?: "egypt" | "israel" | "caution";
  disputed?: boolean;
  sections: ScriptureSection[];
};

export type Timeline = {
  id: string;
  title: string;
  /** Compact label for the timeline switcher, where full titles are too long. */
  shortTitle?: string;
  subtitle: string;
  events: TimelineEvent[];
};

/** One card in the drag exercise: a period, an event or a find. */
export type TimelineNode = {
  label: string;
  /** Free text as taught — "3,300–2,300 לפנה״ס", "גיל 30". */
  dates: string;
};

/** A drag set. `nodes` is stored in chronological order and IS the answer key. */
export type TimelineSet = {
  key: string;
  title: string;
  subtitle: string;
  nodes: TimelineNode[];
};
