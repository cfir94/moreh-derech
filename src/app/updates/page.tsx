"use client";

import Link from "next/link";
import { useEffect } from "react";
import { markAllRead, useUpdates } from "@/lib/updates";

export default function UpdatesPage() {
  const { list, isNew } = useUpdates();
  useEffect(() => {
    const t = window.setTimeout(markAllRead, 1500);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="screen-in mx-auto max-w-2xl px-4 py-10">
      <h1 className="grad-text mb-2 text-3xl">מה חדש באתר</h1>
      <p className="mb-8 text-txt-dim">האתר מתעדכן כל הזמן: שאלונים, מבחנים, משחקים ועזרי למידה חדשים.</p>
      <ol className="flex flex-col gap-3">
        {list.map((u) => (
          <li key={u.id} className={`rounded-lg border bg-card p-4 ${isNew(u) ? "border-teal" : "border-line"}`}>
            <p className="text-sm text-txt-dim">{new Date(`${u.date}T12:00:00`).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}</p>
            <h2 className="mt-1 font-black text-txt">{u.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-txt-dim">{u.body}</p>
            {u.href && (
              <Link href={u.href} className="mt-2 inline-block text-sm font-bold text-teal">
                לפתיחה ←
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
