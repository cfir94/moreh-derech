"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();

    if (!name || !email) {
      setError(true);
      return;
    }

    login({ name, email });
    router.push("/me");
  };

  return (
    <div className="topo-bg flex min-h-[calc(100vh-3.6rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-card border border-border-base bg-bg-raised p-8 shadow-[var(--shadow-md)]">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">כניסה למערכת</h1>
        <p className="mb-6 text-sm leading-relaxed text-fg-muted">
          הזינו שם ומייל — בלי סיסמה. הפרטים וההתקדמות נשמרים בדפדפן הזה,
          כדי שהמערכת תזכור מה תרגלתם ובמה טעיתם.
        </p>

        {error && (
          <p className="mb-4 rounded-card bg-danger-soft px-3 py-2 text-sm text-danger">
            נא למלא שם ומייל תקינים.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            שם מלא
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              className="rounded-card border border-border-strong bg-bg px-3 py-2.5 text-base outline-none transition focus:border-accent"
              placeholder="ישראל ישראלי"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            מייל
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              dir="ltr"
              className="rounded-card border border-border-strong bg-bg px-3 py-2.5 text-base outline-none transition focus:border-accent"
              placeholder="you@example.com"
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded-card bg-accent px-4 py-3 font-semibold text-accent-fg transition hover:bg-accent-hover"
          >
            כניסה
          </button>
        </form>
      </div>
    </div>
  );
}
