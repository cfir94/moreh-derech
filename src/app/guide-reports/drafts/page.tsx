import Link from "next/link";
import { DraftsList } from "@/components/guide-reports/DraftsList";
import { domainStyle } from "@/lib/domains";
import { kit, PenUnderline } from "@/components/trail/kit";
import { PageDecor } from "@/components/trail/PageDecor";

export default function DraftsPage() {
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
        טיוטות
      </p>
      <div className={`${kit.titleWrap} mb-2`}>
        <h1 className="grad-text text-3xl">טיוטות שמורות</h1>
        <PenUnderline />
      </div>
      <p className="mb-8 text-[13.5px] leading-relaxed text-txt-dim">
        הטיוטות נשמרות בדפדפן במכשיר הזה (localStorage), מופרדות לפי חשבון אם
        התחברתם — כמו מעקב השאלונים. הן לא מסתנכרנות לענן עדיין.
      </p>
      <DraftsList />
    </div>
  );
}
