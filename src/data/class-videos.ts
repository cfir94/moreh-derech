/**
 * עיצוב ספריית הכיתה: פלייליסטי הסיורים מערוץ LWSHARON, מחולקים לפי מרחב גאוגרפי.
 */
import type { TopicTone, VideoGroup, VideoItem, VideoPart, VideoSubtopic } from "@/data/videos";
import channelSnapshot from "@/data/class-video-parts.json";

// "שיעורים עיוניים" ו"קורסים מקוונים" (הקלטות השיעורים) הוסרו בהכנה לגרסה בתשלום: הם קניין של
// המרצים. נשארו תיעודי הסיורים, והעשרה (src/data/videos.ts). ראו docs/launch/PLAN.md.
export type VideoSectionId = "tours" | "enrichment";

export type VideoSection = {
  id: VideoSectionId;
  title: string;
  description: string;
  groups: VideoGroup[];
};

const SOURCE = "ערוץ הכיתה · LWSHARON";
const playlistParts: Record<string, VideoPart[]> = channelSnapshot.playlists;
export const classVideoScanDate = channelSnapshot.scannedAt;

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
    playlistId: list,
    parts: playlistParts[list] ?? [],
  };
}

const tourTopics = {
  coast: subtopic("tour-coast", "מישור החוף והמרכז", "סיורי חוף, ערי מישור החוף ואתרי המרכז.", "gold"),
  carmel: subtopic("tour-carmel", "חיפה והכרמל", "חיפה, הכרמל, זכרון יעקב, המוחרקה ועתלית.", "teal"),
  galilee: subtopic("tour-galilee", "גליל ועמקים", "מגידו, הגלבוע, ציפורי, בית שערים, עכו ואתרי הנצרות בגליל.", "violet"),
  samaria: subtopic("tour-samaria", "שומרון", "שילה, הר גריזים ואתרי השומרון.", "blue"),
  jerusalem: subtopic("tour-jerusalem", "ירושלים והשפלה", "עיר דוד, ירושלים ואתרים מקראיים בשפלת יהודה.", "rose"),
  golan: subtopic("tour-golan", "גולן, חרמון ואצבע הגליל", "דרום וצפון הגולן, עמק החולה, החרמון ותל דן.", "gold"),
  south: subtopic("tour-south", "ים המלח ומדבר יהודה", "הר סדום, עין בוקק, מצד זוהר ומפעלי ים המלח.", "blue"),
};

export const CLASS_VIDEO_SECTIONS: VideoSection[] = [
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
          classPlaylist("tour-galilee-christianity", "יום סיור 13: אתרי נצרות בגליל התחתון", "הר תבור, כפר כנא, נצרת, כנסיית הבשורה והשוק.", "PLDrpeDNLPPRY", tourTopics.galilee, ["נצרות", "הר תבור", "כפר כנא", "נצרת", "כנסיית הבשורה"]),
          classPlaylist("tour-golan-campus-day-one", "יום סיור 14: קמפוס גולן — כנרת ואתרי הנצרות", "היום הראשון בקמפוס גולן: הר האושר, כפר נחום, טבחה ומגדלה.", "PLJH5VNp0wuRc", tourTopics.galilee, ["קמפוס גולן", "כנרת", "הר האושר", "כפר נחום", "טבחה", "מגדלה", "נצרות"]),
          classPlaylist("tour-old-acre", "יום סיור 17: עכו העתיקה", "מבצר ההוספיטלרים, בית הכלא, המסגד הגדול, אתרי הטמפלרים ובית הכנסת של הרמח״ל.", "PLOrhQ0JS8oFQ", tourTopics.galilee, ["עכו", "הוספיטלרים", "צלבנים", "טמפלרים", "מסגד", "רמח״ל", "בית הכלא"]),
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
          classPlaylist("tour-jerusalem-campus", "ימי סיור 18–20: קמפוס ירושלים", "ירושלים בימי בית ראשון ושני: עיר דוד, מנהרות הכותל, דגם בית שני, הרובע היהודי ומרכז דוידסון.", "PLDh3GohtOOHI", tourTopics.jerusalem, ["ירושלים", "בית ראשון", "בית שני", "עיר דוד", "כתף הינום", "נקבת השילוח", "מנהרות הכותל", "הרובע היהודי", "דוידסון"]),
          classPlaylist("tour-christian-jerusalem", "יום סיור 21: ירושלים בימי הנצרות", "הר הזיתים, גת שמנים, קבר מרים, הרובע הארמני, הדורמיציון וחדר הסעודה האחרונה.", "PLX_Z6n_ksQkA", tourTopics.jerusalem, ["ירושלים", "נצרות", "הר הזיתים", "גת שמנים", "קבר מרים", "הרובע הארמני", "דורמיציון", "הסעודה האחרונה"]),
        ],
      },
      {
        id: "tour-golan",
        category: "גולן, חרמון ואצבע הגליל",
        intro: tourTopics.golan.description,
        accent: "gold",
        items: [
          classPlaylist("tour-south-golan", "דרום רמת הגולן", "תיעוד יום הסיור בדרום רמת הגולן.", "PLcixFigNsvIo", tourTopics.golan, ["דרום רמת הגולן", "גולן", "נוף געשי", "גבול"]),
          classPlaylist("tour-hula-north-golan", "יום סיור 15: עמק החולה וצפון רמת הגולן", "הבניאס, תל פאחר, תל חי, כפר גלעדי והר בנטל.", "PLMGWbYxoZDvI", tourTopics.golan, ["עמק החולה", "צפון הגולן", "בניאס", "תל פאחר", "תל חי", "כפר גלעדי", "הר בנטל"]),
          classPlaylist("tour-hermon-nimrod-dan", "יום סיור 16: החרמון, קלעת נמרוד ותל דן", "ברכת רם, שמורת החרמון, כיבוש החרמון, מבצר נמרוד והשערים הקדומים בתל דן.", "PLdZDOIuwz4K0", tourTopics.golan, ["חרמון", "ברכת רם", "קלעת נמרוד", "מבצר נמרוד", "תל דן", "שער כנעני", "שער ישראלי"]),
        ],
      },
      {
        id: "tour-dead-sea-desert",
        category: "ים המלח ומדבר יהודה",
        intro: tourTopics.south.description,
        accent: "blue",
        items: [
          classPlaylist("tour-mount-sodom", "יום סיור 1: הר סדום וים המלח", "שביל הדגים בהר סדום, מפעלי ים המלח, עין בוקק, מצד זוהר והרחבה על הבדואים.", "PL20z4RUH7oooFG5OZUSLfSrJVTvYRDlg2", tourTopics.south, ["הר סדום", "ים המלח", "סדום ועמורה", "עין בוקק", "מצד זוהר", "בדואים"]),
        ],
      },
    ],
  },
];

export const classVideoCount = CLASS_VIDEO_SECTIONS.reduce(
  (sectionTotal, section) => sectionTotal + section.groups.reduce((groupTotal, group) => groupTotal + group.items.length, 0),
  0,
);

// Unique recordings, not playlist placements: overlapping collections remain intact.
export const classRecordingCount = new Set(
  CLASS_VIDEO_SECTIONS.flatMap((section) => section.groups.flatMap((group) =>
    group.items.flatMap((item) => item.parts?.map((part) => part.id) ?? []),
  )),
).size;
