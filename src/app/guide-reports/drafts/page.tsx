import Link from "next/link";
import { DraftsList } from "@/components/guide-reports/DraftsList";
import { domainStyle } from "@/lib/domains";

export default function DraftsPage() {
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
        טיוטות
      </p>
      <h1 className="grad-text mb-2 text-3xl">טיוטות שמורות</h1>
      <p className="mb-8 text-[13.5px] leading-relaxed text-txt-dim">
        הטיוטות נשמרות בדפדפן במכשיר הזה (localStorage), מופרדות לפי חשבון אם
        התחברתם — כמו מעקב השאלונים. הן לא מסתנכרנות לענן עדיין.
      </p>
      <DraftsList />
    </div>
  );
}
