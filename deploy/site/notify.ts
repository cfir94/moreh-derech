// הודעות של התשלום הידני (B-04, docs/launch/PAYMENTS-MANUAL.md):
//   POST /api/lead-notify — אחרי הרשמה או בקשת הצטרפות, מייל לבעלים (office@) עם הפרטים.
//   cron יומי            — תזכורת ללקוח חודש לפני סוף המנוי, וסיכום לבעלים (מסתיימים + פניות שלא נשלחו).
// בלי SUPABASE_SERVICE_KEY או RESEND_API_KEY (wrangler secret) הכול מדלג בשקט, והאתר עובד כרגיל.

export interface NotifyEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY?: string;
  RESEND_API_KEY?: string;
  /** לאן הולכים המיילים לבעלים. */
  OWNER_INBOX: string;
  /** השולח, מהדומיין שמאומת ב-Resend. */
  MAIL_FROM: string;
  SITE_ORIGIN: string;
}

type Lead = { id: number; kind: "signup" | "join"; plan: string | null; email: string; full_name: string; phone: string; note: string; created_at: string };
type Expiring = { user_id: string; email: string; full_name: string; plan: string; current_period_end: string };

const PLAN: Record<string, string> = { halfyear: "חצי שנה", yearly: "שנה" };

export function configured(env: NotifyEnv) {
  return Boolean(env.SUPABASE_SERVICE_KEY && env.RESEND_API_KEY);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const day = (iso: string) => new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jerusalem" });

function page(body: string) {
  return `<!doctype html><html lang="he" dir="rtl"><body style="font-family:Arial,sans-serif;line-height:1.6;color:#1d2b33;max-width:560px;margin:auto;padding:16px">${body}</body></html>`;
}

export function leadLine(l: Lead) {
  const what = l.kind === "join" ? `רוצה מנוי ל${PLAN[l.plan ?? ""] ?? "תקופה"}` : "נרשם/ה לשבוע ניסיון";
  return `<li><b>${esc(l.full_name || "בלי שם")}</b>: ${what}<br>${esc(l.email)}${l.phone ? ` · <a href="tel:${esc(l.phone)}">${esc(l.phone)}</a>` : ""}${l.note ? `<br>הערה: ${esc(l.note)}` : ""}</li>`;
}

export function leadsMail(leads: Lead[], origin: string) {
  const joins = leads.filter((l) => l.kind === "join").length;
  const subject = joins ? `בקשת הצטרפות חדשה (${leads[0].full_name || leads[0].email})` : `נרשם/ה חדש/ה: ${leads[0].full_name || leads[0].email}`;
  const html = page(`<h2>${joins ? "בקשה להצטרף" : "הרשמה חדשה"}</h2><ul>${leads.map(leadLine).join("")}</ul><p><a href="${origin}/admin/">למסך הניהול</a></p>`);
  return { subject, html };
}

export function renewalMail(e: Expiring, origin: string) {
  const name = e.full_name ? ` ${esc(e.full_name)}` : "";
  return {
    subject: "המנוי שלך באבן דרך למורי דרך מסתיים בעוד חודש",
    html: page(`<p>היי${name},</p><p>המנוי שלך (${PLAN[e.plan] ?? e.plan}) מסתיים ב-<b>${day(e.current_period_end)}</b>. ההתקדמות שלך שמורה, ואפשר להמשיך בדיוק מאותה נקודה.</p><p>רוצה להמשיך? <a href="${origin}/pricing/">בוחרים תקופה ומשאירים פרטים</a>, או פשוט עונים למייל הזה, ואני חוזר אליך.</p><p>כפיר, אבן דרך למורי דרך</p>`),
  };
}

export function digestMail(expiring: Expiring[], leads: Lead[], origin: string) {
  const parts: string[] = [];
  if (expiring.length) parts.push(`<h2>מנויים שמסתיימים בעוד חודש (${expiring.length})</h2><ul>${expiring.map((e) => `<li>${esc(e.full_name || e.email)} · ${esc(e.email)} · ${PLAN[e.plan] ?? e.plan} · עד ${day(e.current_period_end)}</li>`).join("")}</ul><p>נשלחה להם תזכורת במייל.</p>`);
  if (leads.length) parts.push(`<h2>פניות שעוד לא נשלחו אליך (${leads.length})</h2><ul>${leads.map(leadLine).join("")}</ul>`);
  if (!parts.length) return null;
  return { subject: `אבן דרך: ${expiring.length} מנויים מסתיימים, ${leads.length} פניות`, html: page(`${parts.join("")}<p><a href="${origin}/admin/">למסך הניהול</a></p>`) };
}

async function sb<T>(env: NotifyEnv, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${env.SUPABASE_URL}${path}`, {
    ...init,
    headers: { apikey: env.SUPABASE_SERVICE_KEY!, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`, "content-type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`supabase ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function sendMail(env: NotifyEnv, to: string, mail: { subject: string; html: string }, replyTo?: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject: mail.subject, html: mail.html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
}

async function markNotified(env: NotifyEnv, ids: number[]) {
  if (!ids.length) return;
  await sb(env, `/rest/v1/md_leads?id=in.(${ids.join(",")})`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ notified_at: new Date().toISOString() }),
  });
}

/** POST /api/lead-notify. המשתמש מזוהה מהאסימון שלו; נשלחות רק הפניות שלו שעוד לא נשלחו. */
export async function handleLeadNotify(request: Request, env: NotifyEnv): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  if (!configured(env)) return new Response(null, { status: 204 });
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return new Response(null, { status: 401 });
  const who = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  if (!who.ok) return new Response(null, { status: 401 });
  const user = (await who.json()) as { id?: string };
  if (!user.id) return new Response(null, { status: 401 });
  const leads = await sb<Lead[]>(env, `/rest/v1/md_leads?user_id=eq.${user.id}&notified_at=is.null&order=created_at.desc&limit=5&select=id,kind,plan,email,full_name,phone,note,created_at`);
  if (!leads.length) return new Response(null, { status: 204 });
  await sendMail(env, env.OWNER_INBOX, leadsMail(leads, env.SITE_ORIGIN), leads[0].email);
  await markNotified(env, leads.map((l) => l.id));
  return new Response(null, { status: 204 });
}

/** cron יומי: תזכורות לסוף מנוי, ופניות שהמייל עליהן לא יצא (למשל דפדפן שנסגר). */
export async function runDaily(env: NotifyEnv) {
  if (!configured(env)) return { skipped: true, reminded: 0, leads: 0 };
  const expiring = await sb<Expiring[]>(env, "/rest/v1/rpc/md_expiring", { method: "POST", body: JSON.stringify({ days: 30 }) });
  let reminded = 0;
  for (const e of expiring) {
    try {
      await sendMail(env, e.email, renewalMail(e, env.SITE_ORIGIN), env.OWNER_INBOX);
      reminded++;
    } catch {
      /* one bad address does not stop the others; the owner still sees it in the digest */
    }
  }
  const before = new Date(Date.now() - 15 * 60_000).toISOString();
  const leads = await sb<Lead[]>(env, `/rest/v1/md_leads?notified_at=is.null&created_at=lt.${before}&order=created_at.desc&limit=50&select=id,kind,plan,email,full_name,phone,note,created_at`);
  const digest = digestMail(expiring, leads, env.SITE_ORIGIN);
  if (digest) {
    await sendMail(env, env.OWNER_INBOX, digest);
    await markNotified(env, leads.map((l) => l.id));
  }
  return { skipped: false, reminded, leads: leads.length };
}
