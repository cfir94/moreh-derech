import type { FieldIconName } from "@/components/trail/FieldIcons";

/**
 * Each subject owns a colour and an icon, in the style of the geo-game's mode
 * cards: the colour tints a blurred orb in the card's corner and the progress
 * bar, so a subject is recognisable before its name is read.
 */
export type Domain = {
  /** CSS colour token, used as `--mc` on the card. */
  color: string;
  icon: string;
  /** the subject's ink icon (trail design); `icon` stays until every screen has moved */
  ink: FieldIconName;
};

export const DOMAINS: Record<string, Domain> = {
  "who-am-i": {color: "#b59460", icon: "🎭", ink: "me" },
  "past-exams": {color: "var(--gold)", icon: "🎓", ink: "exams" },
  "exam-bank": {color: "var(--gold)", icon: "🗂️", ink: "exams" },
  geology: {color: "var(--rose)", icon: "🪨", ink: "strata" },
  "flora-fauna": {color: "var(--green)", icon: "🌿", ink: "leaf" },
  prehistory: {color: "var(--violet)", icon: "🦴", ink: "handaxe" },
  "archaeology-intro": {color: "var(--gold)", icon: "🏛️", ink: "column" },
  "bronze-age": {color: "var(--rose)", icon: "🗿", ink: "jar" },
  "iron-age": {color: "var(--blue)", icon: "⚱️", ink: "jar" },
  "roman-byzantine": {color: "var(--violet)", icon: "🏛️", ink: "column" },
  "classical-architecture": {color: "var(--gold)", icon: "🏗️", ink: "column" },
  "early-islam": {color: "var(--green)", icon: "🕌", ink: "arch" },
  medieval: {color: "var(--rose)", icon: "🏰", ink: "tower" },
  ottoman: {color: "var(--gold)", icon: "🕰️", ink: "tower" },
  christianity: {color: "var(--violet)", icon: "✝️", ink: "cross" },
  judaism: {color: "var(--blue)", icon: "✡️", ink: "menorah" },
  "israel-borders": {color: "var(--teal)", icon: "🧭", ink: "border" },
  quizzes: {color: "var(--teal)", icon: "📚", ink: "quizzes" },
  exams: {color: "var(--gold)", icon: "🖊️", ink: "exams" },
  resources: {color: "var(--teal)", icon: "📖", ink: "resources" },
  geography: {color: "var(--rose)", icon: "🗺️", ink: "map" },
  religions: {color: "var(--gold)", icon: "🕍", ink: "menorah" },
  art: {color: "var(--blue)", icon: "🏺", ink: "jar" },
  "israel-today": {color: "var(--green)", icon: "🇮🇱", ink: "compass" },
  profession: {color: "var(--violet)", icon: "🎤", ink: "guide-reports" },
  maps: {color: "var(--teal)", icon: "🧭", ink: "map" },
  timelines: {color: "var(--violet)", icon: "🕰️", ink: "timelines" },
  "history-atlas": {color:"#98733e",icon:"◌", ink: "timelines" },
  "roman-people": {color: "#943d2b", icon: "♛", ink: "column" },
  periods: {color: "var(--teal)", icon: "▥", ink: "timelines" },
  biblical: {color: "var(--violet)", icon: "✝️", ink: "cross" },
  "egypt-canaan": {color: "var(--blue)", icon: "🏺", ink: "jar" },
  kings: {color: "var(--rose)", icon: "👑", ink: "milestone" },
  archaeology: {color: "var(--gold)", icon: "🏺", ink: "jar" },
  "judaism-timeline": {color: "#8b234f", icon: "📖", ink: "menorah" },
  "second-temple": {color: "var(--gold)", icon: "🏛️", ink: "menorah" },
  "roman-timeline": {color: "#8b2a1d", icon: "🦅", ink: "milestone" },
  "byzantine-timeline": {color: "#1e3270", icon: "☦️", ink: "cross" },
  "classical-architecture-timeline": {color: "#a8461f", icon: "📐", ink: "column" },
  "history-talk": {color: "#8C6A3F", icon: "🎙️", ink: "community" },
  "dating-quiz": {color: "var(--green)", icon: "📅", ink: "timelines" },
  "timeline-drag": {color: "var(--violet)", icon: "🧩", ink: "timelines" },
  map: {color: "var(--teal)", icon: "🗺️", ink: "map" },
  me: {color: "var(--blue)", icon: "📊", ink: "me" },
  "guide-reports": {color: "var(--rose)", icon: "📝", ink: "guide-reports" },
  videos: {color: "var(--violet)", icon: "🎬", ink: "videos" },
  notebooks: {color: "var(--blue)", icon: "📓", ink: "notebooks" },
  game: {color: "var(--gold)", icon: "🎮", ink: "games" },
  games: {color: "var(--gold)", icon: "🎮", ink: "games" },
  "geo-game": {color: "var(--teal)", icon: "🗺️", ink: "map" },
  "robes-game": {color: "#b0812f", icon: "✠", ink: "cross" },
  "church-game": {color: "var(--violet)", icon: "⛪", ink: "cross" },
  "plants-game": {color: "var(--green)", icon: "🌿", ink: "leaf" },
  crossword: {color: "var(--gold)", icon: "✏️", ink: "quizzes" },
  arches: {color: "var(--gold)", icon: "🌉", ink: "arch" },
  fauna: {color: "var(--green)", icon: "🦌", ink: "footprint" },
  review: {color: "var(--gold)", icon: "🔁", ink: "review" },
};

export function domainOf(slug: string): Domain {
  return DOMAINS[slug] ?? { color: "var(--teal)", icon: "📍", ink: "milestone" };
}

/** Exposes the subject's colour as `--mc`, which `bg-mc`/`text-mc` resolve. */
export function domainStyle(slug: string) {
  return { "--mc": domainOf(slug).color } as React.CSSProperties;
}
