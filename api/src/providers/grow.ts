/**
 * Grow (משולם): דף תשלום מתארח (createPaymentProcess) והתראת שרת (notifyUrl).
 *
 * מה מבוסס על התיעוד (developers.grow.business): הבקשה נשלחת מהשרת בלבד, כ-multipart/form-data, עם
 * userId, pageCode, sum, successUrl, cancelUrl, description, pageField[...], cField1-9 ו-notifyUrl.
 *
 * מה עוד לא אומת, ו**חייב להיבדק ב-sandbox לפני הפעלה** (docs/team/BOARD.md, B-05):
 *  - מבנה גוף ה-callback המדויק (data[...]) ושדה הסטטוס של עסקה מוצלחת.
 *  - איך מוגדרת הוראת קבע (pageCode ייעודי?), והאם כל חיוב חודשי שולח callback.
 *  - ביטול הוראת קבע דרך ה-API.
 *
 * אבטחה: לא סומכים על התוכן לבד. ה-notifyUrl שנשלח ל-Grow נושא חתימת HMAC על (משתמש, תוכנית),
 * ולכן רק callback לתהליך שאנחנו יצרנו עובר. בנוסף, cField1 ו-cField2 חייבים להתאים לחתימה.
 */
import { safeEqual, signRef } from "../crypto.ts";
import type { BillingEvent, BillingProvider, CheckoutInput, Env, PaidPlan } from "../types.ts";

export function growProvider(env: Env, fetcher: typeof fetch = fetch): BillingProvider {
  const api = env.GROW_API_URL || "https://sandbox.meshulam.co.il/api/light/server/1.0";
  return {
    name: "grow",
    async createCheckout(input: CheckoutInput) {
      const pageCode = input.plan === "yearly" ? env.GROW_PAGE_CODE_YEARLY : env.GROW_PAGE_CODE_MONTHLY;
      if (!env.GROW_USER_ID || !pageCode) throw new Error("Grow is not configured");
      const form = new FormData();
      form.set("userId", env.GROW_USER_ID);
      form.set("pageCode", pageCode);
      form.set("sum", (input.amountAgorot / 100).toFixed(2));
      form.set("successUrl", input.successUrl);
      form.set("cancelUrl", input.cancelUrl);
      form.set("description", input.plan === "yearly" ? "Even Derech yearly" : "Even Derech monthly");
      // Grow דורש שם עם לפחות שתי מילים. בלי שם מלא, הלקוח ימלא אותו בדף התשלום.
      if (input.name.trim().split(/\s+/).length >= 2) form.set("pageField[fullName]", input.name.trim());
      form.set("pageField[email]", input.email);
      form.set("cField1", input.userId);
      form.set("cField2", input.plan);
      form.set("notifyUrl", input.notifyUrl);
      const res = await fetcher(`${api}/createPaymentProcess`, { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { status?: number; err?: unknown; data?: { url?: string } };
      if (!res.ok || data.status !== 1 || !data.data?.url) throw new Error(`Grow createPaymentProcess failed: ${JSON.stringify(data.err ?? res.status)}`);
      return { url: data.data.url };
    },
    async parseCallback(request: Request, url: URL): Promise<BillingEvent | null> {
      const flat: Record<string, string> = {};
      for (const [k, v] of (await request.formData()).entries()) {
        // data[cField1] → cField1. גם שדות שמגיעים בלי עטיפה נשמרים.
        flat[k.replace(/^data\[(.+)\]$/, "$1")] = String(v);
      }
      const userId = flat.cField1;
      const plan = flat.cField2 as PaidPlan;
      if (!userId || (plan !== "monthly" && plan !== "yearly")) return null;
      const expected = await signRef(env.BILLING_SECRET, userId, plan);
      if (!safeEqual(expected, url.searchParams.get("k") ?? "")) return null;
      const providerRef = flat.transactionId || flat.asmachta || flat.processId;
      if (!providerRef) return null;
      // TODO(sandbox): לאשר את שם שדה הסטטוס וערך ההצלחה. בתיעוד: status / statusCode.
      const ok = flat.status === "1" || flat.statusCode === "2" || /שולם|paid|success/i.test(flat.status ?? "");
      if (!ok) return { type: "payment_failed", userId, plan, providerRef, raw: flat };
      return {
        type: "payment_succeeded",
        userId,
        plan,
        providerRef,
        subscriptionRef: flat.directDebitId || flat.recurringId || flat.processId,
        customerRef: flat.payerPhone || flat.payerEmail,
        amountAgorot: Math.round(Number(flat.sum || 0) * 100),
        raw: flat,
      };
    },
    async cancel() {
      // TODO(sandbox): ביטול הוראת קבע דרך ה-API של Grow. עד שזה מאומת, הביטול נרשם אצלנו
      // (cancel_at_period_end) ונשלחת התראה לבעלים לבטל ידנית בממשק של Grow.
      throw new Error("grow_cancel_manual");
    },
  };
}
