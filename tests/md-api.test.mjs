import test from "node:test";
import assert from "node:assert/strict";
import { applyEvent, handleCallback, handleCancel, handleCheckout, runDaily } from "../api/src/index.ts";
import { nextPeriodEnd } from "../api/src/period.ts";
import { growProvider } from "../api/src/providers/grow.ts";
import { signRef } from "../api/src/crypto.ts";

const env = {
  SUPABASE_URL: "https://sb.test", SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_KEY: "service", BILLING_SECRET: "s3cret",
  PROVIDER: "mock", SITE_URL: "https://moreyderech.com", API_URL: "https://api.test", ALLOWED_ORIGINS: "https://moreyderech.com",
  PRICE_MONTHLY_AGOROT: "2000", PRICE_YEARLY_AGOROT: "20000", MAIL_FROM: "x <hello@moreyderech.com>", RESEND_API_KEY: "re_test",
};

/** Supabase מדומה: משתמשים, md_entitlements ו-md_billing_events עם מניעת כפילות. */
function fakeSupabase() {
  const rows = new Map();
  const events = new Set();
  const mails = [];
  const users = { u1: { id: "u1", email: "dana@example.com", user_metadata: { display_name: "דנה לוי" } } };
  const fetcher = async (input, init = {}) => {
    const url = new URL(String(input));
    const auth = new Headers(init.headers).get("authorization") ?? "";
    if (url.pathname === "/auth/v1/user") return auth === "Bearer good" ? Response.json(users.u1) : new Response("no", { status: 401 });
    if (url.pathname.startsWith("/auth/v1/admin/users/")) return Response.json(users[url.pathname.split("/").pop()] ?? {}, { status: users[url.pathname.split("/").pop()] ? 200 : 404 });
    if (url.pathname === "/rest/v1/md_billing_events") {
      const [e] = JSON.parse(init.body);
      const key = `${e.provider}|${e.provider_ref}|${e.event_type}`;
      if (events.has(key)) return new Response("dup", { status: 409 });
      events.add(key);
      return new Response(null, { status: 201 });
    }
    if (url.pathname === "/rest/v1/md_entitlements" && (init.method ?? "GET") === "GET") {
      const id = url.searchParams.get("user_id")?.replace("eq.", "");
      if (id) return Response.json(rows.has(id) ? [rows.get(id)] : []);
      return Response.json([...rows.values()].filter((r) => {
        const plan = url.searchParams.get("plan")?.replace("eq.", "");
        return !plan || r.plan === plan;
      }));
    }
    if (url.pathname === "/rest/v1/md_entitlements" && init.method === "POST") {
      const [r] = JSON.parse(init.body);
      rows.set(r.user_id, { ...(rows.get(r.user_id) ?? { cancel_at_period_end: false }), ...r });
      return new Response(null, { status: 201 });
    }
    if (url.host === "api.resend.com") { mails.push(JSON.parse(init.body)); return Response.json({ id: "m" }); }
    throw new Error(`unexpected ${url}`);
  };
  return { fetcher, rows, events, mails };
}

test("nextPeriodEnd: month/year from now, extending from a later existing end", () => {
  const now = Date.parse("2026-11-06T10:00:00Z");
  assert.equal(nextPeriodEnd("monthly", null, now), "2026-12-07T10:00:00.000Z");
  assert.equal(nextPeriodEnd("yearly", null, now), "2027-11-07T10:00:00.000Z");
  assert.equal(nextPeriodEnd("monthly", "2026-11-20T00:00:00Z", now), "2026-12-21T00:00:00.000Z", "early renewal does not shorten");
});

test("checkout needs a valid user token and returns a signed provider URL", async () => {
  const sb = fakeSupabase();
  const bad = await handleCheckout(new Request("https://api.test/billing/checkout", { method: "POST", headers: { Authorization: "Bearer nope" }, body: "{}" }), env, sb.fetcher);
  assert.equal(bad.status, 401);
  const res = await handleCheckout(new Request("https://api.test/billing/checkout", { method: "POST", headers: { Authorization: "Bearer good", Origin: "https://moreyderech.com" }, body: JSON.stringify({ plan: "yearly" }) }), env, sb.fetcher);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "https://moreyderech.com");
  const { url } = await res.json();
  const u = new URL(url);
  assert.equal(u.searchParams.get("u"), "u1");
  assert.equal(u.searchParams.get("a"), "20000");
});

test("a signed callback grants access once; replays and forgeries change nothing", async () => {
  const sb = fakeSupabase();
  const { url } = await (await handleCheckout(new Request("https://api.test/billing/checkout", { method: "POST", headers: { Authorization: "Bearer good" }, body: JSON.stringify({ plan: "monthly" }) }), env, sb.fetcher)).json();
  const form = () => { const f = new FormData(); for (const [k, v] of new URL(url).searchParams) f.set(k, v); f.set("outcome", "ok"); return f; };
  const post = (body) => handleCallback(new Request("https://api.test/billing/callback/mock", { method: "POST", body }), env, "mock", sb.fetcher);
  assert.equal((await post(form())).status, 200);
  const row = sb.rows.get("u1");
  assert.equal(row.plan, "monthly");
  assert.equal(row.status, "active");
  const firstEnd = row.current_period_end;
  assert.equal(sb.mails.length, 1, "payment confirmation email");
  assert.equal((await post(form())).status, 200);
  assert.equal(sb.rows.get("u1").current_period_end, firstEnd, "replayed callback is not applied twice");
  const forged = form(); forged.set("a", "1");
  assert.equal((await post(forged)).status, 400);
  const otherUser = form(); otherUser.set("u", "attacker");
  assert.equal((await post(otherUser)).status, 400);
});

test("cancel marks the subscription to end at period end and emails the user", async () => {
  const sb = fakeSupabase();
  await applyEvent(env, "mock", { type: "payment_succeeded", userId: "u1", plan: "monthly", providerRef: "t1", subscriptionRef: "sub1", amountAgorot: 2000, raw: {} }, sb.fetcher);
  const res = await handleCancel(new Request("https://api.test/billing/cancel", { method: "POST", headers: { Authorization: "Bearer good" } }), env, sb.fetcher);
  assert.equal(res.status, 200);
  assert.equal(sb.rows.get("u1").cancel_at_period_end, true);
  assert.equal(sb.rows.get("u1").status, "canceled");
  assert.ok(sb.mails.some((m) => m.subject === "המנוי בוטל"));
});

test("grow callback is trusted only with the HMAC from our notifyUrl", async () => {
  const p = growProvider({ ...env, PROVIDER: "grow" });
  const k = await signRef(env.BILLING_SECRET, "u1", "yearly");
  const body = () => { const f = new FormData(); f.set("data[cField1]", "u1"); f.set("data[cField2]", "yearly"); f.set("data[transactionId]", "T9"); f.set("data[sum]", "200"); f.set("data[statusCode]", "2"); return f; };
  const ok = await p.parseCallback(new Request("https://api.test/x", { method: "POST", body: body() }), new URL(`https://api.test/billing/callback/grow?k=${k}`));
  assert.equal(ok.type, "payment_succeeded");
  assert.equal(ok.amountAgorot, 20000);
  assert.equal(await p.parseCallback(new Request("https://api.test/x", { method: "POST", body: body() }), new URL("https://api.test/billing/callback/grow?k=bad")), null);
});

test("daily job: trial-ending email once, yearly renewal notice once per period", async () => {
  const sb = fakeSupabase();
  const now = Date.parse("2026-11-06T06:10:00Z");
  sb.rows.set("u1", { user_id: "u1", plan: "trial", status: "active", trial_ends_at: "2026-11-07T12:00:00Z", reminded_trial_at: null, cancel_at_period_end: false });
  const first = await runDaily(env, sb.fetcher, now);
  assert.equal(first.sent, 1);
  assert.ok(sb.rows.get("u1").reminded_trial_at);
  sb.rows.set("u1", { user_id: "u1", plan: "yearly", status: "active", current_period_end: "2026-11-15T00:00:00Z", reminded_renewal_for: null, cancel_at_period_end: false });
  assert.equal((await runDaily(env, sb.fetcher, now)).sent, 1);
  assert.match(sb.mails.at(-1).subject, /מתחדש/);
});
