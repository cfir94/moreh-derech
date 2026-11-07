// מיילים אוטומטיים דרך Resend. בלי RESEND_API_KEY: רק נרשם ללוג, כדי שהזרימה לא תיפול.
import type { Env } from "./types.ts";

const wrap = (body: string) => `<div dir="rtl" style="font-family:Heebo,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f2a3d;line-height:1.7">${body}
<p style="margin-top:28px;font-size:13px;color:#5b7286">אבן דרך למורי דרך · <a href="mailto:hello@moreyderech.com" style="color:#0f766e">hello@moreyderech.com</a></p></div>`;

export const templates = {
  trialEnding: (name: string, siteUrl: string, days: number) => ({
    subject: days <= 1 ? "מחר נגמר שבוע הניסיון שלך" : `עוד ${days} ימים לשבוע הניסיון`,
    html: wrap(`<h2 style="margin:0 0 8px">היי ${name || "שם"} 👋</h2>
<p>שבוע הניסיון שלך באבן דרך מסתיים ${days <= 1 ? "מחר" : `בעוד ${days} ימים`}. ההתקדמות שלך שמורה, כולל השאלות שמחכות לחזרה.</p>
<p>רוצה להמשיך? מנוי חודשי ב-20 ₪ או שנתי ב-200 ₪, וביטול בכל רגע.</p>
<p><a href="${siteUrl}/pricing/" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#14b8a6;color:#fff;font-weight:800;text-decoration:none">לבחירת מנוי</a></p>
<p style="font-size:13px;color:#5b7286">לא ביקשנו כרטיס אשראי, ולכן לא יהיה חיוב אוטומטי.</p>`),
  }),
  renewalNotice: (name: string, siteUrl: string, date: string, amount: number) => ({
    subject: "תזכורת: המנוי השנתי שלך מתחדש בקרוב",
    html: wrap(`<h2 style="margin:0 0 8px">היי ${name || "שם"},</h2>
<p>המנוי השנתי שלך באבן דרך יתחדש ב-<b>${date}</b> בסכום של <b>${amount} ₪</b>.</p>
<p>לא רוצה לחדש? אפשר לבטל בלחיצה באזור האישי, עד יום החידוש.</p>
<p><a href="${siteUrl}/me/" style="color:#0f766e;font-weight:800">לאזור האישי</a></p>`),
  }),
  paymentReceived: (name: string, plan: string, until: string) => ({
    subject: "תודה! המנוי שלך פעיל",
    html: wrap(`<h2 style="margin:0 0 8px">תודה ${name || ""}!</h2>
<p>המנוי ה${plan === "yearly" ? "שנתי" : "חודשי"} שלך פעיל עד <b>${until}</b>. החשבונית נשלחת בנפרד מחברת הסליקה.</p>`),
  }),
  canceled: (name: string, until: string) => ({
    subject: "המנוי בוטל",
    html: wrap(`<p>היי ${name || ""}, המנוי שלך בוטל ולא יתחדש. הגישה נשארת פתוחה עד <b>${until}</b>. תמיד אפשר לחזור.</p>`),
  }),
  ownerAlert: (text: string) => ({ subject: `[md-api] ${text.slice(0, 60)}`, html: wrap(`<pre dir="ltr" style="white-space:pre-wrap">${text}</pre>`) }),
};

export async function sendEmail(env: Env, to: string, mail: { subject: string; html: string }, fetcher: typeof fetch = fetch) {
  if (!env.RESEND_API_KEY) {
    console.log(JSON.stringify({ event: "email_skipped_no_key", to: to.replace(/(.).+@/, "$1***@"), subject: mail.subject }));
    return false;
  }
  const res = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to, subject: mail.subject, html: mail.html }),
  });
  if (!res.ok) console.error(JSON.stringify({ event: "email_failed", status: res.status }));
  return res.ok;
}

export const heDate = (iso: string) => new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jerusalem" });
