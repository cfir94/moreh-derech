import type { PaidPlan } from "./types.ts";

/**
 * סוף התקופה אחרי תשלום: מוסיפים חודש או שנה מהמאוחר מבין "עכשיו" ו"סוף התקופה הקיימת",
 * כך שתשלום מוקדם (או כפול) לא מקצר מנוי. יום חסד אחד, כי חיוב חוזר מגיע לפעמים באיחור של שעות.
 */
export function nextPeriodEnd(plan: PaidPlan, currentEnd: string | null, now = Date.now()): string {
  const base = new Date(Math.max(now, currentEnd ? Date.parse(currentEnd) : 0));
  const end = new Date(base);
  if (plan === "yearly") end.setUTCFullYear(end.getUTCFullYear() + 1);
  else end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(end.getUTCDate() + 1);
  return end.toISOString();
}
