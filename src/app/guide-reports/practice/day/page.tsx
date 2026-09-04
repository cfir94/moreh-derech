import Link from "next/link";
import { DaySimulator } from "@/components/guide-reports/DaySimulator";
import { domainStyle } from "@/lib/domains";

export default function DayPracticePage() {
  return (
    <div
      className="screen-in mx-auto max-w-3xl px-4 py-10"
      style={domainStyle("guide-reports")}
    >
      <p className="mb-2 text-[12px] font-semibold text-txt-dim">
        <Link href="/guide-reports" className="hover:text-txt">
          דוחות הדרכה
        </Link>
        {" · "}
        תרגול
      </p>
      <h1 className="grad-text mb-2 text-3xl">סימולטור יום סיור</h1>
      <p className="mb-8 text-[13.5px] leading-relaxed text-txt-dim">
        תרגול בסגנון חלק ב׳ של מבחן הרישוי: בוחרים קבוצה עם אילוצים, ובונים
        לוח זמנים (חלק I של דו״ח הסיור) — נסיעות, אתרים, הדרכות דרך ומנהלות.
      </p>
      <DaySimulator />
    </div>
  );
}
