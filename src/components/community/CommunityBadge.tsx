"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { COMMUNITY_EVENT, totalUnread } from "@/lib/community";

/** מספר ההודעות שלא נקראו בפורומים שלי. מתעדכן כשמשהו משתנה, ולכל היותר פעם בדקה כשהלשונית גלויה. */
export function useCommunityUnread() {
  const { user } = useUser();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!user) return;
    let last = 0;
    const refresh = (force = false) => {
      if (document.visibilityState !== "visible") return;
      if (!force && Date.now() - last < 60_000) return;
      last = Date.now();
      void totalUnread().then(setCount);
    };
    const onChange = () => refresh(true);
    const onVisible = () => refresh();
    refresh(true);
    const timer = window.setInterval(() => refresh(), 60_000);
    window.addEventListener(COMMUNITY_EVENT, onChange);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(COMMUNITY_EVENT, onChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user]);
  return user ? count : 0;
}

export function CommunityBadge({ count }: { count: number }) {
  if (!count) return null;
  return <span className="mr-1 inline-grid min-w-5 place-items-center rounded-full bg-red px-1.5 text-[11px] font-black leading-5 text-on-accent" aria-label={`${count} הודעות חדשות`}>{count}</span>;
}
