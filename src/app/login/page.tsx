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
          הזינו שם ומייל — בלי סיסמה. הפרטים וההתקדמות נשמרים בדפדפן הזה,
          כדי שהמערכת תזכור מה תרגלתם ובמה טעיתם.
        </p>

        {error && (
          <p className="relative mb-4 rounded-sm border border-line px-3.5 py-2.5 text-sm font-bold text-red">
            נא למלא שם ומייל תקינים.
          </p>
        )}

        <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            שם מלא
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
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

          <button
            type="submit"
            className="mt-2 rounded-full px-4 py-4 font-extrabold text-on-accent transition active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
              boxShadow: "0 10px 26px -10px var(--teal)",
            }}
          >
            כניסה
          </button>
        </form>
      </div>
    </div>
  );
}
