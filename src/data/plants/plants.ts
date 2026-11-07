/**
 * צמחים לזיהוי בשטח: נתוני משחק הצמחים ומדריך השדה (LA-30). כתוב ביד.
 *
 * הבחירה: 28 צמחי החורש והבתה מהמשחק הקודם (רשימת הצומח של הקורס), ועוד הצמחים שהמבחנים שואלים
 * עליהם הכי הרבה: שבעת המינים, השקד, הקידה והלוטם, ועצי המדבר (אשל, שיטה, שיזף, רותם).
 * כל שדה קצר, כי המטרה היא לזהות בשטח ולא לקרוא ערך אנציקלופדי.
 *
 * - `sign`: הסימן שמזהה את הצמח במבט אחד. עד 90 תווים.
 * - `confuse`: צמחים שמתבלבלים איתם, ואיך מבדילים. המשחק בונה מהם שאלות "מי מהשניים".
 * - `where`: איפה פוגשים אותו בסיור (אזור או סוג אתר, לא נקודה מדויקת).
 * - `fact`: עובדה אחת שכדאי לספר בהדרכה, או שהמבחן שואל עליה.
 */

export type PlantGroup = "woodland-trees" | "riverside" | "batha" | "climbers" | "seven-species" | "desert" | "planted";

export type Plant = {
  id: string;
  name: string;
  sci: string;
  group: PlantGroup;
  habit: "ירוק-עד" | "נשיר" | "נשיר בקיץ" | "עשבוני חד-שנתי";
  sign: string;
  season: string;
  habitat: string;
  where: string;
  confuse: { with: string; how: string }[];
  fact: string;
};

export const PLANT_GROUPS: Record<PlantGroup, { title: string; blurb: string }> = {
  "woodland-trees": { title: "עצי החורש", blurb: "האלונים, האלות והחרוב: השלד של החורש הים-תיכוני." },
  riverside: { title: "לחוף המים", blurb: "עצים שצריכים מים זמינים כל השנה: ערוצים ונחלים איתנים." },
  batha: { title: "בתה וגריגה", blurb: "שיחים ובני-שיח נמוכים, ריחניים וקוצניים, בשטח הפתוח." },
  climbers: { title: "מטפסים", blurb: "צמחים שנתלים על העצים והשיחים בחורש." },
  "seven-species": { title: "שבעת המינים", blurb: "\"ארץ חיטה ושעורה וגפן ותאנה ורימון, ארץ זית שמן ודבש\" (דברים ח, ח)." },
  desert: { title: "מדבר ובקעה", blurb: "עצים ושיחים שעומדים בחום וביובש של הנגב, הערבה ובקעת הירדן." },
  planted: { title: "נטועים ופולשים", blurb: "מה שהאדם הביא: יערות, שדרות ומין פולש." },
};

export const PLANTS: Plant[] = [
  // ---- עצי החורש ----
  {
    id: "quercus-calliprinos", name: "אלון מצוי", sci: "Quercus calliprinos", group: "woodland-trees", habit: "ירוק-עד",
    sign: "עלים קטנים, קשים ומבריקים עם שוליים דוקרניים; בלוט בספלול קשקשי",
    season: "ירוק כל השנה; בלוטים בסתיו", habitat: "חורש ים-תיכוני בכל אזורי ההר",
    where: "הכרמל, הגליל, הרי ירושלים; עצים עתיקים ליד קברי קדושים",
    confuse: [
      { with: "quercus-ithaburensis", how: "אלון התבור נשיר, עליו גדולים ורכים יותר, וגדל בשפלה ובגליל התחתון" },
      { with: "quercus-boissieri", how: "אלון התולע נשיר, עליו רכים ומשוננים, וגדל בהרים הגבוהים" },
    ],
    fact: "העץ הנפוץ ביותר בחורש הים-תיכוני. אחרי כריתה הוא מתחדש מהגדם, ולכן רבים מהאלונים הם שיחים רב-גזעיים.",
  },
  {
    id: "quercus-ithaburensis", name: "אלון התבור", sci: "Quercus ithaburensis", group: "woodland-trees", habit: "נשיר",
    sign: "עץ גדול ורחב, עלים מוארכים עם שיניים חדות; ספלול עם קשקשים ארוכים ומתולתלים",
    season: "משיר בחורף, מתלבש באביב", habitat: "אזורים נמוכים וחמים: שפלה, גליל תחתון, מישור החוף",
    where: "יער אלוני אבא, רמת מנשה, הגליל התחתון",
    confuse: [{ with: "quercus-calliprinos", how: "האלון המצוי ירוק-עד, עליו קטנים וקשים, והספלול שלו קצר" }],
    fact: "יוצר \"יער פארק\": עצים גדולים ומרווחים, לרוב בשולי אזורים חקלאיים.",
  },
  {
    id: "quercus-boissieri", name: "אלון התולע", sci: "Quercus boissieri", group: "woodland-trees", habit: "נשיר",
    sign: "עלים רכים, משוננים ומוארכים, בהירים מלמטה; בלוט ארוך ודק",
    season: "משיר בחורף", habitat: "הרים גבוהים וקרירים",
    where: "הגליל העליון, הר מירון, רמת הגולן, החרמון",
    confuse: [{ with: "quercus-calliprinos", how: "האלון המצוי ירוק-עד, ועליו קשים ודוקרניים" }],
    fact: "מסמן את החורש של ההרים הגבוהים, שם החורף קר ורטוב.",
  },
  {
    id: "pistacia-palaestina", name: "אלה ארץ-ישראלית", sci: "Pistacia palaestina", group: "woodland-trees", habit: "נשיר",
    sign: "עלה מנוצה עם עלעל בקצה (מספר אי-זוגי); שלכת אדומה בסתיו; עפצים דמויי קרן",
    season: "שלכת אדומה בסתיו, ניצנים אדמדמים באביב", habitat: "חורש הררי, לצד האלון המצוי",
    where: "הכרמל, הגליל, הרי ירושלים",
    confuse: [
      { with: "pistacia-lentiscus", how: "אלת המסטיק ירוקת-עד, ובעלה שלה אין עלעל בקצה" },
      { with: "pistacia-atlantica", how: "לאלה האטלנטית ציר עלה מכונף ועלעלים קהים, והיא עץ גדול בודד" },
    ],
    fact: "שותפה של האלון המצוי בחבורה הנפוצה של החורש: \"אלון מצוי – אלה ארץ-ישראלית\".",
  },
  {
    id: "pistacia-atlantica", name: "אלה אטלנטית", sci: "Pistacia atlantica", group: "woodland-trees", habit: "נשיר",
    sign: "עץ גדול ורחב שעומד לבדו; עלה מנוצה עם ציר מכונף ועלעלים קהים",
    season: "משירה בחורף", habitat: "אזורים יבשים יחסית: עמקים, ספר המדבר",
    where: "רמת הגולן, הנגב הצפוני, הר הנגב",
    confuse: [{ with: "pistacia-palaestina", how: "לאלה הארץ-ישראלית אין ציר מכונף, והיא קטנה וגדלה בתוך החורש" }],
    fact: "עצים עתיקים ועצומים ממנה עומדים לבדם בשטח, לעיתים ליד קברים ומקומות קדושים.",
  },
  {
    id: "pistacia-lentiscus", name: "אלת המסטיק", sci: "Pistacia lentiscus", group: "woodland-trees", habit: "ירוק-עד",
    sign: "שיח ירוק-עד צפוף; עלה מנוצה בלי עלעל בקצה, עם ציר מכונף; ריח שרף",
    season: "פירות אדומים שמשחירים בסתיו", habitat: "שפלה, מישור החוף ומורדות ההרים, באזורים חמים",
    where: "השפלה, הכרמל, רכסי הכורכר",
    confuse: [
      { with: "pistacia-palaestina", how: "האלה הארץ-ישראלית נשירה, ובעלה שלה יש עלעל בקצה" },
      { with: "ceratonia-siliqua", how: "לחרוב עלעלים גדולים ועגולים ותרמילים ארוכים" },
    ],
    fact: "מהשרף שלה מפיקים מסטיק, ומכאן שמה.",
  },
  {
    id: "ceratonia-siliqua", name: "חרוב מצוי", sci: "Ceratonia siliqua", group: "woodland-trees", habit: "ירוק-עד",
    sign: "עלה מנוצה בלי עלעל בקצה, עלעלים עגולים ומבריקים; תרמילים חומים ארוכים",
    season: "פירות מבשילים בקיץ; פריחה בסתיו", habitat: "שפלה, כרמל וגליל תחתון, באזורים חמים",
    where: "השפלה, הכרמל, הגליל התחתון",
    confuse: [{ with: "pistacia-lentiscus", how: "לאלת המסטיק עלעלים צרים וציר מכונף, ואין לה תרמילים" }],
    fact: "יחידת המשקל \"קרט\" באה מהשם היווני של החרוב, שזרעיו שימשו משקולות.",
  },
  {
    id: "arbutus-andrachne", name: "קטלב מצוי", sci: "Arbutus andrachne", group: "woodland-trees", habit: "ירוק-עד",
    sign: "גזע חלק בצבע אדום-כתום שקליפתו מתקלפת בקיץ",
    season: "קליפה מתקלפת בקיץ; פריחה לבנה בחורף", habitat: "חורש הררי וסלעי",
    where: "הכרמל, הרי יהודה, הגליל",
    confuse: [{ with: "platanus-orientalis", how: "גם לדולב קליפה מתקלפת, אבל הוא נשיר, עליו דמויי כף יד, וגדל רק ליד מים" }],
    fact: "הגזע האדום והחלק מקנה לו את הכינוי \"העץ העירום\".",
  },
  {
    id: "cercis-siliquastrum", name: "כליל החורש", sci: "Cercis siliquastrum", group: "woodland-trees", habit: "נשיר",
    sign: "פריחה ורודה-סגולה צפופה על ענפים חשופים; עלים עגולים כמו לב",
    season: "פורח בסוף החורף ובתחילת האביב, לפני הלבלוב", habitat: "חורש הררי, לעיתים בגדות ערוצים",
    where: "הגליל, הכרמל, הרי ירושלים",
    confuse: [{ with: "prunus-dulcis", how: "פריחת השקד לבנה-ורודה ובאה עוד קודם, באמצע החורף" }],
    fact: "הפרחים יוצאים ישר מהענפים ואפילו מהגזע, לפני שיש עלים.",
  },
  {
    id: "pyrus-syriaca", name: "אגס סורי", sci: "Pyrus syriaca", group: "woodland-trees", habit: "נשיר",
    sign: "פריחה לבנה באביב; פירות קטנים בצורת אגס זעיר; לעיתים ענפים מסתיימים בקוץ",
    season: "פריחה באביב, פירות בקיץ", habitat: "חורש הררי",
    where: "הגליל, רמת הגולן",
    confuse: [{ with: "crataegus-aronia", how: "לעוזרר עלים מפורצים לאונות ופירות עגולים צהובים-כתומים" }],
    fact: "קרוב בר של האגס התרבותי.",
  },
  {
    id: "acer-obtusifolium", name: "אדר סורי", sci: "Acer obtusifolium", group: "woodland-trees", habit: "נשיר",
    sign: "עלים קטנים עם שלוש אונות; פרי כנפי זוגי",
    season: "משיר בחורף", habitat: "חורש לח בהרים",
    where: "הגליל העליון, הכרמל",
    confuse: [{ with: "platanus-orientalis", how: "עלי הדולב גדולים בהרבה ובעלי חמש אונות, והוא גדל רק ליד מים" }],
    fact: "הפרי הכנפי מסתחרר כמו מדחף כשהוא נופל, וכך הרוח מפזרת אותו.",
  },
  {
    id: "crataegus-aronia", name: "עוזרר קוצני", sci: "Crataegus aronia", group: "woodland-trees", habit: "נשיר",
    sign: "עלים מפורצים לאונות; ענפים קוצניים; פירות עגולים קטנים צהובים-כתומים",
    season: "פריחה לבנה באביב, פירות בסתיו", habitat: "שולי חורש ושטחים פתוחים בהרים",
    where: "הרי ירושלים, הגליל, הגולן",
    confuse: [{ with: "pyrus-syriaca", how: "לאגס הסורי עלים שלמים ופירות בצורת אגס" }],
    fact: "הפירות נאכלים, בטעם תפוח קמחי.",
  },
  {
    id: "styrax-officinalis", name: "לבנה רפואי", sci: "Styrax officinalis", group: "woodland-trees", habit: "נשיר",
    sign: "פרחים לבנים תלויים דמויי פעמון; עלים בהירים ושעירים מלמטה",
    season: "פורח באביב", habitat: "חורש מעורב",
    where: "הכרמל, הגליל",
    confuse: [{ with: "cercis-siliquastrum", how: "פריחת כליל החורש ורודה ויוצאת מענפים חשופים" }],
    fact: "פריחה לבנה ושופעת באביב, שבולטת בחורש הירוק.",
  },
  // ---- לחוף המים ----
  {
    id: "platanus-orientalis", name: "דולב מזרחי", sci: "Platanus orientalis", group: "riverside", habit: "נשיר",
    sign: "עלים גדולים דמויי כף יד; קליפה מתקלפת בכתמים; רק לצד מים",
    season: "משיר בחורף, שלכת צהובה", habitat: "גדות נחלים איתנים ומעיינות",
    where: "נחל דן, הבניאס, נחלי הגליל",
    confuse: [
      { with: "arbutus-andrachne", how: "גם לקטלב קליפה מתקלפת, אבל הוא ירוק-עד ועליו קטנים" },
      { with: "acer-obtusifolium", how: "לאדר עלים קטנים עם שלוש אונות, והוא לא תלוי במים" },
    ],
    fact: "מורה דרך שרואה דולב יודע שיש מים זורמים כל השנה.",
  },
  {
    id: "laurus-nobilis", name: "ער אציל", sci: "Laurus nobilis", group: "riverside", habit: "ירוק-עד",
    sign: "עלים מוארכים, עבים וריחניים (עלי הדפנה של המטבח)",
    season: "ירוק כל השנה", habitat: "ערוצים לחים ומוצלים",
    where: "ערוצי הכרמל והגליל",
    confuse: [{ with: "olea-europaea", how: "עלה הזית צר יותר, וצדו התחתון כסוף" }],
    fact: "ביוון וברומא עשו ממנו את \"זר הדפנה\" לכבוד המנצחים.",
  },
  // ---- בתה וגריגה ----
  {
    id: "sarcopoterium-spinosum", name: "סירה קוצנית", sci: "Sarcopoterium spinosum", group: "batha", habit: "נשיר בקיץ",
    sign: "בן-שיח נמוך וכדורי, צפוף בקוצים מסועפים",
    season: "פורח בסוף החורף; מאפיר ויבש בקיץ", habitat: "בתה פתוחה, השלב שאחרי חורש שנפגע",
    where: "כמעט בכל שטח הררי פתוח",
    confuse: [{ with: "calicotome-villosa", how: "הקידה גבוהה יותר ומתכסה בחורף בפריחה צהובה" }],
    fact: "שימשה להסקה ולגדרות. \"כקול הסירים תחת הסיר\" (קהלת ז, ו).",
  },
  {
    id: "calicotome-villosa", name: "קידה שעירה", sci: "Calicotome villosa", group: "batha", habit: "נשיר בקיץ",
    sign: "שיח קוצני שמתכסה בפריחה צהובה עזה",
    season: "פורחת בחורף ובתחילת האביב", habitat: "בתה, שולי חורש",
    where: "הכרמל, השפלה, הרי ירושלים",
    confuse: [{ with: "retama-raetam", how: "הרותם גדל במדבר ובחולות, פריחתו לבנה, ואין לו קוצים" }],
    fact: "הפריחה הצהובה שלה צובעת את המדרונות בחורף.",
  },
  {
    id: "rhamnus-lycioides", name: "אשחר ארץ-ישראלי", sci: "Rhamnus lycioides", group: "batha", habit: "ירוק-עד",
    sign: "שיח קוצני וסבוך עם עלים קטנים וצרים; פירות שחורים קטנים",
    season: "פירות בקיץ", habitat: "בתה, גריגה וחורש פתוח",
    where: "רוב אזורי הארץ",
    confuse: [{ with: "sarcopoterium-spinosum", how: "הסירה נמוכה וכדורית, והקוצים שלה מסועפים" }],
    fact: "הפירות מזון חשוב לציפורים, שמפיצות את הזרעים.",
  },
  {
    id: "cistus", name: "לוטם", sci: "Cistus creticus / C. salviifolius", group: "batha", habit: "ירוק-עד",
    sign: "פרחים גדולים קמוטים כמו נייר: ורודים (לוטם שעיר) או לבנים (לוטם מרווני)",
    season: "פורח באביב", habitat: "בתה ושולי חורש, במיוחד אחרי שריפה",
    where: "הכרמל, הגליל, הרי ירושלים",
    confuse: [{ with: "salvia-fruticosa", how: "פרחי המרווה קטנים, סגלגלים ושפתניים" }],
    fact: "מהראשונים שחוזרים לצמוח אחרי שריפה בחורש.",
  },
  {
    id: "majorana-syriaca", name: "אזוב מצוי", sci: "Majorana syriaca", group: "batha", habit: "ירוק-עד",
    sign: "בן-שיח אפרפר וריחני, עלים רכים ושעירים",
    season: "פורח בקיץ, פרחים לבנים קטנים", habitat: "בתה וסלעים, גם בקירות",
    where: "הרי יהודה, הגליל, הכרמל",
    confuse: [{ with: "coridothymus-capitatus", how: "לקורנית עלים קטנים מאוד ופרחים ורודים-סגולים" }],
    fact: "ה\"זעתר\". האזוב של התנ\"ך: שימש בטקסי טהרה ובמריחת הדם בליל יציאת מצרים.",
  },
  {
    id: "coridothymus-capitatus", name: "קורנית מקורקפת", sci: "Coridothymus capitatus", group: "batha", habit: "ירוק-עד",
    sign: "בן-שיח קטן וצפוף עם ראשי פרחים ורודים-סגולים",
    season: "פורחת בקיץ, כשרוב הבתה יבשה", habitat: "בתה נמוכה, כורכר וקירטון",
    where: "רכסי הכורכר בשרון, הרי ירושלים",
    confuse: [{ with: "majorana-syriaca", how: "לאזוב עלים גדולים ושעירים ופרחים לבנים" }],
    fact: "פורחת בלב הקיץ, ולכן חשובה מאוד לדבורים.",
  },
  {
    id: "salvia-fruticosa", name: "מרווה משולשת", sci: "Salvia fruticosa", group: "batha", habit: "ירוק-עד",
    sign: "עלים אפרפרים וריחניים, לעיתים עם שתי \"אוזניים\" בבסיס, כך שהעלה נראה משולש",
    season: "פורחת באביב, פרחים סגלגלים", habitat: "אזורים סלעיים ופתוחים",
    where: "הכרמל, הגליל, הרי ירושלים",
    confuse: [{ with: "majorana-syriaca", how: "לאזוב עלים שלמים, קטנים ושעירים יותר" }],
    fact: "ה\"מרמייה\" של התה.",
  },
  // ---- מטפסים ----
  {
    id: "smilax-aspera", name: "קיסוסית קוצנית", sci: "Smilax aspera", group: "climbers", habit: "ירוק-עד",
    sign: "מטפס קוצני עם עלים מבריקים דמויי לב או חץ; אשכולות פירות אדומים",
    season: "פירות בסתיו ובחורף", habitat: "חורש סבוך",
    where: "הכרמל, הגליל",
    confuse: [{ with: "asparagus-aphyllus", how: "לאספרג אין עלים רחבים, רק מחטים" }],
    fact: "נאחזת בקנוקנות ובקוצים, והופכת את החורש לסבך.",
  },
  {
    id: "asparagus-aphyllus", name: "אספרג החורש", sci: "Asparagus aphyllus", group: "climbers", habit: "ירוק-עד",
    sign: "מטפס או שיח קוצני בלי עלים רחבים, עם \"מחטים\" ירוקות דוקרניות",
    season: "נצרים צעירים בחורף", habitat: "תחת עצים ושיחים בחורש",
    where: "הכרמל, השפלה, הגליל",
    confuse: [{ with: "smilax-aspera", how: "לקיסוסית עלים רחבים ומבריקים" }],
    fact: "הנצרים הצעירים נאכלים, כמו אספרגוס.",
  },
  {
    id: "rubia-tenuifolia", name: "פואה מצויה", sci: "Rubia tenuifolia", group: "climbers", habit: "ירוק-עד",
    sign: "מטפס מחוספס שנדבק לבגדים, עלים בדורים מסביב לגבעול",
    season: "פירות שחורים בקיץ", habitat: "חורש ובתה",
    where: "רוב אזורי ההר",
    confuse: [{ with: "smilax-aspera", how: "לקיסוסית עלים מבריקים גדולים וקוצים" }],
    fact: "משורשי הפואה הפיקו בעבר צבע אדום לבדים.",
  },
  // ---- שבעת המינים ----
  {
    id: "triticum", name: "חיטה", sci: "Triticum", group: "seven-species", habit: "עשבוני חד-שנתי",
    sign: "שיבולת צפופה, ובזנים רבים בלי מלענים ארוכים",
    season: "קציר באביב (שבועות, \"חג הקציר\")", habitat: "שדות",
    where: "עמקים ושפלה",
    confuse: [{ with: "hordeum", how: "לשעורה מלענים ארוכים מאוד, ובשלה מוקדם יותר" }],
    fact: "שבועות הוא חג קציר החיטים ו\"חג הביכורים\".",
  },
  {
    id: "hordeum", name: "שעורה", sci: "Hordeum", group: "seven-species", habit: "עשבוני חד-שנתי",
    sign: "שיבולת עם מלענים ארוכים מאוד, כמו זקן",
    season: "מבשילה לפני החיטה, סביב פסח", habitat: "שדות, גם באזורים יבשים",
    where: "עמקים, שפלה, הנגב הצפוני",
    confuse: [{ with: "triticum", how: "לחיטה מלענים קצרים או שאין לה בכלל" }],
    fact: "קורבן העומר בפסח הובא משעורה, היבול הראשון של השנה.",
  },
  {
    id: "vitis-vinifera", name: "גפן", sci: "Vitis vinifera", group: "seven-species", habit: "נשיר",
    sign: "מטפס עם קנוקנות, עלים גדולים מחולקים לאונות, אשכולות ענבים",
    season: "בציר בקיץ", habitat: "כרמים בהר ובשפלה",
    where: "הרי יהודה, השפלה; גתות חצובות בסלע",
    confuse: [{ with: "ficus-carica", how: "התאנה היא עץ ולא מטפס, ואין לה קנוקנות" }],
    fact: "גתות חצובות בסלע הן מהממצאים החקלאיים הנפוצים בסיורים.",
  },
  {
    id: "ficus-carica", name: "תאנה", sci: "Ficus carica", group: "seven-species", habit: "נשיר",
    sign: "עלים גדולים מחוספסים עם 3–5 אונות; פירות בלי פרח נראה לעין",
    season: "פירות בקיץ", habitat: "מטעים, ליד מעיינות וחורבות",
    where: "ליד מעיינות וכפרים נטושים",
    confuse: [{ with: "vitis-vinifera", how: "לגפן קנוקנות, והיא מטפס" }],
    fact: "\"איש תחת גפנו ותחת תאנתו\" (מלכים א ה, ה): סמל לשלום וביטחון.",
  },
  {
    id: "punica-granatum", name: "רימון", sci: "Punica granatum", group: "seven-species", habit: "נשיר",
    sign: "פרחים אדומים-כתומים; פרי עגול עם \"כתר\" בקצה",
    season: "פריחה באביב, פרי בסתיו", habitat: "מטעים וגינות",
    where: "כפרים, מטעים",
    confuse: [{ with: "ficus-carica", how: "לתאנה עלים גדולים מחולקים לאונות ופרי בלי כתר" }],
    fact: "רימונים עיטרו את שולי מעיל הכוהן הגדול, והם מופיעים על מטבעות המרד הגדול.",
  },
  {
    id: "olea-europaea", name: "זית", sci: "Olea europaea", group: "seven-species", habit: "ירוק-עד",
    sign: "עלים צרים, ירוקים מלמעלה וכסופים מלמטה; גזע עבה ומפותל",
    season: "מסיק בסתיו", habitat: "מטעים וטרסות בהר ובשפלה",
    where: "כל אזורי ההר; בתי בד עתיקים",
    confuse: [{ with: "laurus-nobilis", how: "עלה הער רחב יותר, ירוק משני צדדיו וריחני" }],
    fact: "השמן היה מקור כלכלי מרכזי: מאור, מזון ומשיחה. בתי בד הם ממצא נפוץ באתרים.",
  },
  {
    id: "phoenix-dactylifera", name: "תמר", sci: "Phoenix dactylifera", group: "seven-species", habit: "ירוק-עד",
    sign: "דקל עם גזע אחד גבוה ועלים מנוצים ענקיים בצמרת; אשכולות תמרים",
    season: "תמרים בקיץ ובסתיו", habitat: "נאות מדבר ואזורים חמים עם מים",
    where: "עין גדי, יריחו, בקעת הירדן, הערבה",
    confuse: [{ with: "tamarix", how: "האשל הוא עץ עם עלים קשקשיים זעירים, לא דקל" }],
    fact: "ה\"דבש\" בשבעת המינים הוא דבש התמרים. הדקל מופיע על מטבעות \"יהודה השבויה\".",
  },
  // ---- מדבר ובקעה ----
  {
    id: "tamarix", name: "אשל", sci: "Tamarix", group: "desert", habit: "ירוק-עד",
    sign: "עלים קשקשיים זעירים שצמודים לענף; ענפים דקים ונוטפים",
    season: "פריחה ורודה או לבנה", habitat: "קרקע מלוחה וערוצים במדבר",
    where: "הנגב, הערבה, חוף ים המלח",
    confuse: [{ with: "pinus-halepensis", how: "לאורן מחטים ארוכות ואצטרובלים" }],
    fact: "\"ויטע אשל בבאר שבע\" (בראשית כא, לג). מפריש מלח מהעלים.",
  },
  {
    id: "acacia", name: "שיטה", sci: "Vachellia (Acacia) tortilis / raddiana", group: "desert", habit: "ירוק-עד",
    sign: "עץ מדבר עם נוף שטוח כמו מטרייה, קוצים זוגיים ועלים מנוצים זעירים",
    season: "פריחה צהובה; תרמילים מפותלים", habitat: "ערוצי מדבר, ערבה",
    where: "הערבה, נחלי אילת, ים המלח",
    confuse: [{ with: "ziziphus-spina-christi", how: "לשיזף עלים שלמים רחבים ופירות כתומים עגולים" }],
    fact: "\"עצי שיטים\" שמהם נבנו המשכן והארון. מזון חשוב לבעלי החיים במדבר.",
  },
  {
    id: "ziziphus-spina-christi", name: "שיזף מצוי", sci: "Ziziphus spina-christi", group: "desert", habit: "ירוק-עד",
    sign: "עלים שלמים מבריקים עם שלושה עורקים בולטים; קוצים זוגיים, אחד ישר ואחד מעוקל",
    season: "פירות כתומים קטנים (\"דום\") בסתיו", habitat: "אזורים חמים: בקעות ונאות מדבר",
    where: "בקעת בית שאן, בקעת הירדן, ים המלח",
    confuse: [{ with: "acacia", how: "לשיטה עלים מנוצים זעירים ונוף שטוח" }],
    fact: "על פי מסורת נוצרית ממנו נקלעה \"עטרת הקוצים\" של ישו, ומכאן שמו המדעי.",
  },
  {
    id: "retama-raetam", name: "רותם המדבר", sci: "Retama raetam", group: "desert", habit: "ירוק-עד",
    sign: "שיח עם ענפים ירוקים דקים כמעט בלי עלים; פריחה לבנה ריחנית",
    season: "פורח בסוף החורף", habitat: "חולות וערוצי מדבר",
    where: "הנגב, ערוצי מדבר יהודה, חולות החוף",
    confuse: [{ with: "calicotome-villosa", how: "לקידה פריחה צהובה וקוצים, והיא גדלה בהר" }],
    fact: "אליהו ישב \"תחת רותם אחד\" במדבר (מלכים א יט, ד).",
  },
  // ---- נטועים ופולשים ----
  {
    id: "pinus-halepensis", name: "אורן ירושלים", sci: "Pinus halepensis", group: "planted", habit: "ירוק-עד",
    sign: "מחטים דקות בזוגות; אצטרובלים חומים; נוף פתוח",
    season: "ירוק כל השנה", habitat: "גדל בר בכרמל ובגליל; נטוע ברוב היערות",
    where: "רוב יערות קק\"ל; בר בכרמל",
    confuse: [{ with: "cupressus-sempervirens", how: "לברוש עלים קשקשיים, צורה צרה וזקופה ואצטרובל כדורי קטן" }],
    fact: "העץ שנטעו הכי הרבה ביערות קק\"ל בעשורים הראשונים למדינה.",
  },
  {
    id: "cupressus-sempervirens", name: "ברוש מצוי", sci: "Cupressus sempervirens", group: "planted", habit: "ירוק-עד",
    sign: "עץ צר וזקוף כמו עמוד; עלים קשקשיים; אצטרובל כדורי קטן",
    season: "ירוק כל השנה", habitat: "נטוע כמעט בכל מקום",
    where: "שדרות במושבות, בתי עלמין, שוברי רוח",
    confuse: [{ with: "pinus-halepensis", how: "לאורן מחטים זוגיות ארוכות ונוף רחב" }],
    fact: "נטעו אותו כשובר רוח לאורך שדות ובשדרות של המושבות הראשונות.",
  },
  {
    id: "prunus-dulcis", name: "שקד", sci: "Prunus dulcis", group: "planted", habit: "נשיר",
    sign: "פריחה לבנה-ורודה על ענפים חשופים, באמצע החורף",
    season: "הראשון לפרוח: ינואר–פברואר, ט\"ו בשבט", habitat: "מטעים, וגם בר בהרים",
    where: "הרי ירושלים, הגליל",
    confuse: [{ with: "cercis-siliquastrum", how: "פריחת כליל החורש ורודה-סגולה ובאה מאוחר יותר" }],
    fact: "\"מקל שקד אני ראה\" (ירמיהו א, יא): השקד \"שוקד\", הראשון להתעורר.",
  },
  {
    id: "acacia-saligna", name: "שיטה כחלחלה (מכחילה)", sci: "Acacia saligna", group: "planted", habit: "ירוק-עד",
    sign: "שיח או עץ עם עלים מוארכים כחלחלים (לא מנוצים); פריחה צהובה כדורית",
    season: "פורחת באביב", habitat: "חולות מישור החוף, צדי כבישים",
    where: "מישור החוף, חולות ניצנים",
    confuse: [{ with: "acacia", how: "לשיטות המדבר עלים מנוצים זעירים וקוצים" }],
    fact: "מין פולש מאוסטרליה, שנטעו לייצוב חולות. היום הוא דוחק צמחי חולות מקומיים.",
  },
];

export const PLANT_BY_ID = new Map(PLANTS.map((plant) => [plant.id, plant]));
