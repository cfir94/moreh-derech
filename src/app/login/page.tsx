"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { friendlyAuthError, isLegacyPasswordError } from "@/lib/cloudAuth";
import { clearUser, readUser } from "@/lib/localAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, ready, login, loginWithPassword } = useUser();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    if (ready && user) {
      router.replace("/me");
      return;
    }
  }, [ready, user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();

    const password = String(form.get("password") ?? "");
    const classCode = String(form.get("classCode") ?? "").trim();

    if ((!needsPassword && !name) || !email || (needsPassword && !password)) {
      setError("נא למלא את כל שדות החובה.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (needsPassword) await loginWithPassword(email, password);
      else await login(name, email, classCode);
      const legacy = readUser();
      if (!legacy || legacy.email.trim().toLowerCase() === email) clearUser();
      router.push("/me");
    } catch (authError) {
      if (!needsPassword && isLegacyPasswordError(authError)) {
        setNeedsPassword(true);
        setError("לחשבון הישן הזה יש סיסמה. הקלידו אותה כדי להיכנס.");
      } else {
        setError(friendlyAuthError(authError));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen-in flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-card p-8">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full blur-[10px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--teal) 28%, transparent), transparent 65%)",
          }}
        />
        <h1 className="grad-text relative mb-2 text-3xl">כניסה למערכת</h1>
        <p className="relative mb-6 text-sm leading-relaxed text-txt-dim">
          זה אותו חשבון של משחק אבן דרך. הזינו את אותו אימייל ותיכנסו בלי
          סיסמה; בחשבון ישן עם סיסמה השדה יופיע אוטומטית.
        </p>

        {error && (
          <p className="relative mb-4 rounded-sm border border-line px-3.5 py-2.5 text-sm font-bold text-red">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            שם מלא
            <input
              name="name"
              type="text"
              required={!needsPassword}
              autoComplete="name"
              disabled={needsPassword}
              className="rounded-md border border-line bg-sheet px-3.5 py-3 text-base outline-none transition focus:border-teal"
              placeholder="ישראל ישראלי"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-bold">
            מייל
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              dir="ltr"
              className="rounded-md border border-line bg-sheet px-3.5 py-3 text-base outline-none transition focus:border-teal"
              placeholder="you@example.com"
            />
          </label>

          {!needsPassword && (
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              כיתה / מחזור <span className="font-normal text-txt-dim">(לא חובה)</span>
              <input
                name="classCode"
                type="text"
                autoComplete="off"
                className="rounded-md border border-line bg-sheet px-3.5 py-3 text-base outline-none transition focus:border-teal"
                placeholder={'למשל: קמ"ד שרון 26-27'}
              />
            </label>
          )}

          {needsPassword && (
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              סיסמה
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                dir="ltr"
                autoFocus
                className="rounded-md border border-line bg-sheet px-3.5 py-3 text-base outline-none transition focus:border-teal"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-full px-4 py-4 font-extrabold text-on-accent transition active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
              boxShadow: "0 10px 26px -10px var(--teal)",
            }}
          >
            {busy ? "מתחבר…" : "כניסה"}
          </button>
        </form>
      </div>
    </div>
  );
}
