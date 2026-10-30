import type { CrosswordEntry } from "@/data/crossword/types";

/**
 * The weekly crossword's word bank: people, events, places and terms drawn
 * from the 19 course notebooks (`notebooks.ts`), each with its clue and source
 * notebook. Every week the generator picks about 20 of them and lays out a new
 * grid (`src/lib/crossword/generate.ts`).
 *
 * Rules — `tests/crossword.test.mjs` enforces them:
 * - Every answer and clue comes from the notebook named in `notebook`.
 * - The clue never contains the answer.
 * - Never delete or rename an entry. Retire it with `until`, and add a
 *   corrected entry with a new `since`, so that past weeks keep their puzzle.
 *
 * How the bank is filled: docs/crossword.md.
 */
// ⚠️ זמני: מילים כלליות לבדיקת הממשק בלבד (demo:). יוחלפו במילים מהמחברות.
export const CROSSWORD_BANK: CrosswordEntry[] = [
  { id: "demo:מכתש", answer: "מכתש", clue: "בור גדול שנוצר בנגב בבליה של שכבות רכות", notebook: "geology-a", since: "2026-10-25" },
  { id: "demo:בזלת", answer: "בזלת", clue: "סלע געשי כהה, נפוץ בגולן", notebook: "geology-a", since: "2026-10-25" },
  { id: "demo:גיר", answer: "גיר", clue: "סלע משקע ממנו בנויה ירושלים העתיקה", notebook: "geology-a", since: "2026-10-25" },
  { id: "demo:קירטון", answer: "קירטון", clue: "סלע גירי רך ולבן, נוח לחציבה", notebook: "geology-a", since: "2026-10-25" },
  { id: "demo:השבר הסורי אפריקאי", answer: "השבר הסורי אפריקאי", clue: "המבנה הטקטוני שבו יושבים ים המלח והערבה", notebook: "geology-b", since: "2026-10-25" },
  { id: "demo:דולומיט", answer: "דולומיט", clue: "סלע פחמתי קשה, נפוץ בהרי יהודה", notebook: "geology-b", since: "2026-10-25" },
  { id: "demo:צור", answer: "צור", clue: "סלע קשה ששימש לכלי אבן פרהיסטוריים", notebook: "geology-b", since: "2026-10-25" },
  { id: "demo:נטיפים", answer: "נטיפים", clue: "משקעי סידן התלויים מתקרת מערה", notebook: "geology-b", since: "2026-10-25" },
  { id: "demo:אלון מצוי", answer: "אלון מצוי", clue: "עץ החורש הים תיכוני הנפוץ בארץ", notebook: "flora-fauna-a", since: "2026-10-25" },
  { id: "demo:שיטה", answer: "שיטה", clue: "עץ מדבר שממנו נבנה ארון הברית", notebook: "flora-fauna-a", since: "2026-10-25" },
  { id: "demo:כלנית", answer: "כלנית", clue: "פרח אדום ממשפחת הנוריתיים, פורח בחורף", notebook: "flora-fauna-a", since: "2026-10-25" },
  { id: "demo:רקפת", answer: "רקפת", clue: "פרח החורף שעליו כמו לב", notebook: "flora-fauna-a", since: "2026-10-25" },
  { id: "demo:יעל", answer: "יעל", clue: "חיה בעלת קרניים מעוגלות בעין גדי", notebook: "flora-fauna-b", since: "2026-10-25" },
  { id: "demo:שפן סלעים", answer: "שפן סלעים", clue: "יונק קטן שגר במצוקים בעין גדי", notebook: "flora-fauna-b", since: "2026-10-25" },
  { id: "demo:דורבן", answer: "דורבן", clue: "מכרסם גדול עם קוצים", notebook: "flora-fauna-b", since: "2026-10-25" },
  { id: "demo:חסידה", answer: "חסידה", clue: "עוף נודד גדול, עובר בעמק החולה", notebook: "flora-fauna-b", since: "2026-10-25" },
  { id: "demo:צלבנים", answer: "צלבנים", clue: "מקימי ממלכת ירושלים ב־1099", notebook: "borders-intro", since: "2026-10-25" },
  { id: "demo:הצהרת בלפור", answer: "הצהרת בלפור", clue: "מכתב בריטי מ־1917 על בית לאומי ליהודים", notebook: "borders-intro", since: "2026-10-25" },
  { id: "demo:הקו הירוק", answer: "הקו הירוק", clue: "גבול שביתת הנשק משנת 1949", notebook: "borders", since: "2026-10-25" },
  { id: "demo:סייקס פיקו", answer: "סייקס פיקו", clue: "הסכם חלוקת המזרח התיכון בין בריטניה וצרפת", notebook: "borders", since: "2026-10-25" },
  { id: "demo:ממלכת עבר הירדן", answer: "ממלכת עבר הירדן", clue: "מדינה שהוקמה ממזרח לנהר תחת עבדאללה", notebook: "borders", since: "2026-10-25" },
  { id: "demo:תל", answer: "תל", clue: "גבעה מלאכותית של שכבות יישוב", notebook: "archaeology-intro", since: "2026-10-25" },
  { id: "demo:שכבה", answer: "שכבה", clue: "יחידת חפירה של תקופת יישוב אחת", notebook: "archaeology-intro", since: "2026-10-25" },
  { id: "demo:פחמן ארבעה עשר", answer: "פחמן ארבעה עשר", clue: "שיטת תיארוך לפי דעיכה רדיואקטיבית", notebook: "archaeology-intro", since: "2026-10-25" },
  { id: "demo:חרס", answer: "חרס", clue: "שבר של כלי קיבול מחומר שרוף, כלי התיארוך העיקרי", notebook: "archaeology-intro", since: "2026-10-25" },
  { id: "demo:נאטופית", answer: "נאטופית", clue: "תרבות של ציידים־לקטים שהחלה להתיישב קבע", notebook: "prehistory", since: "2026-10-25" },
  { id: "demo:ניאנדרטלי", answer: "ניאנדרטלי", clue: "מין אדם שחי במערות הכרמל", notebook: "prehistory", since: "2026-10-25" },
  { id: "demo:עבידיה", answer: "עבידיה", clue: "אתר בעמק הירדן עם עדויות קדומות לאדם מחוץ לאפריקה", notebook: "prehistory", since: "2026-10-25" },
  { id: "demo:מגל", answer: "מגל", clue: "כלי לקציר שנמצא בתרבות הנאטופית", notebook: "prehistory", since: "2026-10-25" },
  { id: "demo:מגידו", answer: "מגידו", clue: "עיר כנענית ששלטה על דרך הים", notebook: "bronze", since: "2026-10-25" },
  { id: "demo:כנענים", answer: "כנענים", clue: "יושבי הארץ בתקופת הברונזה", notebook: "bronze", since: "2026-10-25" },
  { id: "demo:חצור", answer: "חצור", clue: "העיר הגדולה בכנען לפי ספר יהושע", notebook: "bronze", since: "2026-10-25" },
  { id: "demo:מנהרת המים", answer: "מנהרת המים", clue: "מתקן לגישה אל המעיין בתוך העיר בעת מצור", notebook: "bronze", since: "2026-10-25" },
  { id: "demo:פלשתים", answer: "פלשתים", clue: "גויי הים שהתיישבו בחוף הדרומי", notebook: "iron1", since: "2026-10-25" },
  { id: "demo:שופטים", answer: "שופטים", clue: "מנהיגי השבטים לפני המלוכה", notebook: "iron1", since: "2026-10-25" },
  { id: "demo:דבורה", answer: "דבורה", clue: "נביאה שהנהיגה את המלחמה בסיסרא", notebook: "iron1", since: "2026-10-25" },
  { id: "demo:שילה", answer: "שילה", clue: "מקום משכן ה׳ בימי עלי הכוהן", notebook: "iron1", since: "2026-10-25" },
  { id: "demo:חזקיהו", answer: "חזקיהו", clue: "מלך יהודה שחצב את הנקבה בירושלים", notebook: "iron2", since: "2026-10-25" },
  { id: "demo:סנחריב", answer: "סנחריב", clue: "מלך אשור שצר על לכיש", notebook: "iron2", since: "2026-10-25" },
  { id: "demo:לכיש", answer: "לכיש", clue: "העיר השנייה בחשיבותה ביהודה", notebook: "iron2", since: "2026-10-25" },
  { id: "demo:ירבעם", answer: "ירבעם", clue: "מלך ישראל שהעמיד עגלי זהב בבית אל ובדן", notebook: "iron2", since: "2026-10-25" },
  { id: "demo:עומרי", answer: "עומרי", clue: "מייסד שומרון כבירת ממלכת ישראל", notebook: "iron2", since: "2026-10-25" },
  { id: "demo:החשמונאים", answer: "החשמונאים", clue: "השושלת שקמה מתוך מרד המכבים", notebook: "second-temple", since: "2026-10-25" },
  { id: "demo:הורדוס", answer: "הורדוס", clue: "מלך יהודה שבנה את מצדה וקיסריה", notebook: "second-temple", since: "2026-10-25" },
  { id: "demo:מצדה", answer: "מצדה", clue: "מבצר על צוק מעל ים המלח", notebook: "second-temple", since: "2026-10-25" },
  { id: "demo:קומראן", answer: "קומראן", clue: "אתר ליד ים המלח שבו נמצאו המגילות הגנוזות", notebook: "second-temple", since: "2026-10-25" },
  { id: "demo:פרושים", answer: "פרושים", clue: "זרם שהאמין בתורה שבעל פה", notebook: "second-temple", since: "2026-10-25" },
  { id: "demo:בר כוכבא", answer: "בר כוכבא", clue: "מנהיג המרד ביהודה בימי אדריאנוס", notebook: "roman-byzantine", since: "2026-10-25" },
  { id: "demo:אדריאנוס", answer: "אדריאנוס", clue: "קיסר שהקים את איליה קפיטולינה", notebook: "roman-byzantine", since: "2026-10-25" },
  { id: "demo:קונסטנטינוס", answer: "קונסטנטינוס", clue: "הקיסר הראשון שאימץ את הנצרות", notebook: "roman-byzantine", since: "2026-10-25" },
  { id: "demo:יוסטיניאנוס", answer: "יוסטיניאנוס", clue: "קיסר שבנה את הקרדו החדש והנאה", notebook: "roman-byzantine", since: "2026-10-25" },
  { id: "demo:בית שאן", answer: "בית שאן", clue: "עיר שנקראה סקיתופוליס", notebook: "roman-byzantine", since: "2026-10-25" },
  { id: "demo:קרדו", answer: "קרדו", clue: "הרחוב הראשי מצפון לדרום בעיר רומית", notebook: "classical-architecture", since: "2026-10-25" },
  { id: "demo:אמפיתיאטרון", answer: "אמפיתיאטרון", clue: "מבנה אליפטי לקרבות גלדיאטורים", notebook: "classical-architecture", since: "2026-10-25" },
  { id: "demo:היפודרום", answer: "היפודרום", clue: "מבנה למרוצי מרכבות", notebook: "classical-architecture", since: "2026-10-25" },
  { id: "demo:אמת מים", answer: "אמת מים", clue: "מתקן שהוביל מים לקיסריה מהכרמל", notebook: "classical-architecture", since: "2026-10-25" },
  { id: "demo:פסיפס", answer: "פסיפס", clue: "תמונה מאבנים קטנות על הרצפה", notebook: "classical-architecture", since: "2026-10-25" },
  { id: "demo:פסח", answer: "פסח", clue: "חג החירות ויציאת מצרים", notebook: "judaism-b", since: "2026-10-25" },
  { id: "demo:סוכות", answer: "סוכות", clue: "חג שבו יושבים בצל סכך", notebook: "judaism-b", since: "2026-10-25" },
  { id: "demo:ראש השנה", answer: "ראש השנה", clue: "תחילת השנה העברית בתשרי", notebook: "judaism-b", since: "2026-10-25" },
  { id: "demo:יום כיפור", answer: "יום כיפור", clue: "יום הצום והסליחה", notebook: "judaism-b", since: "2026-10-25" },
  { id: "demo:מזוזה", answer: "מזוזה", clue: "קלף על משקוף הדלת", notebook: "judaism-c", since: "2026-10-25" },
  { id: "demo:מניין", answer: "מניין", clue: "עשרה גברים הדרושים לתפילה בציבור", notebook: "judaism-c", since: "2026-10-25" },
  { id: "demo:ארון הקודש", answer: "ארון הקודש", clue: "הכוננית שבה שמורים ספרי התורה", notebook: "judaism-c", since: "2026-10-25" },
  { id: "demo:עזרת נשים", answer: "עזרת נשים", clue: "האזור המיועד לנשים בבית הכנסת", notebook: "judaism-c", since: "2026-10-25" },
  { id: "demo:בשורה", answer: "בשורה", clue: "אחד מארבעת הספרים על חיי ישוע", notebook: "christianity-a", since: "2026-10-25" },
  { id: "demo:שליחים", answer: "שליחים", clue: "שנים עשר תלמידיו של ישוע", notebook: "christianity-a", since: "2026-10-25" },
  { id: "demo:טבילה", answer: "טבילה", clue: "טקס הכניסה לנצרות במים", notebook: "christianity-a", since: "2026-10-25" },
  { id: "demo:נצרת", answer: "נצרת", clue: "העיר שבה גדל ישוע", notebook: "christianity-b", since: "2026-10-25" },
  { id: "demo:כפר נחום", answer: "כפר נחום", clue: "עיר על חוף הכנרת, ביתו של פטרוס", notebook: "christianity-b", since: "2026-10-25" },
  { id: "demo:גולגותא", answer: "גולגותא", clue: "מקום הצליבה לפי המסורת", notebook: "christianity-b", since: "2026-10-25" },
  { id: "demo:בית לחם", answer: "בית לחם", clue: "עיר הולדתו של ישוע", notebook: "christianity-b", since: "2026-10-25" },
  { id: "demo:פטריארך", answer: "פטריארך", clue: "ראש כנסייה אורתודוקסית", notebook: "christianity-c", since: "2026-10-25" },
  { id: "demo:מנזר", answer: "מנזר", clue: "מקום מגוריהם של נזירים", notebook: "christianity-c", since: "2026-10-25" },
  { id: "demo:פרנציסקנים", answer: "פרנציסקנים", clue: "המסדר הקתולי השומר על המקומות הקדושים", notebook: "christianity-c", since: "2026-10-25" },
  { id: "demo:ארמנים", answer: "ארמנים", clue: "עדה נוצרית עם רובע משלה בעיר העתיקה", notebook: "christianity-c", since: "2026-10-25" },
];
