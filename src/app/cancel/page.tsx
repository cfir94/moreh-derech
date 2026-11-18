import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { OPERATOR } from "@/data/legal";
import { LAUNCH } from "@/lib/launch";
import { kit, PenUnderline } from "@/components/trail/kit";
import { PageDecor } from "@/components/trail/PageDecor";

export const metadata = pageMeta({
  title: "ביטול מנוי",
  description: "איך מבטלים מנוי באבן דרך למורי דרך: בקישור, במייל או בדואר, ומה קורה אחרי הביטול.",
  path: "/cancel",
});

/*
 * The cancellation link the Consumer Protection Law asks for on the site (sections 13ד and 14ט,
 * legal research 18.11). There is no automatic charge to stop: the subscription is paid up front
 * and never renews by itself, so a request by mail is the whole procedure.
 */
const SUBJECT = "ביטול מנוי";
const BODY = "שלום,\nאני מבקש/ת לבטל את המנוי שלי באבן דרך.\nשם:\nכתובת המייל של החשבון:\n";

export default function CancelPage() {
  const mail = `mailto:${LAUNCH.supportEmail}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
  return (
    <div className="screen-in relative mx-auto max-w-2xl px-4 py-10">
      <PageDecor prints={false} items={["scroll", "pencil"]} />
      <div className={`${kit.titleWrap} mb-4`}>
        <h1 className="grad-text text-3xl">ביטול מנוי</h1>
        <PenUnderline />
      </div>
      <p className="mb-6 text-lg leading-relaxed text-txt">
        אפשר לבטל בכל עת, בלי לנמק. המנוי משולם מראש ואינו מתחדש מעצמו, ולכן אין חיוב חוזר שצריך לעצור.
      </p>
      <a
        href={mail}
        className="mb-8 inline-flex min-h-12 items-center rounded-full bg-teal px-6 py-3 text-lg font-black text-on-accent active:scale-95"
      >
        שליחת בקשת ביטול במייל
      </a>
      <section className="mb-6">
        <h2 className="mb-2 text-lg font-black text-txt">דרכים נוספות</h2>
        <p className="mb-2 leading-relaxed text-txt-dim">
          במייל ישיר ל-<a href={`mailto:${LAUNCH.supportEmail}`} dir="ltr" className="font-bold text-teal">{LAUNCH.supportEmail}</a>, או בדואר ל{OPERATOR.name}, {OPERATOR.address}.
          בהודעה מספיק לכתוב שם, כתובת המייל של החשבון, ושאתם מבקשים לבטל.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="mb-2 text-lg font-black text-txt">מה קורה אחרי הביטול</h2>
        <p className="mb-2 leading-relaxed text-txt-dim">
          נאשר במייל שקיבלנו את הבקשה. הגישה לתוכן בתשלום נסגרת תוך 3 ימי עסקים, וההתקדמות שלכם נשמרת.
          החזר כספי, כשמגיע, מועבר תוך 14 יום, כמפורט ב<Link href="/legal/cancellation/" className="font-bold text-teal">מדיניות הביטול וההחזרים</Link>.
        </p>
      </section>
    </div>
  );
}
