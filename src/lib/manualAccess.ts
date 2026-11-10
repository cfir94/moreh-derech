/*
 * תשלום ידני (B-04, docs/launch/PAYMENTS-MANUAL.md): פרופיל ומחזור בהרשמה, בקשת הצטרפות,
 * ופעולות המנהל. הכול מול טבלאות md_ ופונקציות md_admin_* ב-Supabase
 * (supabase/migrations/20261108_01_manual_access.sql). ההרשאות נאכפות שם, לא כאן.
 */
import { authenticatedSupabaseRequest, freshAccessToken, readSession, saveProfileDetails } from "@/lib/cloudAuth";
import { withBasePath } from "@/lib/basePath";

export type Cohort = { id: number; school: string; year: number; name: string; code: string; active?: boolean };
export type JoinPlan = "halfyear" | "yearly";
export type Lead = {
  id: number; user_id: string | null; kind: "signup" | "join"; plan: JoinPlan | null;
  email: string; full_name: string; phone: string; note: string; handled: boolean; created_at: string;
};
export type AdminUser = {
  user_id: string; email: string; signed_up: string; last_sign_in: string | null;
  full_name: string; phone: string; cohort: string;
  plan: string | null; status: string | null; trial_ends_at: string | null; current_period_end: string | null;
  has_access: boolean;
};
export type PendingGrant = { email: string; plan: string; months: number; created_at: string };

export const PLAN_MONTHS: Record<JoinPlan, number> = { halfyear: 6, yearly: 12 };
export const PLAN_LABEL: Record<string, string> = {
  trial: "ניסיון", halfyear: "חצי שנה", yearly: "שנה", comp: "מתנה", founder: "מייסד", monthly: "חודשי",
};

const rpc = <T,>(name: string, body: Record<string, unknown> = {}) =>
  authenticatedSupabaseRequest<T>(`/rest/v1/rpc/${name}`, { method: "POST", body });

export function cohortLabel(c: Pick<Cohort, "school" | "year" | "name">) {
  return `${c.school} · ${c.name} · ${c.year}`;
}

export async function fetchCohorts(includeInactive = false): Promise<Cohort[]> {
  const filter = includeInactive ? "" : "&active=eq.true";
  const rows = await authenticatedSupabaseRequest<Cohort[]>(
    `/rest/v1/md_cohorts?select=id,school,year,name,code,active${filter}&order=year.desc,school.asc,name.asc`,
  );
  return Array.isArray(rows) ? rows : [];
}

/**
 * פרטי ההרשמה. השם והמחזור נשמרים גם בפרופיל של המשחק (class_code), כדי שחבר כיתה יופיע באותה
 * טבלה בשני המקומות. אם טבלאות md_ עוד לא קיימות, ההרשמה ממשיכה בלי הטלפון והפנייה.
 */
export async function saveSignupDetails(input: { fullName: string; phone: string; cohort: Cohort | null }) {
  await saveProfileDetails(input.fullName, input.cohort?.code ?? "");
  const session = readSession();
  if (!session) return;
  await authenticatedSupabaseRequest("/rest/v1/md_profiles?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: { user_id: session.user_id, full_name: input.fullName, phone: input.phone, cohort_id: input.cohort?.id ?? null },
  }).catch(() => null);
  await authenticatedSupabaseRequest("/rest/v1/md_leads", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: { user_id: session.user_id, kind: "signup", email: session.email, full_name: input.fullName, phone: input.phone },
  }).then(notifyOwner, () => null);
}

/** מבקש מה-Worker של האתר לשלוח לבעלים מייל על הפנייה. ב-GitHub Pages אין Worker: נכשל בשקט. */
async function notifyOwner() {
  const token = await freshAccessToken().catch(() => null);
  if (!token) return;
  await fetch(withBasePath("/api/lead-notify"), { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
}

export async function fetchMyProfile(): Promise<{ full_name: string; phone: string } | null> {
  const session = readSession();
  if (!session) return null;
  const rows = await authenticatedSupabaseRequest<{ full_name: string; phone: string }[]>(
    `/rest/v1/md_profiles?user_id=eq.${session.user_id}&select=full_name,phone`,
  ).catch(() => []);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

/** "רוצה להצטרף": בקשה אחת לבעלים, שחוזר אל המשתמש וסוגר תשלום. */
export async function requestJoin(input: { plan: JoinPlan; fullName: string; phone: string; note: string }) {
  const session = readSession();
  if (!session) throw new Error("צריך להתחבר קודם");
  await authenticatedSupabaseRequest("/rest/v1/md_leads", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: {
      user_id: session.user_id, kind: "join", plan: input.plan, email: session.email,
      full_name: input.fullName, phone: input.phone, note: input.note,
    },
  });
  void notifyOwner();
  if (input.phone) {
    await authenticatedSupabaseRequest("/rest/v1/md_profiles?on_conflict=user_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: { user_id: session.user_id, full_name: input.fullName, phone: input.phone },
    }).catch(() => null);
  }
}

// --- מנהל ---

export async function isAdmin() {
  if (!readSession()) return false;
  return Boolean(await rpc<boolean>("is_app_admin").catch(() => false));
}

export const adminUsers = () => rpc<AdminUser[]>("md_admin_users");
export const adminLeads = () => rpc<Lead[]>("md_admin_leads");
export const adminPending = () => rpc<PendingGrant[]>("md_admin_pending");
export const adminSetHandled = (id: number, handled: boolean) => rpc<void>("md_admin_set_handled", { p_id: id, p_handled: handled });
export const adminEndAccess = (userId: string) => rpc<void>("md_admin_end_access", { p_user: userId });

/** מחזיר "active" (הופעל) או "pending" (יופעל כשהמייל יירשם). */
export function adminGrant(email: string, plan: JoinPlan | "comp", months: number) {
  return rpc<string>("md_admin_grant", { p_email: email, p_plan: plan, p_months: months });
}

export async function adminSaveCohort(c: Omit<Cohort, "id"> & { id?: number }) {
  const body = { school: c.school.trim(), year: c.year, name: c.name.trim(), code: c.code.trim(), active: c.active ?? true };
  if (c.id) {
    await authenticatedSupabaseRequest(`/rest/v1/md_cohorts?id=eq.${c.id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body });
  } else {
    await authenticatedSupabaseRequest("/rest/v1/md_cohorts", { method: "POST", headers: { Prefer: "return=minimal" }, body });
  }
}

/** הודעה מוכנה לסוף תקופה, להעתקה (וואטסאפ/מייל), עד שהתזכורת האוטומטית תפעל. */
export function renewalMessage(name: string, endsAt: string) {
  const date = new Date(endsAt).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
  return `היי ${name || ""}, כאן כפיר מ"אבן דרך למורי דרך". המנוי שלך מסתיים ב-${date}. רוצה להמשיך? חצי שנה 160 ₪, שנה 300 ₪. עונים לי כאן ואסדר.`.replace("היי ,", "היי,");
}
