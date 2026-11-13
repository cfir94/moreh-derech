"use client";

/**
 * הרשמה וכניסה בקוד חד-פעמי למייל (A-01): מייל ← קוד ← (משתמש חדש) שם ← בפנים.
 * בלי סיסמה. אותו חשבון כמו במשחק "אבן דרך", כי Supabase מזהה את המשתמש לפי המייל.
 * כשהתשלום דולק (NEXT_PUBLIC_PAYWALL), אחרי כניסה ראשונה נפתח שבוע ניסיון (md_start_trial).
 */
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { friendlyAuthError, requestEmailCode, saveProfileDetails } from "@/lib/cloudAuth";
import { cohortLabel, fetchCohorts, saveSignupDetails, type Cohort } from "@/lib/manualAccess";
import { startTrial } from "@/lib/entitlement";
import { LAUNCH, PRICES } from "@/lib/launch";

type Step = "email" | "code" | "profile";

const RESEND_SECONDS = 45;
const field =
  "rounded-md border border-line bg-sheet px-3.5 py-3 text-base outline-none transition focus:border-teal";
const primary = "mt-2 rounded-full px-4 py-4 font-extrabold text-on-accent transition active:scale-95 disabled:opacity-60";
const primaryStyle = {
  background: "var(--teal)",
  boxShadow: "var(--shadow)",
};

export function EmailCodeLogin({ onUseLegacy }: { onUseLegacy?: () => void }) {
  const router = useRouter();
  const { verifyCode, completeLink } = useUser();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const codeInput = useRef<HTMLInputElement>(null);
  const [cohorts, setCohorts] = useState<Cohort[] | null>(null);

  useEffect(() => {
    if (step !== "profile" || cohorts) return;
    // בלי טבלת המחזורים (לפני הרצת ה-SQL) נשארים עם שדה טקסט חופשי.
    void fetchCohorts().then(setCohorts, () => setCohorts([]));
  }, [step, cohorts]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  // חזרה מקישור במייל (כשהתבנית שולחת קישור ולא קוד).
  useEffect(() => {
    if (!window.location.hash.includes("access_token=")) return;
    const hash = window.location.hash;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL hash is only readable after hydration
    setBusy(true);
    completeLink(hash)
      .then((result) => {
        if (!result) return;
        if (result.needsName) setStep("profile");
        else router.replace("/me");
      })
      .catch((err) => setError(friendlyAuthError(err)))
      .finally(() => setBusy(false));
  }, [completeLink, router]);

  useEffect(() => {
    if (step === "code") codeInput.current?.focus();
  }, [step]);

  const sendCode = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError("נראה שהמייל לא תקין. בדקו ונסו שוב.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await requestEmailCode(clean);
      setEmail(clean);
      setCode("");
      setStep("code");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digits = code.replace(/\D/g, "");
    if (digits.length < 6) {
      setError("הקוד מהמייל הוא בן 6 ספרות לפחות.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await verifyCode(email, digits);
      if (result.needsName) setStep("profile");
      else {
        // משתמש קיים: אם עוד אין לו ניסיון, הוא נפתח בשקט (אידמפוטנטי).
        // רק כשיש תשלום: אחרת השבוע היה נשרף לפני שיש מה לנסות.
        if (LAUNCH.paywall) await startTrial(false, false).catch(() => null);
        router.replace("/me");
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const classCode = String(form.get("classCode") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const cohort = cohorts?.find((c) => String(c.id) === String(form.get("cohort") ?? "")) ?? null;
    const terms = form.get("terms") === "on";
    const marketing = form.get("marketing") === "on";
    if (!name) {
      setError("איך לקרוא לכם? השם מופיע רק אצלכם ובטבלאות הכיתה.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      setError("צריך מספר טלפון, כדי שנוכל לחזור אליכם.");
      return;
    }
    if (!terms) {
      setError("כדי להמשיך צריך לאשר את תנאי השימוש.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (cohorts && cohorts.length) await saveSignupDetails({ fullName: name, phone, cohort });
      else {
        await saveProfileDetails(name, classCode);
        await saveSignupDetails({ fullName: name, phone, cohort: null }).catch(() => null);
      }
      if (LAUNCH.paywall) await startTrial(true, marketing).catch(() => null);
      router.replace("/me?welcome=1");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <ol className="relative mb-6 flex items-center gap-2 text-xs font-bold text-txt-dim" aria-label="שלבי הכניסה">
        {(["email", "code", "profile"] as const).map((s, i) => (
          <li key={s} className="flex items-center gap-2" aria-current={step === s ? "step" : undefined}>
            <span
              className={`grid size-6 place-items-center rounded-full border ${
                step === s ? "border-teal bg-teal/15 text-teal" : "border-line"
              }`}
            >
              {i + 1}
            </span>
            {s === "email" ? "מייל" : s === "code" ? "קוד" : "פרטים"}
            {i < 2 && <span aria-hidden className="h-px w-5 bg-line" />}
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="relative mb-4 rounded-sm border border-line px-3.5 py-2.5 text-sm font-bold text-red">
          {error}
        </p>
      )}

      {step === "email" && (
        <form onSubmit={sendCode} className="relative flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            המייל שלכם
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
              placeholder="you@example.com"
            />
          </label>
          <p className="text-sm leading-relaxed text-txt-dim">
            נשלח אליכם קוד כניסה. בלי סיסמה לזכור.
            {LAUNCH.paywall && <> נרשמים בפעם הראשונה? {PRICES.trialDays} ימים ראשונים בחינם, בלי כרטיס אשראי.</>}
          </p>
          <button type="submit" disabled={busy} className={primary} style={primaryStyle}>
            {busy ? "שולח…" : "שלחו לי קוד"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={submitCode} className="relative flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-txt-dim">
            שלחנו קוד ל-<bdi className="font-bold text-txt" dir="ltr">{email}</bdi>. לא מוצאים? בדקו גם בתיקיית הספאם או ב&quot;קידומי מכירות&quot;.
          </p>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            הקוד מהמייל
            <input
              ref={codeInput}
              name="code"
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9 ]*"
              maxLength={12}
              dir="ltr"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ""))}
              className={`${field} text-center font-mono text-2xl tracking-[0.4em]`}
              placeholder="••••••"
            />
          </label>
          <button type="submit" disabled={busy} className={primary} style={primaryStyle}>
            {busy ? "בודק…" : "כניסה"}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <button
              type="button"
              disabled={busy || cooldown > 0}
              onClick={() => void sendCode()}
              className="font-bold text-teal disabled:text-txt-dim"
            >
              {cooldown > 0 ? `שליחה חוזרת בעוד ${cooldown} שניות` : "שלחו קוד חדש"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError("");
              }}
              className="text-txt-dim underline-offset-2 hover:underline"
            >
              החלפת מייל
            </button>
          </div>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={submitProfile} className="relative flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-txt-dim">ברוכים הבאים! עוד כמה פרטים ומתחילים.</p>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            שם
            <input name="name" type="text" required autoComplete="name" className={field} placeholder="ישראל ישראלי" autoFocus />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            טלפון
            <input name="phone" type="tel" required inputMode="tel" autoComplete="tel" dir="ltr" className={field} placeholder="050-0000000" />
          </label>
          {cohorts && cohorts.length > 0 ? (
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              מחזור <span className="font-normal text-txt-dim">(לא חובה; כך תופיעו בטבלת הכיתה)</span>
              <select name="cohort" className={field} defaultValue="">
                <option value="">לא בקורס / אחר</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>{cohortLabel(c)}</option>
                ))}
              </select>
            </label>
          ) : (
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              כיתה / מחזור <span className="font-normal text-txt-dim">(לא חובה)</span>
              <input name="classCode" type="text" autoComplete="off" className={field} placeholder={'למשל: קמ"ד שרון 26-27'} />
            </label>
          )}
          <label className="flex items-start gap-2.5 text-sm leading-relaxed">
            <input name="terms" type="checkbox" required className="mt-1 size-4 accent-[var(--teal)]" />
            <span>
              קראתי ואני מסכים/ה ל<Link href="/legal/terms" className="font-bold text-teal underline-offset-2 hover:underline" target="_blank">תנאי השימוש</Link>{" "}
              ול<Link href="/legal/privacy" className="font-bold text-teal underline-offset-2 hover:underline" target="_blank">מדיניות הפרטיות</Link>.
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-sm leading-relaxed text-txt-dim">
            <input name="marketing" type="checkbox" className="mt-1 size-4 accent-[var(--teal)]" />
            <span>אשמח לקבל במייל טיפים ללימוד ועדכונים על תכנים חדשים (אפשר להסיר בכל עת).</span>
          </label>
          <button type="submit" disabled={busy} className={primary} style={primaryStyle}>
            {busy ? "שומר…" : `מתחילים — ${PRICES.trialDays} ימים חינם`}
          </button>
        </form>
      )}

      {onUseLegacy && step === "email" && (
        <p className="relative mt-5 text-center text-xs text-txt-dim">
          בעיה בקבלת המייל? כתבו לנו ל-<a className="font-bold text-teal" href={`mailto:${LAUNCH.supportEmail}`} dir="ltr">{LAUNCH.supportEmail}</a>{" "}
          או <button type="button" onClick={onUseLegacy} className="font-bold text-teal underline-offset-2 hover:underline">היכנסו בדרך הישנה</button>.
        </p>
      )}
    </div>
  );
}
