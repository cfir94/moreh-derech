# md-api — שרת התשלומים

Cloudflare Worker קטן שמחבר בין ספק הסליקה לבין `md_entitlements` ב-Supabase. התיעוד בראש `src/index.ts`.

- **מצב נוכחי:** `PROVIDER="mock"`, כלומר דף תשלום מדומה לבדיקות. המעבר ל-`"grow"` יקרה אחרי פתיחת חשבון ובדיקה ב-sandbox. השדות שעוד צריך לאמת מסומנים `TODO(sandbox)` ב-`src/providers/grow.ts`.
- **בדיקות:** `node --import ./tests/register-ts.mjs --test tests/md-api.test.mjs` (מהשורש). Supabase מדומה, בלי רשת.
- **טיפוסים:** `../history-talk/node_modules/.bin/tsc -p api/tsconfig.json`.
- **פריסה:** `.github/workflows/api-deploy.yml` במיזוג ל-main. הסודות מגיעים מ-GitHub Secrets. `BILLING_SECRET` נוצר אוטומטית בפריסה הראשונה.
- **חיבור לאתר:** בבנייה של Cloudflare מגדירים `NEXT_PUBLIC_API_ORIGIN=https://md-api.cfir94.workers.dev`. בלעדיו, כפתורי התשלום פותחים מייל.

## עקרונות
1. זכאות נכתבת **רק** אחרי התראת שרת מאומתת: HMAC על (משתמש, תוכנית) בכתובת ה-callback. אף פעם לא בגלל הפניה בדפדפן.
2. כל אירוע נרשם ב-`md_billing_events`. אירוע כפול (אותו ספק, מזהה וסוג) לא מיושם פעמיים.
3. תשלום מוקדם לא מקצר מנוי: התקופה מתווספת מהמאוחר מבין "עכשיו" ו"סוף התקופה הקיימת".
4. ביטול נכנס לתוקף מיד (`cancel_at_period_end`), והגישה נמשכת עד סוף התקופה. אם ביטול אצל הספק נכשל, הבעלים מקבל התראה לבטל ידנית.
5. תזכורות: יומיים לפני סוף הניסיון, ושבועיים לפני חידוש שנתי (סעיף 13א). כל אחת נשלחת פעם אחת.
