import Link from "next/link";
import { ExamSimulator } from "@/components/guide-reports/ExamSimulator";

export const metadata = {
  title: "סימולציית חלק ב׳ — מבחן הרישוי",
};

export default function ExamSimulationPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/guide-reports"
        className="mb-4 inline-block text-[13px] font-bold text-txt-dim hover:underline"
      >
        ← דוחות הדרכה
      </Link>

      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">
          חלק ב׳ — תכנון יום סיור לקבוצה
        </h1>
        <p className="max-w-2xl leading-relaxed text-txt-dim">
          החלק הפתוח של מבחן הרישוי, בטפסים המקוריים של משרד התיירות: בוחרים
          קבוצה אחת מבין אלה שבטופס ובונים לה יום שלם — טבלת יום, יחידות הדרכה
          קצרות לפי רשימת דרישות, ויחידה מורחבת אחת. מספר הקבוצות ומספר
          היחידות משתנים בין מועדים, ונטענים מהטופס שבחרתם.
        </p>
      </header>

      <ExamSimulator />
    </div>
  );
}
