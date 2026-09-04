import Link from "next/link";
import { UnitPractice } from "@/components/guide-reports/UnitPractice";
import { domainStyle } from "@/lib/domains";

export default function UnitPracticePage() {
  return (
    <div
      className="screen-in mx-auto max-w-2xl px-4 py-10"
      style={domainStyle("guide-reports")}
    >
      <p className="mb-2 text-[12px] font-semibold text-txt-dim">
        <Link href="/guide-reports" className="hover:text-txt">
          דוחות הדרכה
        </Link>
        {" · "}
        תרגול
      </p>
      <h1 className="grad-text mb-2 text-3xl">כתיבת יחידת הדרכה</h1>
      <p className="mb-8 text-[13.5px] leading-relaxed text-txt-dim">
        תרגול חלק II: יחידה קצרה באתר, עם בדיקה אוטומטית של חמש המ״מים (מי,
        מה, מתי, מאיפה, מדוע). אפשר לשמור טיוטה ולהמשיך אחר כך.
      </p>
      <UnitPractice />
    </div>
  );
}
