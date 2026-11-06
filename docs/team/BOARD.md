# לוח המשימות

> **רק Claude עורך את הקובץ הזה** (ראו [`PROTOCOL.md`](PROTOCOL.md), כלל 1). סוכנים אחרים מדווחים ב-`reports/<ID>.md`.
> התוכנית המלאה: [`docs/launch/PLAN.md`](../launch/PLAN.md) · פעולות הבעלים: [`docs/launch/USER-ACTIONS.md`](../launch/USER-ACTIONS.md)

עודכן: 6.11.2026 · מצבים: `backlog` · `ready` · `in-progress` · `review` · `done` · `blocked(<סיבה>)`

## עכשיו

| ID | משימה | מי | מצב | אזור (היקף קבצים) | תלוי ב- |
|---|---|---|---|---|---|
| P-00 | תוכנית, מחקר, פרוטוקול צוות | Claude | done | `docs/launch/**`, `docs/team/**` | — |
| M-01 | מוטי: בלי כתיבות KV בכל הודעה, סדר מודלים, הודעות מכסה | Claude | review | `history-talk/src/**`, `history-talk/web/src/**`, `history-talk/test/**` | — |
| M-02 | מוטי: workflow העלאה אוטומטית (נכתב; פעיל מרגע שיש טוקן) | Claude | review · blocked(בעלים: CLOUDFLARE_API_TOKEN) | `.github/workflows/history-talk*.yml` | USER-ACTIONS §1 |
| C-01 | הסרת סרטוני "עיוניים" ו"מקוונים" | Claude | review | `src/data/class-videos.ts`, `src/components/videos/**`, `src/lib/videoSearch.ts`, `src/lib/siteSearch.ts` | — |
| S-01 | מחברות: כתיבה למנהלים בלבד | Claude | ready | `supabase/**`, `src/lib/notebookStore.ts`, `src/app/notebooks/**` | USER-ACTIONS §9 (הרצת SQL) |
| CX-01 | סקירת בריאות קוד: דוח בלבד, בלי שינויים | Codex | ready | `docs/team/reports/CX-01.md` בלבד | — |
| GPT-01 | מחקר מתחרים ומיצוב | ChatGPT | ready | `marketing/inbox/GPT-01/` | צילום המתחרה מהבעלים |
| GPT-02 | שפה שיווקית: כותרות, יתרונות, שאלות נפוצות לדף הנחיתה | ChatGPT | ready | `marketing/inbox/GPT-02/` | — |
| GPT-03 | טיוטת תקנון, מדיניות פרטיות, ביטול והצהרת נגישות | ChatGPT | ready | `marketing/inbox/GPT-03/` | — |

## הבא בתור

| ID | משימה | מי | מצב | אזור | תלוי ב- |
|---|---|---|---|---|---|
| H-01 | דומיין moreyderech.com ו-DNS | בעלים | blocked(קנייה) | — | USER-ACTIONS §2 |
| H-02 | בנייה בלי basePath ו-Worker סטטי ב-Cloudflare | Claude | backlog | `next.config.ts`, `src/lib/basePath.ts`, `deploy/**`, `.github/workflows/deploy*.yml` | M-02 (אותו טוקן), H-01 |
| H-03 | קובץ המפה (95MB): GitHub Pages או R2 | Claude | backlog | `src/app/map/**` | H-02 |
| H-04 | הפניה מהכתובת הישנה | Claude | backlog | `public/404.html` / gh-pages | H-02 |
| H-05 | ריפו פרטי | בעלים | backlog | — | H-02 |
| E-01 | Resend ו-SMTP של Supabase | בעלים | blocked | — | USER-ACTIONS §5–6 |
| E-02 | hello@moreyderech.com | בעלים | blocked | — | USER-ACTIONS §7 |
| A-01 | כניסה בקוד למייל, מסך הרשמה חדש | Claude | backlog | `src/lib/cloudAuth.ts`, `src/app/login/**`, `src/contexts/**` | E-01 |
| A-02 | כניסה עם Google | Claude | backlog | כנ"ל | USER-ACTIONS §8 |
| A-03 | סגירת הסיסמה הנגזרת (יחד עם israel-geo-game) | Claude | backlog | — | A-01 |
| B-01 | SQL: entitlements, billing_events, start_trial | Claude | backlog | `supabase/**` | — |
| B-02 | `plans.ts` ו-`useEntitlement` | Claude | backlog | `src/lib/plans.ts`, `src/hooks/**` | B-01 |
| B-03 | Paywall ו"התוכנית שלי" | Claude/Codex | backlog | `src/components/paywall/**`, `src/app/me/**` | B-02 |
| B-04 | בחירת ספק סליקה ופתיחת חשבון | בעלים | blocked | — | USER-ACTIONS §3–4 |
| B-05 | Worker `md-api` (checkout, callback, cancel, cron) | Claude | backlog | `api/**` | B-01, B-04 |
| B-06 | מוטי בודק זכאות | Claude | backlog | `history-talk/src/worker/**` | B-01, A-01 |
| L-01 | תקנון ופרטיות באתר | Claude | backlog | `src/app/legal/**` | GPT-03 |
| L-02 | נגישות: בדיקה, תיקונים והצהרה | Codex | backlog | לפי דוח | CX-01 |
| G-01 | דף נחיתה | Claude | backlog | `src/app/(landing)/**`, `src/components/landing/**` | GPT-02 |
| G-02 | צילומי מסך וסרטוני מסך מהאתר | Claude | backlog | `public/marketing/**`, `tools/marketing/**` | — |
| G-03 | תמונות שיווק וסרטון לרשתות | ChatGPT | backlog | `marketing/inbox/GPT-04/` | G-02 |
| G-04 | SEO ו-Open Graph | Codex | backlog | `src/app/layout.tsx`, `src/app/**/page.tsx` (metadata בלבד) | H-02 |
| G-05 | Web Analytics ומשפך | Claude | backlog | `src/app/layout.tsx` | H-02 |

## הושלם
| ID | משימה | PR |
|---|---|---|
| P-00 | תוכנית ההשקה ופרוטוקול הצוות | [#54](https://github.com/cfir94/moreh-derech/pull/54) |
