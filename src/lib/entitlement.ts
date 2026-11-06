/**
 * זכאות: שבוע ניסיון או מנוי (B-02). המקור הוא md_entitlements ב-Supabase
 * (supabase/migrations/20261106_02_entitlements.sql). המשתמש רק קורא את השורה שלו. מנוי נכתב
 * רק ע"י השרת אחרי תשלום מאומת.
 */
import { authenticatedSupabaseRequest, readSession } from "@/lib/cloudAuth";

export type Plan = "trial" | "monthly" | "yearly" | "founder" | "comp";
export type PlanStatus = "active" | "past_due" | "canceled" | "expired";

export type Entitlement = {
  user_id: string;
  plan: Plan;
  status: PlanStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export type Access =
  | { kind: "guest" }
  | { kind: "none" } // מחובר, עוד לא פתח ניסיון
  | { kind: "trial"; endsAt: Date; daysLeft: number }
  | { kind: "paid"; plan: Plan; until: Date | null; canceling: boolean }
  | { kind: "expired"; plan: Plan };

const DAY = 86_400_000;

/** פונקציה טהורה: מה מצב הגישה עכשיו לפי השורה (או היעדרה). נבדקת ב-tests/entitlement.test.mjs. */
export function accessFrom(row: Entitlement | null, signedIn: boolean, now = Date.now()): Access {
  if (!signedIn) return { kind: "guest" };
  if (!row) return { kind: "none" };
  const period = row.current_period_end ? Date.parse(row.current_period_end) : null;
  if ((row.plan === "founder" || row.plan === "comp") && row.status === "active" && (period === null || period > now)) {
    return { kind: "paid", plan: row.plan, until: period === null ? null : new Date(period), canceling: false };
  }
  if (row.plan !== "trial" && row.status !== "expired" && period !== null && period > now) {
    return { kind: "paid", plan: row.plan, until: new Date(period), canceling: row.cancel_at_period_end || row.status === "canceled" };
  }
  const trialEnd = row.trial_ends_at ? Date.parse(row.trial_ends_at) : null;
  if (trialEnd !== null && trialEnd > now && row.status !== "expired") {
    return { kind: "trial", endsAt: new Date(trialEnd), daysLeft: Math.max(1, Math.ceil((trialEnd - now) / DAY)) };
  }
  return { kind: "expired", plan: row.plan };
}

export function hasAccess(access: Access) {
  return access.kind === "trial" || access.kind === "paid";
}

export async function fetchEntitlement(): Promise<Entitlement | null> {
  const session = readSession();
  if (!session) return null;
  const rows = await authenticatedSupabaseRequest<Entitlement[]>(
    `/rest/v1/md_entitlements?user_id=eq.${encodeURIComponent(session.user_id)}` +
      "&select=user_id,plan,status,trial_ends_at,current_period_end,cancel_at_period_end",
  );
  return rows?.[0] ?? null;
}

/** פותח שבוע ניסיון (פעם אחת למשתמש; קריאה חוזרת מחזירה את הקיים). */
export async function startTrial(acceptTerms: boolean, marketing: boolean): Promise<Entitlement | null> {
  if (!readSession()) return null;
  return authenticatedSupabaseRequest<Entitlement>("/rest/v1/rpc/md_start_trial", {
    method: "POST",
    body: { accept_terms: acceptTerms, marketing },
  });
}
