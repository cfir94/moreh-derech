# לוח המשימות

> **רק Claude עורך את הקובץ הזה** (ראו [`PROTOCOL.md`](PROTOCOL.md), כלל 1). סוכנים אחרים מדווחים ב-`reports/<ID>.md`.
> התוכנית המלאה: [`docs/launch/PLAN.md`](../launch/PLAN.md) · פעולות הבעלים: [`docs/launch/USER-ACTIONS.md`](../launch/USER-ACTIONS.md)

עודכן: 7.11.2026 · מצבים: `backlog` · `ready` · `in-progress` · `review` · `done` · `blocked(<סיבה>)`

## עכשיו

| ID | משימה | מי | מצב | אזור (היקף קבצים) | תלוי ב- |
|---|---|---|---|---|---|
| P-00 | תוכנית, מחקר, פרוטוקול צוות | Claude | done | `docs/launch/**`, `docs/team/**` | — |
| M-01 | מוטי: בלי כתיבות KV בכל הודעה, סדר מודלים, הודעות מכסה | Claude | done (#55; באוויר אחרי העלאה) | `history-talk/src/**`, `history-talk/web/src/**`, `history-talk/test/**` | — |
| M-02 | מוטי: workflow העלאה אוטומטית (נכתב; פעיל מרגע שיש טוקן) | Claude | review · blocked(בעלים: CLOUDFLARE_API_TOKEN) | `.github/workflows/history-talk*.yml` | USER-ACTIONS §1 |
| C-01 | הקלטות הקורס (עיוני, מקוון, סיורים) רק לחברי הכיתה; לחדשים רק העשרה | Claude | done | `src/data/class-videos.ts`, `src/components/videos/**`, `src/lib/videoSearch.ts`, `src/lib/siteSearch.ts` | — |
| S-01 | מחברות: כתיבה למנהלים בלבד (SQL מוכן: `supabase/migrations/20261106_01_*`) | בעלים | blocked(הרצת SQL) | `supabase/**`, `src/lib/notebookStore.ts`, `src/app/notebooks/**` | USER-ACTIONS §9 (הרצת SQL) |
| CX-01 | סקירת בריאות קוד: דוח בלבד, בלי שינויים ([#57](https://github.com/cfir94/moreh-derech/issues/57)) | Codex | done (`reports/CX-01.md`) | `docs/team/reports/CX-01.md` בלבד | — |
| CX-02 | SEO: metadata, Open Graph, sitemap, robots ([#60](https://github.com/cfir94/moreh-derech/issues/60)) | Codex | done (#73, אחרי 4 תיקונים של Claude) | metadata ב-`src/app/**`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/seo.ts` | — |
| CX-04 | מחקר מתחרים, מחיר ומיצוב (הועבר מ-GPT-01) | Codex | done (`marketing/inbox/CX-04/`) | `marketing/inbox/CX-04/` | — |
| CX-03 | טקסטים לדף הנחיתה, ובמקום פוסטים: הודעות וואטסאפ אישיות (הועבר מ-GPT-02) | Codex | done (`marketing/inbox/CX-03/`); שילוב ב-/welcome: G-01 | `marketing/inbox/CX-03/` | — |
| CX-06 | ליטוש מדוח CX-01: ESLint בלי embeds, טיפוסי PNG, בדיקת האטלס וכל הבדיקות ב-CI, טוקנים במקום צבעים גולמיים, backdrop נגיש, קוד מת | Codex | in-progress | ראו `codex/CX-06.md` | — |
| F-01 | פונטים מקומיים (`next/font/local`): build בלי Google | Claude | backlog | `src/app/layout.tsx`, `src/assets/fonts/**` | — |
| CX-05 | (בוטל ע"י הבעלים: בלי שיווק המוני. הקהל הוא תלמידי מורי דרך, ופונים אליהם ישירות בוואטסאפ) | — | cancelled | — | — |
| GPT-03 | (בוטל: Claude כתב את דפי המשפט ב-L-01) | — | done | — | — |

## הבא בתור

| ID | משימה | מי | מצב | אזור | תלוי ב- |
|---|---|---|---|---|---|
| H-01 | דומיין moreyderech.com ו-DNS | בעלים | blocked(קנייה) | — | USER-ACTIONS §2 |
| H-02 | בנייה בלי basePath ו-Worker סטטי ב-Cloudflare | Claude | done (#56) | `next.config.ts`, `src/lib/basePath.ts`, `deploy/**`, `.github/workflows/deploy*.yml` | M-02 (אותו טוקן), H-01 |
| H-03 | קובץ המפה (95MB): בינתיים נטען מ-GitHub Pages (Range+CORS נבדקו). לפני ריפו פרטי: ריפו ציבורי נפרד למפה, או R2 | Claude | backlog | `src/app/map/**` | H-02 |
| H-04 | הפניה מהכתובת הישנה | Claude | backlog | `public/404.html` / gh-pages | H-02 |
| H-05 | ריפו פרטי | בעלים | backlog | — | H-02 |
| E-01 | Resend ו-SMTP של Supabase | בעלים | blocked | — | USER-ACTIONS §5–6 |
| E-02 | hello@moreyderech.com | בעלים | blocked | — | USER-ACTIONS §7 |
| A-01 | כניסה בקוד/קישור למייל, מסך הרשמה חדש (כבוי; נבדק מקצה לקצה) | Claude | done (#58) · הפעלה: USER-ACTIONS §6א | `src/lib/cloudAuth.ts`, `src/app/login/**`, `src/contexts/**` | E-01 |
| A-02 | כניסה עם Google | Claude | backlog | כנ"ל | USER-ACTIONS §8 |
| A-03 | סגירת הסיסמה הנגזרת (יחד עם israel-geo-game) | Claude | backlog | — | A-01 |
| B-01 | SQL: entitlements, billing_events, start_trial | Claude | backlog | `supabase/**` | — |
| B-02 | `plans.ts`, `entitlement.ts`, `accessStore.ts` | Claude | review | `src/lib/plans.ts`, `src/hooks/**` | B-01 |
| B-03 | Paywall, `/pricing`, "התוכנית שלי", מוטי רק עם גישה (כבוי: NEXT_PUBLIC_PAYWALL) | Claude | review | `src/components/paywall/**`, `src/app/me/**` | B-02 |
| B-04 | בחירת ספק סליקה ופתיחת חשבון | בעלים | blocked | — | USER-ACTIONS §3–4 |
| B-05 | Worker `md-api`: checkout, callback מאומת, ביטול, תזכורות, ספק מדומה, Grow (טיוטה). 6 בדיקות | Claude | review · Grow ממתין ל-sandbox | `api/**`, `tests/md-api.test.mjs` | B-04 (לחיבור Grow) |
| B-06 | מוטי בודק זכאות | Claude | backlog | `history-talk/src/worker/**` | B-01, A-01 |
| L-01 | `/legal/*`: תנאים, פרטיות, ביטול, נגישות (טיוטה; ממתין לפרטי העוסק ולעורך דין) | Claude | review | `src/app/legal/**` | GPT-03 |
| L-02 | נגישות: בדיקה, תיקונים והצהרה | Codex | backlog | לפי דוח | CX-01 |
| G-01 | דף נחיתה `/welcome` (הכנה, מספרים, 5 יכולות עם סרטונים, משחקים, מוטי, מחיר, שאלות נפוצות) | Claude | review · הטקסטים ישתפרו עם GPT-02 | `src/app/welcome/**`, `src/components/landing/**` | — |
| G-02 | 18 צילומי מסך, 3 סרטוני מסך ותמונת שיתוף (`public/marketing/`, 2.4MB) | Claude | review | `public/marketing/**`, `tools/marketing/**` | — |
| G-03 | (בוטל: בלי שיווק המוני) | — | cancelled | — | — |
| G-05 | Web Analytics ומשפך | Claude | backlog | `src/app/layout.tsx` | H-02 |

## הושלם
| ID | משימה | PR |
|---|---|---|
| P-00 | תוכנית ההשקה ופרוטוקול הצוות | [#54](https://github.com/cfir94/moreh-derech/pull/54) |
