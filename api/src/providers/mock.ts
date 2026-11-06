// ספק מדומה לבדיקות ולפיתוח בלבד: "דף התשלום" הוא כתובת חתומה ב-md-api עצמו. פעיל רק כש-PROVIDER=mock.
import { hmacHex, safeEqual } from "../crypto.ts";
import type { BillingEvent, BillingProvider, CheckoutInput, Env, PaidPlan } from "../types.ts";

export function mockProvider(env: Env): BillingProvider {
  return {
    name: "mock",
    async createCheckout(input: CheckoutInput) {
      const ref = crypto.randomUUID();
      const payload = `${input.userId}|${input.plan}|${input.amountAgorot}|${ref}`;
      const sig = await hmacHex(env.BILLING_SECRET, `mock:${payload}`);
      const url = new URL(`${env.API_URL}/billing/mock/pay`);
      url.search = new URLSearchParams({ u: input.userId, p: input.plan, a: String(input.amountAgorot), r: ref, s: sig }).toString();
      return { url: url.toString() };
    },
    async parseCallback(request: Request): Promise<BillingEvent | null> {
      const form = Object.fromEntries((await request.formData()).entries()) as Record<string, string>;
      const { u, p, a, r, s, outcome } = form;
      if (!u || !r || !s || (p !== "monthly" && p !== "yearly")) return null;
      const expected = await hmacHex(env.BILLING_SECRET, `mock:${u}|${p}|${a}|${r}`);
      if (!safeEqual(expected, s)) return null;
      if (outcome === "fail") return { type: "payment_failed", userId: u, plan: p as PaidPlan, providerRef: r, raw: form };
      return { type: "payment_succeeded", userId: u, plan: p as PaidPlan, providerRef: r, subscriptionRef: `mock-sub-${u}`, amountAgorot: Number(a), raw: form };
    },
    async cancel() {
      /* אין מה לבטל אצל ספק מדומה */
    },
  };
}
