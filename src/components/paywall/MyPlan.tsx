"use client";

/** "התוכנית שלי" באזור האישי (B-03). מוצג רק כשה-Paywall פעיל. */
import Link from "next/link";
import { useState } from "react";
import { readSession } from "@/lib/cloudAuth";
import { refreshEntitlement, useAccess } from "@/lib/accessStore";
import { LAUNCH } from "@/lib/launch";
import { useLaunch } from "@/lib/launchClient";
import { SIGN_STYLE } from "@/components/trail/kit";

const date = (d: Date) => d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });

export function MyPlan() {
  const { access, known } = useAccess();
  const { paywall } = useLaunch();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  if (!paywall || !known) return null;

  const cancel = async () => {
    const session = readSession();
    if (!session) return;
    if (!LAUNCH.apiOrigin) {
      window.location.assign(`mailto:${LAUNCH.supportEmail}?subject=${encodeURIComponent(`ביטול מנוי — ${session.email}`)}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${LAUNCH.apiOrigin}/billing/cancel`, {
        method: "POST",
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error();
      await refreshEntitlement(true);
      setMessage("המנוי בוטל. הוא לא יתחדש, והגישה נשארת עד סוף התקופה ששולמה. אישור נשלח במייל.");
    } catch {
      setMessage(`הביטול לא הושלם. נסו שוב, או כתבו ל-${LAUNCH.supportEmail} ונבטל ידנית.`);
    } finally {
      setBusy(false);
    }
  };

  let title = "";
  let detail = "";
  if (access.kind === "trial") {
    title = "שבוע ניסיון";
    detail = `נשארו ${access.daysLeft} ימים (עד ${date(access.endsAt)}).`;
  } else if (access.kind === "paid") {
    title = access.plan === "yearly" ? "מנוי לשנה" : access.plan === "halfyear" ? "מנוי לחצי שנה" : "גישה מלאה";
    detail = access.until
      ? access.canceling
        ? `בוטל. הגישה נמשכת עד ${date(access.until)}.`
        : `בתוקף עד ${date(access.until)}. חודש לפני כן נשלח תזכורת.`
      : "ללא הגבלת זמן.";
  } else if (access.kind === "expired") {
    title = "אין מנוי פעיל";
    detail = "ההתקדמות שלכם שמורה. בוחרים מנוי וממשיכים מאותה נקודה.";
  } else {
    title = "עוד לא התחלתם";
    detail = "שבוע ניסיון חינם נפתח בכניסה הראשונה לתוכן.";
  }

  return (
    <section className="mb-8 paper-sheet p-5" aria-labelledby="my-plan-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="my-plan-title" className="text-lg font-black text-txt">התוכנית שלי: {title}</h2>
          <p className="text-sm text-txt-dim">{detail}</p>
        </div>
        {access.kind === "paid" && access.until && !access.canceling && false ? (
          <button type="button" disabled={busy} onClick={() => void cancel()} className="rounded-full border border-line bg-card-2 px-4 py-2.5 text-sm font-bold transition active:scale-95">
            {busy ? "מבטל…" : "ביטול מנוי"}
          </button>
        ) : access.kind !== "paid" ? (
          <Link href="/pricing/" className="rounded-full px-4 py-2.5 text-sm font-extrabold text-on-accent" style={SIGN_STYLE}>
            הצטרפות
          </Link>
        ) : null}
      </div>
      {message && <p role="status" className="mt-3 text-sm font-bold text-txt">{message}</p>}
    </section>
  );
}
