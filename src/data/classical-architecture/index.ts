/**
 * Classical architecture, as the course teaches it: unit 6 of the history
 * lectures ("מושגים בסיסיים בארכיאולוגיה והארכיטקטורה של העולם הקלאסי", three
 * recorded lessons) and Bat-Zion Ziv's assignment sheet — the list of terms
 * every student must explain in five lines, with a site in Israel.
 *
 * Written by hand, not generated. `lecture: true` means the term is explained
 * in the recorded lessons and the site given is the one the lecturer used.
 * `list: true` means it is on the assignment sheet — an exam term.
 */

export type ArchChapter = {
  id: string;
  numeral: string;
  title: string;
  short: string;
};

export type ArchTerm = {
  id: string;
  term: string;
  /** Latin or Greek, as the lecturer says it. */
  latin?: string;
  chapter: string;
  text: string;
  /** A site in Israel that demonstrates the term. */
  site?: string;
  lecture: boolean;
  list: boolean;
};

export type ArchPeriod = { id: string; title: string; range: string };

export type ArchMilestone = {
  id: string;
  year: number;
  date: string;
  period: string;
  title: string;
  text: string;
  chapter: string;
  /** a field photo id from photos.ts, shown on the timeline */
  photo?: string;
};

export const ARCH_CHAPTERS: ArchChapter[] = [
  { id: "orders", numeral: "I", title: "הסדרים", short: "דורי, יוני, קורינתי" },
  { id: "temples", numeral: "II", title: "מקדשים", short: "יווני, רומי, טולוס" },
  { id: "city", numeral: "III", title: "העיר", short: "קרדו, דקומנוס, קשתות" },
  { id: "roads", numeral: "IV", title: "דרכים", short: "סלילה ואבני מיל" },
  { id: "water", numeral: "V", title: "אמות מים", short: "מהמעיין אל העיר" },
  { id: "entertainment", numeral: "VI", title: "מבני בידור", short: "תיאטרון והיפודרום" },
  { id: "baths", numeral: "VII", title: "בית המרחץ", short: "מקר אל חם" },
  { id: "decor", numeral: "VIII", title: "עיטורים", short: "פרסקו, סטוקו, פסיפס" },
  { id: "purity", numeral: "IX", title: "מקוואות", short: "טהרה בימי בית שני" },
  { id: "burial", numeral: "X", title: "קבורה", short: "כוכים וגלוסקמאות" },
  { id: "synagogues", numeral: "XI", title: "בתי כנסת", short: "ארבעה טיפוסים" },
  { id: "churches", numeral: "XII", title: "כנסיות", short: "בסיליקה ומבנה רכזי" },
];

export const ARCH_PERIODS: ArchPeriod[] = [
  { id: "classical", title: "יוון הקלאסית", range: "המאות ה־5–4 לפנה״ס" },
  { id: "hellenistic", title: "התקופה ההלניסטית", range: "332–63 לפנה״ס" },
  { id: "roman", title: "התקופה הרומית", range: "63 לפנה״ס – 324" },
  { id: "byzantine", title: "התקופה הביזנטית", range: "324–638" },
];

export const ARCH_MILESTONES: ArchMilestone[] = [
  { id: "AR-01", year: -480, date: "המאה ה־5 לפנה״ס", period: "classical", chapter: "city", title: "היפודמוס ותוכנית הרשת", text: "האדריכל היווני היפודמוס מִמילטוס מזוהה עם העיר המתוכננת ברחובות שתי וערב — 'התוכנית ההיפודמית', שתהיה האידאל של העיר הרומית.", photo: "tl-miletus" },
  { id: "AR-02", year: -447, date: "447–432 לפנה״ס", period: "classical", chapter: "orders", title: "הפרתנון באתונה", text: "שיא הסדר הדורי. המדידות מגלות שקווים 'ישרים' בו מעוקלים במכוון — השליות אופטיות כמו האנטזיס.", photo: "tl-parthenon" },
  { id: "AR-03", year: -332, date: "332 לפנה״ס", period: "hellenistic", chapter: "city", title: "אלכסנדר — ראשית ההלניזם בארץ", text: "השלטון המערבי מביא לארץ את השפה האדריכלית היוונית. מכאן ואילך — 'התקופה הקלאסית' של ארץ ישראל.", photo: "tl-alexander" },
  { id: "AR-04", year: -250, date: "המאות ה־3–2 לפנה״ס", period: "hellenistic", chapter: "burial", title: "הכוכים הראשונים — מרשה", text: "במערות הקבורה ההלניסטיות של מרשה נחצבים כוכים: גומחות צרות ועמוקות לגופה. הדגם יאומץ בקבורה היהודית בירושלים.", photo: "tl-maresha" },
  { id: "AR-05", year: -130, date: "התקופה החשמונאית", period: "hellenistic", chapter: "purity", title: "המקוואות הראשונים", text: "לראשונה מופיעים בממצא מתקנים ייעודיים לטבילה — עם ההקפדה הגוברת על טהרה ('פרצה טהרה בישראל') והעלייה לרגל.", photo: "tl-jericho-mikveh" },
  { id: "AR-06", year: -100, date: "התקופה החשמונאית", period: "hellenistic", chapter: "water", title: "אמות המים הראשונות בהיקף רחב", text: "הובלת מים ממרחק מוכרת בארץ בהיקף רחב מן התקופה ההלניסטית־חשמונאית: אמות לארמונות יריחו ולמבצרי המדבר.", photo: "tl-jericho-pools" },
  { id: "AR-07", year: -63, date: "63 לפנה״ס", period: "roman", chapter: "city", title: "פומפיוס — רומא בארץ", text: "השליטה הרומית מביאה את הקשת, הקמרון והכיפה, את בית המרחץ ואת מבני הבידור הגדולים.", photo: "tl-pompey" },
  { id: "AR-08", year: -22, date: "22–10 לפנה״ס", period: "roman", chapter: "temples", title: "הורדוס בונה את קיסריה", text: "מקדש לרומא ולאוגוסטוס, תיאטרון, היפו־סטדיום ואמת המים העליונה — עיר רומית מלאה על חוף הים.", photo: "caesarea-theatre" },
  { id: "AR-09", year: -20, date: "מ־20 לפנה״ס בערך", period: "roman", chapter: "decor", title: "הר הבית ההרודיאני", text: "שברי אופוס סקטילה צבעוניים מפרויקט סינון העפר מעידים שרחבת המקדש הייתה מרוצפת בצבעים עזים — כפי שתיאר יוסף בן מתתיהו.", photo: "tl-holyland" },
  { id: "AR-10", year: -15, date: "סוף המאה ה־1 לפנה״ס", period: "roman", chapter: "burial", title: "הגלוסקמאות בירושלים", text: "קבורה שנייה בתיבה אישית במקום במאספה המשפחתית. בשימוש בירושלים עד החורבן, ובגליל ובדרום עוד כמאתיים שנה.", photo: "ossuary" },
  { id: "AR-11", year: -10, date: "המאה ה־1 לפנה״ס – המאה ה־1 לספירה", period: "roman", chapter: "burial", title: "מצבות נחל קדרון", text: "קבר בני חזיר, יד אבשלום וקבר זכריה: קבר חצוב ונפש בנויה, סדרים קלאסיים — ובלי דמויות.", photo: "absalom" },
  { id: "AR-12", year: 60, date: "לפני 70 לספירה", period: "roman", chapter: "synagogues", title: "בתי הכנסת הראשונים וכתובת תיאודוטוס", text: "גמלא, מצדה, הרודיון ומגדלא: אולמות עם ספסלים לקריאה ולימוד. בירושלים — כתובת תיאודוטוס מעיר דוד.", photo: "gamla" },
  { id: "AR-13", year: 130, date: "כ־130 לספירה", period: "roman", chapter: "water", title: "אדריאנוס: איליה קפיטולינה", text: "קשתות ניצחון בירושלים (שער שכם, אקה הומו), והכפלת אמת המים העליונה לקיסריה בידי חיילי הלגיונות.", photo: "damascus-gate" },
  { id: "AR-14", year: 200, date: "המאות ה־2–3", period: "roman", chapter: "entertainment", title: "ערי הבידור — בית שאן", text: "תיאטרון, היפודרום שהוסב לאמפיתיאטרון, מרחצאות ולטרינות. בבית גוברין נבנה אמפיתיאטרון מלכתחילה.", photo: "beit-shean-theatre" },
  { id: "AR-15", year: 250, date: "המאות ה־3–4", period: "roman", chapter: "burial", title: "בית שערים", text: "מערכות קבורה מפוארות וסרקופגים — ייתכן שגם קבר רבי יהודה הנשיא.", photo: "sarcophagus-animals" },
  { id: "AR-16", year: 335, date: "335", period: "byzantine", chapter: "churches", title: "כנסיית הקבר", text: "בסיליקה ולצידה רוטונדה — מבנה רכזי סביב הסלע של הקבר. הבסיליקה האזרחית הופכת לבית תפילה נוצרי.", photo: "holy-sepulchre" },
  { id: "AR-17", year: 350, date: "המאה ה־4", period: "byzantine", chapter: "synagogues", title: "גלגל המזלות בחמת טבריה", text: "בבית הכנסת של סוורוס — גלגל המזלות המוקדם בארץ, ובמרכזו הליוס. אמנות הדמות חוזרת אל הרצפות היהודיות.", photo: "hammat-tiberias" },
  { id: "AR-18", year: 450, date: "המאה ה־5", period: "byzantine", chapter: "water", title: "האמה התחתונה לקיסריה", text: "אמה מקורה מסכר נחל תנינים, לצד שתי תעלות האמה העליונה. אפשר ללכת בתוכה כמו במנהרה.", photo: "caesarea-aqueduct-sea" },
  { id: "AR-19", year: 456, date: "אמצע המאה ה־5", period: "byzantine", chapter: "churches", title: "כנסיית הקתיסמה", text: "מתומן שמנציח את הסלע שעליו נחה מרים בדרך לבית לחם — כנסייה רכזית.", photo: "tl-kathisma" },
  { id: "AR-20", year: 525, date: "המאה ה־6", period: "byzantine", chapter: "synagogues", title: "בית אלפא", text: "בית כנסת דמוי כנסייה: אפסיס, פסיפס עם עקדת יצחק, גלגל המזלות וארון הקודש.", photo: "beit-alpha" },
  { id: "AR-21", year: 550, date: "המאה ה־6", period: "byzantine", chapter: "churches", title: "כורסי", text: "בסיליקה עם אטריום, נרתקס, תווך, סטרות ושלוש אפסידות — דיאקוניקון ופרותזיס בצדדים.", photo: "kursi" },
  { id: "AR-22", year: 691, date: "691", period: "byzantine", chapter: "churches", title: "אחרי הסוף: כיפת הסלע", text: "המסורת הקלאסית ממשיכה גם אחרי 638: מבנה רכזי מתומן — אבל מוסלמי, סביב הסלע הקדוש.", photo: "dome-of-the-rock" },
];

export const ARCH_TERMS: ArchTerm[] = [
  // ---- I. orders ----
  { id: "order", term: "סדר אדריכלי", latin: "order", chapter: "orders", lecture: true, list: true,
    text: "יותר מ'סגנון': בחירת סוג העמוד קובעת גם את הכותרת, את העיטורים שמעליה ואת הפרופורציות של המבנה כולו. שלושת העיקריים — דורי, יוני וקורינתי — קרויים על שם האזורים שבהם התפתחו.",
    site: "קבר יאסון ברחביה (דורי); יד אבשלום בנחל קדרון (יוני)" },
  { id: "doric", term: "הסדר הדורי", chapter: "orders", lecture: true, list: true,
    text: "הפשוט והגוץ: העמוד צומח ישר מן הסטילובט בלי בסיס, הכותרת חלקה — 'כרית' ולוח מעליה, ובאפריז מתחלפים טריגליפים ומטופות.",
    site: "קבר יאסון ברחביה; שני העמודים בחזית קבר בני חזיר" },
  { id: "ionic", term: "הסדר היוני", chapter: "orders", lecture: true, list: true,
    text: "עמוד צר יותר ביחס לגובהו, העומד על בסיס, וכותרת עם שתי וולוטות — שבלולים ספירליים מימין ומשמאל. הוולוטות הן סימן הזיהוי הבולט.",
    site: "הכותרות של יד אבשלום בנחל קדרון" },
  { id: "corinthian", term: "הסדר הקורינתי", chapter: "orders", lecture: true, list: true,
    text: "המפותח והמפואר: כותרת גבוהה עטופה עלי אקנתוס (קוציץ סורי), ועמוד דק וגבוה עוד יותר. החביב על הרומאים — כמו במקדש אוגוסטוס בפולה שבקרואטיה.",
    site: "כותרות קורינתיות בכל עיר רומית בארץ — בית שאן, קיסריה" },
  { id: "triglyphs", term: "טריגליפים ומטופות", latin: "triglyph · metope", chapter: "orders", lecture: true, list: true,
    text: "הדגם החוזר באפריז הדורי. טריגליף — לוח מגולף בשלושה פסים אנכיים (טרי = שלוש); מטופה — הלוח שביניהם, שעוטר בסצנות מיתולוגיות. בירושלים של בית שני — עיגולים פשוטים בלי דמויות.",
    site: "יד אבשלום בנחל קדרון" },
  { id: "stylobate", term: "סטילובט", latin: "stylobate", chapter: "orders", lecture: true, list: true,
    text: "המדרגה העליונה, או רצועה מוגבהת כמו מדרכה, שעליה עומדים העמודים. במקדש היווני היא מעל כמה מדרגות; בבתי כנסת ובכנסיות היא שורת אבן מוגבהת ברצפה.",
    site: "כל מקדש, בית כנסת וכנסייה עם שורות עמודים — למשל כורסי" },
  { id: "pedestal", term: "פדסטל", latin: "pedestal", chapter: "orders", lecture: true, list: true,
    text: "כַּן מוגבה שמתחת לבסיס העמוד. הוא אינו חלק מן העמוד — הוא מגביה אותו.",
    site: "שער הניצחון הרומי מתחת לשער שכם בירושלים" },
  { id: "capital", term: "כותרת", chapter: "orders", lecture: true, list: false,
    text: "ראש העמוד, שעליו נחה הקורה. לפי הכותרת מזהים את הסדר במבט אחד: חלקה (דורי), וולוטות (יוני), עלי אקנתוס (קורינתי)." },
  { id: "architrave", term: "ארכיטרב", latin: "architrave", chapter: "orders", lecture: true, list: false,
    text: "קורת האבן האופקית שנחה ישירות על הכותרות — חיקוי בָּאבן לקורת העץ של המבנים הקדומים." },
  { id: "frieze", term: "אפריז", latin: "frieze", chapter: "orders", lecture: true, list: false,
    text: "הרצועה שמעל הארכיטרב, מעוטרת בדגם חוזר: בדורי — טריגליפים ומטופות; ביוני ובקורינתי — רצועה רציפה של תבליט." },
  { id: "pediment", term: "גמלון וטימפנון", latin: "pediment · tympanon", chapter: "orders", lecture: true, list: false,
    text: "הגמלון הוא הגג המשולש שבחזית; הטימפנון הוא השדה המשולש שבתוכו, שעוטר בדמויות, קרבות וחיות מיתולוגיות." },
  { id: "acroteria", term: "אקרוטריות", latin: "acroteria", chapter: "orders", lecture: false, list: true,
    text: "פסלים או עיטורים שהוצבו על ראש הגמלון ובשתי פינותיו התחתונות — 'כתר' לחזית המקדש." },
  { id: "entasis", term: "אנטזיס", latin: "entasis", chapter: "orders", lecture: true, list: false,
    text: "עיבוי קל במרכז גוף העמוד, כאילו העמוד 'מתאמץ' תחת המשקל. אחת ההשליות האופטיות של האדריכלות הקלאסית, כמו הרצפות המקומרות בפרתנון." },
  { id: "fluting", term: "חריצי העמוד", latin: "fluting", chapter: "orders", lecture: true, list: false,
    text: "חריצים אנכיים לאורך גוף העמוד, כמו קפלי שמלה. הם מוסיפים חן וגורמים לעמוד להיראות רזה וגבוה יותר." },

  // ---- II. temples ----
  { id: "greek-temple", term: "המקדש היווני", chapter: "temples", lecture: true, list: true,
    text: "מוקף עמודים ומדרגות מארבעת צדדיו, ולכן קשה לזהות במבט ראשון היכן הכניסה. פסל האל עמד בחדר סגור בלב טור העמודים — לא בחוץ.",
    site: "אין בארץ; דוגמה: מקדש הפייסטוס באתונה" },
  { id: "roman-temple", term: "המקדש הרומי", chapter: "temples", lecture: true, list: true,
    text: "ניצב על בסיס מוגבה עם גרם מדרגות בחזית בלבד; העמודים מדגישים את החזית. מבנה צירי מובהק, לרוב בקצה רחוב או פורום. בתקופת אוגוסטוס מתחיל גם פולחן הקיסר.",
    site: "מקדש רומא ואוגוסטוס בקיסריה; חורבת עומרית; תל קדש" },
  { id: "tholos", term: "טולוס", latin: "tholos", chapter: "temples", lecture: true, list: false,
    text: "מבנה עגול מוקף עמודים — מקדש (אתנה בדלפי, הרקולס ברומא) ובהמשך גם קבר. ראש יד אבשלום הוא סוג של טולוס.",
    site: "החלק העליון של יד אבשלום" },
  { id: "sacellum", term: "סקלום", latin: "sacellum", chapter: "temples", lecture: false, list: true,
    text: "מקדש קטן או חדר פולחן. במחנה לגיון רומי — החדר הקדוש בלב המפקדה (פרינקיפיה), שבו נשמרו נשר הלגיון, סמליו ודמות הקיסר, ומתחתיו לרוב קופת הלגיון.",
    site: "מחנה הלגיון השישי (Legio) ליד מגידו" },

  // ---- III. city ----
  { id: "hippodamian", term: "תוכנית היפודמית", latin: "grid plan", chapter: "city", lecture: true, list: true,
    text: "תוכנית העיר האידאלית: רחובות שתי וערב שיוצרים רשת (גריד), על שם האדריכל היווני היפודמוס. לא כל עיר נראית כך — ערים שנכבשו הותאמו לדגם ככל האפשר.",
    site: "קיסריה (אינסולות); בית שאן" },
  { id: "cardo", term: "קרדו", latin: "cardo maximus", chapter: "city", lecture: true, list: false,
    text: "רחוב האורך המרכזי, בדרך כלל בציר צפון–דרום — רחב, עם עמודים וחנויות, לתהלוכות ולמסחר. בלטינית: 'ציר' (כמו ציר של דלת).",
    site: "ירושלים — שני קרדו משער שכם; אנטיפטריס (תל אפק)" },
  { id: "decumanus", term: "דקומנוס", latin: "decumanus maximus", chapter: "city", lecture: true, list: false,
    text: "רחוב הרוחב המרכזי, בציר מזרח–מערב. מקור השם אינו ידוע (יש בו את 'דקה' — עשר).",
    site: "סוסיתא — דקומנוס בלבד, בלי קרדו, כי העיר מוארכת על ראש ההר" },
  { id: "tetrapylon", term: "טטרפילון", latin: "tetrapylon", chapter: "city", lecture: true, list: false,
    text: "'ארבעה שערים': מבנה בצומת הקרדו והדקומנוס, שנכנסים דרכו לכיכר מארבעה צדדים.",
    site: "בחו״ל: ג'רש, תדמור (פלמירה)" },
  { id: "forum", term: "פורום / אגורה", latin: "forum · agora", chapter: "city", lecture: true, list: false,
    text: "כיכר השוק הגדולה — מרכז החיים: מסחר, כינוס ומפגש. ביוונית אגורה, בלטינית פורום. ברומא בנה כל קיסר פורום חדש.",
    site: "האגורה ליד רחוב פלדיוס בבית שאן" },
  { id: "insula", term: "אינסולה", latin: "insula", chapter: "city", lecture: true, list: false,
    text: "גוש בתים בין ארבעה רחובות — 'מבנן'. לעתים בן כמה קומות, ובו עשרות ואף מאות דיירים.",
    site: "קיסריה" },
  { id: "arch", term: "שער ניצחון", latin: "arcus", chapter: "city", lecture: true, list: false,
    text: "קשת הנצחה, לא שער בחומה: בדרך כלל קשת מרכזית גבוהה ושתי קשתות צד, עמודים על פדסטלים וכתובת למעלה. ארבעה מוכרים בירושלים.",
    site: "שער שכם (הקשת הקטנה של אדריאנוס); אקה הומו; כנסיית אלכסנדר נבסקי; מצפון לשער שכם" },
  { id: "vault-dome", term: "קמרון, כיפה ואוקולוס", chapter: "city", lecture: true, list: false,
    text: "האדריכלות היוונית היא של עמודים וקורות; הרומאים מחזירים לשימוש את הקשת, הקמרון (קשת רחבה) והכיפה. בכיפת הבטון של הפנתאון — אוקולוס, 'עין' פתוחה לאור.",
    site: "קמרונות אמת המים בקיסריה" },
  { id: "peristyle", term: "חצר פריסטיל", latin: "peristylium", chapter: "city", lecture: true, list: false,
    text: "חצר מוקפת עמודים (פרי = מסביב, סטילוס = עמוד) בלב בית מפואר: שמש באמצע וצל מאחורי העמודים." },
  { id: "atrium", term: "אטריום", latin: "atrium", chapter: "city", lecture: true, list: false,
    text: "בבית הרומי — אולם מרכזי עם פתח בגג ובריכה למי הגשם. בכנסייה — החצר שלפני הכניסה, שחוברה לתבנית הבסיליקה.",
    site: "האטריום של כנסיית כורסי" },

  // ---- IV. roads ----
  { id: "roads", term: "סלילת דרכים", chapter: "roads", lecture: true, list: true,
    text: "רשת דרכים חסרת תקדים שנועדה לתנועת הצבא, למסחר ולהעברת המסים. במקום אחד — חציבה בסלע עד מדרגות; באחר — תשתית ושכבות מרוצפות. רחובות בעיר רוצפו עם מדרכות.",
    site: "דרך הקיסר מירושלים לכיוון חברון ובית גוברין" },
  { id: "milestones", term: "אבני מיל — מיליה פאסום", latin: "milia passuum", chapter: "roads", lecture: true, list: true,
    text: "מיל = אלף צעדים (כ־1.5 ק״מ), נמדד מן הפורום של העיר. על האבן נחקקו מספר המיל ושם הקיסר — ולכן שימשה גם לתעמולה. מדידות חוזרות יצרו ריכוזי אבנים.",
    site: "ריכוזי אבני מיל בגבעת ישעיהו שבשפלה ובדרך לחברון" },
  { id: "peutinger", term: "מפת פויטינגר", latin: "Tabula Peutingeriana", chapter: "roads", lecture: true, list: false,
    text: "מפת דרכים ארוכה של האימפריה, בהעתק מימי הביניים, על שם אספן מן המאה ה־15. מופיעים בה ירושלים בשם איליה קפיטולינה, הר הזיתים וים המלח." },

  // ---- V. water ----
  { id: "aqueduct", term: "אמות מים", latin: "aquaeductus", chapter: "water", lecture: true, list: true,
    text: "תעלה שמובילה מים בכוח הכובד, בשיפוע קל, ממעיינות רחוקים — מה שאפשר לערים לרדת מן התלים. בארץ בהיקף רחב מן התקופה ההלניסטית־חשמונאית, שוכללה ברומית ונמשכה בביזנטית.",
    site: "אמות ירושלים העליונה והתחתונה; אמות קיסריה" },
  { id: "caesarea-aqueducts", term: "אמות המים לקיסריה", chapter: "water", lecture: true, list: true,
    text: "האמה העליונה: תעלת הורדוס, שהוכפלה בימי אדריאנוס (כ־130) בידי חיילי הלגיונות — כתובותיהם בקשתות. האמה התחתונה (הנמוכה), ביזנטית: מסכר נחל תנינים, מקורה לכל אורכה. האמות שירתו את העיר, בתיקונים, מאות שנים.",
    site: "חוף האקוודוקט בקיסריה" },
  { id: "tunnel", term: "מנהרה ופירים", chapter: "water", lecture: true, list: false,
    text: "דרך לעבור הר: חוצבים מנהרה משני הכיוונים, ופירים אנכיים מחלקים את העבודה לכמה חזיתות, מכניסים אוויר ואור ומאפשרים לסלק את פסולת החציבה.",
    site: "מנהרת ארמון הנציב (האמה התחתונה, שישה פירים)" },
  { id: "siphon", term: "סיפון הפוך (גיכון)", chapter: "water", lecture: true, list: false,
    text: "צינור סגור שיורד אל העמק ועולה בצד השני, מעט נמוך יותר, לפי חוק הכלים השלובים. צינור חרס היה מתפוצץ בלחץ — ולכן חוליות אבן מחוברות זכר־נקבה.",
    site: "האמה העליונה לירושלים באזור בית לחם; חוליות במוזיאון ישראל" },
  { id: "castellum", term: "קסטלום ובריכת שיקוע", latin: "castellum", chapter: "water", lecture: true, list: false,
    text: "בריכת שיקוע בדרך מנקה את המים לבד: הם נחים, הלכלוך שוקע והמים העליונים ממשיכים. בפתח העיר הקסטלום מפצל את המים — לבתי עשירים, למזרקות ולבתי המרחץ." },

  // ---- VI. entertainment ----
  { id: "theatre", term: "תיאטרון — יווני ורומי", chapter: "entertainment", lecture: true, list: true,
    text: "מבנה חצי־עגולי לצפייה בהצגות. היווני נחצב במדרון גבעה; הרומי נבנה גם במישור, על קמרונות, וקיר הסקנה הגבוה שלו חסם את הנוף — הקהל 'נכנס' אל העולם הרומי.",
    site: "בית שאן; קיסריה; טבריה" },
  { id: "theatre-parts", term: "חלקי התיאטרון", chapter: "entertainment", lecture: true, list: true,
    text: "סקנה פרונס (קיר התפאורה), פולפיטום (הבמה — כאן נערכה ההופעה בתיאטרון הרומי), פרוסקניון (חזית הבמה), אורכסטרה, קוואה (גושי המושבים), אדיטוס מקסימוס (כניסת המכובדים), וומיטוריום ואמבולקרום.",
    site: "התיאטרון בבית שאן; בחו״ל — בוסרה שבסוריה" },
  { id: "odeon", term: "אודיאון", latin: "odeion", chapter: "entertainment", lecture: true, list: true,
    text: "'בן דודו' של התיאטרון: תיאטרון קטן ומקורה, להופעות מוזיקה ושירה." },
  { id: "bouleuterion", term: "בולאוטריון", latin: "bouleuterion", chapter: "entertainment", lecture: false, list: true,
    text: "בית מועצת העיר (הבּוּלֶה): אולם קטן ומקורה עם מושבים מדורגים בחצי עיגול. דומה בצורתו לאודיאון — ולכן לא תמיד אפשר להבחין ביניהם בחפירה.",
    site: "בבית שאן נחשף מבנה קטן כזה, שזוהה כאודיאון או כבולאוטריון" },
  { id: "stadium", term: "אצטדיון", latin: "stadion", chapter: "entertainment", lecture: true, list: true,
    text: "מבנה מוארך לתחרויות ריצה ואתלטיקה, על שם 'סטדיון' — יחידת אורך שלאורכה רצו.",
    site: "ההיפו־סטדיום של הורדוס בקיסריה" },
  { id: "hippodrome", term: "היפודרום (קירקוס)", latin: "hippodromos · circus", chapter: "entertainment", lecture: true, list: true,
    text: "מסלול מוארך למרוצי מרכבות (היפוס = סוס, דרומוס = מרוץ). המרכבות זינקו מתאי ההזנקה והקיפו כמה סיבובים את הספינה — הקיר המרכזי.",
    site: "קיסריה (גם אצטדיון וגם אמפיתיאטרון — 'היפו־סטדיום'); בית שאן" },
  { id: "meta", term: "מטה", latin: "meta", chapter: "entertainment", lecture: true, list: true,
    text: "עמודי הסיבוב בשני קצות הספינה: מטה פרימה — בקצה הרחוק מתאי ההזנקה, מטה סקונדה — בקצה הקרוב. נקודות הסכנה, שבהן התהפכו מרכבות.",
    site: "ההיפודרום בקיסריה" },
  { id: "amphitheatre", term: "אמפיתיאטרון", latin: "amphitheatrum", chapter: "entertainment", lecture: true, list: true,
    text: "כשני תיאטראות מחוברים: מבנה סגור, עגול או אליפטי, שהקהל מקיף את זירתו ב־360 מעלות — לקרבות גלדיאטורים ולמאבקים בחיות.",
    site: "בית גוברין — נבנה ככזה מלכתחילה; בקיסריה ובבית שאן הוסב מהיפודרום" },
  { id: "munera", term: "מונרה", latin: "munera", chapter: "entertainment", lecture: false, list: true,
    text: "מופעי קרבות הגלדיאטורים באמפיתיאטרון. במקור 'מתנות' — חובה או מחווה שנתן נכבד לעם על חשבונו.",
    site: "האמפיתיאטרון בבית גוברין" },

  // ---- VII. baths ----
  { id: "baths", term: "תרבות הרחצה", chapter: "baths", lecture: true, list: true,
    text: "בית המרחץ הרומי הוא מרכז חיים, לא רק ניקיון: שם נפגשו הפטרון ובני חסותו ונסגרו עסקים ופוליטיקה. גם יהודים — ואף חכמים — ביקרו בו. בארץ המרחצאות קטנים יחסית לרומא.",
    site: "בית שאן (המרחץ המזרחי והמערבי); קיסריה; ליד הכותל" },
  { id: "hypocaust", term: "היפוקאוסט", latin: "hypocaustum", chapter: "baths", lecture: true, list: true,
    text: "חלל מתחת לרצפה, שהרצפה נשענת בו על עמודונים. האוויר החם מן התנור זורם בו ומחמם את הרצפה, ובצינורות גם את הקירות. מים קרים על הרצפה החמה יוצרים אדים.",
    site: "המרחץ המזרחי בבית שאן" },
  { id: "caldarium", term: "קלדריום", latin: "caldarium", chapter: "baths", lecture: true, list: true,
    text: "החדר החם — הסמוך לתנור, מעל ההיפוקאוסט, עם בריכה חמה ואדים. אליו מגיעים אחרון, אחרי שהגוף הורגל בהדרגה.",
    site: "בית שאן" },
  { id: "bath-rooms", term: "פריגידריום, טפידריום, אפודיטריום ופלאסטרה", chapter: "baths", lecture: true, list: false,
    text: "פלאסטרה — חצר לאימון ולהזעה לפני הרחצה; אפודיטריום — מלתחה; פריגידריום — הבריכה הקרה; טפידריום — חדר פושר בין הקר לחם.",
    site: "אפודיטריום עם תאים לבגדים באחד ממרחצאות קיסריה" },
  { id: "latrina", term: "לטרינה", latin: "latrina", chapter: "baths", lecture: true, list: true,
    text: "בית שימוש ציבורי: מושבים בשורה מעל תעלת ביוב, ולפניהם תעלה עם מים זורמים ומקל עם ספוג לניקוי.",
    site: "הלטרינה במרחץ המערבי בבית שאן" },
  { id: "nymphaeum", term: "נימפיאון", latin: "nymphaeum", chapter: "baths", lecture: true, list: true,
    text: "מזרקה ציבורית מפוארת על שם הנימפות: חזית עם גומחות, עמודים ופסלים ובריכה לפניה, מוזנת מאמת מים. מקור לשתייה ולנוי ברחוב הראשי.",
    site: "קיסריה — שוקם, ובו פסל היגיאה; בית שאן" },

  // ---- VIII. decor ----
  { id: "fresco", term: "פרסקו", latin: "fresco", chapter: "decor", lecture: true, list: true,
    text: "ציור על טיח לח. כשהטיח מתייבש הפיגמנט נקשר אליו כימית — אי אפשר למחוק אותו בלי להרוס את הטיח. דורש מהירות: מטייחים ומציירים קטע אחר קטע. (fresco = טרי)",
    site: "הרובע ההרודיאני בירושלים; תא המלך בתיאטרון בהרודיון" },
  { id: "secco", term: "סקו", latin: "secco", chapter: "decor", lecture: true, list: true,
    text: "ציור על טיח יבש. נוח יותר — אין לחץ זמן — אבל הצבע לא נקשר לטיח, ולכן נמחק בקלות יחסית. בעין לא מבחינים בינו לבין פרסקו." },
  { id: "stucco", term: "סטוקו", latin: "stucco", chapter: "decor", lecture: true, list: true,
    text: "טיח שעוצב בתבליט — ביד או בדפוס — על קירות ותקרות: פרחים, מסגרות, דגמים. אופייני לארמונות הורדוס.",
    site: "ארמונות הורדוס" },
  { id: "mosaic", term: "פסיפס", latin: "musivum", chapter: "decor", lecture: true, list: false,
    text: "תמונה מאבנים קטנטנות בצבעיהן הטבעיים. בימי בית שני — בלי דמויות; בתקופה הביזנטית אמנות הדמות פורחת גם בבתי הכנסת.",
    site: "הרובע ההרודיאני בירושלים (בלי דמויות); בית אלפא (עם דמויות)" },
  { id: "opus-sectile", term: "אופוס סקטילה", latin: "opus sectile", chapter: "decor", lecture: true, list: false,
    text: "'עבודה חתוכה': ריצוף מאריחי אבן צבעוניים גדולים שנחתכו לצורות. רזולוציה נמוכה מפסיפס, אבל צבעוני מאוד.",
    site: "שברים מהר הבית — פרויקט סינון העפר בעמק צורים" },

  // ---- IX. purity ----
  { id: "mikveh", term: "מקוואות", chapter: "purity", lecture: true, list: true,
    text: "מתקן לטבילה כדי להיטהר מטומאה — לא כדי להתנקות. מופיע לראשונה בתקופה החשמונאית. חלקיו: מדרגות רחבות (לפעמים עם קו מפריד), בריכת טבילה ולעתים אוצר. כשר רק עם 40 סאה של מים שאינם שאובים.",
    site: "הרובע היהודי בירושלים; קומראן; מצדה; יריחו" },
  { id: "otzar", term: "אוצר", chapter: "purity", lecture: true, list: false,
    text: "בור של מי גשמים כשרים לצד המקווה. כשמי המקווה התלכלכו ממלאים אותו במים שאובים ופותחים את הפקק — המגע במי האוצר מכשיר אותם. נדיר בממצא." },
  { id: "stone-vessels", term: "כלי אבן", chapter: "purity", lecture: true, list: false,
    text: "כלי אבן אינם מקבלים טומאה, בניגוד לכלי חרס, מתכת ועץ. לכן נפוצים בסוף ימי בית שני — ואצל העשירים אפילו שולחנות אבן.",
    site: "הרובע ההרודיאני בירושלים" },

  // ---- X. burial ----
  { id: "burial", term: "מנהגי קבורה", chapter: "burial", lecture: true, list: true,
    text: "בית ראשון: קבורה ראשונה במערה, ואחר כך ליקוט העצמות למאספה המשפחתית. בית שני ואילך: קבורה ראשונה בכוך, בארקוסוליום או בסרקופג, וקבורה שנייה אישית — בכוך קטן או בגלוסקמה.",
    site: "קברי הסנהדרין; בית שערים" },
  { id: "kokhim", term: "קבורה בכוכים", chapter: "burial", lecture: true, list: true,
    text: "גומחות צרות ועמוקות שנחצבו בדופן מערת הקבורה, ופתחן נאטם. כוך ארוך — לגופה (קבורה ראשונה); קטן — לעצמות. הכוכים הקדומים בארץ: במערות הקבורה ההלניסטיות של מרשה; בירושלים מן התקופה החשמונאית.",
    site: "קברי הסנהדרין בירושלים (אפילו שתי קומות כוכים); מרשה" },
  { id: "arcosolium", term: "ארקוסוליום", latin: "arcosolium", chapter: "burial", lecture: true, list: false,
    text: "מדף חצוב שמעליו קשת (ארקוס). על מדף גדול הונחה גופה שלמה; על קטן — עצמות.",
    site: "קברי הסנהדרין" },
  { id: "ossuary", term: "גלוסקמאות", chapter: "burial", lecture: true, list: true,
    text: "תיבות קטנות (לרוב מאבן) לקבורה שנייה של העצמות. אורכן נקבע לפי עצם הירך, רוחבן לפי האגן וגובהן לפי הגולגולת. בירושלים מסוף המאה ה־1 לפנה״ס ועד החורבן; בגליל ובדרום — עוד כמאתיים שנה.",
    site: "גלוסקמאות מעוטרות במוזיאון ישראל" },
  { id: "sarcophagus", term: "סרקופג", latin: "sarcophagus", chapter: "burial", lecture: true, list: false,
    text: "ארון מתים גדול לגופה שלמה — 'אוכל הבשר' ביוונית. נדיר בבית שני, נפוץ בתקופות הרומית המאוחרת והביזנטית, אצל יהודים ואצל שאינם יהודים.",
    site: "בית שערים" },
  { id: "urna", term: "אורנה", latin: "urna", chapter: "burial", lecture: false, list: true,
    text: "כד או תיבה לאפר המת אחרי שריפת הגופה — המנהג הרומי הרווח עד המאה ה־2 לספירה, אז גברה הקבורה בגוף ובסרקופגים. יהודים לא שרפו את מתיהם." },
  { id: "nefesh", term: "קבר ונפש · מאוזוליאום", latin: "mausoleum", chapter: "burial", lecture: true, list: false,
    text: "מאוזוליאום — מבנה קבר מפואר. 'קבר' הוא המקום לגופה; 'נפש' — מבנה הנצחה לנשמה, מעליו או לידו. הבחנה מוכרת מחז״ל ומכתובות נבטיות.",
    site: "יד אבשלום — קבר חצוב ונפש בנויה; קבר בני חזיר" },
  { id: "in-antis", term: "דיסטילוס אין אנטיס", latin: "distylos in antis", chapter: "burial", lecture: true, list: false,
    text: "שני עמודים בין שתי מזוזות (אנטות) בחזית. בקבר בני חזיר — עמודים דוריים, ומעליהם כתובת שמונה את בני משפחת הכהנים בני חזיר: השם היחיד בנחל קדרון שמבוסס על ממצא.",
    site: "קבר בני חזיר בנחל קדרון" },

  // ---- XI. synagogues ----
  { id: "first-synagogues", term: "בתי הכנסת הראשונים", chapter: "synagogues", lecture: false, list: true,
    text: "מימי בית שני: אולם מלבני עם ספסלים מדורגים לאורך הקירות ועמודים — מתאים לקריאה בתורה וללימוד בציבור. בלי אפסיס ובלי פסיפס דמויות.",
    site: "גמלא, מצדה, הרודיון, מגדלא" },
  { id: "theodotus", term: "כתובת תיאודוטוס בן וטנוס", chapter: "synagogues", lecture: false, list: true,
    text: "כתובת יוונית שנמצאה בעיר דוד (חפירות ריימון וייל, 1913–1914). תיאודוטוס, כהן וראש כנסת, בן ונכד לראשי כנסת, בנה בית כנסת 'לקריאת התורה וללימוד המצוות' ואכסניה עם מתקני מים לבאים מחו״ל. עדות לבית כנסת בירושלים לפני החורבן ולתפקידיו.",
    site: "עיר דוד, ירושלים" },
  { id: "synagogue-types", term: "טיפוסי בתי הכנסת הקדומים", chapter: "synagogues", lecture: false, list: true,
    text: "גליליים — חזית מפוארת לירושלים ורצפת אבן (כפר נחום, ברעם); גולניים — בזלת (עין קשתות); דמויי כנסייה — אפסיס ופסיפס עם גלגל מזלות (בית אלפא); דרום הר חברון — אולם רחב, כניסה ממזרח (אשתמוע, סוסיא). השוני אזורי יותר משהוא כרונולוגי.",
    site: "כפר נחום; עין קשתות; בית אלפא; סוסיא" },
  { id: "zodiac", term: "גלגל המזלות בבתי הכנסת", chapter: "synagogues", lecture: false, list: true,
    text: "בתקופה הביזנטית: 12 המזלות במעגל, הליוס במרכבתו במרכז, ובפינות ארבע התקופות. המוקדם — בחמת טבריה (המאה ה־4), ואחריו ציפורי (5) ובית אלפא (6). בעין גדי — שמות המזלות בכתב בלבד.",
    site: "חמת טבריה; ציפורי; בית אלפא" },

  // ---- XII. churches ----
  { id: "basilica", term: "בסיליקה", latin: "basilica", chapter: "churches", lecture: true, list: true,
    text: "במקור מבנה ציבורי אזרחי — למסחר ולמשפט — לא כנסייה. אולם מוארך, מחולק בשתי שורות עמודים לתווך גבוה (נווה) ולשתי סטרות נמוכות, ובקצה אפסיס. מן המאה ה־4 אימצה אותו הנצרות.",
    site: "כורסי" },
  { id: "church-parts", term: "חלקי הבסיליקה", chapter: "churches", lecture: true, list: true,
    text: "אטריום (חצר), נרתקס (אולם מעבר — שם עמדו המתנצרים), תווך, סטרות, אפסיס מרכזי; ובצדדים: דיאקוניקון — לבגדי הכהונה, ופרותזיס — להכנת לחם הקודש.",
    site: "כורסי — שלוש אפסידות" },
  { id: "central-church", term: "כנסייה רכזית", chapter: "churches", lecture: true, list: true,
    text: "מבנה עגול או מתומן סביב מרכז מקודש — כנסיית הנצחה. השורש פגני (הפנתאון), וגם כיפת הסלע המוסלמית בנויה כך.",
    site: "כנסיית הקתיסמה; הרוטונדה בכנסיית הקבר" },
  { id: "spolia", term: "ספוליה", latin: "spolia", chapter: "churches", lecture: false, list: true,
    text: "'שלל': שימוש חוזר בפריטים אדריכליים ממבנים חרבים — עמודים, כותרות ומשקופים שנבנו לתוך מבנים חדשים. נפוץ מאוד בתקופה הביזנטית ואחריה.",
    site: "עמודים וכותרות משולבים במבנים מאוחרים בקיסריה ובירושלים" },
];

/** The assignment sheet, term by term — every one must have an entry above. */
export const ASSIGNMENT_TERMS = [
  "order", "triglyphs", "stylobate", "pedestal", "sacellum", "hypocaust", "caldarium", "urna", "meta", "acroteria",
  "munera", "stadium", "hippodrome", "bouleuterion", "theatre", "odeon", "amphitheatre", "nymphaeum", "latrina",
  "fresco", "secco", "stucco", "caesarea-aqueducts", "zodiac", "first-synagogues", "theodotus", "mikveh",
  "synagogue-types", "spolia", "theatre-parts", "milestones", "kokhim", "ossuary", "church-parts",
];

export function matchesArchTerm(term: ArchTerm, query: string) {
  const q = query.trim();
  if (!q) return true;
  return [term.term, term.latin ?? "", term.text, term.site ?? ""].join(" ").toLowerCase().includes(q.toLowerCase());
}
