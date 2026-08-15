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
