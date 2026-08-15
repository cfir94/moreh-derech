import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/app/actions/auth";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">שלום, {user.name}</h1>
      <p className="mb-8 text-sm text-neutral-600">{user.email}</p>

      <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-neutral-600">
        <h2 className="mb-2 text-lg font-semibold text-neutral-900">
          מעקב התקדמות אישי
        </h2>
        <p>
          כאן יופיעו בהמשך: כמה שאלונים תרגלתם, אחוזי הצלחה לפי קטגוריה,
          ושאלות שכדאי לחזור עליהן. הפיצ&apos;ר יתווסף בשלב הבא, יחד עם שילוב
          מאגר השאלונים.
        </p>
      </div>

      <form action={logout} className="mt-8">
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100"
        >
          יציאה
        </button>
      </form>
    </div>
  );
}
