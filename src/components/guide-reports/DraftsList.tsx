"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  DRAFTS_EVENT,
  deleteDraft,
  readDrafts,
  type GuideDraft,
} from "@/lib/guideReportDrafts";
import { useHydrated } from "@/lib/clientStore";

function subscribe(onChange: () => void) {
  window.addEventListener(DRAFTS_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(DRAFTS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function useDrafts(): GuideDraft[] {
  return useSyncExternalStore(subscribe, readDrafts, () => []);
}

function formatWhen(ts: number) {
  try {
    return new Date(ts).toLocaleString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function DraftsList() {
  const drafts = useDrafts();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <p className="text-sm text-txt-dim">טוען טיוטות…</p>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-card p-6 text-center text-[13.5px] text-txt-dim">
        <p className="mb-3">עדיין אין טיוטות שמורות במכשיר זה.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/guide-reports/practice/day"
            className="font-bold text-teal hover:underline"
          >
            סימולטור יום סיור
          </Link>
          <span>·</span>
          <Link
            href="/guide-reports/practice/unit"
            className="font-bold text-teal hover:underline"
          >
            תרגול יחידה
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {drafts.map((d) => (
        <li
          key={d.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-card px-4 py-3"
        >
          <div>
            <p className="font-extrabold">{d.title}</p>
            <p className="text-[12px] text-txt-dim">
              {d.kind === "day" ? "יום סיור" : "יחידת הדרכה"}
              {" · "}
              {formatWhen(d.updatedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={
                d.kind === "day"
                  ? "/guide-reports/practice/day"
                  : "/guide-reports/practice/unit"
              }
              className="rounded-full border border-line bg-card-2 px-3 py-1.5 text-[12px] font-extrabold"
            >
              פתיחה
            </Link>
            <button
              type="button"
              onClick={() => deleteDraft(d.id)}
              className="rounded-full border border-line px-3 py-1.5 text-[12px] font-extrabold text-txt-dim transition active:scale-95"
            >
              מחיקה
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
