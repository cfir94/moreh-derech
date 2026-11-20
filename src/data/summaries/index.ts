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
import archaeologyIntro from "./archaeology-intro";
import bronzeAge from "./bronze-age";
import type { Summary } from "./types";

// the syllabus order (TOPICS in src/data/topics.ts); archaeology and the bronze age are course topics of their own
export const SUMMARIES: Summary[] = [prehistory, archaeologyIntro, bronzeAge, bible, secondTemple, romanByzantine, earlyIslam, crusader, mamlukOttoman, modernYishuv, state, jerusalem, judaism, christianity, islam, minorities, geology, waterClimate, floraFauna, geography, artArch, tourism];

export function getSummary(key: string): Summary | undefined {
  return SUMMARIES.find((summary) => summary.key === key);
}
