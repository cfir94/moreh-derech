/**
 * ספריית הווידאו של מורי דרך — מקורות לימוד שמופו לפי רשימת הסיכומים של אפרת נקש.
 * מבנה הנתונים מופרד מהממשק כדי לאפשר עדכון, אימות והרחבה של מקורות ללא שינוי בתצוגה.
 */
export type VideoKind = "video" | "playlist";
export type TopicTone = "teal" | "blue" | "violet" | "gold" | "rose";

export type VideoSubtopic = {
  id: string;
  title: string;
  description: string;
  tone: TopicTone;
};

export type VideoItem = {
  id: string;
  title: string;
  description: string;
  type: VideoKind;
  embedUrl: string;
  directUrl: string;
  source: string;
  recommendedByCoordinator?: boolean;
  embedRestricted?: boolean;
  externalProvider?: string;
  subtopic?: VideoSubtopic;
};

export type VideoGroup = {
  id: string;
  category: string;
  intro: string;
  accent: "teal" | "blue" | "violet" | "gold";
  items: VideoItem[];
};

function playlist(
  id: string,
  title: string,
  description: string,
  list: string,
  source: string,
  recommendedByCoordinator = false,
  embedRestricted = false,
): VideoItem {
  return {
    id,
    title,
    description,
    type: "playlist",
    embedUrl: `https://www.youtube.com/embed/videoseries?list=${list}`,
    directUrl: `https://www.youtube.com/playlist?list=${list}`,
    source,
    ...(recommendedByCoordinator ? { recommendedByCoordinator } : {}),
    ...(embedRestricted ? { embedRestricted } : {}),
  };
}

function externalSeries(
  id: string,
  title: string,
  description: string,
  directUrl: string,
  source: string,
  externalProvider: string,
  recommendedByCoordinator = false,
): VideoItem {
  return {
    id,
    title,
    description,
    type: "playlist",
    embedUrl: directUrl,
    directUrl,
    source,
    embedRestricted: true,
    externalProvider,
    ...(recommendedByCoordinator ? { recommendedByCoordinator } : {}),
  };
}

function video(
  id: string,
  title: string,
  description: string,
  youtubeId: string,
  source: string,
): VideoItem {
  return {
    id,
    title,
    description,
    type: "video",
    embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    directUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    source,
  };
}

const rawVideoGroups: VideoGroup[] = [
  {
    id: "history-jerusalem",
    category: "היסטוריה וירושלים",
    intro: "מן המקרא ועד מדינת ישראל: תקופות, עליות, מלחמות ושכבותיה של ירושלים.",
    accent: "teal",
    items: [
      playlist(
        "ancient-jewish-history",
        "קיצור תולדות העם היהודי בעת העתיקה",
        "סדרת אנימציה ממוקדת על תקופות בית ראשון, שיבת ציון וימי בית שני.",
        "PLEREG-oChOzAusmCfk579R1BBK7b6f44j",
        "איך - ככה",
      ),
      playlist(
        "land-of-israel-through-ages",
        "ארץ ישראל לאורך הדורות",
        "סדרת הרצאות אקדמיות על התקופות השונות בתולדות הארץ.",
        "PL-0uvNlrXN3FJqttXR7LctYcKDEhFh9i5",
        "יד יצחק בן-צבי",
      ),
      playlist(
        "jerusalem-myth-history-reality",
        "ירושלים: מיתוס, היסטוריה ומציאות",
        "סדרה על תולדות ירושלים, אתריה המרכזיים ושכבותיה ההיסטוריות.",
        "PL-0uvNlrXN3E_KNIdzmsTCh8RLwzvOUIv",
        "יד יצחק בן-צבי",
      ),
      playlist(
        "zionism-aliyot-nation-building",
        "ציונות, עליות ובניין האומה",
        "סדרת הרצאות על הציונות, גלי העלייה ועיצוב היישוב והמדינה.",
        "PL-0uvNlrXN3FWVoZKOM1sP3i_KtEfNmRe",
        "יד יצחק בן-צבי",
      ),
      playlist(
        "modern-israel-events-wars",
        "מדינת ישראל: מלחמות, אירועים מכוננים והיסטוריה מודרנית",
        "סדרת מבוא לנקודות ציון בהיסטוריה של מדינת ישראל.",
        "PL-0uvNlrXN3GVkz8pwqbmJpIbMG3rgjXi",
        "יד יצחק בן-צבי",
      ),
      playlist(
        "philosophy-and-holocaust",
        "פילוסופיה והשואה",
        "סדרה לימודית של יד ושם המציעה זווית עיונית להוראת השואה.",
        "PLVA6iCeBK_XJFxrHWdB-ExkN0byV4oN9w",
        "יד ושם",
      ),
    ],
  },
  {
    id: "archaeology",
    category: "ארכאולוגיה ועתיקות",
    intro: "פרהיסטוריה, תקופות קלאסיות וימי הביניים דרך ממצאים, חפירות והרצאות חוקרים.",
    accent: "gold",
    items: [
      externalSeries(
        "tohu-va-vohu",
        "והארץ הייתה תוהו ובוהו — כל הפרקים",
        "סדרת התעודה הרשמית של כאן 11: 15 פרקים על תולדות ארץ ישראל, מן הפרהיסטוריה ועד התקופה העותמאנית.",
        "https://www.kan.org.il/content/kan/kan-11/p-13894/",
        "כאן 11 · המלצת רכז הקורס",
        "כאן 11",
        true,
      ),
      playlist(
        "ancient-israel-finkelstein",
        "מסע אל ישראל הקדום עם פרופ׳ ישראל פינקלשטיין",
        "סדרת הרצאות מעמיקה על ארכאולוגיה מקראית, תקופות הברונזה והברזל.",
        "PL2pjBEgMLrHVdP-1FuHw0EB_IBbIY8HWF",
        "Alex Tseitlin · פרופ׳ ישראל פינקלשטיין",
      ),
      playlist(
        "second-temple-mishnah-talmud",
        "ארכיאולוגיה של החברה היהודית בבית שני, המשנה והתלמוד",
        "מבט היסטורי וארכאולוגי על היישוב היהודי בארץ בתקופות הקלאסיות.",
        "PLLZDwCnPvAhJoji7bxUNurUJkXlc1uH13",
        "אוניברסיטת בר-אילן",
      ),
      playlist(
        "beneath-the-surface",
        "מתחת לפני השטח",
        "תגליות, חפירות וסיפורים מאתרי עתיקות ברחבי הארץ.",
        "PLudCzAmVjuKytfQ8BV85yjGcZLZ2vh2wD",
        "רשות העתיקות",
      ),
      playlist(
        "city-of-david-tour-guides",
        "השתלמות מורי דרך — עיר דוד",
        "סרטוני העשרה למדריכים על חידושים ארכאולוגיים בירושלים הקדומה.",
        "PLk3tL9beKyZAlBR7hsNx5sKRhiff8iOXU",
        "עיר דוד",
      ),
      playlist(
        "crusader-period",
        "התקופה הצלבנית: 1099 עד 1261 לספירה",
        "קורס על מסעי הצלב, ממלכת ירושלים והביצורים הצלבניים.",
        "PLplBWgJ5vvWUEbElgQ5-ICp9SSma1SYEK",
        "מבוא לגיאוגרפיה היסטורית",
      ),
      playlist(
        "tour-guide-secrets",
        "הסודות של מורי דרך",
        "הסכת מצולם על המקומות, הסיפורים והזוויות שמורי דרך מכירים.",
        "PL-0uvNlrXN3EDsvOLBt0gXUMBPxuGVhso",
        "יד יצחק בן-צבי",
      ),
    ],
  },
  {
    id: "religions-communities",
    category: "דתות, עדות ואתרי קודש",
    intro: "יהדות, נצרות, אסלאם, מיעוטים ואתרי מפתח בבית לחם, יריחו וירושלים.",
    accent: "violet",
    items: [
      playlist(
        "christianity-holy-land",
        "קורס תולדות הנצרות בארץ הקודש",
        "סדרת השיעורים המקיפה של יסכה הרני להכשרת מורי דרך.",
        "PLkq8REMVTTdfOHkrIJINV6RnkWBDyMMpL",
        "יסכה הרני",
      ),
      playlist(
        "christian-communities-rossing",
        "נוצרים ונצרות בארץ",
        "שיעורים על הקהילות הנוצריות בירושלים ובארץ.",
        "PL2Z8w9-b0bWXkzcT3O-0iLgPJKcB73Gke",
        "מרכז רוסינג · חנה בנדקובסקי",
      ),
      playlist(
        "religions-and-beliefs",
        "דתות ואמונות: יהדות, נצרות, אסלאם ופגאניזם",
        "הרצאות על דתות ואמונות במרחב הארץ־ישראלי.",
        "PL-0uvNlrXN3GDwjtO-x4De6CS0C4-xpgp",
        "יד יצחק בן-צבי",
      ),
      playlist(
        "early-muslim-period",
        "התקופה המוסלמית המוקדמת בירושלים",
        "מן הכיבוש המוסלמי ועד התקופה הצלבנית, כולל הר הבית.",
        "PLplBWgJ5vvWV21vTIFQOPzlO5_64C2VRQ",
        "מבוא לגיאוגרפיה היסטורית",
      ),
      video(
        "druze-in-brief",
        "הדרוזים בקיצור",
        "הסבר על מוצא העדה, עיקרי האמונה וההיסטוריה שלה באזור.",
        "SdNL1l1xWgw",
        "הדרך הקלה",
      ),
      video(
        "mount-gerizim-samaritans",
        "הר גריזים והעיר השומרונית האבודה",
        "הרצאה על תולדות השומרונים והממצאים בהר גריזים.",
        "gBfxngMeH0c",
        "המחלקה ללימודי ארץ ישראל",
      ),
      video(
        "bahai-faith",
        "הדת הבהאית: ממשיחיות שיעית לדת עולמית",
        "הרצאה על הדת הבהאית ומרכזיה בארץ.",
        "hzSNh1sfvJk",
        "ד״ר שי רוזן",
      ),
      video(
        "bethlehem-nativity-church",
        "כנסיית המולד בבית לחם — יום עיון",
        "יום עיון על ההיסטוריה, הארכאולוגיה והשימור של כנסיית המולד.",
        "MJrO8Kab21s",
        "יד יצחק בן-צבי",
      ),
      video(
        "jericho-winter-palaces",
        "שימור ארמונות החורף ביריחו",
        "הרצאה על הארכאולוגיה והשימור של ארמונות הורדוס ביריחו.",
        "YgGELombfJQ",
        "רשות העתיקות",
      ),
    ],
  },
  {
    id: "art-architecture",
    category: "אמנות ואדריכלות",
    intro: "קריאת סגנונות, מבנים ויצירה מן העת העתיקה, דרך דתות הארץ ועד אמנות ישראלית.",
    accent: "blue",
    items: [
      playlist(
        "jewish-culture-and-creation",
        "תרבות יהודית ויצירה",
        "הרצאות על תרבות יהודית, יצירה וחומרי מורשת.",
        "PL-0uvNlrXN3HzpdqRHuG2inBP6UyO1Y7D",
        "יד יצחק בן-צבי",
      ),
      playlist(
        "jewish-communities-east",
        "קהילות ישראל במזרח",
        "סדרה על קהילות יהודיות, מורשתן ותרבותן החזותית.",
        "PL-0uvNlrXN3GEqe2i3HT49uBHsHaW1qFx",
        "יד יצחק בן-צבי",
      ),
      playlist(
        "jewish-art-lectures",
        "הרצאות המחלקה לאמנות יהודית",
        "הרצאות מחקריות על אמנות יהודית, דימויים, חפצים ותרבות חזותית.",
        "PL2IBVOfC7KeQDt-s5KbYb-Ca0hvxGdZMY",
        "המחלקה לאמנות יהודית",
      ),
      playlist(
        "israeli-modern-art",
        "של מי הצבר הזה: הזכות לדיאלוג",
        "הרצאות על אמנות ישראלית מודרנית והיבטים רב־תרבותיים ביצירה המקומית.",
        "PLYPSHpl2RaHBL2hQlzoBdivsZCgDCIfnu",
        "בית לאמנות ישראלית",
      ),
      playlist(
        "zoomorechet-heritage-sites",
        "זומורשת — אדריכלות, שימור וסיפורי אתרים",
        "מאגר רחב של מפגשים על אתרי מורשת, מבנים היסטוריים, שימור והתיישבות — חומר שימושי לבניית הדרכה באתר.",
        "PLB_N2nTZlLenGIbRRThlBCGKpwqlpLpls",
        "המועצה לשימור אתרי מורשת בישראל",
      ),
    ],
  },
  {
    id: "geography-landscape",
    category: "גאוגרפיה, גאולוגיה ונוף",
    intro: "גבולות, דרכים, תבליט ותהליכים שעיצבו את פני הארץ — מן הבקע ועד מכתשי הנגב.",
    accent: "gold",
    items: [
      video(
        "how-crater-forms",
        "איך נוצר מכתש",
        "הסבר ויזואלי על תהליכי הסחיפה הייחודיים של מכתשי הנגב.",
        "u7CMlRyjqQE",
        "נועם זיו · מרכז מכתש רמון",
      ),
      video(
        "plate-tectonics",
        "טקטוניקת הפלטות והשבר הסורי־אפריקאי",
        "אנימציה מבהירה של תנועת הלוחות ותהליכי השבירה בארץ.",
        "CLJFel5Am74",
        "גל קציר",
      ),
      video(
        "judean-desert-geology",
        "מבואות גאולוגיים וטופוגרפיים למדבר יהודה",
        "הרצאת שטח על מסלע, קו פרשת מים ומצוק ההעתקים.",
        "TZ4QXPHXr4k",
        "חיליק אברג׳ל",
      ),
      playlist(
        "geology-public-lectures",
        "הרצאות בנושאי גאולוגיה לקהל הרחב",
        "הרצאות על לוחות טקטוניים, ים המלח, בולענים ותופעות גאולוגיות נוספות.",
        "PLqJvSRnDtOg_W6UcpsowWFfYZeqqhhkDd",
        "המכון הגאולוגי לישראל",
      ),
      playlist(
        "geology-course",
        "גאולוגיה",
        "סדרת לימוד על סוגי סלעים, מבנה כדור הארץ ותהליכים גאולוגיים.",
        "PL8OCxL2J8lQxam7arVbgbZkwzcFUVVK2x",
        "ציון אבוקסיס",
      ),
    ],
  },
  {
    id: "water-nature-ecology",
    category: "מים, חי, צומח וסביבה",
    intro: "הידרולוגיה, צמחייה, בעלי חיים ושמירת טבע — בסיס חשוב להבנת השטח והדרכה אחראית.",
    accent: "teal",
    items: [
      playlist(
        "water-in-israel",
        "אבני פינה — המים בישראל",
        "קורס אקדמי על הידרולוגיה, משק המים ומשאבי המים של ישראל.",
        "PLT-roSWIpp1EeReAN-3TuVJadl5uODrYb",
        "האוניברסיטה העברית בירושלים",
      ),
      playlist(
        "water-authority-podcast",
        "פודקאסט רשות המים",
        "פרקים רשמיים על התפתחות משק המים בישראל, ניהול מקורות מים ואתגרי העתיד.",
        "PLkrMXSx-Ib9vYgQvDd2c_DiqoBKE-NlMT",
        "רשות המים",
      ),
      playlist(
        "environmental-voice-podcast",
        "קול הסביבה — המשרד להגנת הסביבה",
        "הסכת רשמי על משבר האקלים, זיהום, פסולת, בנייה ירוקה והגנה על הטבע הישראלי.",
        "PLjm3NGu8VMITfvVKi4tRKWljie-Vn2m0p",
        "המשרד להגנת הסביבה",
      ),
      playlist(
        "historic-flora",
        "צמחי תרבות ובר בשימוש האדם בעת העתיקה",
        "סדרת הרצאות על בוטניקה היסטורית וזיהוי צמחי ארץ ישראל.",
        "PLX305R4UNU48_nNCYN12nhmZDnnU2h-At",
        "פרופ׳ זהר עמר",
      ),
      playlist(
        "quarter-to-nature",
        "רבע לטבע",
        "סדרת סרטוני שטח על שמורות, תופעות אקולוגיות ובעלי חיים בסביבתם.",
        "PLZ6FQsvEwz3YErkFFXmcXzmCxpXfOQ5VW",
        "רשות הטבע והגנים",
      ),
      playlist(
        "nature-reserves",
        "שמורת טבע",
        "סרטונים על שמורות טבע, שיקום בתי גידול והיכרות עם ערכי טבע בישראל.",
        "PLZ6FQsvEwz3bPkaSRSpwyvJTRkJiPSv3b",
        "רשות הטבע והגנים",
      ),
      playlist(
        "nature-webinars-hebrew",
        "וובינרים בעברית — החברה להגנת הטבע",
        "מפגשי עומק על טבע ישראלי, פריחה, צפרות, בתי גידול, מגוון ביולוגי ושמירת טבע.",
        "PLfz554KW8Zw8U1FpzQd3_i0So2DVwksAs",
        "החברה להגנת הטבע",
      ),
      video(
        "judean-desert-flora-tour",
        "סיור צומח במדבר יהודה עם פרופ׳ אבינעם דנין",
        "סיור שטח לזיהוי צמחים ולהבנת תפוצתם ותנאי המחיה במדבר.",
        "GlrdkiOIRRc",
        "צמחיית ישראל ברשת",
      ),
      video(
        "israeli-desert-flora-fauna",
        "החי והצומח של המדבר הישראלי",
        "הרצאה על התאמות בעלי חיים וצמחים לתנאי המדבר בישראל.",
        "8JXx2BIX8r8",
        "אוהד בנימיני",
      ),
    ],
  },
  {
    id: "israel-guiding-skills",
    category: "מדינת ישראל ומקצוע ההדרכה",
    intro: "המדינה והחברה, הסכסוך, בטיחות, נגישות, עזרה ראשונה וכלים מקצועיים להדרכה.",
    accent: "violet",
    items: [
      playlist(
        "israeli-palestinian-conflict-narratives",
        "הסכסוך הישראלי־פלסטיני: נרטיבים וסוגיות יסוד",
        "קורס אקדמי המציע הכרות עם הנרטיבים וסוגיות היסוד של הסכסוך.",
        "PLim5qUUjql0H8COAXyRHuNwibyxSZOJU2",
        "HUJI Multimedia · האוניברסיטה העברית",
      ),
      playlist(
        "shared-society-conference",
        "הכנס השנתי לחברה משותפת",
        "מפגשים על החברה הישראלית, קבוצות אוכלוסייה, יחסי דת ומדינה ותפקיד המדינה במרחב הציבורי.",
        "PLmCtYOSs2DQw8scTZVkx58s5btAP2QdiU",
        "המכון הישראלי לדמוקרטיה",
      ),
      playlist(
        "hurwitz-economy-society-conference",
        "כנס אלי הורביץ לכלכלה וחברה",
        "מקורות עומק על כלכלת ישראל, תקציב, שוק העבודה, צמיחה ומדיניות ציבורית.",
        "PLmCtYOSs2DQzoX75D-WKC97y4ChtCs7qH",
        "המכון הישראלי לדמוקרטיה",
      ),
      playlist(
        "national-security-conference",
        "ועידת הביטחון הלאומי — מחקר האיומים של ישראל",
        "הרצאות על יחסי ישראל־ערב, הסכסוך הישראלי־פלסטיני, מדיניות ואיומים אזוריים.",
        "PLYGbkeWijUDI",
        "INSS — המכון למחקרי ביטחון לאומי",
      ),
      playlist(
        "public-diplomacy-strategies",
        "דיפלומטיה ציבורית ואסטרטגיות תקשורת",
        "קורס מצולם על הסברה, מסרים, תדמית ישראל ודיפלומטיה תרבותית לקהלים בין־לאומיים.",
        "PLEC6AB4D9CC007D28",
        "אוניברסיטת בר־אילן",
      ),
      playlist(
        "first-aid-training",
        "הדרכת עזרה ראשונה",
        "סרטוני הדרכה רשמיים לטיפול ראשוני במצבי חירום והחייאה בסיסית.",
        "PL9jj4vXs6YdgDjR1tVxUh9ZbQrBLKiunn",
        "מגן דוד אדום",
      ),
      playlist(
        "accessible-trips",
        "סרטונים: טיולים נגישים מצולמים",
        "דוגמאות והדרכות לטיולים נגישים עבור אנשים עם מוגבלות.",
        "PLt_bkk9q640GcDkhGp4s8T6gWsNKN6CkS",
        "נגישות ישראל",
      ),
      playlist(
        "accessible-national-parks",
        "טיולים נגישים — רשות הטבע והגנים",
        "דוגמאות מעשיות לאתרים ומסלולים נגישים, לרבות חופים, שמורות טבע, מצדה ומעיינות.",
        "PLZ6FQsvEwz3bjtMClc1gxdGdEhyptUX1C",
        "רשות הטבע והגנים",
      ),
      playlist(
        "school-trips-safety",
        "בטיחות במוסדות חינוך — כולל טיולים",
        "הנחיות בטיחות, ניהול סיכונים ותדריכים לקראת יציאה לשטח.",
        "PLvOBUEO1Dk20lDb_jEIkQmJOZVmV8FMbK",
        "משרד החינוך",
      ),
      playlist(
        "public-speaking-tools",
        "טיפים וכלים יישומיים להופעה אותנטית מול קהל",
        "כלים מעשיים להעברת מסרים, נוכחות ועמידה מול קהל.",
        "PLv8-PnBJJiqyKsRjvK8EJIrr6rnhUgPL_",
        "גיא יריב",
      ),
      playlist(
        "public-speaking-tips",
        "עמידה מול קהל — עצות וטיפים",
        "כלים ליצירת פתיחה, סטוריטלינג, התאמת מסר לקהלים שונים, שפת גוף ותכנון הרצאה.",
        "PLsXfKI8TcWSCXx3uXvxstbnl67gBuy39W",
        "אסתי גרוסמן",
      ),
      video(
        "learning-technologies",
        "טכנולוגיות למידה — מה עובד באמת?",
        "הרצאה על בחירת טכנולוגיות הדרכה וכלים דיגיטליים באופן שמשרת את הלמידה והקהל.",
        "7bmHivnPQjQ",
        "מתודיקה — למידה אפקטיבית",
      ),
      video(
        "excellent-tour-guide-host",
        "מה הופך מדריך טיולים ומארח למצוין?",
        "הרצאת TED עם עקרונות שימושיים לבניית חוויה, העברת סיפור, הקשבה לקהל והדרכה משמעותית; באנגלית.",
        "Q0kI3LNChis",
        "TEDx Talks · Rick Steves",
      ),
      video(
        "route-planning-google-maps",
        "תכנון מסלול טיול בעזרת Google Maps",
        "כלי מעשי לבניית ציר מסלול ולהכנת תכנון טיול; מתאים כעזר, לצד שיקולי הדרכה ובטיחות.",
        "-zq8lYXOO98",
        "בלוג טיולים check in out",
      ),
      video(
        "tourism-marketing-israel",
        "שיווק תיירות לישראל ושנת הצמיחה",
        "ראיון מקצועי על מגמות שיווק ותיירות נכנסת בישראל, שימושי להבנת ענף התיירות.",
        "ToxKXE3nhsg",
        "ד״ר ערן כתר",
      ),
      video(
        "tourism-services-law",
        "חוק שירותי תיירות",
        "רקע רגולטורי קצר מדיון על הצעת חוק שירותי תיירות; מיועד להתמצאות ראשונית בלבד ואינו ייעוץ משפטי.",
        "AKVfcI17a9c",
        "תומר שלוש",
      ),
      video(
        "tour-guide-course-intro",
        "הרצאת מבוא לקראת פתיחת קורס מורי דרך",
        "סקירה של דרישות המקצוע, מבנה הלימודים והכנה לקראת מבחני הרישוי.",
        "0BdmT9wo6As",
        "יד יצחק בן-צבי",
      ),
      video(
        "israel-economy-intro",
        "כלכלת ישראל — מבוא וסוגיות יסוד",
        "הרצאת מבוא על מבנה הכלכלה הישראלית וסוגיות מרכזיות.",
        "n7g7b3y3xcQ",
        "הקריה האקדמית אונו",
      ),
    ],
  },
];

function subtopic(
  id: string,
  title: string,
  description: string,
  tone: TopicTone,
): VideoSubtopic {
  return { id, title, description, tone };
}

const subtopicsByVideoId: Record<string, VideoSubtopic> = {
  "ancient-jewish-history": subtopic(
    "ancient-history",
    "העת העתיקה והמקרא",
    "מן המקרא, דרך בית ראשון ושני ועד מפת התקופות של הארץ.",
    "teal",
  ),
  "land-of-israel-through-ages": subtopic(
    "ancient-history",
    "העת העתיקה והמקרא",
    "מן המקרא, דרך בית ראשון ושני ועד מפת התקופות של הארץ.",
    "teal",
  ),
  "jerusalem-myth-history-reality": subtopic(
    "jerusalem",
    "ירושלים לדורותיה",
    "העיר, שכבותיה ואתרי המפתח שלה.",
    "gold",
  ),
  "zionism-aliyot-nation-building": subtopic(
    "modern-history",
    "ציונות, מדינה וזיכרון",
    "עליות, הקמת המדינה, מלחמותיה וזיכרון השואה.",
    "violet",
  ),
  "modern-israel-events-wars": subtopic(
    "modern-history",
    "ציונות, מדינה וזיכרון",
    "עליות, הקמת המדינה, מלחמותיה וזיכרון השואה.",
    "violet",
  ),
  "philosophy-and-holocaust": subtopic(
    "modern-history",
    "ציונות, מדינה וזיכרון",
    "עליות, הקמת המדינה, מלחמותיה וזיכרון השואה.",
    "violet",
  ),
  "tohu-va-vohu": subtopic(
    "archaeology-foundations",
    "יסודות וארכאולוגיה מקראית",
    "מושגי יסוד, תקופות וחקר ישראל הקדום.",
    "gold",
  ),
  "ancient-israel-finkelstein": subtopic(
    "archaeology-foundations",
    "יסודות וארכאולוגיה מקראית",
    "מושגי יסוד, תקופות וחקר ישראל הקדום.",
    "gold",
  ),
  "second-temple-mishnah-talmud": subtopic(
    "periods-and-excavations",
    "תקופות, חפירות ותגליות",
    "התקופה הקלאסית, ימי הביניים וממצאים מן השטח.",
    "blue",
  ),
  "beneath-the-surface": subtopic(
    "periods-and-excavations",
    "תקופות, חפירות ותגליות",
    "התקופה הקלאסית, ימי הביניים וממצאים מן השטח.",
    "blue",
  ),
  "city-of-david-tour-guides": subtopic(
    "jerusalem-heritage",
    "ירושלים וסיפורי מורשת",
    "עיר דוד, ירושלים הקדומה וסיפורים מאתרי הארץ.",
    "teal",
  ),
  "crusader-period": subtopic(
    "periods-and-excavations",
    "תקופות, חפירות ותגליות",
    "התקופה הקלאסית, ימי הביניים וממצאים מן השטח.",
    "blue",
  ),
  "tour-guide-secrets": subtopic(
    "jerusalem-heritage",
    "ירושלים וסיפורי מורשת",
    "עיר דוד, ירושלים הקדומה וסיפורים מאתרי הארץ.",
    "teal",
  ),
  "christianity-holy-land": subtopic(
    "christianity",
    "נצרות בארץ הקודש",
    "היסטוריה, זרמים, קהילות ואתרים נוצריים.",
    "violet",
  ),
  "christian-communities-rossing": subtopic(
    "christianity",
    "נצרות בארץ הקודש",
    "היסטוריה, זרמים, קהילות ואתרים נוצריים.",
    "violet",
  ),
  "religions-and-beliefs": subtopic(
    "religions-and-islam",
    "דתות ואסלאם",
    "יהדות, אסלאם ומסורות אמונה במרחב הארץ־ישראלי.",
    "gold",
  ),
  "early-muslim-period": subtopic(
    "religions-and-islam",
    "דתות ואסלאם",
    "יהדות, אסלאם ומסורות אמונה במרחב הארץ־ישראלי.",
    "gold",
  ),
  "druze-in-brief": subtopic(
    "communities-and-sites",
    "עדות ואתרים",
    "דרוזים, שומרונים, בהאים ואתרי מורשת ייחודיים.",
    "rose",
  ),
  "mount-gerizim-samaritans": subtopic(
    "communities-and-sites",
    "עדות ואתרים",
    "דרוזים, שומרונים, בהאים ואתרי מורשת ייחודיים.",
    "rose",
  ),
  "bahai-faith": subtopic(
    "communities-and-sites",
    "עדות ואתרים",
    "דרוזים, שומרונים, בהאים ואתרי מורשת ייחודיים.",
    "rose",
  ),
  "bethlehem-nativity-church": subtopic(
    "christianity",
    "נצרות בארץ הקודש",
    "היסטוריה, זרמים, קהילות ואתרים נוצריים.",
    "violet",
  ),
  "jericho-winter-palaces": subtopic(
    "communities-and-sites",
    "עדות ואתרים",
    "דרוזים, שומרונים, בהאים ואתרי מורשת ייחודיים.",
    "rose",
  ),
  "jewish-culture-and-creation": subtopic(
    "jewish-culture",
    "תרבות יהודית",
    "יצירה, חפצים, מסורות ותרבות חומרית.",
    "teal",
  ),
  "jewish-communities-east": subtopic(
    "jewish-culture",
    "תרבות יהודית",
    "יצירה, חפצים, מסורות ותרבות חומרית.",
    "teal",
  ),
  "jewish-art-lectures": subtopic(
    "art-in-israel",
    "אמנות יהודית וישראלית",
    "דימויים, חפצים ויצירה מודרנית בארץ.",
    "violet",
  ),
  "israeli-modern-art": subtopic(
    "art-in-israel",
    "אמנות יהודית וישראלית",
    "דימויים, חפצים ויצירה מודרנית בארץ.",
    "violet",
  ),
  "zoomorechet-heritage-sites": subtopic(
    "architecture-and-conservation",
    "אדריכלות ושימור אתרים",
    "מבנים היסטוריים, אתרי מורשת וקריאת שכבות המרחב הבנוי.",
    "gold",
  ),
  "how-crater-forms": subtopic(
    "desert-landscapes",
    "מדבר, נגב ומכתשים",
    "נופי המדבר, מכתשי הנגב ותבליט מדבר יהודה.",
    "gold",
  ),
  "plate-tectonics": subtopic(
    "earth-processes",
    "תהליכי כדור הארץ",
    "לוחות, העתקים, בקע ותופעות גאולוגיות.",
    "blue",
  ),
  "judean-desert-geology": subtopic(
    "desert-landscapes",
    "מדבר, נגב ומכתשים",
    "נופי המדבר, מכתשי הנגב ותבליט מדבר יהודה.",
    "gold",
  ),
  "geology-public-lectures": subtopic(
    "earth-processes",
    "תהליכי כדור הארץ",
    "לוחות, העתקים, בקע ותופעות גאולוגיות.",
    "blue",
  ),
  "geology-course": subtopic(
    "earth-processes",
    "תהליכי כדור הארץ",
    "לוחות, העתקים, בקע ותופעות גאולוגיות.",
    "blue",
  ),
  "water-in-israel": subtopic(
    "water-and-flora",
    "מים וצמחייה",
    "משק המים, בוטניקה היסטורית וצמחי מדבר.",
    "blue",
  ),
  "water-authority-podcast": subtopic(
    "water-and-flora",
    "מים וצמחייה",
    "משק המים, בוטניקה היסטורית וצמחי מדבר.",
    "blue",
  ),
  "environmental-voice-podcast": subtopic(
    "climate-and-environment",
    "אקלים ואיכות הסביבה",
    "משבר האקלים, זיהום, פסולת ומדיניות סביבתית בישראל.",
    "rose",
  ),
  "historic-flora": subtopic(
    "water-and-flora",
    "מים וצמחייה",
    "משק המים, בוטניקה היסטורית וצמחי מדבר.",
    "blue",
  ),
  "quarter-to-nature": subtopic(
    "nature-and-wildlife",
    "שמורות, אקולוגיה וחי",
    "בתי גידול, שמירת טבע והתאמות בעלי חיים.",
    "teal",
  ),
  "nature-reserves": subtopic(
    "nature-and-wildlife",
    "שמורות, אקולוגיה וחי",
    "בתי גידול, שמירת טבע והתאמות בעלי חיים.",
    "teal",
  ),
  "nature-webinars-hebrew": subtopic(
    "nature-and-wildlife",
    "שמורות, אקולוגיה וחי",
    "בתי גידול, שמירת טבע והתאמות בעלי חיים.",
    "teal",
  ),
  "judean-desert-flora-tour": subtopic(
    "water-and-flora",
    "מים וצמחייה",
    "משק המים, בוטניקה היסטורית וצמחי מדבר.",
    "blue",
  ),
  "israeli-desert-flora-fauna": subtopic(
    "nature-and-wildlife",
    "שמורות, אקולוגיה וחי",
    "בתי גידול, שמירת טבע והתאמות בעלי חיים.",
    "teal",
  ),
  "israeli-palestinian-conflict-narratives": subtopic(
    "state-and-society",
    "המדינה והחברה",
    "סוגיות יסוד, נרטיבים והכלכלה הישראלית.",
    "rose",
  ),
  "shared-society-conference": subtopic(
    "state-and-society",
    "המדינה והחברה",
    "סוגיות יסוד, נרטיבים והכלכלה הישראלית.",
    "rose",
  ),
  "hurwitz-economy-society-conference": subtopic(
    "state-and-society",
    "המדינה והחברה",
    "סוגיות יסוד, נרטיבים והכלכלה הישראלית.",
    "rose",
  ),
  "national-security-conference": subtopic(
    "regional-relations-advocacy",
    "יחסי חוץ, סכסוך והסברה",
    "יחסי ישראל־ערב, סכסוך, מדיניות אזורית והעברת מסרים לקהלים.",
    "gold",
  ),
  "public-diplomacy-strategies": subtopic(
    "regional-relations-advocacy",
    "יחסי חוץ, סכסוך והסברה",
    "יחסי ישראל־ערב, סכסוך, מדיניות אזורית והעברת מסרים לקהלים.",
    "gold",
  ),
  "first-aid-training": subtopic(
    "responsible-guiding",
    "הדרכה אחראית ונגישה",
    "עזרה ראשונה, בטיחות, נגישות וניהול סיכונים.",
    "teal",
  ),
  "accessible-trips": subtopic(
    "responsible-guiding",
    "הדרכה אחראית ונגישה",
    "עזרה ראשונה, בטיחות, נגישות וניהול סיכונים.",
    "teal",
  ),
  "accessible-national-parks": subtopic(
    "responsible-guiding",
    "הדרכה אחראית ונגישה",
    "עזרה ראשונה, בטיחות, נגישות וניהול סיכונים.",
    "teal",
  ),
  "school-trips-safety": subtopic(
    "responsible-guiding",
    "הדרכה אחראית ונגישה",
    "עזרה ראשונה, בטיחות, נגישות וניהול סיכונים.",
    "teal",
  ),
  "public-speaking-tools": subtopic(
    "professional-delivery",
    "המקצוע וההגשה",
    "עמידה מול קהל, הכשרת מורי דרך ורישוי.",
    "violet",
  ),
  "public-speaking-tips": subtopic(
    "professional-delivery",
    "המקצוע וההגשה",
    "עמידה מול קהל, הכשרת מורי דרך ורישוי.",
    "violet",
  ),
  "learning-technologies": subtopic(
    "professional-delivery",
    "המקצוע וההגשה",
    "עמידה מול קהל, הכשרת מורי דרך ורישוי.",
    "violet",
  ),
  "excellent-tour-guide-host": subtopic(
    "professional-delivery",
    "המקצוע וההגשה",
    "עמידה מול קהל, הכשרת מורי דרך ורישוי.",
    "violet",
  ),
  "route-planning-google-maps": subtopic(
    "professional-delivery",
    "המקצוע וההגשה",
    "עמידה מול קהל, הכשרת מורי דרך ורישוי.",
    "violet",
  ),
  "tourism-marketing-israel": subtopic(
    "tourism-industry-regulation",
    "ענף התיירות ורגולציה",
    "תיירות נכנסת, שיווק, התנהלות מקצועית ורקע רגולטורי.",
    "blue",
  ),
  "tourism-services-law": subtopic(
    "tourism-industry-regulation",
    "ענף התיירות ורגולציה",
    "תיירות נכנסת, שיווק, התנהלות מקצועית ורקע רגולטורי.",
    "blue",
  ),
  "tour-guide-course-intro": subtopic(
    "professional-delivery",
    "המקצוע וההגשה",
    "עמידה מול קהל, הכשרת מורי דרך ורישוי.",
    "violet",
  ),
  "israel-economy-intro": subtopic(
    "state-and-society",
    "המדינה והחברה",
    "סוגיות יסוד, נרטיבים והכלכלה הישראלית.",
    "rose",
  ),
};

const uncategorizedSubtopic = subtopic(
  "general",
  "העשרה כללית",
  "מקורות העשרה בנושאי הקורס.",
  "teal",
);

export const videoGroups: VideoGroup[] = rawVideoGroups.map((group) => ({
  ...group,
  items: group.items.map((item) => ({
    ...item,
    subtopic: subtopicsByVideoId[item.id] ?? uncategorizedSubtopic,
  })),
}));

export const videoCount = videoGroups.reduce(
  (total, group) => total + group.items.length,
  0,
);
