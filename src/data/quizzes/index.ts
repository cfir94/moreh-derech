import type { Quiz } from "@/data/quizzes/types";
import christianity from "@/data/quizzes/christianity";
import courseBank from "@/data/quizzes/course-bank";
import floraFauna from "@/data/quizzes/flora-fauna";
import geology from "@/data/quizzes/geology";
import history from "@/data/quizzes/history";
import ironAge from "@/data/quizzes/iron-age";
import israelBorders from "@/data/quizzes/israel-borders";
import judaism from "@/data/quizzes/judaism";
import pastExams from "@/data/quizzes/past-exams";

export const QUIZZES: Quiz[] = [
  pastExams,
  courseBank,
  floraFauna,
  geology,
  history,
  ironAge,
  christianity,
  judaism,
  israelBorders,
];

export const QUIZ_DESCRIPTIONS: Record<string, string> = {
  "course-bank":
    "שאלות ממבחני התרגול של הקורס — עם הסבר לכל תשובה, לפי הנושאים שנלמדו.",
  "past-exams":
    "שאלות אמיתיות ממבחני הרישוי של משרד התיירות, 2021–2025, עם התשובות הרשמיות.",
  "flora-fauna":
    "צמחייה, ציפורים, יונקים, זוחלים, נדידה ובתי גידול — הטבע של ארץ ישראל.",
  geology:
    "טקטוניקת לוחות, סוגי סלעים, בקע ים המלח וגיאומורפולוגיה של הארץ.",
  history:
    "מהתקופות הקדומות ועד ימינו — אירועים, שליטים ותרבויות לאורך ההיסטוריה.",
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
