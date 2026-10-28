import type {AtlasRelation} from "./types";

/*
 * Family ties the three collections leave out, so the tree reads as a family
 * tree, and a few lines of rule and of teacher and disciple that were missing: Hannah above Samuel, Isaac above Jacob and Esau, Josiah above
 * Zedekiah, the Hasmonean kings as fathers and sons. Each one is sourced:
 * - `quote` is the words in the course's own text ("Who Am I?") that state it;
 *   a test checks they are there;
 * - `cite` gives the source outside the course material — chapter and verse
 *   and the words of the verse for the Bible, the book and section for
 *   Josephus and the others.
 * A tie that skips generations the atlas does not show is a `grandparent`,
 * and its label names the generation in between. A family tie here replaces
 * a succession line between the same two figures (atlas.ts).
 */
export type Kinship=AtlasRelation&{quote?:string;cite?:string};
export const KINSHIP:Kinship[]=[
 // ── The patriarchs and the judges ──
 {from:"F-02",to:"F-03",label:"אב ובן",kind:"parent",cite:"בראשית כה, כו: «ויצחק בן ששים שנה בלדת אתם»"},
 {from:"F-02",to:"F-04",label:"אב ובן",kind:"parent",cite:"בראשית כה, כו: «ויצחק בן ששים שנה בלדת אתם»"},
 {from:"F-19",to:"F-20",label:"אם ובן",kind:"parent",cite:"שמואל א׳ א, כ: «ותלד בן ותקרא את שמו שמואל»"},
 {from:"F-18",to:"F-19",label:"חשב אותה לשיכורה",kind:"contact",quote:"הכהן חשב תחילה שאני שיכורה"},
 {from:"F-16",to:"F-23",label:"סבתא רבתא: רות ← עובד ← ישי ← דוד",kind:"grandparent",cite:"רות ד, יז: «ויקראנה שמו עובד הוא אבי ישי אבי דוד»"},
 {from:"F-22",to:"F-23",label:"ברית נאמנות",kind:"contact",quote:"ברית נאמנות קשרה אותי לדוד"},
 // ── The kings of Judah and Israel ──
 {from:"F-25",to:"F-28",label:"סב ונכד, דרך אבים",kind:"grandparent",cite:"מלכים א׳ יד, לא; טו, ח: «וימלך אבים בנו תחתיו» · «וימלך אסא בנו תחתיו»"},
 {from:"F-28",to:"F-30",label:"אב ובן",kind:"parent",cite:"מלכים א׳ כב, מא: «ויהושפט בן אסא מלך על יהודה»"},
 {from:"F-37",to:"F-39",label:"אב ובן",kind:"parent",cite:"מלכים ב׳ ח, כה: «מלך אחזיהו בן יהורם מלך יהודה»"},
 {from:"F-31",to:"F-40",label:"אב ובת (ובמל״ב ח, כו: בת עמרי)",kind:"parent",cite:"מלכים ב׳ ח, יח: «כי בת אחאב היתה לו לאשה»"},
 {from:"F-32",to:"F-36",label:"אם ובן",kind:"parent",cite:"מלכים ב׳ ט, כב: «עד זנוני איזבל אמך»"},
 {from:"F-43",to:"F-45",label:"סב ונכד, דרך יותם",kind:"grandparent",quote:"הייתי אביו של יותם",cite:"מלכים ב׳ טז, א: «מלך אחז בן יותם מלך יהודה»"},
 {from:"F-47",to:"F-52",label:"סב רבא, דרך מנשה ואמון",kind:"grandparent",cite:"מלכים ב׳ כ, כא; כא, יח; כא, כד: «וימלך מנשה בנו תחתיו» · «וימלך אמון בנו תחתיו» · «וימליכו עם הארץ את יאשיהו בנו תחתיו»"},
 {from:"F-36",to:"F-41",label:"הרג אותו ותפס את המלוכה",kind:"succession",quote:"הרגתי את יורם בן אחאב ופתחתי שושלת חדשה בישראל"},
 {from:"F-52",to:"F-54",label:"אב ובן",kind:"parent",cite:"ירמיהו א, ג: «צדקיהו בן יאשיהו מלך יהודה»"},
 {from:"F-52",to:"P-003",label:"סב ונכד, דרך יהויקים",kind:"grandparent",cite:"מלכים ב׳ כג, לד; כד, ו: «וימלך פרעה נכה את אליקים בן יאשיהו» · «וימלך יהויכין בנו תחתיו»"},
 // ── Assyria and Persia: the kings in their order ──
 {from:"P-001",to:"P-002",label:"רצף מלכי אשור",kind:"succession",cite:"מלכים ב׳ טו, כט; יז, ג: «בא תגלת פלאסר מלך אשור» · «עליו עלה שלמנאסר מלך אשור»"},
 {from:"P-002",to:"F-48",label:"סנחריב, בן סרגון, יורש אותו",kind:"succession",cite:"ישעיהו כ, א; לז, לז: «שלח אתו סרגון מלך אשור» · «סנחריב מלך אשור»; ועל היותו בן סרגון — כתובות סנחריב, מנסרת טיילור"},
 {from:"P-008",to:"P-009",label:"רצף מלכי פרס",kind:"succession",cite:"עזרא ד, ה: «כל ימי כורש מלך פרס ועד מלכות דריוש מלך פרס»"},
 {from:"P-009",to:"P-011",label:"סב ונכד, דרך קסרקסס",kind:"grandparent",cite:"הרודוטוס ז, 2–4 (קסרקסס בן דריוש); תוקידידס א, 137 (ארתחשסתא בן קסרקסס)"},
 // ── The return ──
 {from:"P-003",to:"P-014",label:"סב ונכד, דרך שאלתיאל",kind:"grandparent",cite:"דברי הימים א׳ ג, יז; עזרא ג, ב: «ובני יכניה אסר שאלתיאל בנו» · «וזרבבל בן שאלתיאל»"},
 {from:"P-007",to:"P-005",label:"דודו: שניהם מבית שפן",kind:"contact",cite:"ירמיהו כו, כד; לו, י: «אחיקם בן שפן» · «גמריהו בן שפן»"},
 // ── The Seleucids ──
 {from:"P-024",to:"P-025",label:"אב ובן",kind:"parent",cite:"אפיאנוס, הספר הסורי 45"},
 {from:"P-024",to:"P-027",label:"אב ובן",kind:"parent",cite:"מקבים א׳ א, י (אנטיוכוס אפיפנס, בן אנטיוכוס המלך)"},
 // ── The Hasmonean kings: fathers and sons, not only a line of rulers ──
 {from:"P-040",to:"P-042",label:"אב ובן",kind:"parent",cite:"יוספוס, קדמוניות היהודים יג, 301–302 (אריסטובולוס, בכור בניו של הורקנוס)"},
 {from:"P-040",to:"P-043",label:"אב ובן",kind:"parent",cite:"יוספוס, קדמוניות היהודים יג, 320–322 (אלכסנדר ינאי, בנו של הורקנוס)"},
 {from:"P-043",to:"P-045",label:"אב ובן",kind:"parent",cite:"יוספוס, קדמוניות היהודים יג, 407–408 (ינאי, שלומציון ושני בניהם)"},
 {from:"P-043",to:"P-046",label:"אב ובן",kind:"parent",cite:"יוספוס, קדמוניות היהודים יג, 407–408 (ינאי, שלומציון ושני בניהם)"},
 // ── Herod's family ──
 {from:"P-048",to:"P-056",label:"אב ובן",kind:"parent",cite:"יוספוס, קדמוניות היהודים יד, 121 (בני אנטיפטר: פצאל, הורדוס, יוסף ופרורס)"},
 {from:"P-045",to:"P-054",label:"סב ונכדה, דרך אמה אלכסנדרה",kind:"grandparent",cite:"יוספוס, קדמוניות היהודים יד, 300 (מרים, בת אלכסנדר בן אריסטובולוס ונכדת הורקנוס)"},
 {from:"P-046",to:"P-054",label:"סב ונכדה, דרך אביה אלכסנדר",kind:"grandparent",cite:"יוספוס, קדמוניות היהודים יד, 300 (מרים, בת אלכסנדר בן אריסטובולוס ונכדת הורקנוס)"},
 {from:"P-054",to:"P-065",label:"סבתא ונכד, דרך בנה אריסטובולוס",kind:"grandparent",quote:"אני נכדו של הורדוס",cite:"יוספוס, קדמוניות היהודים יח, 130–133 (אגריפס, בן אריסטובולוס בן הורדוס ומרים)"},
 {from:"P-065",to:"P-067",label:"אב ובן",kind:"parent",quote:"אגריפס השני הוא בנו"},
 {from:"P-064",to:"P-063",label:"קרובים, והטביל אותו בירדן",kind:"contact",cite:"לוקס א, לו; מרקוס א, ט: «והנה אלישבע קרובתך» · «ויבא ישוע מנצרת אשר בגליל ויטבל על ידי יוחנן בירדן»"},
 // ── Rome, the sages and Byzantium ──
 {from:"L-03",to:"L-04",label:"בנו המאומץ ויורשו",kind:"succession",cite:"היסטוריה אוגוסטה, חיי אדריאנוס 4"},
 {from:"L-04",to:"L-08",label:"בנו המאומץ ויורשו",kind:"succession",cite:"היסטוריה אוגוסטה, חיי אנטונינוס פיוס 4"},
 {from:"L-09",to:"L-10",label:"אב ובן",kind:"parent",cite:"היסטוריה אוגוסטה, חיי ספטימיוס סוורוס 4; 16"},
 {from:"L-02",to:"L-07",label:"סב ונכד, דרך רבן שמעון בן גמליאל",kind:"grandparent",cite:"רשימת הנשיאים באגרת רב שרירא גאון: רבן גמליאל ← רבן שמעון בן גמליאל ← רבי יהודה הנשיא"},
 {from:"L-15",to:"L-16",label:"בן דודו ויורשו",kind:"succession",cite:"אמיאנוס מרקלינוס, ספרים כא–כב (יוליאנוס, בן אחיו של קונסטנטינוס, יורש את קונסטנטיוס)"},
 {from:"L-22",to:"L-25",label:"מורה ותלמיד",kind:"succession",cite:"ציר התקופה הביזנטית באתר: «תלמידיו, ובהם סבס»"},
 {from:"L-17",to:"L-20",label:"סב ונכד, דרך ארקדיוס",kind:"grandparent",quote:"תיאודוסיוס השני הוא נכדו של הראשון"},
 // ── Julius Caesar, the one supplement outside the course (atlas.ts) ──
 {from:"X-01",to:"P-053",label:"אב מאמץ ובן",kind:"parent",cite:"סואטוניוס, חיי הקיסרים, אוגוסטוס 8: בצוואתו אימץ קיסר את אוקטביאנוס, נכד אחותו"},
];
