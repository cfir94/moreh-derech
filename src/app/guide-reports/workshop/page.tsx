import Link from "next/link";
import { PartBWorkshop } from "@/components/guide-reports/PartBWorkshop";
import { SESSION_DATE } from "@/data/guide-reports/coordinator-session";

export const metadata = {
  title: "סדנת תכנון — חלק ב׳ במבחן הרישוי",
};

export default function WorkshopPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/guide-reports" className="mb-4 inline-block text-[13px] font-bold text-txt-dim hover:underline">
        ← דוחות הדרכה
      </Link>
      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">סדנת תכנון — חלק ב׳</h1>
        <p className="max-w-2xl leading-relaxed text-txt-dim">
          השיטה שהרכז לימד בשיעור של {SESSION_DATE}, שלב אחר שלב: בוחרים קבוצה לפי היחידה המורחבת, קוראים כל מילה,
          עושים סיעור מוחין לכל דרישה, מסדרים לפי המפה עם זמני נסיעה וארוחת צהריים, ובודקים בעיני הבוחן. בסוף התוכנית
          עוברת לסימולטור הכתיבה. בכל שלב — קודם אתם, ואחר כך המפתח.
        </p>
        <p className="mt-2 text-[13px]">
          <Link href="/guide-reports/coordinator" className="font-bold text-teal hover:underline">כל דגשי הרכז</Link>
          {" · "}
          <Link href="/guide-reports/drills" className="font-bold text-teal hover:underline">תרגילי מיקוד</Link>
        </p>
      </header>
      <PartBWorkshop />
    </div>
  );
}
