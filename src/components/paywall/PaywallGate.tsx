"use client";

/**
 * שער התשלום (B-03): עוטף את תוכן הדף ב-layout. כבוי לגמרי כש-LAUNCH.paywall כבוי.
 * דף חינמי (src/lib/plans.ts) מוצג תמיד. דף בתשלום מוצג עם גישה (ניסיון או מנוי), ובלעדיה
 * מוצג מסך הסבר עם צעד אחד קדימה. זו חסימה בצד הלקוח ("רכה"), כמתוכנן ב-docs/launch/PLAN.md.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PricingCards } from "@/components/paywall/PricingCards";
import { refreshEntitlement, useAccess } from "@/lib/accessStore";
import { hasAccess, startTrial } from "@/lib/entitlement";
import { PRICES } from "@/lib/launch";
import { useLaunch } from "@/lib/launchClient";
import { isFreePath } from "@/lib/plans";

const cta =
  "inline-block rounded-full px-6 py-3.5 font-extrabold text-on-accent transition active:scale-95 disabled:opacity-60";
const ctaStyle = { background: "var(--teal)", boxShadow: "var(--shadow)" };

export function PaywallGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { access, known } = useAccess();
  const { paywall } = useLaunch();
  if (!paywall || isFreePath(pathname)) return <>{children}</>;
  if (hasAccess(access)) {
    return (
      <>
        {access.kind === "trial" && <TrialBanner daysLeft={access.daysLeft} />}
        {children}
      </>
    );
  }
  if (!known) return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-txt-dim">טוען…</div>;
  return <Locked kind={access.kind} />;
}

function TrialBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="border-b border-line bg-card px-4 py-2 text-center text-sm">
      {daysLeft === 1 ? "היום האחרון" : `נותרו ${daysLeft} ימים`} בשבוע הניסיון ·{" "}
      <Link href="/pricing/" className="font-bold text-teal underline-offset-2 hover:underline">
        הצטרפות: {PRICES.halfyear} ₪ לחצי שנה
      </Link>
    </div>
  );
}

function Locked({ kind }: { kind: "guest" | "none" | "expired" | "trial" | "paid" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const begin = async () => {
    setBusy(true);
    setError("");
    try {
      await startTrial(true, false);
      await refreshEntitlement(true);
    } catch {
      setError("לא הצלחנו לפתוח את הניסיון. נסו שוב בעוד רגע.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen-in mx-auto max-w-3xl px-4 py-14">
      <div className="relative overflow-hidden rounded-lg border border-line bg-card p-8 text-center">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-[12px]"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--teal) 26%, transparent), transparent 65%)" }}
        />
        <div aria-hidden className="relative mb-3 text-5xl">🧭</div>
        {kind === "expired" ? (
          <>
            <h1 className="grad-text relative mb-2 text-3xl">שבוע הניסיון הסתיים</h1>
            <p className="relative mx-auto mb-8 max-w-md leading-relaxed text-txt-dim">
              ההתקדמות שלכם שמורה, כולל השאלות שמחכות לחזרה. בוחרים מנוי וממשיכים בדיוק מאיפה שעצרתם.
            </p>
            <div className="relative text-start"><PricingCards compact /></div>
          </>
        ) : kind === "none" ? (
          <>
            <h1 className="grad-text relative mb-2 text-3xl">{PRICES.trialDays} ימים חינם, הכול פתוח</h1>
            <p className="relative mx-auto mb-6 max-w-md leading-relaxed text-txt-dim">
              בלי כרטיס אשראי ובלי התחייבות. בסוף השבוע תחליטו אם להמשיך.
            </p>
            <button type="button" onClick={() => void begin()} disabled={busy} className={cta} style={ctaStyle}>
              {busy ? "פותח…" : "מתחילים את שבוע הניסיון"}
            </button>
            <p className="relative mt-3 text-xs text-txt-dim">
              בלחיצה אתם מאשרים את <Link href="/legal/terms" className="font-bold text-teal">תנאי השימוש</Link>.
            </p>
            {error && <p role="alert" className="relative mt-3 text-sm font-bold text-red">{error}</p>}
          </>
        ) : (
          <>
            <h1 className="grad-text relative mb-2 text-3xl">החלק הזה פתוח למנויים</h1>
            <p className="relative mx-auto mb-6 max-w-md leading-relaxed text-txt-dim">
              נרשמים עם מייל ומקבלים {PRICES.trialDays} ימים ראשונים חינם, בלי כרטיס אשראי. ההתקדמות נשמרת בחשבון.
            </p>
            <Link href="/login/" className={cta} style={ctaStyle}>
              הרשמה — שבוע ראשון חינם
            </Link>
            <p className="relative mt-4 text-sm text-txt-dim">
              <Link href="/welcome/" className="font-bold text-teal">מה יש באתר?</Link> ·{" "}
              <Link href="/pricing/" className="font-bold text-teal">מחירים</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
