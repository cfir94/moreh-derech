import Link from "next/link";
import { DaySimulator } from "@/components/guide-reports/DaySimulator";
import { domainStyle } from "@/lib/domains";
import { kit, PenUnderline } from "@/components/trail/kit";
import { PageDecor } from "@/components/trail/PageDecor";

export default function DayPracticePage() {
  return (
    <div
      className="screen-in relative mx-auto max-w-3xl px-4 py-10"
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
        <h1 className="grad-text text-3xl">סימולטור יום סיור</h1>
        <PenUnderline />
      </div>
      <p className="mb-8 text-[13.5px] leading-relaxed text-txt-dim">
        תרגול בסגנון חלק ב׳ של מבחן הרישוי: בוחרים קבוצה עם אילוצים, ובונים
        לוח זמנים (חלק I של דו״ח הסיור) — נסיעות, אתרים, הדרכות דרך ומנהלות.
      </p>
      <DaySimulator />
    </div>
  );
}
