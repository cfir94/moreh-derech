# דבר עם ההיסטוריה

שיחה קולית בעברית, בזמן אמת, עם דמויות היסטוריות. לכל דמות יש קול משלה, דף ידע
מרוכז ומאגר מקורות שהיא מחפשת בו לפני כל תשובה עובדתית ומצטטת ממנו. בנוי על
Gemini Live API ו-Cloudflare Workers, ורץ בחינם בשלב ההתחלה.

הדמויות הראשונות: **יוסף בן מתתיהו** ו**טיטוס**.

```
 הגולש (עמוד /characters באתר, iframe)
      │  בוחר דמות, מאשר גיל 18+, לוחץ "התחל שיחה"
      ▼
 [talk.html]  ── Turnstile ──►  [Worker: POST /api/token]
      │                           מקור ✓ מדינה ✓ Turnstile ✓ מכסות ✓
      │◄── אסימון זמני לשיחה אחת ──┘ ההוראות, הקול והכלים נעולים באסימון
      ▼
 [Gemini Live]  ◄── שמע דו-כיווני, ישירות מהדפדפן
      └── toolCall search_sources → חיפוש בדפדפן (MiniSearch) → sendToolResponse
```

- **המפתח לא נחשף**: הדפדפן מקבל אסימון זמני (ephemeral token) בלבד.
- **הדמות נעולה**: כל הגדרות השיחה — הוראות, קול, כלים, תמלול — נבנות בשרת ונעולות
  באסימון. גולש לא יכול להפוך את הדמות לצ'אט כללי. ראו `docs/api-notes.md`.
- **הקול לא עובר דרך השרת**: הדפדפן מדבר עם Gemini ישירות.

## מבנה

```
wrangler.jsonc            Worker + assets + KV + rate limit + משתנים
src/worker/               index.ts (ניתוב), token.ts (אסימון נעול), guards.ts (שומרים, כותרות), prompt.ts (הוראות)
web/                      index.html (בחירת דמות), talk.html (שיחה), src/ (לקוח)
characters/<id>/          character.json, prompt.md, knowledge-sheet.md, sources/, media/
scripts/                  fetch-sources.mjs, build-knowledge.mjs, optimize-media.mjs
test/                     בדיקות (node --test)
docs/                     api-notes, add-character, embed, privacy-he, qa
```

## הרצה מקומית

צריך Node.js 22 ומעלה.

```bash
cd history-talk
npm install
cp .dev.vars.example .dev.vars   # ולמלא GEMINI_API_KEY (מפתח הבדיקה של Turnstile כבר שם)
npm run dev                      # בונה את מאגר הידע ומריץ את Vite + Worker על http://localhost:5173
```

- מיקרופון עובד רק ב-HTTPS או ב-`localhost`.
- `npm test` — בדיקות לחיפוש בעברית, לחיתוך המקורות ול-`/api/token` (עם Gemini מדומה).
- `npm run typecheck` — בדיקת טיפוסים ללקוח ול-Worker.

## העלאה ל-Cloudflare

פעם ראשונה:

```bash
npx wrangler login                          # או CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID בסביבה
npx wrangler kv namespace create SESSIONS   # להעתיק את ה-id לתוך wrangler.jsonc
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put TURNSTILE_SECRET
```

ב-`wrangler.jsonc` להחליף את `TURNSTILE_SITE_KEY` ב-Site key האמיתי. ב-Turnstile להוסיף
לרשימת הדומיינים את כתובת ה-Worker (`history-talk.<חשבון>.workers.dev`) — שם רץ הווידג'ט,
לא ב-github.io.

ואז, בכל עדכון:

```bash
npm run deploy
```

אחרי ההעלאה: לכתוב את כתובת ה-Worker ב-`src/data/history-talk.ts` של האתר
(`HISTORY_TALK_ORIGIN`), ולבדוק: `/api/health` עונה `ok`, שיחה אחת עובדת, ושיחה
רביעית מאותו IP נחסמת.

## משתנים (`wrangler.jsonc`)

| משתנה | ברירת מחדל | מה עושה |
|---|---|---|
| `GEMINI_LIVE_MODEL` | `gemini-3.8-live` | המודל |
| `GEMINI_API_VERSION` | `v1beta` | גרסת ה-API לאסימון (ראו הפער ב-`docs/api-notes.md`) |
| `ALLOWED_ORIGINS` | github.io + localhost | מי רשאי לבקש אסימון (בנוסף ל-Worker עצמו) |
| `FRAME_ANCESTORS` | github.io + localhost | מי רשאי להטמיע ב-iframe |
| `FREE_TIER_MODE` | `true` | חוסם את האיחוד האירופי, אזור הכלכלה האירופי, שווייץ ובריטניה |
| `MAX_SESSION_MINUTES` | `12` | אורך שיחה; האסימון פג אחרי 12+2 דקות |
| `DAILY_SESSIONS_PER_IP` | `3` | שיחות ביום לכל IP (KV, משוער) |
| `DAILY_SESSIONS_GLOBAL` | `60` | תקרה יומית לכל האתר |
| `TURNSTILE_SITE_KEY` | מפתח בדיקה | ה-Site key של Turnstile |

סודות: `GEMINI_API_KEY`, `TURNSTILE_SECRET`. מקומית — ב-`.dev.vars` (לא נכנס ל-Git).

## עלויות

- **Cloudflare**: התוכנית החינמית — 100,000 בקשות ביום; קבצים סטטיים בחינם. KV: 1,000 כתיבות
  ביום בחינם — כל שיחה כותבת 4 ערכים וכל חידוש עוד אחד, כך ש-60 שיחות ביום רחוק מהתקרה.
- **Gemini**: התוכנית החינמית בלי חשבון חיוב. גוגל לא מפרסמת כמה שיחות מותר — המכסה
  מוצגת ב-AI Studio, וכל הגולשים חולקים אותה. בתוכנית החינמית Google משתמשת בתוכן לשיפור
  המוצרים, ואסור לשרת את אירופה ובריטניה — לכן `FREE_TIER_MODE`.
- **מעבר לתשלום**: לחבר חיוב בפרויקט של המפתח ב-AI Studio, להגדיר התראות תקציב, לשנות
  `FREE_TIER_MODE` ל-`false` ולעדכן את עמוד הפרטיות. כל תור בשיחה מחויב גם על כל ההקשר
  שלפניו — ולכן דף הידע קצר (כ-2,500 טוקנים לדמות), הדחיסה מופעלת והשיחה מוגבלת בזמן.

## מקורות

הטקסטים העבריים מפרויקט בן־יהודה (נחלת הכלל), והלטיניים מתרגומי Loeb ב-LacusCurtius
(נחלת הכלל). `npm run fetch:sources` מוריד אותם מחדש. כל ציטוט בדפי הידע נבדק אוטומטית
מול המקורות (`build-knowledge` מתריע על ציטוט שלא נמצא).
