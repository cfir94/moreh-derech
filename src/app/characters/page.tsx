/**
 * "דבר עם ההיסטוריה": דמויות היסטוריות שמדברים איתן בקול. האפליקציה רצה ב-Worker
 * נפרד (history-talk/) ומוטמעת כאן ב-iframe עם הרשאת מיקרופון.
 */
import type { Metadata } from "next";
import { HistoryTalk } from "@/components/characters/HistoryTalk";

export const metadata: Metadata = {
  title: "דבר עם ההיסטוריה — אֶבֶן דֶּרֶךְ למורי דרך",
  description: "שיחה קולית בעברית עם דמויות היסטוריות — שחזור מבוסס בינה מלאכותית שנשען על המקורות.",
};

export default function CharactersPage() {
  return <HistoryTalk />;
}
