/*
 * השכבה הרשמית של עזר הגאולוגיה (LA-72): המפה הגאולוגית של ישראל 1:200,000 (2014)
 * של המכון הגאולוגי לישראל, מתוך tools/fetch_gsi_geology.py. כאן רק המיפוי מתצורה
 * לתקופה של עמוד הזמן, כדי ש"הראו במפה" ומיון הרשימה יעבדו גם בה.
 */
import type { AgeId } from "./geology";

export const GSI_CREDIT = {
  text: "המפה הגאולוגית של ישראל 1:200,000 (2014), המכון הגאולוגי לישראל",
  url: "https://www.gov.il/he/departments/israel-geological-survey",
};

/** התקופה של תצורה לפי השם האנגלי שלה במפה. הסדר חשוב: "Precambrian" מכיל "Cambrian". */
export function gsiAge(en: string): AgeId {
  const n = en.toLowerCase();
  if (n.includes("precambrian")) return "precambrian";
  if (/basalt|volcanic|volcanic cone/.test(n) && !/cretaceous|mesozoic/.test(n)) {
    return /quaternary/.test(n) && !/pliocene/.test(n) ? "basalt-young" : "basalt-old";
  }
  if (/cambrian|ordovician|permian/.test(n)) return "paleozoic";
  if (n.includes("triassic")) return "triassic";
  if (n.includes("jurassic")) return "jurassic";
  if (/lower cretaceous|kurnub|mesozoic/.test(n)) return "lower-cretaceous";
  if (/cenomanian|turonian|albian/.test(n) && !/senonian/.test(n)) return "cenomanian-turonian";
  if (/senonian|coniacian|santonian|campanian|maastrichtian|paleocene|upper cretaceous|hatrurim/.test(n)) return "senonian";
  if (/eocene|oligocene/.test(n)) return "eocene";
  if (n.includes("lisan")) return "lisan";
  if (/calcareous sandstone|red sand and loam/.test(n)) return "pleistocene-kurkar";
  if (/miocene|pliocene|neogene/.test(n)) return "neogene";
  return "quaternary";
}
