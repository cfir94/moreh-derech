import type { Quiz } from "@/data/quizzes/types";
import floraFauna from "@/data/quizzes/flora-fauna";
import geology from "@/data/quizzes/geology";
import history from "@/data/quizzes/history";
import ironAge from "@/data/quizzes/iron-age";
import pastExams from "@/data/quizzes/past-exams";

export const QUIZZES: Quiz[] = [pastExams, floraFauna, geology, history, ironAge];

export const QUIZ_DESCRIPTIONS: Record<string, string> = {
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
};

export function getQuiz(slug: string): Quiz | undefined {
  return QUIZZES.find((q) => q.slug === slug);
}
