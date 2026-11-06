/**
 * md-api — שרת התשלומים של אבן דרך (B-05). Cloudflare Worker.
 *
 *  POST /billing/checkout          (JWT של המשתמש) → { url } של דף תשלום אצל הספק
 *  POST /billing/callback/:provider ← התראת שרת מהספק → md_billing_events + md_entitlements
 *  POST /billing/cancel            (JWT) → ביטול חידוש: נכנס לתוקף מיד, והגישה עד סוף התקופה
 *  GET  /billing/mock/pay           דף תשלום מדומה (רק כש-PROVIDER=mock)
 *  GET  /health
 *  cron יומי: מייל "הניסיון נגמר בעוד יומיים", ותזכורת לפני חידוש שנתי (סעיף 13א לחוק הגנת הצרכן)
 *
 * עיקרון: הזכאות נכתבת רק אחרי התראה מאומתת מהשרת של הספק. אף פעם לא בגלל הפניה בדפדפן.
 */
import { signRef } from "./crypto.ts";
import { heDate, sendEmail, templates } from "./email.ts";
import { nextPeriodEnd } from "./period.ts";
import { growProvider } from "./providers/grow.ts";
import { mockProvider } from "./providers/mock.ts";
import { getEntitlement, listEntitlements, recordEvent, upsertEntitlement, userEmail, userFromToken } from "./supabase.ts";
import type { BillingEvent, BillingProvider, Env, PaidPlan } from "./types.ts";

export function provider(env: Env): BillingProvider {
  if (env.PROVIDER === "grow") return growProvider(env);
  if (env.PROVIDER === "mock") return mockProvider(env);
  throw new Error(`unknown provider ${env.PROVIDER}`);
}

function cors(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
  return allowed.includes(origin)
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", Vary: "Origin" }
    : { Vary: "Origin" };
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

const price = (env: Env, plan: PaidPlan) => Number(plan === "yearly" ? env.PRICE_YEARLY_AGOROT : env.PRICE_MONTHLY_AGOROT);

export async function handleCheckout(request: Request, env: Env, fetcher: typeof fetch = fetch): Promise<Response> {
  const h = cors(request, env);
  const user = await userFromToken(env, request.headers.get("Authorization"), fetcher);
  if (!user) return json({ error: "unauthorized", messageHe: "צריך להתחבר מחדש." }, 401, h);
  const body = (await request.json().catch(() => ({}))) as { plan?: string };
  const plan = body.plan === "yearly" ? "yearly" : body.plan === "monthly" ? "monthly" : null;
  if (!plan) return json({ error: "bad_plan" }, 400, h);
  const k = await signRef(env.BILLING_SECRET, user.id, plan);
  try {
    const { url } = await provider(env).createCheckout({
      userId: user.id,
      email: user.email,
      name: user.name,
      plan,
      amountAgorot: price(env, plan),
      successUrl: `${env.SITE_URL}/me/?paid=1`,
      cancelUrl: `${env.SITE_URL}/pricing/`,
      notifyUrl: `${env.API_URL}/billing/callback/${env.PROVIDER}?k=${k}`,
    });
    return json({ url }, 200, h);
  } catch (err) {
    console.error(JSON.stringify({ event: "checkout_error", message: (err as Error).message.slice(0, 300) }));
    return json({ error: "checkout_failed", messageHe: "לא הצלחנו לפתוח את דף התשלום. נסו שוב בעוד רגע." }, 502, h);
  }
}

/** מיישם אירוע מאומת על הזכאות. אידמפוטנטי: אירוע שכבר נרשם לא מיושם שוב. */
export async function applyEvent(env: Env, providerName: string, event: BillingEvent, fetcher: typeof fetch = fetch, now = Date.now()) {
  const fresh = await recordEvent(
    env,
    {
      user_id: event.userId,
      provider: providerName,
      event_type: event.type,
      provider_ref: event.providerRef,
      amount_agorot: event.type === "payment_succeeded" ? event.amountAgorot : null,
      payload: event.raw,
    },
    fetcher,
  );
  if (!fresh) return { applied: false };
  const current = await getEntitlement(env, event.userId, fetcher);
  if (event.type === "payment_succeeded") {
    const until = nextPeriodEnd(event.plan, current?.current_period_end ?? null, now);
    await upsertEntitlement(env, {
      user_id: event.userId,
      plan: event.plan,
      status: "active",
      current_period_end: until,
      cancel_at_period_end: false,
      provider: providerName,
      provider_subscription_ref: event.subscriptionRef ?? current?.provider_subscription_ref ?? null,
    }, fetcher);
    const who = await userEmail(env, event.userId, fetcher);
    if (who) await sendEmail(env, who.email, templates.paymentReceived(who.name, event.plan, heDate(until)), fetcher);
    return { applied: true, until };
  }
  if (event.type === "payment_failed") {
    if (current && current.plan !== "trial") await upsertEntitlement(env, { user_id: event.userId, status: "past_due" }, fetcher);
    return { applied: true };
  }
  await upsertEntitlement(env, { user_id: event.userId, status: "canceled", cancel_at_period_end: true }, fetcher);
  return { applied: true };
}

export async function handleCallback(request: Request, env: Env, providerName: string, fetcher: typeof fetch = fetch): Promise<Response> {
  if (providerName !== env.PROVIDER) return json({ error: "unknown_provider" }, 404);
  const event = await provider(env).parseCallback(request, new URL(request.url));
  if (!event) {
    console.error(JSON.stringify({ event: "callback_rejected", provider: providerName }));
    return json({ error: "rejected" }, 400);
  }
  const result = await applyEvent(env, providerName, event, fetcher);
  console.log(JSON.stringify({ event: "callback_applied", provider: providerName, type: event.type, applied: result.applied }));
  return json({ ok: true });
}

export async function handleCancel(request: Request, env: Env, fetcher: typeof fetch = fetch): Promise<Response> {
  const h = cors(request, env);
  const user = await userFromToken(env, request.headers.get("Authorization"), fetcher);
  if (!user) return json({ error: "unauthorized" }, 401, h);
  const row = await getEntitlement(env, user.id, fetcher);
  if (!row || (row.plan !== "monthly" && row.plan !== "yearly")) return json({ error: "no_subscription" }, 400, h);
  let manual = false;
  if (row.provider_subscription_ref) {
    try {
      await provider(env).cancel(row.provider_subscription_ref);
    } catch (err) {
      manual = true;
      console.error(JSON.stringify({ event: "provider_cancel_failed", message: (err as Error).message }));
    }
  }
  await upsertEntitlement(env, { user_id: user.id, status: "canceled", cancel_at_period_end: true }, fetcher);
  await recordEvent(env, { user_id: user.id, provider: env.PROVIDER, event_type: "cancel_requested", provider_ref: `cancel-${user.id}-${row.current_period_end}`, payload: { manual } }, fetcher);
  if (row.current_period_end) await sendEmail(env, user.email, templates.canceled(user.name, heDate(row.current_period_end)), fetcher);
  if (manual) await sendEmail(env, env.MAIL_FROM.replace(/^.*<|>$/g, ""), templates.ownerAlert(`ביטול ידני נדרש אצל הספק: user ${user.id}, ref ${row.provider_subscription_ref}`), fetcher);
  return json({ ok: true }, 200, h);
}

/** תזכורות יומיות. נרשם עליהן חותם זמן, כדי שלא יישלחו פעמיים. */
export async function runDaily(env: Env, fetcher: typeof fetch = fetch, now = Date.now()) {
  const iso = (ms: number) => new Date(ms).toISOString();
  const day = 86_400_000;
  let sent = 0;
  const trials = await listEntitlements(
    env,
    `plan=eq.trial&reminded_trial_at=is.null&trial_ends_at=gt.${iso(now)}&trial_ends_at=lt.${iso(now + 2 * day)}&select=*`,
    fetcher,
  );
  for (const row of trials) {
    const who = await userEmail(env, row.user_id, fetcher);
    if (!who) continue;
    const days = Math.max(1, Math.ceil((Date.parse(row.trial_ends_at!) - now) / day));
    await sendEmail(env, who.email, templates.trialEnding(who.name, env.SITE_URL, days), fetcher);
    await upsertEntitlement(env, { user_id: row.user_id, reminded_trial_at: iso(now) }, fetcher);
    sent++;
  }
  const renewals = await listEntitlements(
    env,
    `plan=eq.yearly&status=eq.active&cancel_at_period_end=is.false&current_period_end=gt.${iso(now)}&current_period_end=lt.${iso(now + 14 * day)}&select=*`,
    fetcher,
  );
  for (const row of renewals) {
    if (row.reminded_renewal_for === row.current_period_end) continue;
    const who = await userEmail(env, row.user_id, fetcher);
    if (!who) continue;
    await sendEmail(env, who.email, templates.renewalNotice(who.name, env.SITE_URL, heDate(row.current_period_end!), price(env, "yearly") / 100), fetcher);
    await upsertEntitlement(env, { user_id: row.user_id, reminded_renewal_for: row.current_period_end }, fetcher);
    sent++;
  }
  return { sent };
}

function mockPayPage(url: URL): Response {
  const fields = ["u", "p", "a", "r", "s"].map((k) => `<input type="hidden" name="${k}" value="${(url.searchParams.get(k) ?? "").replace(/"/g, "")}">`).join("");
  return new Response(
    `<!doctype html><meta charset="utf-8"><body dir="rtl" style="font-family:sans-serif;padding:40px"><h1>דף תשלום מדומה (בדיקות)</h1>
<form method="post" action="/billing/callback/mock">${fields}<button name="outcome" value="ok">לשלם ${Number(url.searchParams.get("a")) / 100} ₪</button>
<button name="outcome" value="fail">לדמות כישלון</button></form>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(request, env) });
    if (url.pathname === "/health") return new Response("ok");
    if (url.pathname === "/billing/checkout" && request.method === "POST") return handleCheckout(request, env);
    if (url.pathname === "/billing/cancel" && request.method === "POST") return handleCancel(request, env);
    const cb = url.pathname.match(/^\/billing\/callback\/([a-z]+)$/);
    if (cb && request.method === "POST") return handleCallback(request, env, cb[1]);
    if (url.pathname === "/billing/mock/pay" && env.PROVIDER === "mock") return mockPayPage(url);
    return new Response("Not found", { status: 404 });
  },
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runDaily(env).then((r) => console.log(JSON.stringify({ event: "daily_done", ...r }))));
  },
} satisfies ExportedHandler<Env>;
