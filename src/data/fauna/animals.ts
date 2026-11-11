/*
 * מגדיר החי והציפורים (LA-80/81). כתוב ביד, באותו מבנה כמו מגדיר הצמחים.
 *
 * הבחירה: בעלי החיים ששאלון החי והצומח של הקורס שואל עליהם (יעל, יחמור, נשר, תנשמת, דוכיפת,
 * צפע ואפעה, עגולשון, פסמון, עקצן, ארגמון ועוד), ועוד המינים שפוגשים בסיורים ובשמורות.
 * נבדק מול מחברת "החי בארץ ישראל" של הקורס ב-NotebookLM (11.11.2026). מין שאינו בשאלון ואינו
 * במחברת מסומן `extra: true` ומוצג עם תג "השלמה".
 */

export type AnimalGroup = "mammals" | "birds" | "reptiles" | "amphibians" | "invertebrates";
export type Region = "mediterranean" | "desert" | "wetland" | "sea" | "everywhere";

export type Animal = {
  id: string;
  name: string;
  sci: string;
  group: AnimalGroup;
  regions: Region[];
  /** הסימן שמזהה אותו במבט אחד. */
  sign: string;
  /** איפה ומתי פוגשים אותו בסיור. */
  where: string;
  /** מה כדאי לספר בהדרכה, או מה המבחן שואל. */
  fact: string;
  status?: "protected" | "endemic" | "reintroduced" | "invasive";
  confuse?: { with: string; how: string }[];
  extra?: boolean;
};

export const ANIMAL_GROUPS: Record<AnimalGroup, { title: string; icon: string }> = {
  mammals: { title: "יונקים", icon: "🦌" },
  birds: { title: "ציפורים", icon: "🪶" },
  reptiles: { title: "זוחלים", icon: "🦎" },
  amphibians: { title: "דו־חיים", icon: "🐸" },
  invertebrates: { title: "חסרי חוליות", icon: "🦂" },
};

export const REGIONS: Record<Region, string> = {
  mediterranean: "החבל הים־תיכוני", desert: "מדבר ובקעה", wetland: "מים וביצות", sea: "הים והחוף", everywhere: "בכל הארץ",
};

export const STATUS_LABEL: Record<NonNullable<Animal["status"]>, string> = {
  protected: "מוגן", endemic: "אנדמי", reintroduced: "הושב לטבע", invasive: "פולש",
};

export const ANIMALS: Animal[] = [
  // ---- יונקים ----
  {
    id: "nubian-ibex", name: "יעל נובי", sci: "Capra nubiana", group: "mammals", regions: ["desert"], status: "protected",
    sign: "עז בר על מצוקים; לזכר קרניים ארוכות מקושתות לאחור עם טבעות בולטות וזקן",
    where: "עין גדי ולאורך מצוק ההעתקים, מכתש רמון ושדה בוקר; בשעות הבוקר והערב",
    fact: "שני זכרים שנאבקים על נקבה הם תחרות תוך־מינית. הקרניים הגדולות הן דוגמה לעיקרון ההכבדה.",
    confuse: [{ with: "mountain-gazelle", how: "לצבי קרניים דקות וישרות יחסית, גוף דק ורגליים ארוכות, והוא רץ במישור ולא מטפס על מצוקים" }],
  },
  {
    id: "mountain-gazelle", name: "צבי ארץ־ישראלי", sci: "Gazella gazella", group: "mammals", regions: ["mediterranean"], status: "protected",
    sign: "איילה דקה בגוון חום־צהבהב, פס כהה לאורך הצד וזנב קצר; קרניים דקות",
    where: "עמק האלה, רמת מנשה, גבעות השפלה ושולי ירושלים; בשדות פתוחים בבוקר",
    fact: "\"צבי\" הוא השם העברי המקראי (\"ארץ הצבי\"), ומכאן גם הכינוי של ארץ ישראל.",
  },
  {
    id: "persian-fallow-deer", name: "יחמור פרסי", sci: "Dama mesopotamica", group: "mammals", regions: ["mediterranean"], status: "reintroduced",
    sign: "אייל בינוני עם כתמים לבנים על גב חום; לזכר קרניים רחבות דמויות כף",
    where: "נחל כזיב והרי ירושלים, באזורי ההשבה",
    fact: "ההשבה לטבע בישראל החלה ב-1996, בנחל כזיב ובהרי ירושלים. לאיילים קרניים מסועפות שנושרות ומתחלפות כל שנה.",
  },
  {
    id: "rock-hyrax", name: "שפן סלעים", sci: "Procavia capensis", group: "mammals", regions: ["mediterranean", "desert"],
    sign: "יונק קטן ועגלגל בגודל ארנבת, בלי זנב, יושב בקבוצות על סלעים",
    where: "עין גדי, נחל דוד, הכרמל ושוליים סלעיים בכל הארץ",
    fact: "השפן אינו מכרסם, למרות המראה. \"סלעים מחסה לשפנים\" (תהילים קד).",
  },
  {
    id: "striped-hyena", name: "צבוע מפוספס", sci: "Hyaena hyaena", group: "mammals", regions: ["mediterranean", "desert"], status: "protected",
    sign: "גב משופע, רעמה זקורה ופסים כהים על רגליים בהירות; פעיל בלילה",
    where: "נדיר לראות; עקבות ומאורות ברמת הגולן, במדבר יהודה ובנגב",
    fact: "אוכל נבלות. צבוע שמגרש נשר מפגר הוא תחרות בין־מינית. טורף, אבל לא ממשפחת הכלביים. כמעט לא רואים אותו, ולכן מדריכים עליו מן העקבות וסימני השדה.",
  },
  {
    id: "golden-jackal", name: "תן זהוב", sci: "Canis aureus", group: "mammals", regions: ["mediterranean", "wetland"],
    sign: "כלב בר בגוון זהוב־אפרפר, זנב קצר עם קצה כהה; יללות בלהקה בערב",
    where: "עמק החולה, עמקי הצפון ושולי יישובים; נשמע יותר משנראה",
    fact: "דוגמה ל\"מין מתפרץ\": מין מקומי שהתרבה מאוד בגלל האדם (לולים, רפתות, שדות ואשפה), ועכשיו פוגע במינים שסביבו, כמו החוגלה.",
    confuse: [{ with: "red-fox", how: "לשועל זנב ארוך ועבות, אוזניים גדולות ומחודדות וגוף קטן יותר; הוא נראה לרוב לבדו" }],
  },
  {
    id: "red-fox", name: "שועל מצוי", sci: "Vulpes vulpes", group: "mammals", regions: ["everywhere"],
    sign: "גוף קטן וזנב ארוך ועבות, אוזניים גדולות ומחודדות; לרוב לבדו",
    where: "בכל הארץ, גם בפארקים ובשולי ערים; בדמדומים",
    fact: "\"שועלים הלכו בו\" (איכה ה, יח): הר הבית החרב.",
  },
  {
    id: "fat-sand-rat", name: "פסמון", sci: "Psammomys obesus", group: "mammals", regions: ["desert"],
    sign: "מכרסם מדברי חום־צהבהב עם זנב קצר וקצה כהה, ליד שיחי מלוח",
    where: "הערבה, ים המלח והנגב, ליד שיחי מלחית ומלוח",
    fact: "צמחוני מובהק. מפריש גללים יבשים כדי לחסוך במים: דוגמה להתאמה פיזיולוגית.",
  },
  {
    id: "fruit-bat", name: "עטלף פירות מצוי", sci: "Rousettus aegyptiacus", group: "mammals", regions: ["mediterranean"], status: "protected",
    sign: "עטלף גדול עם פנים של כלב קטן ועיניים גדולות; להקות במערות",
    where: "מערות ובתי קברות עתיקים, ובערב סביב עצי פרי בערים",
    fact: "מוגן בחוק. בעבר נפגע קשות מהרעלות במערות, שכוונו נגדו כמזיק חקלאי.",
  },
  {
    id: "onager", name: "ערוד", sci: "Equus hemionus", group: "mammals", regions: ["desert"], status: "reintroduced",
    sign: "חמור בר חום־בהיר עם בטן לבנה ופס כהה לאורך הגב",
    where: "מכתש רמון ומרכז הנגב; ובחי־בר יטבתה",
    fact: "הושב לטבע מחי־בר יטבתה, שמטרתו להשיב לטבע חיות מדבר שנכחדו מן הארץ.",
  },
  {
    id: "arabian-oryx", name: "ראם לבן", sci: "Oryx leucoryx", group: "mammals", regions: ["desert"], status: "reintroduced",
    sign: "אנטילופה לבנה עם קרניים ארוכות וישרות לגמרי ופנים בדוגמה שחורה",
    where: "הערבה ונחל עשן; ובחי־בר יטבתה",
    fact: "אחד המינים שחי־בר יטבתה השיב לטבע.",
    extra: true,
  },
  // ---- ציפורים ----
  {
    id: "hoopoe", name: "דוכיפת", sci: "Upupa epops", group: "birds", regions: ["everywhere"],
    sign: "ציפור כתומה עם כנפיים בפסים שחורים־לבנים, מקור ארוך ומעוקל וכרבולת שנפתחת כמניפה",
    where: "בכל הארץ: מדשאות, פרדסים ופארקים; מחפשת מזון בקרקע",
    fact: "הציפור הלאומית של ישראל.",
  },
  {
    id: "griffon-vulture", name: "נשר מקראי", sci: "Gyps fulvus", group: "birds", regions: ["mediterranean", "desert"], status: "protected",
    sign: "דורס ענק, מוטת כנפיים של כ-2.5 מטר, ראש וצוואר לבנבנים בלי נוצות; דואה בלי לנפנף",
    where: "גמלא, נחל עמוד, הכרמל ועין גדי; דאייה מעל מצוקים בשעות החמות",
    fact: "ניזון מפגרי בעלי חיים. שמורת גמלא ידועה במושבת נשרים מקננת.",
  },
  {
    id: "barn-owl", name: "תנשמת", sci: "Tyto alba", group: "birds", regions: ["mediterranean", "wetland"],
    sign: "ינשוף לבן עם פנים בצורת לב; פעיל בלילה",
    where: "עמק החולה, עמק יזרעאל ושדות; בתיבות קינון בשדות",
    fact: "משמשת בחקלאות להדברה ביולוגית של מכרסמים, במקום רעלים.",
  },
  {
    id: "common-crane", name: "עגור אפור", sci: "Grus grus", group: "birds", regions: ["wetland"],
    sign: "ציפור גבוהה ואפורה עם צוואר ארוך, כתם שחור־לבן בראש ונקודה אדומה; להקות של אלפים",
    where: "אגמון החולה, מאוקטובר עד מרץ",
    fact: "עוף דואה: נודד ביום, מעל היבשה, ונישא על זרמי אוויר חם (תרמיקות). ישראל היא צוואר בקבוק יבשתי בין אירופה, אסיה ואפריקה, ולכן הנדידה כאן מרשימה כל כך.",
  },
  {
    id: "white-stork", name: "חסידה לבנה", sci: "Ciconia ciconia", group: "birds", regions: ["wetland", "everywhere"],
    sign: "ציפור לבנה גדולה עם קצות כנפיים שחורים ומקור ורגליים אדומים; להקות דואות",
    where: "בעמקים בסתיו ובאביב, בזמן הנדידה",
    fact: "\"גם חסידה בשמים ידעה מועדיה\" (ירמיהו ח, ז): הנדידה כבר בתנ\"ך.",
  },
  {
    id: "white-pelican", name: "שקנאי מצוי", sci: "Pelecanus onocrotalus", group: "birds", regions: ["wetland"],
    sign: "ציפור מים לבנה וענקית עם שק עור צהוב מתחת למקור",
    where: "בריכות הדגים בעמק החולה ובעמק בית שאן, בסתיו ובאביב",
    fact: "עוף דואה שנודד ביום על התרמיקות. חוצה את הארץ בלהקות גדולות, ונעצר לאכול בבריכות הדגים.",
  },
  {
    id: "tristram-starling", name: "טריסטרמית", sci: "Onychognathus tristramii", group: "birds", regions: ["desert"],
    sign: "ציפור שחורה מבריקה עם כתם כתום בכנפיים, שנראה בעיקר בתעופה; שריקות חזקות",
    where: "עין גדי, מצדה ונחלי ים המלח; קרובה מאוד למבקרים",
    fact: "קרויה על שם הנרי טריסטרם, חוקר הטבע האנגלי שתיעד את ארץ ישראל במאה ה-19.",
    extra: true,
  },
  {
    id: "white-throated-kingfisher", name: "שלדג לבן־חזה", sci: "Halcyon smyrnensis", group: "birds", regions: ["wetland", "mediterranean"],
    sign: "ציפור כחולה בוהקת עם חזה לבן, ראש חום ומקור אדום גדול",
    where: "ליד מים ושדות בצפון ובמרכז; יושב על חוטי חשמל",
    fact: "נציג של האזור האוריינטלי (המזרחי): אחד משלושת השלדגים בארץ, כל אחד מאזור זואוגיאוגרפי אחר. ניזון לא רק מדגים אלא גם מלטאות, חרקים ועכברים.",
  },
  {
    id: "white-spectacled-bulbul", name: "בולבול ממושקף", sci: "Pycnonotus xanthopygos", group: "birds", regions: ["everywhere"],
    sign: "ציפור שיר חומה־אפורה עם ראש כהה, טבעת לבנה סביב העין וכתם צהוב מתחת לזנב",
    where: "בכל הארץ, בגינות ובפארקים; שירה חזקה ורועשת",
    fact: "מהציפורים הנפוצות ביותר בארץ.",
    extra: true,
  },
  // ---- זוחלים ----
  {
    id: "palestine-viper", name: "צפע ארץ־ישראלי", sci: "Daboia palaestinae", group: "reptiles", regions: ["mediterranean"], status: "endemic",
    sign: "נחש עבה עם ראש משולש ורחב ודוגמת זיגזג כהה לאורך הגב",
    where: "בכל שטחה הלא מדברי של ישראל: שדות, חורש וגינות; פעיל בלילות הקיץ",
    fact: "הנחש הארסי הנפוץ בארץ. לנחש ארסי שיני ארס קדמיות ומזרקיות.",
    confuse: [{ with: "saw-scaled-viper", how: "האפעה קטנה ודקה יותר, צבעונית ומדברית; הצפע נפוץ בחבל הים־תיכוני" }],
  },
  {
    id: "saw-scaled-viper", name: "אפעה מגוונת", sci: "Echis coloratus", group: "reptiles", regions: ["desert"],
    sign: "נחש קטן וצבעוני בגוני אדום, אפור וחום עם כתמים בהירים",
    where: "מדבר יהודה, הנגב והערבה; בין סלעים",
    fact: "הצפע נפוץ בחבל הים־תיכוני והאפעה מדברית: כך מבדילים ביניהם במבחן.",
    confuse: [{ with: "palestine-viper", how: "הצפע עבה וגדול יותר, עם זיגזג כהה לאורך הגב, וחי בחבל הים־תיכוני" }],
  },
  {
    id: "starred-agama", name: "חרדון מצוי", sci: "Stellagama stellio", group: "reptiles", regions: ["mediterranean"],
    sign: "לטאה מחוספסת ושטוחה עם קשקשים קוצניים, משתזפת על סלעים וקירות",
    where: "בכל אתר עתיקות בחבל הים־תיכוני, על קירות אבן",
    fact: "זוחל ולא דו־חי, ולכן אין לו גלגול: מהביצה בוקע חרדון קטן.",
  },
  {
    id: "chameleon", name: "זיקית מצויה", sci: "Chamaeleo chamaeleon", group: "reptiles", regions: ["mediterranean"],
    sign: "לטאה ירוקה עם עיניים שזזות כל אחת לחוד, זנב מסתלסל ולשון ארוכה",
    where: "בשיחים ובגינות בחבל הים־תיכוני; איטית ומוסווית",
    fact: "משנה צבע בעיקר כדי לתקשר ולווסת חום, לא רק כדי להסתוות.",
  },
  {
    id: "spur-thighed-tortoise", name: "צב יבשה מצוי", sci: "Testudo graeca", group: "reptiles", regions: ["mediterranean"], status: "protected",
    sign: "צב יבשה עם שריון מקומר בגוני צהוב וחום",
    where: "בשטחים פתוחים בחבל הים־תיכוני, באביב",
    fact: "ערך טבע מוגן. אין לקחת צבים מהטבע.",
  },
  {
    id: "loggerhead-turtle", name: "צב ים חום", sci: "Caretta caretta", group: "reptiles", regions: ["sea"], status: "protected",
    sign: "צב ים גדול עם ראש רחב ושריון חום־אדמדם",
    where: "חופי הים התיכון; מקנן על החוף בקיץ",
    fact: "זוחל ולא דו־חי, כי אין לו גלגול. הנקבות עולות לחוף רק כדי להטיל ביצים: נדידה למטרת רבייה בלבד. רשות הטבע והגנים מגדרת את הקינים ומעבירה ביצים לחוות צבי ים במכמורת.",
  },
  // ---- דו־חיים ----
  {
    id: "hula-painted-frog", name: "עגולשון שחור־גחון", sci: "Latonia nigriventer", group: "amphibians", regions: ["wetland"], status: "endemic",
    sign: "צפרדע עם גחון שחור מנוקד בלבן",
    where: "שמורת החולה בלבד",
    fact: "הוכרז כנכחד אחרי ייבוש החולה, והתגלה מחדש ב-2011. דו־חיים עוברים גלגול, וזה מה שמבדיל אותם מזוחלים.",
  },
  {
    id: "fire-salamander", name: "סלמנדרה כתומה", sci: "Salamandra infraimmaculata", group: "amphibians", regions: ["mediterranean"], status: "protected",
    sign: "דו־חי שחור עם כתמים צהובים־כתומים, פעיל בלילות גשומים",
    where: "הכרמל והגליל העליון, ליד מעיינות ובריכות חורף",
    fact: "דו־חי ולא זוחל. מגוון הדו־חיים בארץ נמוך, כי היא יובשנית ומקורות מים רבים יובשו או זוהמו.",
  },
  // ---- חסרי חוליות ----
  {
    id: "yellow-scorpion", name: "עקצן צהוב", sci: "Leiurus hebraeus", group: "invertebrates", regions: ["desert"],
    sign: "עקרב צהוב־בהיר דק, עם צבתות דקות וזנב ארוך",
    where: "מדבר יהודה, הנגב והערבה, מתחת לאבנים",
    fact: "עקרב ארסי ומסוכן. הארס הוא דוגמה להתאמה פיזיולוגית. כל העקרבים ארסיים, אבל רק מעטים מסוכנים לאדם.",
  },
  {
    id: "murex", name: "ארגמון", sci: "Bolinus brandaris", group: "invertebrates", regions: ["sea"],
    sign: "חילזון ים עם קונכייה קוצנית ו\"זנב\" ארוך",
    where: "חופי הים התיכון",
    fact: "חילזון התכלת והארגמן: ממנו הפיקו את הצבע היקר בעת העתיקה. רכיכות אוכלות בעזרת משננת.",
  },
];
