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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <h1 className="mb-2 text-2xl font-bold">כניסה למערכת</h1>
      <p className="mb-6 text-sm text-neutral-600">
        הזינו שם ומייל כדי להיכנס. אין צורך בסיסמה — הפרטים נשמרים בדפדפן הזה
        בלבד ומשמשים לזיהוי שלכם ולמעקב אחרי ההתקדמות במכשיר הזה.
      </p>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          נא למלא שם ומייל תקינים.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          שם מלא
          <input
            name="name"
            type="text"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900"
            placeholder="ישראל ישראלי"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          מייל
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900"
            placeholder="you@example.com"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-md bg-neutral-900 px-4 py-2 font-medium text-white transition hover:bg-neutral-700"
        >
          כניסה
        </button>
      </form>
    </div>
  );
}
