import { login } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <h1 className="mb-2 text-2xl font-bold">כניסה למערכת</h1>
      <p className="mb-6 text-sm text-neutral-600">
        הזינו שם ומייל כדי להיכנס. אין צורך בסיסמה — המערכת תזהה אתכם לפי
        המייל בכניסות הבאות.
      </p>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          נא למלא שם ומייל תקינים.
        </p>
      )}

      <form action={login} className="flex flex-col gap-4">
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
