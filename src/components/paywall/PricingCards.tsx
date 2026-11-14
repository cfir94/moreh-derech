"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useUser } from "@/contexts/UserContext";
import { LAUNCH, PRICES } from "@/lib/launch";
import { fetchMyProfile, requestJoin, type JoinPlan } from "@/lib/manualAccess";
import { OwnerCard } from "./OwnerCard";
import { SIGN_STYLE } from "@/components/trail/kit";

const INCLUDED = [
  "כל השאלונים, לפי נושאי הסילבוס",
  "מבחני רישוי מלאים בתנאי אמת, עם מפתח רשמי",
  "תרגול טעויות שזוכר מה עוד לא יושב",
  "מפות, צירי זמן, אטלס הזמן ומגדיר הצמחים",
  "משחקים, תשבץ שבועי ומוטי, מורה הדרך שבוחן אתכם",
];

const CARDS: { id: JoinPlan; title: string; price: number; list: number; note: string; featured?: boolean }[] = [
  { id: "halfyear", title: "חצי שנה", price: PRICES.halfyear, list: PRICES.halfyearList, note: "מתאים לתקופת הקורס והמבחן" },
  { id: "yearly", title: "שנה", price: PRICES.yearly, list: PRICES.yearlyList, note: "גם לשנה הראשונה בשטח", featured: true },
];

const field = "rounded-md border border-line bg-sheet px-3.5 py-3 text-base outline-none transition focus:border-teal";

/**
 * הצטרפות בתשלום ידני (docs/launch/PAYMENTS-MANUAL.md): בוחרים תקופה, משאירים פרטים, והבעלים חוזר
 * אליכם וסוגר תשלום. בלי סליקה ובלי לצאת מהאתר.
 */
export function PricingCards({ compact = false }: { compact?: boolean }) {
  const { user } = useUser();
  const [plan, setPlan] = useState<JoinPlan | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; phone: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const choose = (id: JoinPlan) => {
    setPlan(id);
    setError("");
    if (user && !profile) void fetchMyProfile().then((p) => setProfile(p ?? { full_name: user.name, phone: "" }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!plan) return;
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!fullName || phone.replace(/\D/g, "").length < 9) {
      setError("צריך שם וטלפון, כדי שאוכל לחזור אליכם.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await requestJoin({ plan, fullName, phone, note: String(form.get("note") ?? "").trim() });
      setSent(true);
    } catch {
      setError(`לא הצלחתי לשמור את הבקשה. אפשר לכתוב ישירות ל-${LAUNCH.supportEmail}.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
        {CARDS.map((card) => (
          <div
            key={card.id}
            className={`relative flex flex-col rounded-lg border bg-card p-6 ${card.featured ? "border-teal shadow-[0_18px_40px_-24px_var(--teal)]" : "border-line"}`}
          >
            {card.featured && (
              <span className="absolute -top-3 right-5 rounded-full bg-teal px-3 py-1 text-sm font-extrabold text-on-accent">הכי משתלם</span>
            )}
            <h3 className="text-lg font-black text-txt">{card.title}</h3>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black text-txt">{card.price} ₪</span>
              <s className="text-sm text-txt-dim">{card.list} ₪</s>
            </p>
            <p className="mt-1 text-sm text-txt-dim">{card.note}. תשלום אחד, בלי חיוב אוטומטי.</p>
            {!compact && (
              <ul className="mt-4 flex flex-col gap-2 text-sm text-txt">
                {INCLUDED.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span aria-hidden className="text-teal">✓</span>
                    {line}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              aria-pressed={plan === card.id}
              onClick={() => choose(card.id)}
              className={`mt-5 rounded-full px-4 py-3.5 font-extrabold transition active:scale-95 ${
                card.featured || plan === card.id ? "text-on-accent" : "border border-line bg-card-2 text-txt"
              }`}
              style={card.featured || plan === card.id ? SIGN_STYLE : undefined}
            >
              {plan === card.id ? "נבחר ✓" : `רוצה ${card.title}`}
            </button>
          </div>
        ))}
      </div>

      {plan && (
        <div className="screen-in mt-5 paper-sheet p-5" data-join-form>
          <OwnerCard />
          {sent ? (
            <p role="status" className="mt-4 text-base font-bold text-txt">
              קיבלתי! אחזור אליכם בטלפון או במייל, בדרך כלל עוד היום, ונסגור את התשלום.
            </p>
          ) : !user ? (
            <p className="mt-4 text-sm text-txt">
              כדי שאוכל להפעיל לכם את המנוי, קודם{" "}
              <Link href="/login/" className="font-bold text-teal">נרשמים או נכנסים</Link>, ואז חוזרים לכאן.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
              <p className="text-sm text-txt-dim">
                בחרתם {plan === "yearly" ? `שנה, ${PRICES.yearly} ₪` : `חצי שנה, ${PRICES.halfyear} ₪`}. משאירים פרטים, ואני חוזר אליכם לסגור תשלום בביט.
              </p>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                שם
                <input name="name" required autoComplete="name" defaultValue={profile?.full_name ?? user.name} key={profile?.full_name} className={field} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                טלפון
                <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" defaultValue={profile?.phone ?? ""} key={profile?.phone} className={field} placeholder="050-0000000" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                הערה <span className="font-normal text-txt-dim">(לא חובה)</span>
                <textarea name="note" rows={2} maxLength={1000} className={field} />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="mt-1 rounded-full px-4 py-3.5 font-extrabold text-on-accent transition active:scale-95 disabled:opacity-60"
                style={SIGN_STYLE}
              >
                {busy ? "שולח…" : "שליחה"}
              </button>
              {error && <p role="alert" className="text-sm font-bold text-red">{error}</p>}
            </form>
          )}
        </div>
      )}

      <p className="mt-4 text-center text-sm leading-relaxed text-txt-dim">
        תשלום אחד לכל התקופה, בהעברה, עם קבלה · שאלות?{" "}
        <a href={`mailto:${LAUNCH.supportEmail}`} className="font-bold text-teal" dir="ltr">{LAUNCH.supportEmail}</a> ·{" "}
        <Link href="/legal/cancellation" className="font-bold text-teal">מדיניות ביטול</Link>
      </p>
    </div>
  );
}
