import Link from "next/link";
import { PartBDrills } from "@/components/guide-reports/PartBDrills";

export const metadata = {
  title: "תרגילי מיקוד — חלק ב׳",
};

export default function DrillsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/guide-reports" className="mb-4 inline-block text-[13px] font-bold text-txt-dim hover:underline">
        ← דוחות הדרכה
      </Link>
      <header className="screen-in mb-7">
        <h1 className="grad-text mb-2 text-3xl">תרגילי מיקוד</h1>
        <p className="leading-relaxed text-txt-dim">
          שאלות קצרות על ההחלטות שמאחורי התוכנית: מה נחשב ״מקראי״, מה צריך בהדרכת דרך, כמה זמן לנסיעה ולארוחת
          צהריים, ואיזו קבוצה לבחור. אחרי כל תשובה — ההסבר מן השיעור.
        </p>
      </header>
      <PartBDrills />
    </div>
  );
}
