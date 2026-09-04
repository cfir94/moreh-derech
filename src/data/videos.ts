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
      playlist(
        "tohu-va-vohu",
        "והארץ הייתה תוהו ובוהו — כל הפרקים",
        "סדרה מומלצת ישירות על ידי רכז הקורס; מתאימה להעמקת ההיכרות עם ארכאולוגיה ותולדות הארץ.",
        "PLY8SR_z5GHjcxaML9v0NW5f1TJdi4PXRV",
        "Eldad Beeri · המלצת רכז הקורס",
        true,
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
    "biblical-periods",
    "מקרא ובית שני",
    "תקופות היסוד של ההיסטוריה היהודית הקדומה.",
    "teal",
  ),
  "land-of-israel-through-ages": subtopic(
    "historical-survey",
    "מבט כרונולוגי",
    "תולדות הארץ לאורך התקופות.",
    "blue",
  ),
  "jerusalem-myth-history-reality": subtopic(
    "jerusalem",
    "ירושלים לדורותיה",
    "העיר, שכבותיה ואתרי המפתח שלה.",
    "gold",
  ),
  "zionism-aliyot-nation-building": subtopic(
    "zionism",
    "ציונות והיישוב",
    "עליות, התיישבות ובניין האומה.",
    "violet",
  ),
  "modern-israel-events-wars": subtopic(
    "modern-state",
    "המדינה ומלחמותיה",
    "היסטוריה ישראלית מן ההקמה ועד ימינו.",
    "rose",
  ),
  "philosophy-and-holocaust": subtopic(
    "holocaust",
    "שואה וזיכרון",
    "היכרות עיונית עם השואה והוראתה.",
    "rose",
  ),
  "tohu-va-vohu": subtopic(
    "archaeology-overview",
    "מבט־על ארכאולוגי",
    "המלצת רכז הקורס למסע בין תקופות הארץ.",
    "gold",
  ),
  "ancient-israel-finkelstein": subtopic(
    "biblical-archaeology",
    "ארכאולוגיה מקראית",
    "ברונזה, ברזל והתהוות ישראל הקדום.",
    "teal",
  ),
  "second-temple-mishnah-talmud": subtopic(
    "classical-periods",
    "התקופה הקלאסית",
    "בית שני, רומא, ביזנטיון וימי חז״ל.",
    "blue",
  ),
  "beneath-the-surface": subtopic(
    "excavations",
    "חפירות ותגליות",
    "מבט עדכני על ממצאים ואתרי עתיקות.",
    "violet",
  ),
  "city-of-david-tour-guides": subtopic(
    "jerusalem-archaeology",
    "ארכאולוגיית ירושלים",
    "חידושים מעיר דוד וירושלים הקדומה.",
    "gold",
  ),
  "crusader-period": subtopic(
    "medieval-period",
    "ימי הביניים",
    "התקופה הצלבנית ומבני הכוח שלה.",
    "rose",
  ),
  "tour-guide-secrets": subtopic(
    "heritage-stories",
    "סיפורי מורשת",
    "זוויות הדרכה מאתרים מוכרים ופחות מוכרים.",
    "teal",
  ),
  "christianity-holy-land": subtopic(
    "christianity",
    "נצרות בארץ הקודש",
    "היסטוריה, זרמים, אתרים ומסורות.",
    "violet",
  ),
  "christian-communities-rossing": subtopic(
    "christianity",
    "נצרות בארץ הקודש",
    "היסטוריה, זרמים, אתרים ומסורות.",
    "violet",
  ),
  "religions-and-beliefs": subtopic(
    "monotheistic-religions",
    "דתות ואמונות",
    "יהדות, נצרות, אסלאם ומסורות נוספות.",
    "gold",
  ),
  "early-muslim-period": subtopic(
    "islam",
    "אסלאם וירושלים",
    "התקופה המוסלמית המוקדמת ואתרי הקודש.",
    "teal",
  ),
  "druze-in-brief": subtopic(
    "communities",
    "עדות וקהילות",
    "דרוזים, שומרונים, בהאים וקהילות הארץ.",
    "rose",
  ),
  "mount-gerizim-samaritans": subtopic(
    "communities",
    "עדות וקהילות",
    "דרוזים, שומרונים, בהאים וקהילות הארץ.",
    "rose",
  ),
  "bahai-faith": subtopic(
    "communities",
    "עדות וקהילות",
    "דרוזים, שומרונים, בהאים וקהילות הארץ.",
    "rose",
  ),
  "bethlehem-nativity-church": subtopic(
    "holy-sites",
    "אתרי קודש",
    "בית לחם, יריחו ואתרים בעלי משמעות דתית.",
    "blue",
  ),
  "jericho-winter-palaces": subtopic(
    "holy-sites",
    "אתרי קודש",
    "בית לחם, יריחו ואתרים בעלי משמעות דתית.",
    "blue",
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
    "jewish-art",
    "אמנות יהודית",
    "דימויים, חפצים והיסטוריה של אמנות יהודית.",
    "violet",
  ),
  "israeli-modern-art": subtopic(
    "israeli-art",
    "אמנות ישראלית",
    "יצירה מודרנית, זהות ומרחב מקומי.",
    "rose",
  ),
  "how-crater-forms": subtopic(
    "negev-craters",
    "נגב ומכתשים",
    "תהליכי סחיפה, מכתשים ונופי מדבר.",
    "gold",
  ),
  "plate-tectonics": subtopic(
    "tectonics",
    "טקטוניקה ובקע",
    "לוחות, העתקים והשבר הסורי־אפריקאי.",
    "rose",
  ),
  "judean-desert-geology": subtopic(
    "desert-topography",
    "מדבר יהודה וטופוגרפיה",
    "מסלע, מצוקים, קווי פרשת מים ותבליט.",
    "teal",
  ),
  "geology-public-lectures": subtopic(
    "earth-sciences",
    "מדעי כדור הארץ",
    "ים המלח, בולענים ותופעות גאולוגיות.",
    "blue",
  ),
  "geology-course": subtopic(
    "earth-sciences",
    "מדעי כדור הארץ",
    "ים המלח, בולענים ותופעות גאולוגיות.",
    "blue",
  ),
  "water-in-israel": subtopic(
    "hydrology",
    "מים והידרולוגיה",
    "משק המים, אקוויפרים ומשאבי מים בישראל.",
    "blue",
  ),
  "historic-flora": subtopic(
    "ethnobotany",
    "צמחי תרבות ובר",
    "בוטניקה היסטורית, זיהוי צמחים ושימושי אדם.",
    "gold",
  ),
  "quarter-to-nature": subtopic(
    "nature-reserves",
    "שמורות ואקולוגיה",
    "ערכי טבע, בתי גידול ושמירת הסביבה.",
    "teal",
  ),
  "nature-reserves": subtopic(
    "nature-reserves",
    "שמורות ואקולוגיה",
    "ערכי טבע, בתי גידול ושמירת הסביבה.",
    "teal",
  ),
  "judean-desert-flora-tour": subtopic(
    "flora-fauna",
    "חי וצומח",
    "זיהוי מינים והתאמות לתנאי השטח.",
    "violet",
  ),
  "israeli-desert-flora-fauna": subtopic(
    "flora-fauna",
    "חי וצומח",
    "זיהוי מינים והתאמות לתנאי השטח.",
    "violet",
  ),
  "israeli-palestinian-conflict-narratives": subtopic(
    "israeli-palestinian-conflict",
    "הסכסוך ונרטיבים",
    "היכרות אקדמית עם סוגיות היסוד ונקודות המבט.",
    "rose",
  ),
  "first-aid-training": subtopic(
    "field-safety",
    "עזרה ראשונה ובטיחות",
    "מוכנות לשטח, טיפול ראשוני וניהול סיכונים.",
    "teal",
  ),
  "accessible-trips": subtopic(
    "accessible-guiding",
    "הדרכה נגישה",
    "תכנון והובלה של טיולים נגישים.",
    "blue",
  ),
  "school-trips-safety": subtopic(
    "field-safety",
    "עזרה ראשונה ובטיחות",
    "מוכנות לשטח, טיפול ראשוני וניהול סיכונים.",
    "teal",
  ),
  "public-speaking-tools": subtopic(
    "presentation-skills",
    "עמידה מול קהל",
    "מסרים, נוכחות וכלי הצגה מעשיים.",
    "violet",
  ),
  "tour-guide-course-intro": subtopic(
    "profession-and-licensing",
    "המקצוע והרישוי",
    "מבנה המקצוע, הקורס והכנה למבחני רישוי.",
    "gold",
  ),
  "israel-economy-intro": subtopic(
    "state-and-economy",
    "המדינה והכלכלה",
    "מוסדות המדינה, חברה וכלכלת ישראל.",
    "blue",
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
