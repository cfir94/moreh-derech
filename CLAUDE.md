# מורי דרך — מערכת מאוחדת לתלמידי קורס מורי דרך

## מטרת הפרויקט

אתר/מערכת אחת שמרכזת את כל מה שתלמיד בקורס מורי דרך צריך:

- **מאגר שאלונים** — 609 שאלות רב-ברירה בארבעה שאלונים, לפי נושאים.
- **צירי זמן** — צירי זמן אינטראקטיביים לפי נושא היסטורי.
- **מפה אינטראקטיבית** — מפת מורשת ישראל בשכבות.
- **מעקב אישי** — כניסה עם שם+מייל (ללא סיסמה), ומעקב ברמת השאלה הבודדת:
  מה נענה, במה טעו, ומה עוד ממתין לחזרה.
- **דוחות הדרכה** ו**סרטונים** — עדיין placeholder, ממתינים לחומר מקור.

## אילוץ מרכזי: אתר סטטי ללא שרת

האתר מתארח ב-GitHub Pages (`https://cfir94.github.io/moreh-derech/`) —
**אין שרת ואין DB**. זה קבע את הארכיטקטורה:

- Next.js 16 (App Router) + TypeScript + Tailwind v4, עם `output: "export"`
  ו-`basePath: "/moreh-derech"` (`next.config.ts`). הבנייה מייצרת `out/`.
- אימות ומעקב מבוססים כולם `localStorage` — ראו `src/lib/localAuth.ts`,
  `src/contexts/UserContext.tsx`, `src/lib/progress.ts`.
- **הנתונים נשמרים פר-דפדפן/מכשיר, ללא סנכרון.** זה trade-off מודע שאושר
  ע"י הבעלים. מעבר לחשבון אמיתי מסונכרן ידרוש פלטפורמה עם שרת (Vercel וכו').

## איך התוכן הגיע לכאן — חשוב לפני עריכת תוכן

לבעלים היו כמה אפליקציות Vite/React עצמאיות (שאלונים, צירי זמן, מפה), חלקן
ריפואי GitHub וחלקן ZIP. **הנתונים מהן עברו פורט מלא לתוך האתר** — הם אינם
אפליקציות נפרדות יותר:

- `src/data/quizzes/*.ts` — נוצרו אוטומטית מ-`quizData.ts` של ארבעת
  פרויקטי השאלונים (`/workspace/cfir94/{geology,history,iron-age}-quiz`,
  `/workspace/sources/tourguidequiz`). קבצים אלה **generated — לא לערוך ידנית**.
- `src/data/quizzes/past-exams.ts` — 181 שאלות ממבחני הרישוי הרשמיים של משרד
  התיירות (2021–2025), עם התשובות הרשמיות. נוצר ע"י `tools/parse-exams.py`
  (ראו "מבחני רישוי" למטה).
- `src/data/timelines/*.ts` — נוצרו מ-`biblicaltimelines` ומ-
  `egyptcanaantimeline`.
- תמונות השאלונים הועתקו ל-`public/quiz-images/<quiz>/`.

ה-UI נכתב מחדש מקומית (`src/components/quiz/QuizRunner.tsx`,
`src/components/timeline/TimelineViewer.tsx`) בעיצוב של האתר, כדי שהחוויה
תהיה אחידה ולא "קפיצה" לממשק זר.

**היוצא מן הכלל — המפה**: `israel-heritage-map` היא אפליקציית MapLibre שלמה
(vector tiles, service worker, ~90MB נתונים). היא נשארה כפי שהיא תחת
`public/embeds/map/` ורצה ב-`<iframe>` בתוך `/map` — כך המשתמש נשאר בתוך
האתר עם הניווט שלו, בלי לשכתב מנוע מפות שלם.

### מבחני רישוי רשמיים (`tools/parse-exams.py`)

הבעלים סיפק PDF-ים של מבחני הרישוי 2020–2025 (עברית/אנגלית/ערבית, חלק א'
רב-ברירה וחלק ב' פתוח). הסקריפט מחלץ מהם **רק** את החלק הרב-ברירתי בעברית,
ורק ממבחנים שיש להם **מפתח תשובות רשמי**.

נקודות חשובות למי שיריץ אותו שוב על מבחנים חדשים:

- כל פריט במבחן מורכב משני חלקים: השלמת משפט (חלק ראשון) ושאלת הבנה עם 4
  תשובות (חלק שני). רק החלק השני מתאים לשאלון רב-ברירה — החלק הראשון אינו
  בשימוש.
- **התשובה הנכונה מסומנת ויזואלית** במפתחות: ב-2021–2023 ע"י **טקסט מודגש**
  (font `David-Bold`), וב-2024–2025 ע"י **מלבן הדגשה צהוב** (`(1,1,0)`).
  הסקריפט מזהה את שתי השיטות.
- הטקסט נלקח מ-`pdfplumber` בקריאה מימין לשמאל. זה הופך גם רצפי ספרות
  ולטינית (1917 הופך ל-7191), ולכן יש `fix_bidi_runs()` שמחזיר אותם.
  (`pypdf.extract_text()` פותר bidi נכון לבד — אבל מוחק רווחים בין מילים
  בקבצים האלה, וזה גרוע יותר.)
- **מה שלא מתפרסר נקי — נזרק, לא מנוחש.** שאלה נכללת רק אם יש בדיוק 4 תשובות
  ובדיוק תשובה אחת מסומנת. גם שאלות שתלויות בחלק ההשלמה ("נחל זה עובר
  באזור...") נזרקות, כי הן חסרות הקשר בפני עצמן. תשובה "נכונה" שגויה תלמד
  את התלמיד חומר שגוי לקראת מבחן רישוי — עדיף פחות שאלות.
- **מבחנים ללא מפתח תשובות לא נכללו**: קיץ 2020, קיץ 2022, קיץ 2024,
  יולי 2025 חלק א', קיץ 2025, חורף 2025. יש בידינו את השאלות אך לא את
  התשובות הרשמיות.

הרצה: `pip install pdfplumber` ואז `python3 tools/parse-exams.py` מתוך תיקיית
ה-PDF-ים, ולאחר מכן המרה ל-`src/data/quizzes/past-exams.ts`.

## מערכת המעקב (`src/lib/progress.ts`)

מפתח `md_progress_v2` ב-localStorage, שני חלקים:

- `attempts[]` — שורה לכל סבב תרגול שהושלם (לסטטיסטיקה והיסטוריה).
- `questions{}` — מצב לכל שאלה, במפתח `"<quizSlug>:<questionId>"`, כולל
  `seen` / `wrong` / `lastCorrectAt` / `lastWrongAt`.

**הלוגיקה המרכזית**: שאלה נחשבת "ממתינה לחזרה" כל עוד התשובה **האחרונה**
עליה הייתה שגויה (`needsReview()`). לכן מענה נכון מאוחר יותר מוציא אותה
מהתור — אבל היסטוריית הטעויות (`wrong`) נשמרת.

מכאן `/quizzes/review` — מסך שמתרגל בדיוק את השאלות האלה, חוצה-שאלונים.
שים לב ל-`sourceQuiz` על `Question`: במצב חזרה השאלות מגיעות מכמה שאלונים,
והשדה הזה מבטיח שהתוצאה נזקפת לשאלון המקורי ולא ל"review" — בלי זה מענה
נכון בחזרה לא היה מנקה את השאלה (באג שנתפס ותוקן).

## מבנה

```
src/
  app/
    page.tsx                 דף בית
    login/  me/               כניסה ואזור אישי (מעקב מלא)
    quizzes/                  אינדקס שאלונים
      [slug]/                 שאלון בודד (generateStaticParams)
      review/                 תרגול טעויות חוצה-שאלונים
    timelines/                אינדקס + biblical/ + egypt-canaan/
    map/                      iframe של מפת המורשת
    guide-reports/  videos/    placeholders
  components/
    quiz/QuizRunner.tsx        מנוע השאלונים (setup → שאלות → תוצאות)
    timeline/TimelineViewer.tsx צירי זמן אינטראקטיביים
    Navbar.tsx  HomeProgress.tsx  PlaceholderSection.tsx
  contexts/UserContext.tsx
  hooks/useProgress.ts         קריאת המעקב בצד לקוח בלבד
  lib/  progress.ts  localAuth.ts  basePath.ts
  data/ quizzes/  timelines/     נתונים generated
public/
  quiz-images/<quiz>/           תמונות השאלות
  embeds/map/                    אפליקציית המפה כפי שהיא
```

## מוסכמות

- UI בעברית, `dir="rtl"`, פונט Rubik.
- עיצוב דרך design tokens ב-`globals.css` (`--accent`, `--fg-muted` וכו'),
  שנחשפים כ-Tailwind utilities (`text-fg-muted`, `bg-bg-raised`). **לא**
  להשתמש בצבעי Tailwind גולמיים כמו `text-neutral-600` — זה שובר dark mode.
- מצב כהה נתמך מלא (media query + `[data-theme]`), לא פילטר.
- קריאה ל-localStorage תמיד ב-`useEffect` (דרך `useProgress`/`UserContext`),
  אחרת יש hydration mismatch מול ה-HTML הסטטי.
- נתיבי assets ידניים חייבים `withBasePath()` מ-`src/lib/basePath.ts`.

## רודמאפ פתוח

1. **דוחות הדרכה** ו**סרטונים** — ממתינים לחומר מקור.
2. תמונות שאלון "החי והצומח" — 79 שאלות הצביעו על שרת אחסון של Manus שאינו
   קיים; הקבצים לא היו ב-ZIP. השאלון עובד, רק בלי תמונות. אם יימצאו הקבצים,
   להעתיק ל-`public/quiz-images/flora-fauna/` ולעדכן את הנתיבים בסקריפט
   החילוץ.
3. סנכרון בין מכשירים — ידרוש מעבר מ-GitHub Pages לפלטפורמה עם שרת.

## פקודות

```bash
npm run dev     # פיתוח — לגשת ל-http://localhost:3000/moreh-derech/
npm run build    # static export ל-out/
```

פריסה: GitHub Actions (`.github/workflows/deploy.yml`) בונה ודוחף ל-
`gh-pages` בכל push ל-main.
