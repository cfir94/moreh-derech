/**
 * Each subject owns a colour and an icon, in the style of the geo-game's mode
 * cards: the colour tints a blurred orb in the card's corner and the progress
 * bar, so a subject is recognisable before its name is read.
 */
export type Domain = {
  /** CSS colour token, used as `--mc` on the card. */
  color: string;
  icon: string;
};

export const DOMAINS: Record<string, Domain> = {
  "past-exams": { color: "var(--gold)", icon: "🎓" },
  geology: { color: "var(--rose)", icon: "🪨" },
  "flora-fauna": { color: "var(--green)", icon: "🌿" },
  history: { color: "var(--violet)", icon: "🏛️" },
  "iron-age": { color: "var(--blue)", icon: "⚱️" },

  quizzes: { color: "var(--teal)", icon: "📚" },
  exams: { color: "var(--gold)", icon: "🖊️" },
  timelines: { color: "var(--violet)", icon: "🕰️" },
  biblical: { color: "var(--violet)", icon: "✝️" },
  "egypt-canaan": { color: "var(--blue)", icon: "🏺" },
  map: { color: "var(--teal)", icon: "🗺️" },
  me: { color: "var(--blue)", icon: "📊" },
  "guide-reports": { color: "var(--rose)", icon: "📝" },
  videos: { color: "var(--violet)", icon: "🎬" },
  game: { color: "var(--gold)", icon: "🎮" },
  review: { color: "var(--gold)", icon: "🔁" },
};

export function domainOf(slug: string): Domain {
  return DOMAINS[slug] ?? { color: "var(--teal)", icon: "📍" };
}

/** Exposes the subject's colour as `--mc`, which `bg-mc`/`text-mc` resolve. */
export function domainStyle(slug: string) {
  return { "--mc": domainOf(slug).color } as React.CSSProperties;
}
