# סליקה — איזה ספק, ולמה

נבדק: 6.11.2026

## הדרישות שלנו

1. **מנוי חודשי מתחדש** (20 ₪) ו**מנוי שנתי** (200 ₪).
2. **התראת שרת** על כל חיוב, כולל חיוב חודשי אוטומטי, כדי שה-Worker יעדכן את `entitlements` בלי מגע יד אדם.
3. **ביטול מנוי דרך API.** החוק מחייב לאפשר ביטול באותה דרך שבה נרשמו, כלומר באתר.
4. **חשבונית/קבלה אוטומטית** לכל חיוב (חובה בישראל).
5. **ביט**, Apple Pay ו-Google Pay. הקהל ישראלי.
6. **עלות קבועה נמוכה.** במחיר של 20 ₪ לחודש, דמי מנוי של 100 ₪ אוכלים את חמשת המנויים הראשונים.

## האפשרויות

| ספק | הוראת קבע | API ו-callback | חשבונית | ביט | עלות (לאמת!) | הערות |
|---|---|---|---|---|---|---|
| **Grow** (לשעבר משולם) | ✅ (דף תשלום ייעודי להוראת קבע, Grow מנהלת את החיובים) | ✅ `createPaymentProcess` + `notifyUrl` (POST form). יש sandbox | ✅ אוטומטית "ללא עלות נוספת" | ✅ | מקורות סותרים: 29–59 ₪ לחודש ועמלה מ-0.75–0.9% | **ההמלצה.** הכי נפוץ בעסקים קטנים, ממשק בעברית |
| **Cardcom** | ✅ (מודול הוראות קבע) | ✅ LowProfile + IndicatorUrl, תיעוד מפתחים ותיק | ✅ מובנית | ✅ | כ-100 ₪ לחודש? כ-1.2%? | חזק טכנית. יקר יותר בדמי המנוי |
| **PayPlus** | ✅ (מודול נוסף בתשלום) | ✅ תיעוד API מודרני, `refURL_callback`, IPN | ✅ (IPN FULL כולל חשבונית) | ✅ | לא פורסם | תיעוד מצוין |
| **Paddle** (MoR זר) | ✅ | ✅ webhooks, פורטל לקוח, ניסיון מובנה | ✅ (Paddle הוא המוכר) | ❌ | 5% + $0.50 לעסקה, בלי דמי מנוי | אין עברית בצ'קאאוט ואין ביט. לא אומת שמוכר ישראלי מקבל תשלומים. **עלות 14% לעסקה של 20 ₪** |
| **Stripe** | — | — | — | — | — | **לא פועל בישראל** (אין רישיון סליקה מבנק ישראל נכון ל-2026) |

## ההמלצה

**Grow**, בתנאי שבשיחה איתם יאשרו: API עם callback על חיובי הוראת קבע, ביטול דרך API, ומחיר מסלול סביר. אם לא, **PayPlus**, ואחריו **Cardcom**.

הקוד ייכתב עם **מתאם (adapter)** אחד לכל ספק, מאחורי ממשק אחיד:

```ts
interface BillingProvider {
  createCheckout(user, plan): Promise<{ url: string }>;      // דף תשלום מתארח אצל הספק
  verifyCallback(request): Promise<BillingEvent | null>;      // אימות ההתראה (חתימה / שאילתה חוזרת לספק)
  cancel(subscriptionRef): Promise<void>;
}
```

כך החלפת ספק היא קובץ אחד, ולא שכתוב.

**עיקרון אבטחה:** לא סומכים על ההפניה בדפדפן ("התשלום הצליח"). זכאות נכתבת **רק** אחרי callback מאומת מהשרת של הספק, או אחרי שאילתה ישירה ל-API של הספק עם מזהה העסקה.

## מקורות
- [Grow — שאלות נפוצות](https://grow.business/popular-questions/) · [Grow API — Server-to-Server Callback](https://developers.grow.business/reference/delayed-payment-callback)
- [PayPlus API Reference](https://docs.payplus.co.il)
- [Cardcom — פתרונות סליקה](https://www.cardcom.solutions/%D7%A4%D7%AA%D7%A8%D7%95%D7%A0%D7%95%D7%AA-%D7%A1%D7%9C%D7%99%D7%A7%D7%94-%D7%9C%D7%A2%D7%A1%D7%A7%D7%99%D7%9D/)
- [השוואת חברות סליקה 2026 (arbiter)](https://arbiter.co.il/credit-card-clearing-comparison) · [systemcompare](https://systemcompare.co.il/best/payments/)
- [Globes — Stripe לא פועלת בישראל](https://en.globes.co.il/en/article-1001381078) · [Stripe מגייסת Country Manager לישראל](https://stripe.com/jobs/search?gh_jid=8267857)
- [Paddle supported countries](https://developer.paddle.com/concepts/sell/supported-countries-locales) · [Paddle localized checkouts](https://paddle.com/support/do-you-offer-localised-checkouts)
