"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readSession } from "@/lib/cloudAuth";
import { LAUNCH, PRICES, yearlySavingsMonths } from "@/lib/launch";

type PlanId = "monthly" | "yearly";

const INCLUDED = [
  "כל השאלונים, לפי נושאי הסילבוס",
  "מבחני רישוי מלאים בתנאי אמת, עם מפתח רשמי",
  "תרגול טעויות חכם שזוכר מה עוד לא יושב",
  "צירי זמן, מפת למידה ואטלס הזמן",
  "משחקים, תשבץ שבועי ומוטי — מורה הדרך שבוחן אתכם",
];

/** כרטיסי המחיר. בלי md-api פעיל, הכפתור פותח מייל במקום דף תשלום. */
export function PricingCards({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  const checkout = async (plan: PlanId) => {
    setError("");
    const session = readSession();
    if (!session) {
      router.push("/login/");
      return;
    }
    if (!LAUNCH.apiOrigin) {
      window.location.assign(`mailto:${LAUNCH.supportEmail}?subject=${encodeURIComponent(`מנוי ${plan === "yearly" ? "שנתי" : "חודשי"} — ${session.email}`)}`);
      return;
    }
    setBusy(plan);
    try {
      const res = await fetch(`${LAUNCH.apiOrigin}/billing/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; messageHe?: string };
      if (!res.ok || !data.url) throw new Error(data.messageHe || "לא הצלחנו לפתוח את דף התשלום. נסו שוב בעוד רגע.");
      window.location.assign(data.url);
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  };

  const cards: { id: PlanId; title: string; price: number; per: string; note: string; featured?: boolean }[] = [
    { id: "monthly", title: "חודשי", price: PRICES.monthly, per: "לחודש", note: "מתחדש כל חודש, ביטול בכל רגע מהאזור האישי" },
    {
      id: "yearly",
      title: "שנתי",
      price: PRICES.yearly,
      per: "לשנה",
      note: `${yearlySavingsMonths} חודשים מתנה לעומת החודשי`,
      featured: true,
    },
  ];

  return (
    <div>
      <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`relative flex flex-col rounded-lg border bg-card p-6 ${card.featured ? "border-teal shadow-[0_18px_40px_-24px_var(--teal)]" : "border-line"}`}
          >
            {card.featured && (
              <span className="absolute -top-3 right-5 rounded-full bg-teal px-3 py-1 text-xs font-extrabold text-on-accent">הכי משתלם</span>
            )}
            <h3 className="text-lg font-black text-txt">{card.title}</h3>
            <p className="mt-2 flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-txt">{card.price} ₪</span>
              <span className="text-sm text-txt-dim">{card.per}</span>
            </p>
            <p className="mt-1 text-sm text-txt-dim">{card.note}</p>
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
              disabled={busy !== null}
              onClick={() => void checkout(card.id)}
              className={`mt-5 rounded-full px-4 py-3.5 font-extrabold transition active:scale-95 disabled:opacity-60 ${
                card.featured ? "text-on-accent" : "border border-line bg-card-2 text-txt"
              }`}
              style={card.featured ? { background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)" } : undefined}
            >
              {busy === card.id ? "פותח את דף התשלום…" : `בחירה במנוי ${card.title}`}
            </button>
          </div>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-red">{error}</p>}
      <p className="mt-4 text-center text-xs leading-relaxed text-txt-dim">
        תשלום מאובטח בחברת סליקה ישראלית · חשבונית במייל · שאלות?{" "}
        <a href={`mailto:${LAUNCH.supportEmail}`} className="font-bold text-teal" dir="ltr">{LAUNCH.supportEmail}</a> ·{" "}
        <Link href="/legal/cancellation" className="font-bold text-teal">מדיניות ביטול</Link>
      </p>
    </div>
  );
}
