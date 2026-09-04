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
  christianity: { color: "var(--violet)", icon: "✝️" },
  judaism: { color: "var(--blue)", icon: "✡️" },
  "israel-borders": { color: "var(--teal)", icon: "🧭" },

  quizzes: { color: "var(--teal)", icon: "📚" },
  exams: { color: "var(--gold)", icon: "🖊️" },
  resources: { color: "var(--teal)", icon: "📖" },
  geography: { color: "var(--rose)", icon: "🗺️" },
  religions: { color: "var(--gold)", icon: "🕍" },
  art: { color: "var(--blue)", icon: "🏺" },
  "israel-today": { color: "var(--green)", icon: "🇮🇱" },
  profession: { color: "var(--violet)", icon: "🎤" },
  maps: { color: "var(--teal)", icon: "🧭" },
  timelines: { color: "var(--violet)", icon: "🕰️" },
  biblical: { color: "var(--violet)", icon: "✝️" },
  "egypt-canaan": { color: "var(--blue)", icon: "🏺" },
  kings: { color: "var(--rose)", icon: "👑" },
  archaeology: { color: "var(--gold)", icon: "🏺" },
  "judaism-timeline": { color: "#8b234f", icon: "📖" },
  "dating-quiz": { color: "var(--green)", icon: "📅" },
  "timeline-drag": { color: "var(--violet)", icon: "🧩" },
  map: { color: "var(--teal)", icon: "🗺️" },
  me: { color: "var(--blue)", icon: "📊" },
  "guide-reports": { color: "var(--rose)", icon: "📝" },
  videos: { color: "var(--violet)", icon: "🎬" },
  game: { color: "var(--gold)", icon: "🎮" },
  games: { color: "var(--gold)", icon: "🎮" },
  "geo-game": { color: "var(--teal)", icon: "🗺️" },
  "church-game": { color: "var(--violet)", icon: "⛪" },
  "plants-game": { color: "var(--green)", icon: "🌿" },
  review: { color: "var(--gold)", icon: "🔁" },
};

export function domainOf(slug: string): Domain {
  return DOMAINS[slug] ?? { color: "var(--teal)", icon: "📍" };
}

/** Exposes the subject's colour as `--mc`, which `bg-mc`/`text-mc` resolve. */
export function domainStyle(slug: string) {
  return { "--mc": domainOf(slug).color } as React.CSSProperties;
}
