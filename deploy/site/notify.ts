// הודעות של התשלום הידני (B-04, docs/launch/PAYMENTS-MANUAL.md):
//   POST /api/lead-notify — אחרי הרשמה או בקשת הצטרפות, מייל לבעלים (office@) עם הפרטים.
//   cron יומי            — תזכורת ללקוח חודש לפני סוף המנוי, וסיכום לבעלים (מסתיימים + פניות שלא נשלחו).
//                          ומייל קהילה מרוכז (C-12) למי שבחר בו: הנושאים והתגובות החדשים בפורומים שלו.
//   GET/POST /api/digest-off?t=<token> — הסרה מהמייל היומי בלחיצה, בלי התחברות.
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

// --- C-12: מייל קהילה מרוכז ---

export type DigestRecipient = { user_id: string; email: string; full_name: string; token: string; since: string };
export type DigestItem = {
  forum_title: string; forum_slug: string; thread_id: number; thread_title: string;
  kind: "thread" | "post"; author_name: string; excerpt: string; created_at: string;
};

const time = (iso: string) => new Date(iso).toLocaleString("he-IL", { weekday: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem" });
const clip = (s: string, n = 140) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);

/**
 * המייל עצמו: לכל פורום, הנושאים שהתעדכנו, ובכל נושא מי כתב ומה (קטע קצר). קישור לכל נושא,
 * וקישור הסרה בתחתית. בלי פריטים אין מייל (null): לא שולחים "אין חדש".
 */
export function communityDigestMail(r: DigestRecipient, items: DigestItem[], origin: string) {
  if (!items.length) return null;
  const offUrl = `${origin}/api/digest-off?t=${encodeURIComponent(r.token)}`;
  const forums = new Map<string, { title: string; slug: string; threads: Map<number, { title: string; lines: DigestItem[] }> }>();
  for (const it of items) {
    const f = forums.get(it.forum_slug) ?? { title: it.forum_title, slug: it.forum_slug, threads: new Map() };
    forums.set(it.forum_slug, f);
    const t = f.threads.get(it.thread_id) ?? { title: it.thread_title, lines: [] };
    f.threads.set(it.thread_id, t);
    t.lines.push(it);
  }
  const blocks = [...forums.values()].map((f) => {
    const threads = [...f.threads.entries()].map(([id, t]) => {
      const href = `${origin}/community/?f=${encodeURIComponent(f.slug)}&t=${id}`;
      const lines = t.lines
        .slice()
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((l) => `<li><b>${esc(l.author_name || "חבר/ה")}</b> ${l.kind === "thread" ? "פתח/ה את הנושא" : "הגיב/ה"} · <span style="color:#6b5a44">${time(l.created_at)}</span><br>${esc(clip(l.excerpt))}</li>`)
        .join("");
      return `<h3 style="margin:14px 0 4px"><a href="${href}">${esc(t.title)}</a></h3><ul style="margin:0;padding-inline-start:18px">${lines}</ul>`;
    });
    return `<h2 style="margin:18px 0 0;font-size:18px">${esc(f.title)}</h2>${threads.join("")}`;
  });
  const name = r.full_name ? ` ${esc(r.full_name)}` : "";
  const count = items.length;
  return {
    subject: count === 1 ? "עדכון אחד חדש בקהילת אבן דרך" : `${count} עדכונים חדשים בקהילת אבן דרך`,
    html: page(`<p>היי${name}, זה מה שנכתב בקהילה מאז המייל הקודם:</p>${blocks.join("")}<p style="margin-top:22px"><a href="${origin}/community/">לקהילה</a></p><p style="font-size:13px;color:#6b5a44">קיבלת את המייל כי ביקשת סיכום יומי מהקהילה. <a href="${offUrl}">להפסיק לקבל אותו</a>.</p>`),
    headers: { "List-Unsubscribe": `<${offUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}

/** cron יומי: לכל מי שבחר, מה חדש בפורומים שלו. מי שאין לו חדש לא מקבל מייל. */
export async function runCommunityDigest(env: NotifyEnv) {
  const recipients = (await sb<DigestRecipient[] | null>(env, "/rest/v1/rpc/md_digest_recipients", { method: "POST", body: "{}" })) ?? [];
  let sent = 0;
  for (const r of recipients) {
    try {
      const items = (await sb<DigestItem[] | null>(env, "/rest/v1/rpc/md_digest_items", { method: "POST", body: JSON.stringify({ uid: r.user_id, since: r.since }) })) ?? [];
      const mail = communityDigestMail(r, items, env.SITE_ORIGIN);
      if (!mail) continue;
      await sendMail(env, r.email, mail);
      await sb(env, "/rest/v1/rpc/md_digest_mark", { method: "POST", body: JSON.stringify({ uid: r.user_id }) });
      sent++;
    } catch {
      /* one member's failure does not stop the others; their window stays open for tomorrow */
    }
  }
  return sent;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** GET (לחיצה בקישור) או POST (הסרה בלחיצה אחת של תוכנת הדואר, RFC 8058): מכבה את המייל היומי. */
export async function handleDigestOff(request: Request, env: NotifyEnv): Promise<Response> {
  if (request.method !== "GET" && request.method !== "POST") return new Response(null, { status: 405 });
  const t = new URL(request.url).searchParams.get("t") ?? "";
  let ok = false;
  if (UUID.test(t)) {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/md_digest_off`, {
      method: "POST",
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ t }),
    });
    ok = res.ok && (await res.json().catch(() => false)) === true;
  }
  if (request.method === "POST") return new Response(null, { status: ok ? 200 : 400 });
  const body = ok
    ? `<h1 style="font-size:22px">הוסרת מהמייל היומי</h1><p>לא יישלחו אליך יותר סיכומים מהקהילה. אפשר להדליק אותם שוב בכל רגע במסך הקהילה.</p>`
    : `<h1 style="font-size:22px">הקישור לא תקין</h1><p>אפשר לכבות את המייל היומי במסך הקהילה, אחרי כניסה לאתר.</p>`;
  return new Response(page(`${body}<p><a href="${env.SITE_ORIGIN}/community/">לקהילה</a></p>`), {
    status: ok ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
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

export async function sendMail(env: NotifyEnv, to: string, mail: { subject: string; html: string; headers?: Record<string, string> }, replyTo?: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.MAIL_FROM, to: [to], subject: mail.subject, html: mail.html,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(mail.headers ? { headers: mail.headers } : {}),
    }),
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
  if (!configured(env)) return { skipped: true, reminded: 0, leads: 0, community: 0 };
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
  // the community digest runs on its own: a failure there must not hide the owner's digest, and back
  const community = await runCommunityDigest(env).catch(() => 0);
  return { skipped: false, reminded, leads: leads.length, community };
}
