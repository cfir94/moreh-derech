import type { Metadata } from "next";
import Link from "next/link";
import { PricingCards } from "@/components/paywall/PricingCards";
import { PRICES } from "@/lib/launch";

export const metadata: Metadata = {
  title: "מחירים — אבן דרך למורי דרך",
  description: `מנוי חודשי ${PRICES.monthly} ₪ או שנתי ${PRICES.yearly} ₪, ושבוע ראשון חינם בלי כרטיס אשראי.`,
};

export default function PricingPage() {
  return (
    <div className="screen-in mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="grad-text text-4xl">מחיר אחד, הכול פתוח</h1>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-txt-dim">
          {PRICES.trialDays} ימים ראשונים חינם, בלי כרטיס אשראי. אחר כך בוחרים מנוי, ומבטלים בכל רגע מהאזור האישי.
        </p>
      </header>
      <PricingCards />
      <section className="mx-auto mt-12 max-w-2xl">
        <h2 className="mb-4 text-xl font-black text-txt">שאלות על התשלום</h2>
        <dl className="flex flex-col gap-4 text-sm leading-relaxed">
          <div>
            <dt className="font-bold text-txt">מה קורה בסוף שבוע הניסיון?</dt>
            <dd className="text-txt-dim">כלום, אם לא בחרתם מנוי. לא ביקשנו כרטיס אשראי, ולכן אין חיוב אוטומטי. התוכן בתשלום פשוט נחסם, וההתקדמות נשמרת.</dd>
          </div>
          <div>
            <dt className="font-bold text-txt">איך מבטלים?</dt>
            <dd className="text-txt-dim">כפתור אחד באזור האישי. המנוי לא יתחדש, והגישה נמשכת עד סוף התקופה ששולמה. פרטים ב<Link href="/legal/cancellation" className="font-bold text-teal">מדיניות הביטול</Link>.</dd>
          </div>
          <div>
            <dt className="font-bold text-txt">מקבלים חשבונית?</dt>
            <dd className="text-txt-dim">כן, במייל, אוטומטית אחרי כל תשלום.</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
