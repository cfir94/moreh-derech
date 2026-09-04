/**
 * ספריית הווידאו של מורי דרך — מקורות לימוד שנבחרו לפי נושאי הליבה של הקורס.
 * מבנה נתונים זה מופרד מהממשק כדי להקל על הרחבה, מיון ועדכון מקורות בעתיד.
 */
export type VideoKind = "video" | "playlist";

export type VideoItem = {
  id: string;
  title: string;
  description: string;
  type: VideoKind;
  embedUrl: string;
  directUrl: string;
  source: string;
};

export type VideoGroup = {
  id: string;
  category: string;
  intro: string;
  accent: "teal" | "blue" | "violet" | "gold";
  items: VideoItem[];
};

export const videoGroups: VideoGroup[] = [
  {
    id: "history",
    category: "היסטוריה וארכיאולוגיה",
    intro: "מהמקרא ועד התקופה הצלבנית — הרצאות, סדרות ותגליות מן השטח.",
    accent: "teal",
    items: [
      {
        id: "ancient-jewish-history",
        title: "קיצור תולדות העם היהודי בעת העתיקה",
        description:
          "סדרת אנימציה ממוקדת על תקופות בית ראשון, שיבת ציון וימי בית שני.",
        type: "playlist",
        embedUrl:
          "https://www.youtube.com/embed/videoseries?list=PLEREG-oChOzAusmCfk579R1BBK7b6f44j",
        directUrl:
          "https://www.youtube.com/playlist?list=PLEREG-oChOzAusmCfk579R1BBK7b6f44j",
        source: "איך - ככה",
      },
      {
        id: "land-of-israel-through-ages",
        title: "ארץ ישראל לאורך הדורות",
        description: "סדרת הרצאות אקדמיות על התקופות השונות בתולדות הארץ.",
        type: "playlist",
        embedUrl:
          "https://www.youtube.com/embed/videoseries?list=PL-0uvNlrXN3FJqttXR7LctYcKDEhFh9i5",
        directUrl:
          "https://www.youtube.com/playlist?list=PL-0uvNlrXN3FJqttXR7LctYcKDEhFh9i5",
        source: "יד יצחק בן-צבי",
      },
      {
        id: "second-temple-mishnah-talmud",
        title: "ארכיאולוגיה של החברה היהודית בבית שני, המשנה והתלמוד",
        description: "מבט היסטורי וארכיאולוגי על היישוב היהודי בארץ.",
        type: "playlist",
        embedUrl:
          "https://www.youtube.com/embed/videoseries?list=PLLZDwCnPvAhJoji7bxUNurUJkXlc1uH13",
        directUrl:
          "https://www.youtube.com/playlist?list=PLLZDwCnPvAhJoji7bxUNurUJkXlc1uH13",
        source: "אוניברסיטת בר-אילן",
      },
      {
        id: "crusader-period",
        title: "התקופה הצלבנית: 1099 עד 1261 לספירה",
        description: "קורס מקיף על מסעי הצלב, ממלכת ירושלים והביצורים הצלבניים.",
        type: "playlist",
        embedUrl:
          "https://www.youtube.com/embed/videoseries?list=PLplBWgJ5vvWUEbElgQ5-ICp9SSma1SYEK",
        directUrl:
          "https://www.youtube.com/playlist?list=PLplBWgJ5vvWUEbElgQ5-ICp9SSma1SYEK",
        source: "מבוא לגיאוגרפיה היסטורית",
      },
    ],
  },
  {
    id: "religions",
    category: "נצרות, אסלאם ועדות",
    intro: "היכרות עם דתות, קהילות ועדות המעצבות את הפסיפס המקומי.",
    accent: "violet",
    items: [
      {
        id: "christianity-holy-land",
        title: "קורס תולדות הנצרות בארץ הקודש",
        description: "סדרת השיעורים המקיפה של יסכה הרני להכשרת מורי דרך.",
        type: "playlist",
        embedUrl:
          "https://www.youtube.com/embed/videoseries?list=PLkq8REMVTTdfOHkrIJINV6RnkWBDyMMpL",
        directUrl:
          "https://www.youtube.com/playlist?list=PLkq8REMVTTdfOHkrIJINV6RnkWBDyMMpL",
        source: "יסכה הרני",
      },
      {
        id: "early-muslim-period",
        title: "התקופה המוסלמית המוקדמת",
        description: "מכיבוש ירושלים בשנת 638 ועד התקופה הצלבנית, כולל הר הבית.",
        type: "playlist",
        embedUrl:
          "https://www.youtube.com/embed/videoseries?list=PLplBWgJ5vvWV21vTIFQOPzlO5_64C2VRQ",
        directUrl:
          "https://www.youtube.com/playlist?list=PLplBWgJ5vvWV21vTIFQOPzlO5_64C2VRQ",
        source: "מבוא לגיאוגרפיה היסטורית",
      },
      {
        id: "druze-in-brief",
        title: "הדרוזים בקיצור",
        description: "הסבר מרוכז על מוצא העדה, עיקרי האמונה וההיסטוריה שלה באזור.",
        type: "video",
        embedUrl: "https://www.youtube.com/embed/SdNL1l1xWgw",
        directUrl: "https://www.youtube.com/watch?v=SdNL1l1xWgw",
        source: "הדרך הקלה",
      },
      {
        id: "mount-gerizim-samaritans",
        title: "הר גריזים והעיר השומרונית האבודה",
        description:
          "הרצאה של ד״ר דביר רביב על תולדות השומרונים והממצאים בהר גריזים.",
        type: "video",
        embedUrl: "https://www.youtube.com/embed/gBfxngMeH0c",
        directUrl: "https://www.youtube.com/watch?v=gBfxngMeH0c",
        source: "המחלקה ללימודי ארץ ישראל",
      },
      {
        id: "bahai-faith",
        title: "הדת הבהאית: ממשיחיות שיעית לדת עולמית",
        description: "הרצאה של ד״ר שי רוזן על הדת הבהאית ומרכזיה בארץ.",
        type: "video",
        embedUrl: "https://www.youtube.com/embed/hzSNh1sfvJk",
        directUrl: "https://www.youtube.com/watch?v=hzSNh1sfvJk",
        source: "ד״ר שי רוזן",
      },
    ],
  },
  {
    id: "geology",
    category: "גיאולוגיה ונוף",
    intro: "תהליכים שעיצבו את הארץ: מכתשים, בקע, מסלע ומדבר.",
    accent: "gold",
    items: [
      {
        id: "how-crater-forms",
        title: "איך נוצר מכתש",
        description: "הסבר מפורט על תהליכי הסחיפה הייחודיים של מכתשי הנגב.",
        type: "video",
        embedUrl: "https://www.youtube.com/embed/u7CMlRyjqQE",
        directUrl: "https://www.youtube.com/watch?v=u7CMlRyjqQE",
        source: "נועם זיו",
      },
      {
        id: "plate-tectonics",
        title: "טקטוניקת הפלטות והשבר הסורי-אפריקאי",
        description: "אנימציה מבהירה של תנועת הלוחות ותהליכי השבירה בארץ.",
        type: "video",
        embedUrl: "https://www.youtube.com/embed/CLJFel5Am74",
        directUrl: "https://www.youtube.com/watch?v=CLJFel5Am74",
        source: "גל קציר",
      },
      {
        id: "judean-desert-geology",
        title: "מבואות גיאולוגיים וטופוגרפיים למדבר יהודה",
        description:
          "הרצאת שטח של חיליק אברג׳ל על תופעות המסלע והטופוגרפיה של מדבר יהודה.",
        type: "video",
        embedUrl: "https://www.youtube.com/embed/TZ4QXPHXr4k",
        directUrl: "https://www.youtube.com/watch?v=TZ4QXPHXr4k",
        source: "חיליק אברג׳ל",
      },
    ],
  },
  {
    id: "nature-jerusalem",
    category: "חי, צומח וירושלים",
    intro: "בוטניקה, טבע ושכבותיה של ירושלים — מן השדה אל העיר.",
    accent: "blue",
    items: [
      {
        id: "historic-flora",
        title: "צמחי תרבות ובר בשימוש האדם בעת העתיקה",
        description:
          "סדרת הרצאות של פרופ׳ זהר עמר על בוטניקה היסטורית וזיהוי צמחים.",
        type: "playlist",
        embedUrl:
          "https://www.youtube.com/embed/videoseries?list=PLX305R4UNU48_nNCYN12nhmZDnnU2h-At",
        directUrl:
          "https://www.youtube.com/playlist?list=PLX305R4UNU48_nNCYN12nhmZDnnU2h-At",
        source: "פרופ׳ זהר עמר",
      },
      {
        id: "quarter-to-nature",
        title: "רבע לטבע",
        description: "סדרת סרטוני שטח של רשות הטבע והגנים על שמורות ואקולוגיה מקומית.",
        type: "playlist",
        embedUrl:
          "https://www.youtube.com/embed/videoseries?list=PLZ6FQsvEwz3YErkFFXmcXzmCxpXfOQ5VW",
        directUrl:
          "https://www.youtube.com/playlist?list=PLZ6FQsvEwz3YErkFFXmcXzmCxpXfOQ5VW",
        source: "רשות הטבע והגנים",
      },
      {
        id: "jerusalem-myth-history-reality",
        title: "ירושלים: מיתוס, היסטוריה ומציאות",
        description: "סדרה על תולדות ירושלים, אתריה המרכזיים ושכבותיה ההיסטוריות.",
        type: "playlist",
        embedUrl:
          "https://www.youtube.com/embed/videoseries?list=PL-0uvNlrXN3E_KNIdzmsTCh8RLwzvOUIv",
        directUrl:
          "https://www.youtube.com/playlist?list=PL-0uvNlrXN3E_KNIdzmsTCh8RLwzvOUIv",
        source: "יד יצחק בן-צבי",
      },
    ],
  },
];

export const videoCount = videoGroups.reduce(
  (total, group) => total + group.items.length,
  0,
);
