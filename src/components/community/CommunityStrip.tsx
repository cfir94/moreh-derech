"use client";

import Link from "next/link";
import { useCommunityUnread } from "./CommunityBadge";

/** פס בדף הבית (C-12): מופיע רק כשיש בקהילה הודעות שלא נקראו. */
export function CommunityStrip() {
  const unread = useCommunityUnread();
  if (!unread) return null;
  return <Link href="/community/" className="screen-in mb-6 flex min-h-14 items-center gap-3 rounded-lg border border-line bg-card px-5 py-3 transition hover:bg-card-2 active:scale-[.99]">
    <span aria-hidden className="text-2xl">💬</span>
    <span className="flex-1 text-base font-bold">
      {unread === 1 ? "הודעה חדשה אחת בקהילה" : <><span className="num">{unread}</span> הודעות חדשות בקהילה</>}
    </span>
    <span className="rounded-full bg-red px-3 py-1 text-sm font-black text-on-accent">לקריאה</span>
  </Link>;
}
