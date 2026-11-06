# מה רק אתה יכול לעשות

את הדברים האלה אני (Claude) לא יכול לעשות בשבילך, כי הם דורשים כרטיס אשראי, זהות, חתימה או כניסה לחשבון שלך. הם מסודרים לפי סדר עדיפות. כל אחד מהם משחרר משימות שמחכות לו בלוח ([`docs/team/BOARD.md`](../team/BOARD.md)).

**אסור להדביק סודות (מפתחות, סיסמאות, טוקנים) בצ'אט, ב-GitHub Issues או בקבצים בריפו.** סוד נכנס רק למקומות שמפורטים כאן: GitHub Secrets, `wrangler secret` או הגדרות Supabase.

סימון: ⬜ לא נעשה · ✅ נעשה. כשתסיים פעולה, כתוב לי ואסמן אותה.

---

## 1. ⬜ טוקן Cloudflare ל-GitHub (משחרר: M-02, H-02). 10 דקות, חינם
בלי זה תיקוני מוטי לא עולים לאוויר אוטומטית.
1. https://dash.cloudflare.com/profile/api-tokens ← **Create Token** ← תבנית **Edit Cloudflare Workers** ← בחר את החשבון שלך ← Create.
2. העתק את הטוקן.
3. ב-GitHub: הריפו `moreh-derech` ← Settings ← Secrets and variables ← Actions ← **New repository secret**:
   - Name: `CLOUDFLARE_API_TOKEN`, Value: הטוקן.
   - סוד נוסף: Name: `CLOUDFLARE_ACCOUNT_ID`. את המזהה מוצאים בדשבורד של Cloudflare, בצד ימין של דף Workers & Pages ("Account ID").

## 2. ⬜ קניית הדומיין moreyderech.com (משחרר: H-01, E-01, E-02). כ-$10.5 לשנה
1. https://dash.cloudflare.com ← Domain Registration ← **Register Domains** ← `moreyderech.com` ← קנייה, לשנה אחת עם חידוש אוטומטי.
2. זהו. ה-DNS כבר נמצא ב-Cloudflare, ואת השאר אני מגדיר דרך ה-workflow, או שאכתוב לך בדיוק מה ללחוץ.

## 3. ⬜ פתיחת תיק עוסק (אם עוד אין). תנאי לכל חברת סליקה
- הכנסה צפויה מתחת ל-122,833 ₪ בשנה (2026) מתאימה ל**עוסק פטור**. פותחים במע"מ ובמס הכנסה, גם אונליין דרך אתר רשות המסים.
- כדאי להתייעץ עם רואה חשבון לפני כן, במיוחד אם אתה שכיר במקביל.
- הוצאה מוכרת: הדומיין, ובעתיד Gemini וכו'.

## 4. ⬜ פתיחת חשבון סליקה (משחרר: B-04, B-05)
ההמלצה המפורטת נמצאת ב-[`research/payments.md`](research/payments.md). בקצרה: **Grow**, ובנוסף כדאי לבקש הצעה מ-Cardcom ומ-PayPlus. כשאתה מדבר איתם, תשאל:
- [ ] יש **API** עם **התראת שרת (callback/webhook)** על כל חיוב, כולל חיובי הוראת קבע חודשיים?
- [ ] יש **הוראת קבע באשראי** (מנוי חודשי) שהם מנהלים, ו**ביטול דרך API**?
- [ ] **חשבונית/קבלה אוטומטית** לכל חיוב (גם לעוסק פטור)?
- [ ] **ביט**, Apple Pay ו-Google Pay?
- [ ] **דמי מנוי חודשיים** ו**עמלה לעסקה**, כולל מה עולה המודול של הוראות קבע ושל API?
- [ ] **סביבת בדיקות (sandbox)** למפתחים?

כשתבחר, תכניס את המפתחות **רק** כ-GitHub Secrets (אכתוב לך את השמות המדויקים), ולא בצ'אט.

## 5. ⬜ חשבון Resend למיילים (משחרר: E-01, A-01). חינם
1. https://resend.com ← הרשמה עם ה-Gmail שלך.
2. Domains ← Add Domain ← `moreyderech.com` ← Resend מציג רשומות DNS. אם תחבר את Resend ל-Cloudflare (יש כפתור), זה נעשה אוטומטית.
3. API Keys ← Create ← שמור כ-GitHub Secret בשם `RESEND_API_KEY`.

## 6. ⬜ הגדרת SMTP ב-Supabase (משחרר: A-01). 5 דקות
אחרי סעיף 5: Supabase Dashboard ← Project Settings ← Authentication ← **SMTP Settings** ← Enable custom SMTP:
- Host: `smtp.resend.com` · Port: `465` · User: `resend` · Password: מפתח ה-API של Resend
- Sender email: `login@moreyderech.com` · Sender name: `מורי דרך`

## 7. ⬜ מייל עסקי hello@moreyderech.com (משחרר: E-02). חינם
1. Cloudflare ← הדומיין ← **Email** ← Email Routing ← Enable. מוסיף `hello@moreyderech.com` ← היעד הוא ה-Gmail שלך (מאשרים במייל).
2. Gmail ← הגדרות ← חשבונות ← **שלח דואר בשם** ← `hello@moreyderech.com`, עם SMTP `smtp.resend.com`, פורט 465, משתמש `resend` וסיסמה = מפתח Resend.
3. מעכשיו עונים ללקוחות מתוך ה-Gmail, והם רואים `hello@moreyderech.com`.

## 8. ⬜ כניסה עם Google (משחרר: A-02). חינם, 15 דקות
אכתוב מדריך מדויק כשנגיע לשלב הזה.

## 9. ⬜ Supabase: הרצת קובצי SQL (משחרר: S-01, B-01)
כשתגיע משימה כזו, אכתוב לך: "הרץ את `supabase/xxx.sql`". נכנסים ל-Supabase ← SQL Editor ← מדביקים ← Run.
אפשרות שחוסכת את זה: ליצור Supabase **access token** (Account ← Access Tokens) ולשמור אותו כ-GitHub Secret בשם `SUPABASE_ACCESS_TOKEN`, ואז workflow יריץ את המיגרציות לבד. **מפתח ה-service_role** נכנס כ-`wrangler secret` של ה-Worker בלבד (אכתוב פקודה מדויקת).

## 10. ⬜ צילום אתר המתחרה
שלח לי צילום, או את הכתובת. זה קובע את המחיר הסופי ואת המסרים בדף הנחיתה.

## 11. ⬜ ChatGPT ו-Codex: הגדרה חד-פעמית
ההוראות ב-[`docs/team/chatgpt/SETUP.md`](../team/chatgpt/SETUP.md) וב-[`docs/team/codex/SETUP.md`](../team/codex/SETUP.md).

## 12. ⬜ (אחרי ההשקה) עורך דין לתקנון
את הנוסח נכין בעצמנו, ומומלץ שעורך דין יעבור עליו לפני שגובים כסף מהלקוח הראשון.
