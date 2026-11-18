import type { Article } from "./types";
import desertFloods from "./desert-floods";
import beitAlfaMosaic from "./beit-alfa-mosaic";
import gezerScarab from "./gezer-scarab";
import nativityTwice from "./nativity-twice";
import clergyDress from "./clergy-dress";
import archesByPeriod from "./arches-by-period";
import whatTheExamAsks from "./what-the-exam-asks";
import twoEarthquakes from "./two-earthquakes";
import qumranEinGedi from "./qumran-ein-gedi";
import tourReport from "./tour-report";
import hulaCranes from "./hula-cranes";
import lostBeetles from "./lost-beetles";
import afterTheFire from "./after-the-fire";

/** הסדר כאן הוא סדר ההצגה במדור: האקטואליים קודם. */
export const ARTICLES: Article[] = [
  hulaCranes,
  desertFloods,
  lostBeetles,
  afterTheFire,
  beitAlfaMosaic,
  gezerScarab,
  nativityTwice,
  qumranEinGedi,
  twoEarthquakes,
  clergyDress,
  archesByPeriod,
  whatTheExamAsks,
  tourReport,
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** "18 בנובמבר 2026" */
export function articleDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  return `${d} ב${months[m - 1]} ${y}`;
}

/** מאמרים קשורים: קודם מאותה קטגוריה, ואחר כך הבאים בתור. */
export function relatedArticles(slug: string, n = 3): Article[] {
  const me = getArticle(slug);
  const others = ARTICLES.filter((a) => a.slug !== slug);
  const same = others.filter((a) => a.category === me?.category);
  return [...same, ...others.filter((a) => !same.includes(a))].slice(0, n);
}
