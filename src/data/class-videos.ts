/**
 * עיצוב ספריית הכיתה: הפלייליסטים מערוץ LWSHARON נשמרים כמקורות קורס רשמיים,
 * ומחולקים קודם לפי אופן הלמידה ואחר כך לפי תחום או מרחב גאוגרפי.
 */
import type { TopicTone, VideoGroup, VideoItem, VideoSubtopic } from "@/data/videos";

export type VideoSectionId = "theory" | "online" | "tours" | "enrichment";

export type VideoSection = {
  id: VideoSectionId;
  title: string;
  description: string;
  groups: VideoGroup[];
};

const SOURCE = "ערוץ הכיתה · LWSHARON";

function subtopic(id: string, title: string, description: string, tone: TopicTone): VideoSubtopic {
  return { id, title, description, tone };
}

function classPlaylist(
  id: string,
  title: string,
  description: string,
  list: string,
  topic: VideoSubtopic,
  keywords: string[],
): VideoItem {
  return {
    id,
    title,
    description,
    type: "playlist",
    embedUrl: `https://www.youtube.com/embed/videoseries?list=${list}`,
    directUrl: `https://www.youtube.com/playlist?list=${list}`,
    source: SOURCE,
    subtopic: topic,
    keywords,
  };
}

const theoryTopics = {
  borders: subtopic("class-borders", "גבולות וגאוגרפיה", "גבולות הארץ, שדרת ההר והמרחב הישראלי.", "gold"),
  religions: subtopic("class-religions", "דתות", "שיעורים עיוניים ביהדות ובנצרות.", "violet"),
  nature: subtopic("class-nature", "טבע וסביבה", "צומח, משאבי טבע וסביבה בארץ ישראל.", "teal"),
  profession: subtopic("class-profession", "מקצוע ההדרכה", "ניהול קבוצה ועבודה מול גורמי תיירות.", "blue"),
};

const onlineTopics = {
  foundations: subtopic("online-foundations", "יסודות ופרהיסטוריה", "פרהיסטוריה, התפתחות האדם ומבוא לארכאולוגיה.", "teal"),
  bronzeIron: subtopic("online-bronze-iron", "ברונזה וברזל", "תקופות הברונזה והברזל בארץ ישראל.", "gold"),
  classical: subtopic("online-classical", "בית שני והעולם הקלאסי", "בית שני, אדריכלות קלאסית והתקופות הרומית והביזנטית.", "violet"),
  islamic: subtopic("online-islamic", "התקופות המוסלמיות והעות׳מאנית", "מן התקופה המוסלמית הקדומה ועד התקופה העות׳מאנית.", "blue"),
};

const tourTopics = {
  coast: subtopic("tour-coast", "מישור החוף והמרכז", "סיורי חוף, ערי מישור החוף ואתרי המרכז.", "gold"),
  carmel: subtopic("tour-carmel", "חיפה והכרמל", "חיפה, הכרמל, זכרון יעקב, המוחרקה ועתלית.", "teal"),
  galilee: subtopic("tour-galilee", "גליל ועמקים", "מגידו, הגלבוע, ציפורי ובית שערים.", "violet"),
  samaria: subtopic("tour-samaria", "שומרון", "שילה, הר גריזים ואתרי השומרון.", "blue"),
  jerusalem: subtopic("tour-jerusalem", "ירושלים והשפלה", "עיר דוד, ירושלים ואתרים מקראיים בשפלת יהודה.", "rose"),
  golan: subtopic("tour-golan", "רמת הגולן", "תיעוד יום הסיור בדרום רמת הגולן.", "gold"),
};

export const CLASS_VIDEO_SECTIONS: VideoSection[] = [
  {
    id: "theory",
    title: "חומר עיוני",
    description: "הקלטות של שיעורי הכיתה לפי תחומי הלימוד של הקורס.",
    groups: [
      {
        id: "class-theory-geography",
        category: "גבולות וגאוגרפיה",
        intro: theoryTopics.borders.description,
        accent: "gold",
        items: [
          classPlaylist("class-israel-borders", "גבולות הארץ ושדרת ההר המרכזית", "שיעור עיוני עם גיא לינב על גבולות הארץ ושדרת ההר המרכזית.", "PLJhw_Oa-JntE", theoryTopics.borders, ["גבולות", "ארץ ישראל", "שדרת ההר", "גיא לינב"]),
        ],
      },
      {
        id: "class-theory-religions",
        category: "דתות",
        intro: theoryTopics.religions.description,
        accent: "violet",
        items: [
          classPlaylist("class-christianity", "מבוא לנצרות", "הקלטות שיעורי המבוא לנצרות במסגרת הקורס.", "PLDEVuzN0RSm8", theoryTopics.religions, ["נצרות", "ישו", "כנסייה", "כתבי הקודש"]),
          classPlaylist("class-judaism", "מבוא ליהדות", "הקלטות שיעורי המבוא ליהדות במסגרת הקורס.", "PLUERFHln9NWo", theoryTopics.religions, ["יהדות", "מקרא", "הלכה", "בית כנסת"]),
        ],
      },
      {
        id: "class-theory-nature",
        category: "טבע וסביבה",
        intro: theoryTopics.nature.description,
        accent: "teal",
        items: [
          classPlaylist("class-natural-resources", "משאבי טבע וסביבה", "שיעורים על משאבי הטבע והסביבה בישראל.", "PLfJJe27EPxg0", theoryTopics.nature, ["משאבי טבע", "סביבה", "אקולוגיה", "שמירת טבע"]),
          classPlaylist("class-flora", "עולם הצומח בארץ ישראל", "שיעורי אוהד בנימיני על הצומח בארץ ישראל.", "PL20z4RUH7ooq3x2nEIwOMrUH8krDA1MWz", theoryTopics.nature, ["צומח", "בוטניקה", "צמחי ארץ ישראל", "אוהד בנימיני"]),
        ],
      },
      {
        id: "class-theory-profession",
        category: "מקצוע ההדרכה",
        intro: theoryTopics.profession.description,
        accent: "blue",
        items: [
          classPlaylist("class-tourism-operations", "עבודה מול גורמי תיירות וניהול קבוצה", "שיעורים מעשיים על עבודה בענף התיירות וניהול קבוצות.", "PLANfcs5Uhi1I", theoryTopics.profession, ["ניהול קבוצה", "גורמי תיירות", "מקצוע ההדרכה", "תיירות"]),
        ],
      },
    ],
  },
  {
    id: "online",
    title: "קורסים מקוונים",
    description: "יחידות החובה המקוונות של הקורס, מסודרות לפי רצף תקופות ונושאים.",
    groups: [
      {
        id: "online-foundations",
        category: "יסודות ופרהיסטוריה",
        intro: onlineTopics.foundations.description,
        accent: "teal",
        items: [
          classPlaylist("online-prehistory", "יחידה 6: פרהיסטוריה והתפתחות האדם", "יחידת הקורס המקוון על ראשית האדם והתרבויות הפרהיסטוריות.", "PL20z4RUH7ooqr0q3iJvxBHE54S-wRDWGd", onlineTopics.foundations, ["פרהיסטוריה", "התפתחות האדם", "פליאולית", "ניאולית"]),
          classPlaylist("online-archaeology-intro", "יחידה 8: מבוא לארכאולוגיה של ארץ ישראל", "יחידת יסוד על מחקר ארכאולוגי, חפירה, תיארוך וממצא.", "PLRgKoeKFZD7M", onlineTopics.foundations, ["ארכאולוגיה", "חפירה", "תיארוך", "תל"]),
        ],
      },
      {
        id: "online-bronze-iron",
        category: "ברונזה וברזל",
        intro: onlineTopics.bronzeIron.description,
        accent: "gold",
        items: [
          classPlaylist("online-bronze-age", "יחידה 9: תקופת הברונזה", "יחידת הקורס המקוון על תקופות הברונזה וערי כנען.", "PLfj5khSEP_OU", onlineTopics.bronzeIron, ["תקופת הברונזה", "כנען", "ערי מדינה", "מגידו"]),
          classPlaylist("online-iron-age-one", "יחידה 10: תקופת הברזל — חלק ראשון", "החלק הראשון של יחידת הקורס המקוון על תקופת הברזל.", "PLPOdFzwMj6kw", onlineTopics.bronzeIron, ["תקופת הברזל", "ישראל", "יהודה", "מקרא"]),
          classPlaylist("online-iron-age-two", "יחידה 10: תקופת הברזל — חלק שני", "החלק השני של יחידת הקורס המקוון על תקופת הברזל.", "PLYcCpUbYG204", onlineTopics.bronzeIron, ["תקופת הברזל", "ממלכת ישראל", "ממלכת יהודה", "מגידו"]),
        ],
      },
      {
        id: "online-classical",
        category: "בית שני והעולם הקלאסי",
        intro: onlineTopics.classical.description,
        accent: "violet",
        items: [
          classPlaylist("online-second-temple", "יחידה 11: תקופת בית שני", "יחידת הקורס המקוון על התקופה הפרסית, ההלניסטית והרומית הקדומה.", "PLOJyGbnt4Y5U", onlineTopics.classical, ["בית שני", "חשמונאים", "הורדוס", "רומאים"]),
          classPlaylist("online-roman-byzantine", "יחידה 12: התקופה הרומית המאוחרת והביזנטית", "יחידת הקורס המקוון על התקופות הרומית המאוחרת והביזנטית.", "PLbKQBW1l0Uqo", onlineTopics.classical, ["רומית", "ביזנטית", "נצרות", "העולם הקלאסי"]),
          classPlaylist("online-classical-architecture", "יחידה 13: ארכאולוגיה ואדריכלות העולם הקלאסי", "מושגי יסוד בארכאולוגיה ובאדריכלות של העולם הקלאסי.", "PLCOMrrqZK_48", onlineTopics.classical, ["ארכאולוגיה", "אדריכלות", "העולם הקלאסי", "מקדש"]),
        ],
      },
      {
        id: "online-islamic-periods",
        category: "התקופות המוסלמיות והעות׳מאנית",
        intro: onlineTopics.islamic.description,
        accent: "blue",
        items: [
          classPlaylist("online-early-islam", "יחידה 14: התקופה המוסלמית הקדומה", "יחידת הקורס המקוון על הכיבוש המוסלמי והתקופות האומיית והעבאסית.", "PLfuVdWU8-RUI", onlineTopics.islamic, ["אסלאם", "מוסלמית קדומה", "אומיים", "עבאסים"]),
          classPlaylist("online-middle-ages", "יחידה 15: הצלבנים, האיובים והממלוכים", "יחידת הקורס המקוון על תקופות ימי הביניים בארץ ישראל.", "PLZeF_g39gXEo", onlineTopics.islamic, ["צלבנים", "איובים", "ממלוכים", "ימי הביניים"]),
          classPlaylist("online-ottoman", "יחידה 16: התקופה העות׳מאנית", "יחידת הקורס המקוון על ארץ ישראל בתקופה העות׳מאנית.", "PLU0PiDrMxRMA", onlineTopics.islamic, ["עותמאנים", "האימפריה העותמאנית", "העת החדשה"]),
        ],
      },
    ],
  },
  {
    id: "tours",
    title: "סיורים",
    description: "תיעוד מצולם של ימי הסיור, מאורגן לפי אזורים ואתרי השטח.",
    groups: [
      {
        id: "tour-coast-center",
        category: "מישור החוף והמרכז",
        intro: tourTopics.coast.description,
        accent: "gold",
        items: [
          classPlaylist("tour-south-coast", "מישור החוף הדרומי: ראשון לציון, עד הלום, ניצנים ותל אשקלון", "תיעוד הסיור במישור החוף הדרומי ובאתרי מורשת והיסטוריה לאורך הציר.", "PLBUdxHO71PY0", tourTopics.coast, ["ראשון לציון", "עד הלום", "ניצנים", "תל אשקלון", "מישור החוף"]),
          classPlaylist("tour-gezer-afek", "תל גזר, אמאוס, לטרון, מגדל צדק ותל אפק", "יום סיור בהדרכת אפרת נתן בין תל גזר, אמאוס, לטרון ומקורות הירקון.", "PLbv6q3j5BcnQ", tourTopics.coast, ["תל גזר", "אמאוס", "מנזר לטרון", "מגדל צדק", "תל אפק", "פארק אפק"]),
          classPlaylist("tour-jisr-pardes-hanna", "ג׳סר א־זרקא ופרדס חנה־כרכור", "תיעוד יום הסיור בג׳סר א־זרקא, חוף הכרמל ופרדס חנה־כרכור.", "PLfDLohFabXuA", tourTopics.coast, ["ג׳סר א זרקא", "פרדס חנה", "כרכור", "חוף הכרמל"]),
        ],
      },
      {
        id: "tour-carmel-haifa",
        category: "חיפה והכרמל",
        intro: tourTopics.carmel.description,
        accent: "teal",
        items: [
          classPlaylist("tour-carmel-course", "הכרמל: גני הנדיב, זכרון יעקב ומחנה המעפילים", "תיעוד יום הסיור בכרמל, בזכרון יעקב ובעתלית.", "PLO7CoaGjfeDg", tourTopics.carmel, ["הכרמל", "גני הנדיב", "זכרון יעקב", "עתלית", "מחנה המעפילים"]),
          classPlaylist("tour-carmel-full", "גני הנדיב, זכרון יעקב, המוחרקה ומחנה המעפילים בעתלית", "אוסף מורחב של קטעי ההדרכה והאתרים ביום הסיור בכרמל.", "PLXodZLnjeOVM", tourTopics.carmel, ["גני הנדיב", "זכרון יעקב", "המוחרקה", "עתלית", "כרמל"]),
          classPlaylist("tour-haifa", "העיר חיפה", "תיעוד יום הסיור בחיפה ובאתרי העיר המרכזיים.", "PLV2InJmyh0lU", tourTopics.carmel, ["חיפה", "הכרמל", "העיר התחתית", "בהאים"]),
          classPlaylist("tour-geology", "סיור גאולוגי", "תיעוד סיור שטח בגאולוגיה ובגאומורפולוגיה.", "PLPyoCppI-MLc", tourTopics.carmel, ["גאולוגיה", "גאומורפולוגיה", "כרמל", "מסלע"]),
        ],
      },
      {
        id: "tour-galilee-valleys",
        category: "גליל ועמקים",
        intro: tourTopics.galilee.description,
        accent: "violet",
        items: [
          classPlaylist("tour-megiddo-gilboa", "תל מגידו והגלבוע", "תיעוד הסיור בתל מגידו, בגלבוע ובאתרי עמק יזרעאל.", "PLJfJsW-p0OVE", tourTopics.galilee, ["מגידו", "תל מגידו", "גלבוע", "עמק יזרעאל", "תל עמל"]),
          classPlaylist("tour-zippori-beit-shearim", "ציפורי ובית שערים", "תיעוד יום הסיור בציפורי ובבית שערים בהדרכת אסתר שמואלי סטפמן.", "PLRwlEi4CoFyk", tourTopics.galilee, ["ציפורי", "בית שערים", "גליל תחתון", "רבי יהודה הנשיא"]),
        ],
      },
      {
        id: "tour-samaria",
        category: "שומרון",
        intro: tourTopics.samaria.description,
        accent: "blue",
        items: [
          classPlaylist("tour-samaria-shiloh", "שומרון, שילה והר גריזים", "תיעוד יום הסיור בשומרון בהדרכת אפרת נתן.", "PLSh3fHd3M4vI", tourTopics.samaria, ["שומרון", "שילה", "הר גריזים", "שומרונים"]),
        ],
      },
      {
        id: "tour-jerusalem-lowlands",
        category: "ירושלים והשפלה",
        intro: tourTopics.jerusalem.description,
        accent: "rose",
        items: [
          classPlaylist("tour-city-of-david", "עיר דוד וירושלים", "תיעוד סיור בעיר דוד ובירושלים בהדרכת מירון.", "PLEd1sm6uzRoc", tourTopics.jerusalem, ["עיר דוד", "ירושלים", "נקבת השילוח", "מירון"]),
          classPlaylist("tour-biblical-lowlands", "אתרים מקראיים בשפלת יהודה", "תיעוד יום הסיור בשפלת יהודה בהדרכת שמוליק שפרמן.", "PLOyC3qTQ_jq4", tourTopics.jerusalem, ["שפלת יהודה", "לכיש", "מרשה", "בית גוברין", "עזקה"]),
        ],
      },
      {
        id: "tour-golan",
        category: "רמת הגולן",
        intro: tourTopics.golan.description,
        accent: "gold",
        items: [
          classPlaylist("tour-south-golan", "דרום רמת הגולן", "תיעוד יום הסיור בדרום רמת הגולן.", "PLcixFigNsvIo", tourTopics.golan, ["דרום רמת הגולן", "גולן", "נוף געשי", "גבול"]),
        ],
      },
    ],
  },
];

export const classVideoCount = CLASS_VIDEO_SECTIONS.reduce(
  (sectionTotal, section) => sectionTotal + section.groups.reduce((groupTotal, group) => groupTotal + group.items.length, 0),
  0,
);
