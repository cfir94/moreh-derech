// גישה ל-Supabase מה-Worker. אימות משתמש עם ה-JWT שלו, וכתיבה עם service_role.
import type { Env } from "./types.ts";

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
}

export interface EntitlementRow {
  user_id: string;
  plan: string;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  provider: string | null;
  provider_subscription_ref: string | null;
  reminded_trial_at?: string | null;
  reminded_renewal_for?: string | null;
}

/** בודק את ה-JWT מול Supabase עצמו (בלי להחזיק את סוד ה-JWT). */
export async function userFromToken(env: Env, authorization: string | null, fetcher: typeof fetch = fetch): Promise<AuthedUser | null> {
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token || token.length > 4096) return null;
  const res = await fetcher(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string; email?: string; user_metadata?: { display_name?: string } };
  if (!user.id || !user.email) return null;
  return { id: user.id, email: user.email, name: user.user_metadata?.display_name ?? "" };
}

function service(env: Env, extra: Record<string, string> = {}) {
  return {
    apikey: env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function getEntitlement(env: Env, userId: string, fetcher: typeof fetch = fetch): Promise<EntitlementRow | null> {
  const res = await fetcher(`${env.SUPABASE_URL}/rest/v1/md_entitlements?user_id=eq.${encodeURIComponent(userId)}&select=*`, {
    headers: service(env),
  });
  if (!res.ok) throw new Error(`entitlement read ${res.status}`);
  return ((await res.json()) as EntitlementRow[])[0] ?? null;
}

export async function upsertEntitlement(env: Env, row: Partial<EntitlementRow> & { user_id: string }, fetcher: typeof fetch = fetch) {
  const res = await fetcher(`${env.SUPABASE_URL}/rest/v1/md_entitlements?on_conflict=user_id`, {
    method: "POST",
    headers: service(env, { Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify([row]),
  });
  if (!res.ok) throw new Error(`entitlement upsert ${res.status} ${await res.text()}`);
}

/** רישום אירוע. false = כפול (אותו אירוע כבר נקלט), וממשיכים בלי לעדכן שוב. */
export async function recordEvent(
  env: Env,
  event: { user_id: string | null; provider: string; event_type: string; provider_ref: string | null; amount_agorot?: number | null; payload: unknown },
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  const res = await fetcher(`${env.SUPABASE_URL}/rest/v1/md_billing_events`, {
    method: "POST",
    headers: service(env, { Prefer: "return=minimal" }),
    body: JSON.stringify([event]),
  });
  if (res.status === 409) return false;
  if (!res.ok) throw new Error(`event insert ${res.status} ${await res.text()}`);
  return true;
}

export async function listEntitlements(env: Env, query: string, fetcher: typeof fetch = fetch): Promise<EntitlementRow[]> {
  const res = await fetcher(`${env.SUPABASE_URL}/rest/v1/md_entitlements?${query}`, { headers: service(env) });
  if (!res.ok) throw new Error(`entitlement list ${res.status}`);
  return (await res.json()) as EntitlementRow[];
}

export async function userEmail(env: Env, userId: string, fetcher: typeof fetch = fetch): Promise<{ email: string; name: string } | null> {
  const res = await fetcher(`${env.SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, { headers: service(env) });
  if (!res.ok) return null;
  const user = (await res.json()) as { email?: string; user_metadata?: { display_name?: string } };
  return user.email ? { email: user.email, name: user.user_metadata?.display_name ?? "" } : null;
}
