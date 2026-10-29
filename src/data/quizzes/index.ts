import mosheUpcomingExam from "@/data/quizzes/moshe-upcoming-exam";
import type { Quiz } from "@/data/quizzes/types";
import archaeologyIntro from "@/data/quizzes/archaeology-intro";
import bronzeAge from "@/data/quizzes/bronze-age";
import christianity from "@/data/quizzes/christianity";
import courseBank from "@/data/quizzes/course-bank";
import examBank from "@/data/quizzes/exam-bank";
import floraFauna from "@/data/quizzes/flora-fauna";
import geology from "@/data/quizzes/geology";
import ironAge from "@/data/quizzes/iron-age";
import secondTemple from "@/data/quizzes/second-temple";
import israelBorders from "@/data/quizzes/israel-borders";
import judaism from "@/data/quizzes/judaism";
import pastExams from "@/data/quizzes/past-exams";
import prehistory from "@/data/quizzes/prehistory";
import romanByzantine from "@/data/quizzes/roman-byzantine";
import classicalArchitecture from "@/data/quizzes/classical-architecture";
import earlyIslam from "@/data/quizzes/early-islam";
import medieval from "@/data/quizzes/medieval";
import ottoman from "@/data/quizzes/ottoman";

export const QUIZZES: Quiz[] = [
  mosheUpcomingExam,
  pastExams,
  examBank,
  courseBank,
  floraFauna,
  geology,
  prehistory,
  archaeologyIntro,
  bronzeAge,
  ironAge,
  secondTemple,
  romanByzantine,
  classicalArchitecture,
  earlyIslam,
  medieval,
  ottoman,
  christianity,
  judaism,
  israelBorders,
];

export const QUIZ_DESCRIPTIONS: Record<string, string> = {
  "moshe-upcoming-exam": "שאלון זמני שהכין משה מהכיתה למבחן הקרוב — 400 שאלות השלמה ורב־ברירה, עם המפתח שלו.",
  "second-temple":
    "שיבת ציון, הלניזם וחשמונאים, כתות ומגילות, הורדוס ומפעליו, השלטון הרומי והמרד הגדול.",
  ottoman:
    "השלטון העות׳מאני, צפת וירושלים, שליטי הגליל ועכו, נפוליאון, רפורמות והתיישבות.",
  medieval:
    "ממלכות הצלבנים, מסדרים ומבצרים, האיובים, חיטין, הממלוכים והמורשת הבנויה.",
  "early-islam":
    "ראשית האסלאם, האומיים והעבאסים, הפאטימים, רמלה, ירושלים ושינויי ההתיישבות.",
  "classical-architecture":
    "סדרים ומקדשים, תכנון עיר, מבני בידור, מרחצאות, אמות מים, טהרה וקבורה.",
  "roman-byzantine":
    "מרד בר כוכבא, משנה ותלמוד, התנצרות האימפריה, בתי כנסת, כנסיות ומפת מידבא.",
  "course-bank":
    "שאלות ממבחני התרגול של הקורס — עם הסבר לכל תשובה, לפי הנושאים שנלמדו.",
  "past-exams":
    "שאלות רב־ברירה ממבחני הרישוי 2016–2026. לחלק מהמועדים מפתח רשמי, ובמועדים אחרים הפתרונות מוסקים ומסומנים בהתאם.",
  "exam-bank":
    "2,634 שאלות ממבחני הרישוי 2000–2017, ממוינות ל-23 נושאים — כולל נושאים שאין להם שאלון אחר.",
  "flora-fauna":
    "צמחייה, ציפורים, יונקים, זוחלים, נדידה ובתי גידול — הטבע של ארץ ישראל.",
  geology:
    "טקטוניקת לוחות, סוגי סלעים, בקע ים המלח וגיאומורפולוגיה של הארץ.",
  prehistory:
    "אבולוציית האדם, פליאולית, התרבות הנטופית והמהפכה החקלאית — ניאולית וכלקוליתי.",
  "archaeology-intro":
    "תל, שכבה וטיפולוגיה, שיטות חפירה ותיארוך, וחלוצי המחקר הארכיאולוגי בארץ.",
  "bronze-age":
    "ברונזה קדומה, ביניימית, תיכונה ומאוחרת — ערים, ביצורים, מצרים וכנען.",
  "iron-age":
    "ממלכות ישראל ויהודה, ערים מרכזיות, ממצאים וכתובות מתקופת הברזל.",
  christianity:
    "יסודות האמונה, כתבי הקודש, זרמים, פולחן ואתרים נוצריים בארץ הקודש.",
  judaism:
    "אמונה וזהות, ארון הספרים, הלוח העברי, מועדים, תפילה ואורח חיים יהודי.",
  "israel-borders":
    "גבולות טבעיים, מקראיים, הלכתיים ומדיניים — והשתנותם לאורך ההיסטוריה.",
};

export function getQuiz(slug: string): Quiz | undefined {
  return QUIZZES.find((q) => q.slug === slug);
}
