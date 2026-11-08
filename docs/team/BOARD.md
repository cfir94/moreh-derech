# לוח המשימות

> **רק Claude עורך את הקובץ הזה** (ראו [`PROTOCOL.md`](PROTOCOL.md), כלל 1). סוכנים אחרים מדווחים ב-`reports/<ID>.md`.
> התוכנית המלאה: [`docs/launch/PLAN.md`](../launch/PLAN.md) · פעולות הבעלים: [`docs/launch/USER-ACTIONS.md`](../launch/USER-ACTIONS.md)

עודכן: 7.11.2026 · מצבים: `backlog` · `ready` · `in-progress` · `review` · `done` · `blocked(<סיבה>)`

## עכשיו

| ID | משימה | מי | מצב | אזור (היקף קבצים) | תלוי ב- |
|---|---|---|---|---|---|
| P-00 | תוכנית, מחקר, פרוטוקול צוות | Claude | done | `docs/launch/**`, `docs/team/**` | — |
| P-01 | סקילים בריפו, זמינים ל-Claude בענן ול-Codex, ומדריך `docs/team/SKILLS.md` | Claude | review | `.claude/skills/**`, `.agents/skills/**`, `docs/team/SKILLS.md`, `CLAUDE.md`, `AGENTS.md`, הגדרות lint/tsc/git | — |
| M-01 | מוטי: בלי כתיבות KV בכל הודעה, סדר מודלים, הודעות מכסה | Claude | done (#55; באוויר אחרי העלאה) | `history-talk/src/**`, `history-talk/web/src/**`, `history-talk/test/**` | — |
| M-02 | מוטי: workflow העלאה אוטומטית | Claude | done (רץ אוטומטית אחרי #89) | `.github/workflows/history-talk*.yml` | USER-ACTIONS §1 |
| C-01 | הקלטות הקורס (עיוני, מקוון, סיורים) רק לחברי הכיתה; לחדשים רק העשרה | Claude | done | `src/data/class-videos.ts`, `src/components/videos/**`, `src/lib/videoSearch.ts`, `src/lib/siteSearch.ts` | — |
| S-01 | מחברות: כתיבה למנהלים בלבד (`supabase/migrations/20261106_01_*`) | בעלים | done (הורץ ב-7.11, #88) | `supabase/**`, `src/lib/notebookStore.ts`, `src/app/notebooks/**` | USER-ACTIONS §9 (הרצת SQL) |
| CX-01 | סקירת בריאות קוד: דוח בלבד, בלי שינויים ([#57](https://github.com/cfir94/moreh-derech/issues/57)) | Codex | done (`reports/CX-01.md`) | `docs/team/reports/CX-01.md` בלבד | — |
| CX-02 | SEO: metadata, Open Graph, sitemap, robots ([#60](https://github.com/cfir94/moreh-derech/issues/60)) | Codex | done (#73, אחרי 4 תיקונים של Claude) | metadata ב-`src/app/**`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/seo.ts` | — |
| CX-04 | מחקר מתחרים, מחיר ומיצוב (הועבר מ-GPT-01) | Codex | done (`marketing/inbox/CX-04/`) | `marketing/inbox/CX-04/` | — |
| CX-03 | טקסטים לדף הנחיתה, ובמקום פוסטים: הודעות וואטסאפ אישיות (הועבר מ-GPT-02) | Codex | done (`marketing/inbox/CX-03/`); שילוב ב-/welcome: G-01 | `marketing/inbox/CX-03/` | — |
| CX-06 | ליטוש מדוח CX-01: ESLint בלי embeds, טיפוסי PNG, בדיקת האטלס וכל הבדיקות ב-CI, טוקנים במקום צבעים גולמיים, קוד מת | Codex+Claude | done (#78) | ראו `codex/CX-06.md` | — |
| S-02 | התקדמות, טעויות, מפת הלמידה, תשבצים וטיוטות נשמרים בחשבון ומסונכרנים בין מכשירים (`md_user_data`) | Claude | done (#92, SQL #93; נבדק ע"י הבעלים בכניסה אמיתית) | `src/lib/sync/**`, `supabase/migrations/20261107_01_*`, `tests/cloud-sync.test.mjs` | — |
| F-01 | פונטים מקומיים (`next/font/local`): build בלי Google | Claude | done | `src/app/layout.tsx`, `src/assets/fonts/**` | — |
| CX-05 | (בוטל ע"י הבעלים: בלי שיווק המוני. הקהל הוא תלמידי מורי דרך, ופונים אליהם ישירות בוואטסאפ) | — | cancelled | — | — |
| GPT-03 | (בוטל: Claude כתב את דפי המשפט ב-L-01) | — | done | — | — |

## הבא בתור

| ID | משימה | מי | מצב | אזור | תלוי ב- |
|---|---|---|---|---|---|
| H-01 | דומיין moreyderech.com ו-DNS | בעלים | done (באוויר, כולל www) | — | USER-ACTIONS §2 |
| H-02 | בנייה בלי basePath ו-Worker סטטי ב-Cloudflare | Claude | done (#56) | `next.config.ts`, `src/lib/basePath.ts`, `deploy/**`, `.github/workflows/deploy*.yml` | M-02 (אותו טוקן), H-01 |
| H-03 | קובץ המפה (95MB): בינתיים נטען מ-GitHub Pages (Range+CORS נבדקו). לפני ריפו פרטי: ריפו ציבורי נפרד למפה, או R2 | Claude | backlog | `src/app/map/**` | H-02 |
| H-04 | הפניה מהכתובת הישנה | Claude | backlog | `public/404.html` / gh-pages | H-02 |
| H-05 | ריפו פרטי | בעלים | backlog | — | H-02 |
| E-01 | Resend ו-SMTP של Supabase | בעלים | done (#88: הדומיין מאומת, SMTP ותבנית עברית) | — | USER-ACTIONS §5–6 |
| E-02 | office@moreyderech.com (Email Routing ל-Gmail) | מקומי | done (#90, מייל מכתובת חיצונית הגיע ל-Gmail) | — | USER-ACTIONS §7 |
| A-01 | כניסה בקוד/קישור למייל, מסך הרשמה חדש (כבוי; נבדק מקצה לקצה) | Claude | done (#58) · הודלק ב-moreyderech.com ב-7.11, באישור הבעלים | `src/lib/cloudAuth.ts`, `src/app/login/**`, `src/contexts/**` | E-01 |
| A-02 | כניסה עם Google | Claude | backlog | כנ"ל | USER-ACTIONS §8 |
| A-03 | סגירת הסיסמה הנגזרת (יחד עם israel-geo-game) | Claude | backlog | — | A-01 |
| B-01 | SQL: entitlements, billing_events, start_trial (`supabase/migrations/20261106_02_*`, `_03_*`) | Claude | done (הורץ ב-7.11) | `supabase/**` | — |
| B-02 | `plans.ts`, `entitlement.ts`, `accessStore.ts` | Claude | review | `src/lib/plans.ts`, `src/hooks/**` | B-01 |
| B-03 | Paywall, `/pricing`, "התוכנית שלי", מוטי רק עם גישה (כבוי: NEXT_PUBLIC_PAYWALL) | Claude | review | `src/components/paywall/**`, `src/app/me/**` | B-02 |
| B-04 | בחירת ספק סליקה ופתיחת חשבון | בעלים | blocked | — | USER-ACTIONS §3–4 |
| B-05 | Worker `md-api`: checkout, callback מאומת, ביטול, תזכורות, ספק מדומה, Grow (טיוטה). 6 בדיקות | Claude | review · Grow ממתין ל-sandbox | `api/**`, `tests/md-api.test.mjs` | B-04 (לחיבור Grow) |
| B-06 | מוטי בודק זכאות (`REQUIRE_ENTITLEMENT`, כבוי; 2 בדיקות) | Claude | done · הפעלה אחרי B-04 ו-§9 | `history-talk/src/worker/**` | B-01, A-01 |
| L-01 | `/legal/*`: תנאים, פרטיות, ביטול, נגישות (טיוטה; ממתין לפרטי העוסק ולעורך דין) | Claude | review | `src/app/legal/**` | GPT-03 |
| L-02 | נגישות: בדיקה, תיקונים והצהרה | Codex | backlog | לפי דוח | CX-01 |
| G-01 | דף נחיתה `/welcome` (הכנה, מספרים, 5 יכולות עם סרטונים, משחקים, מוטי, מחיר, שאלות נפוצות) | Claude | done · הטקסטים נבדקו מול CX-03 | `src/app/welcome/**`, `src/components/landing/**` | — |
| G-02 | 18 צילומי מסך, 3 סרטוני מסך ותמונת שיתוף (`public/marketing/`, 2.4MB) | Claude | review | `public/marketing/**`, `tools/marketing/**` | — |
| G-03 | (בוטל: בלי שיווק המוני) | — | cancelled | — | — |
| G-05 | Web Analytics ומשפך | Claude | backlog | `src/app/layout.tsx` | H-02 |

## עזרי למידה: שפה אחידה (סדרה LA)

המפרט נמצא ב-[`docs/learning-aids/DESIGN.md`](../learning-aids/DESIGN.md). עובדים לפי הסדר, משימה או שתיים בכל פעימה. Codex בונה ממשק לפי המפרט, Claude כותב את התוכן ובודק כל PR בצילומי מסך.

| ID | משימה | מי | מצב | אזור | תלוי ב- |
|---|---|---|---|---|---|
| LA-00 | מפרט עיצוב לעזרי הלמידה | Claude | done | `docs/learning-aids/DESIGN.md` | — |
| LA-01 | רכיבי המעטפת: כותרת, לשוניות ב-hash, חיפוש, כרטיס עם סיכום, תמונה עם קרדיט, תרגול | Codex | done (שני סבבים, נבדק בדפדפן) | `src/components/learning-aid/**` | LA-00 |
| LA-10 | בית שני: סיכום של עד 200 תווים לכל אירוע, וסימון מושגי מבחן | Claude | ready | `src/data/second-temple/summaries.ts` | — |
| LA-11 | בית שני על המעטפת: מסך לכל תקופה, מפה ותמונות | Codex | backlog · מחכה ל-LA-10 | `src/components/timeline/SecondTemple*` | LA-01, LA-10 |
| LA-12 | בית שני: תרגול (סדר כרונולוגי, מי עשה, מה קרה) | Codex | backlog | כנ"ל | LA-11 |
| LA-20 | הרומי והביזנטי על המעטפת ועל הטוקנים, בלי לאבד את ה"חומר" הייחודי | Codex | backlog | `src/components/timeline/{Roman,Byzantine}*` | LA-01 |
| LA-21 | הרומי והביזנטי: תמונות ותרגול | Claude+Codex | backlog | כנ"ל | LA-20 |
| LA-30 | משחק הצמחים: נתונים (סימן מזהה, עונה, בית גידול, איפה בסיור, לא להתבלבל עם) | Claude | done (40 צמחים, 7 קבוצות, 3 בדיקות) | `src/data/plants/**` | — |
| LA-31 | משחק הצמחים: תמונות מוויקישיתוף, וכל אחת נבדקת בעין | Claude | ready | `tools/plants_photos.json`, workflow | LA-30 |
| LA-32 | משחק הצמחים: המשחק עצמו, במבנה של גלימות ירושלים | Codex | backlog | `src/components/games/Plants*` | LA-31 |
| LA-33 | משחק הצמחים: בדיקת ממשק, הסרת ה-embed הישן, "מה חדש" | Claude | backlog | `src/app/games/plants/**`, `public/embeds/games/plants/**` | LA-32 |
| LA-40 | ברזל, מלכים ויהדות כדפים מקומיים: חילוץ הנתונים מה-HTML | Claude+Codex | backlog | `src/data/history-timeline/**` | LA-01 |
| LA-41 | הברית החדשה ומצרים–כנען על המעטפת (בלי לגעת בתוכן של ישוע) | Codex | backlog | `src/app/timelines/{biblical,egypt-canaan}/**` | LA-01 |
| LA-50 | טבלת התקופות ו"מי זה מי ברומא" על הטוקנים ובמצב כהה, ואינדקס עזרי הלמידה אחיד | Codex | backlog | `src/components/timeline/Periods*`, `RomanPeople*`, `src/app/timelines/page.tsx` | LA-01 |

## הושלם
| ID | משימה | PR |
|---|---|---|
| P-00 | תוכנית ההשקה ופרוטוקול הצוות | [#54](https://github.com/cfir94/moreh-derech/pull/54) |
