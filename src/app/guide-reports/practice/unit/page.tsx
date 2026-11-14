import Link from "next/link";
import { UnitPractice } from "@/components/guide-reports/UnitPractice";
import { domainStyle } from "@/lib/domains";
import { kit, PenUnderline } from "@/components/trail/kit";
import { PageDecor } from "@/components/trail/PageDecor";

export default function UnitPracticePage() {
  return (
    <div
      className="screen-in relative mx-auto max-w-2xl px-4 py-10"
      style={domainStyle("guide-reports")}
    >
      <PageDecor items={["notes", "pencil", "map", "signpost", "canteen"]} />
      <p className="mb-2 text-sm font-semibold text-txt-dim">
        <Link href="/guide-reports" className="hover:text-txt">
          דוחות הדרכה
        </Link>
        {" · "}
        תרגול
      </p>
      <div className={`${kit.titleWrap} mb-2`}>
        <h1 className="grad-text text-3xl">כתיבת יחידת הדרכה</h1>
        <PenUnderline />
      </div>
      <p className="mb-8 text-[13.5px] leading-relaxed text-txt-dim">
        תרגול חלק II: יחידה קצרה באתר, עם בדיקה אוטומטית של חמש המ״מים (מי,
        מה, מתי, מאיפה, מדוע). אפשר לשמור טיוטה ולהמשיך אחר כך.
      </p>
      <UnitPractice />
    </div>
  );
}
