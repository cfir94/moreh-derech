import minorities from "./minorities";
import christianity from "./christianity";
import islam from "./islam";
import judaism from "./judaism";
import prehistory from "./prehistory";
import bible from "./bible";
import secondTemple from "./second-temple";
import romanByzantine from "./roman-byzantine";
import crusader from "./crusader";
import mamlukOttoman from "./mamluk-ottoman";
import modernYishuv from "./modern-yishuv";
import state from "./state";
import jerusalem from "./jerusalem";
import geology from "./geology";
import waterClimate from "./water-climate";
import floraFauna from "./flora-fauna";
import geography from "./geography";
import artArch from "./art-arch";
import tourism from "./tourism";
import earlyIslam from "./early-islam";
import type { Summary } from "./types";

// the syllabus order (TOPICS in src/data/topics.ts)
export const SUMMARIES: Summary[] = [prehistory, bible, secondTemple, romanByzantine, earlyIslam, crusader, mamlukOttoman, modernYishuv, state, jerusalem, judaism, christianity, islam, minorities, geology, waterClimate, floraFauna, geography, artArch, tourism];

export function getSummary(key: string): Summary | undefined {
  return SUMMARIES.find((summary) => summary.key === key);
}
