export type PaidPlan = "monthly" | "yearly";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  /** סוד (wrangler secret): מפתח service_role. הכתיבה ל-md_entitlements רק דרכו. */
  SUPABASE_SERVICE_KEY: string;
  /** סוד: חתימת HMAC על כתובות ה-callback ועל דף התשלום המדומה. */
  BILLING_SECRET: string;
  /** "grow" | "mock". mock רק לבדיקות ולפיתוח, ולעולם לא בייצור. */
  PROVIDER: string;
  SITE_URL: string;
  API_URL: string;
  ALLOWED_ORIGINS: string;
  PRICE_MONTHLY_AGOROT: string;
  PRICE_YEARLY_AGOROT: string;
  RESEND_API_KEY?: string;
  MAIL_FROM: string;
  GROW_API_URL?: string;
  GROW_USER_ID?: string;
  GROW_PAGE_CODE_MONTHLY?: string;
  GROW_PAGE_CODE_YEARLY?: string;
}

export type BillingEvent =
  | {
      type: "payment_succeeded";
      userId: string;
      plan: PaidPlan;
      providerRef: string;
      subscriptionRef?: string;
      customerRef?: string;
      amountAgorot: number;
      raw: Record<string, string>;
    }
  | { type: "payment_failed"; userId: string; plan: PaidPlan; providerRef: string; raw: Record<string, string> }
  | { type: "subscription_canceled"; userId: string; providerRef: string; raw: Record<string, string> };

export interface CheckoutInput {
  userId: string;
  email: string;
  name: string;
  plan: PaidPlan;
  amountAgorot: number;
  successUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface BillingProvider {
  readonly name: string;
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
  /** אימות ופענוח התראה מהספק. null = לא תקינה או לא שלנו. */
  parseCallback(request: Request, url: URL): Promise<BillingEvent | null>;
  /** ביטול הוראת קבע אצל הספק. */
  cancel(subscriptionRef: string): Promise<void>;
}
