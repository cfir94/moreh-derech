# מה רק אתה יכול לעשות

את הדברים האלה אני (Claude) לא יכול לעשות בשבילך, כי הם דורשים כרטיס אשראי, זהות, חתימה או כניסה לחשבון שלך. הם מסודרים לפי סדר עדיפות. כל אחד מהם משחרר משימות שמחכות לו בלוח ([`docs/team/BOARD.md`](../team/BOARD.md)).

**אסור להדביק סודות (מפתחות, סיסמאות, טוקנים) בצ'אט, ב-GitHub Issues או בקבצים בריפו.** סוד נכנס רק למקומות שמפורטים כאן: GitHub Secrets, `wrangler secret` או הגדרות Supabase.

סימון: ⬜ לא נעשה · ✅ נעשה. כשתסיים פעולה, כתוב לי ואסמן אותה.

## הדרך הקצרה להשקה (7.11)

כל הקוד מוכן ומחכה כבוי. מה שנשאר הוא רק אצלך, בסדר הזה:

1. **§1: טוקן Cloudflare** (10 דקות). בלעדיו התיקונים של מוטי והאתר החדש לא עולים לאוויר.
2. **§2: קניית הדומיין** (כ-$10.5).
3. **§9: הרצת שלושת קובצי ה-SQL ב-Supabase** (5 דקות). זה פותח את שבוע הניסיון ואת המנויים.
4. **§6א: כתובות החזרה ותבנית המייל ב-Supabase** (5 דקות). זה פותח את הכניסה בקוד מהמייל.
5. **§3–4: עוסק וחשבון סליקה.** זה השלב הארוך, ובלעדיו אי אפשר לגבות.
6. **§5–7: Resend, ‏SMTP ומייל עסקי.**

אחרי 1–4 אני מפעיל את שבוע הניסיון ואת מוטי למנויים. אחרי 5 אני מחבר את הסליקה. כל הפעלה אני מאשר מולך לפני שהיא עולה.

---

## 1. ⬜ טוקן Cloudflare ל-GitHub (משחרר: M-02, H-02). 10 דקות, חינם
> **7.11, מצב:** הטוקן תקין. Claude השתמש בו פעם אחת כדי להעלות את מוטי ואת האתר ל-`https://moreh-derech.cfir94.workers.dev`. **מה שנשאר:** הטוקן לא נשמר ב-GitHub, ולכן העלאה אוטומטית אחרי כל מיזוג עדיין לא פועלת. מכיוון שהטוקן נשלח בצ'אט, עדיף ליצור טוקן חדש, לבטל את הישן, ולשמור את החדש לפי השלבים כאן. ה-Account ID הוא `f4d6d7497c7faa8b87f1a1167c6aebcc`.
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

## 6א. ⬜ Supabase: כתובות חזרה ותבנית מייל בעברית (משחרר: A-01). 5 דקות, חינם
**נבדק ב-6.11:** הכניסה בקישור מהמייל עובדת מקצה לקצה (Claude בדק עם המייל שלך בדפדפן בדיקה). אבל:
- **Site URL** של הפרויקט הוא `http://localhost:3000`, כלומר קישור מייל ששולח שרת אמיתי חוזר ל-localhost.
- התבנית באנגלית, ושולחת רק קישור (בלי קוד להקלדה).

מה לעשות: Supabase ← Authentication ← **URL Configuration**:
- **Site URL**: `https://moreyderech.com` (עד שהדומיין יעלה: `https://cfir94.github.io/moreh-derech/`)
- **Redirect URLs**: להוסיף את כל אלה:
  `https://cfir94.github.io/**` · `https://moreyderech.com/**` · `https://www.moreyderech.com/**` · `https://moreh-derech.cfir94.workers.dev/**` · `http://localhost:3000/**`

Authentication ← **Emails** ← **Magic Link**: נושא `קוד הכניסה שלך למורי דרך: {{ .Token }}`, ותוכן מהקובץ [`email-templates/magic-link.html`](email-templates/magic-link.html). אם "Confirm signup" מופעל, אותו תוכן גם שם.

⚠️ בלי SMTP מותאם (§5–6) Supabase שולח רק כ-2 מיילים בשעה. זה מספיק לבדיקה, לא למשתמשים.

## 7. ⬜ מייל עסקי office@moreyderech.com (משחרר: E-02). חינם
1. Cloudflare ← הדומיין ← **Email** ← Email Routing ← Enable. מוסיף `office@moreyderech.com` ← היעד הוא ה-Gmail שלך (מאשרים במייל).
2. Gmail ← הגדרות ← חשבונות ← **שלח דואר בשם** ← `office@moreyderech.com`, עם SMTP `smtp.resend.com`, פורט 465, משתמש `resend` וסיסמה = מפתח Resend.
3. מעכשיו עונים ללקוחות מתוך ה-Gmail, והם רואים `office@moreyderech.com`.

## 8. ⬜ כניסה עם Google (משחרר: A-02). חינם, 15 דקות
אכתוב מדריך מדויק כשנגיע לשלב הזה.

## 8א. ⬜ סודות לשרת התשלומים (md-api), הכול ב-GitHub Secrets
אין צורך בשורת פקודה. ב-GitHub ← Settings ← Secrets and variables ← Actions ← New repository secret:
- `SUPABASE_SERVICE_KEY`: מ-Supabase ← Project Settings ← API ← **service_role** (סודי! רק כאן).
- `RESEND_API_KEY`: מסעיף 5.
- אחרי פתיחת חשבון ב-Grow: `GROW_USER_ID`, `GROW_PAGE_CODE_MONTHLY` ו-`GROW_PAGE_CODE_YEARLY` (Grow נותנים אותם בהקמה).
- את `BILLING_SECRET` הפריסה יוצרת לבד.

## 9. ⬜ Supabase: הרצת קובצי SQL (משחרר: S-01, B-01)
**לסדר, כשתתפנה:** `supabase/migrations/20261106_01_admins_notebooks.sql`, `..._02_entitlements.sql`, `..._03_entitlement_reminders.sql`. כל אחד: SQL Editor ← הדבקה ← Run. מותר להריץ שוב. נכנסים ל-Supabase ← SQL Editor ← מדביקים ← Run.
אפשרות שחוסכת את זה: ליצור Supabase **access token** (Account ← Access Tokens) ולשמור אותו כ-GitHub Secret בשם `SUPABASE_ACCESS_TOKEN`, ואז workflow יריץ את המיגרציות לבד. **מפתח ה-service_role** נכנס כ-`wrangler secret` של ה-Worker בלבד (אכתוב פקודה מדויקת).

## 10. ⬜ צילום אתר המתחרה
שלח לי צילום, או את הכתובת. זה קובע את המחיר הסופי ואת המסרים בדף הנחיתה.

## 11. ⬜ ChatGPT ו-Codex: הגדרה חד-פעמית
ההוראות ב-[`docs/team/chatgpt/SETUP.md`](../team/chatgpt/SETUP.md) וב-[`docs/team/codex/SETUP.md`](../team/codex/SETUP.md).

## 12. ⬜ (אחרי ההשקה) עורך דין לתקנון
את הנוסח נכין בעצמנו, ומומלץ שעורך דין יעבור עליו לפני שגובים כסף מהלקוח הראשון.

## 13. ⬜ חיבור NotebookLM לסשן של Claude (משחרר: בדיקת התוכן של עזר הגאולוגיה, LA-70). 5 דקות, חינם
נרשם לבקשת הבעלים ב-10.11, "לעשות אחר כך".
- **מה:** להפעיל את המחבר `notebooklm` בהגדרות המחברים ב-claude.ai, ולהתחבר בו לחשבון Google שבו נמצאות מחברות הקורס.
- **למה:** עזר הגאולוגיה (`/timelines/geology`) נכתב בינתיים משאלון הגאולוגיה ומיחידות המפה. מה שאינו מחומר הקורס מסומן בו "השלמה". כשהמחבר יהיה מחובר, Claude יעבור על כל עמוד הזמן, הסלעים והקרקעות מול שתי מחברות הגאולוגיה (`688ad1a8-ac54-41b3-82b7-c0281f16a647`, `a2ec758d-63dd-4006-bd88-6daf8e6acf9b`), יתקן את מה שסותר אותן, ויוריד את תג "השלמה" ממה שנמצא בהן.
- **אחר כך:** לכתוב ל-Claude "המחבר מחובר, תעבור על הגאולוגיה".
