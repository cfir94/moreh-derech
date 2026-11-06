"use client";

/**
 * העדכונים שהמשתמש עוד לא ראה. נשמר במכשיר (md_updates_seen_v1): רשימת מזהים שנקראו, ותאריך
 * ההצטרפות. בביקור הראשון נספרים כחדשים רק עדכונים מ-10 הימים האחרונים, כדי שלא יהיה עומס.
 */
import { makeStore } from "@/lib/clientStore";
import { UPDATES, type SiteUpdate } from "@/data/updates";
import { israelDate, weekOfDate } from "@/lib/crossword/week";

const KEY = "md_updates_seen_v1";
const EVENT = "md-updates-changed";
type Seen = { since: string; ids: string[] };

const store = makeStore<Seen | null>({
  key: KEY,
  empty: null,
  events: [EVENT],
  parse: (raw) => {
    try {
      return raw ? (JSON.parse(raw) as Seen) : null;
    } catch {
      return null;
    }
  },
});

/** כל העדכונים, כולל תשבץ השבוע הנוכחי, מהחדש לישן. */
export function allUpdates(now = new Date()): SiteUpdate[] {
  const week = weekOfDate(israelDate(now));
  const crossword: SiteUpdate[] =
    week.number >= 2
      ? [
          {
            id: `crossword-week-${week.number}`,
            date: week.start,
            kind: "game",
            title: `תשבץ השבוע #${week.number} עלה`,
            body: "תשבץ חדש מחומר הקורס, עד יום חמישי הקרוב.",
            href: "/games/crossword/",
          },
        ]
      : [];
  return [...crossword, ...UPDATES].sort((a, b) => b.date.localeCompare(a.date));
}

export function useUpdates() {
  const seen = store.use();
  const list = allUpdates();
  const isNew = (u: SiteUpdate) => (seen ? u.date >= seen.since && !seen.ids.includes(u.id) : false);
  return { list, seen, unread: list.filter(isNew), isNew };
}

function write(next: Seen) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  store.notify();
}

/** ביקור ראשון: מתחילים לספור מלפני 10 ימים. */
export function initUpdates() {
  if (!window.localStorage.getItem(KEY)) write({ since: israelDate(new Date(Date.now() - 10 * 86_400_000)), ids: [] });
}

export function markAllRead() {
  const current = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Seen | null;
  write({ since: current?.since ?? israelDate(new Date()), ids: allUpdates().map((u) => u.id) });
}
