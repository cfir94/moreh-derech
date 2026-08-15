# מורי דרך — מערכת מאוחדת לתלמידי קורס מורי דרך

## מטרת הפרויקט

אתר/מערכת אחת שמרכזת את כל מה שתלמיד בקורס מורי דרך צריך:

- **מאגר שאלונים** — שאלונים אמריקאיים (רב-ברירה) לפי קטגוריות מהחומר הנבחן.
- **דוחות הדרכה** — לפי הפורמט שדורש משרד התיירות (עדיין placeholder, אין
  חומר מקור).
- **סרטונים מומלצים** — קישורים לסרטוני יוטיוב (עדיין placeholder, אין חומר
  מקור).
- **צירי זמן** — לפי נושאים היסטוריים.
- **מפה אינטראקטיבית** — מפת ישראל עם נקודות ציון והסברים למורה דרך.
- **התחברות ומעקב אישי** — כניסה עם שם+מייל בלבד (ללא סיסמה), ומעקב אחרי מה
  כל משתמש תרגל, מה טעה בו, ומה צריך לחזור עליו.

## סטאק טכני וארכיטקטורה — חשוב לקרוא לפני שינויים

**האתר מתארח כ-static site ב-GitHub Pages** (`https://cfir94.github.io/moreh-derech/`),
**ללא שרת וללא DB בצד שרת**. זו אילוץ מכריע שקבע את כל הארכיטקטורה:

- Next.js 16 (App Router) + TypeScript + Tailwind v4, עם
  `output: "export"` ו-`basePath: "/moreh-derech"` ב-`next.config.ts`
  (הבנייה מייצרת `out/` ולא שרת).
- **אין Prisma / DB / server actions.** הוסרו במעבר ל-static export. אימות
  ומעקב התקדמות מבוססים כולם על `localStorage` בדפדפן של המשתמש (ראו
  `src/lib/localAuth.ts`, `src/contexts/UserContext.tsx`, `src/lib/progress.ts`).
  המשמעות: הנתונים נשמרים **פר-מכשיר/דפדפן בלבד**, ללא סנכרון בין מכשירים.
  זהו trade-off מודע (תועד בשיחה עם הבעלים) — שדרוג עתידי לחשבון אמיתי עם DB
  ידרוש מעבר לפלטפורמת אחסון עם שרת (Vercel/Netlify וכו').

### תבנית ה"embeds" — איך שולבו האפליקציות החיצוניות

לבעל הפרויקט כבר היו כמה אפליקציות שאלונים/צירי-זמן/מפה עצמאיות (חלקן
ריפואי GitHub, חלקן ZIP שהועלו) — כל אחת בנויה כאפליקציית Vite+React נפרדת
(חלקן נבנו בעבר בכלי AI בשם "Manus"). **לא בוצע port מלא שלהן ל-React
components בתוך Next** — זה היה סיכון גבוה מדי לביצוע בלילה אחד. במקום זה:

1. כל אפליקציה כזו נבנתה (`vite build`) כ-bundle סטטי עצמאי, עם `base` ב-
   `vite.config.ts` מוגדר לתת-הנתיב המדויק שבו היא תוגש (למשל
   `/moreh-derech/embeds/quizzes/geology/`).
2. תוצר הבנייה הועתק ל-`public/embeds/<category>/<slug>/` בפרויקט הזה —
   כלומר הוא חלק מ-`out/` הסופי של Next (Next מעתיק את כל `public/` כמו
   שהוא ב-static export).
3. עמודי הסקציות (`/quizzes`, `/timelines`, `/map`) הם עמודי Next רגילים
   עם כרטיסיות שמקשרות (`<a href>` רגיל, לא `<Link>`) לכל embed — ניווט
   מלא-עמוד, לא iframe.
4. **מעקב התקדמות חוצה-אפליקציות**: `public/shared/progress-tracker.js`
   נטען על ידי כל אפליקציית שאלון מוטמעת (`<script src="/moreh-derech/shared/progress-tracker.js">`
   ב-`client/index.html` שלה), וחושף `window.MDProgress.record({...})`.
   כל אפליקציית שאלון תוקנה כך שב-`finishQuiz` (ב-`Home.tsx` שלה) היא קוראת
   ל-`MDProgress.record({quiz, quizLabel, category, correct, total, wrongQuestions})`.
   זה עובד כי כל ה-embeds וה-hub הם **אותו origin** (אותו דומיין ב-GitHub
   Pages) — כולם כותבים לאותו מפתח `localStorage` (`md_quiz_progress_v1`),
   וה-hub קורא אותו ב-`src/lib/progress.ts` / `/me`. **נבדק ועובד קצה-לקצה**
   (ניווט hub→embed, קריאה ל-MDProgress.record, וקריאה חזרה ב-/me — נבדק
   עם Playwright).

תיקיות המקור המקוריות (לפני build) נמצאות תחת `/workspace/cfir94/*` (ריפואי
GitHub: `geology-quiz`, `history-quiz`, `iron-age-quiz`, `israel-heritage-map`)
ו-`/workspace/sources/*` (ZIP: `biblicaltimelines`, `egyptcanaantimeline`,
`tourguidequiz`) — **לא הועתקו לתוך ריפו זה**, רק תוצרי הבנייה שלהן. אם צריך
לעדכן תוכן של embed בעתיד, יש לחזור למקור, לערוך שם, לבנות מחדש ולהעתיק
לתוך `public/embeds/...`.

`israel-heritage-map` הוא היוצא מן הכלל — אתר סטטי טהור (HTML/CSS/JS, בלי
build step), עם נתיבים יחסיים בלבד, כך שהועתק ישירות ללא שינוי.

## מבנה תיקיות

```
src/
  app/
    page.tsx              דף בית עם קישורים לכל הסקציות
    login/                עמוד כניסה (שם + מייל) — client component
    me/                   אזור אישי, מציג סיכום התקדמות מ-localStorage
    quizzes/               כרטיסיות שמקשרות ל-embeds/quizzes/*
    timelines/              כרטיסיות שמקשרות ל-embeds/timelines/*
    map/                    קישור ל-embeds/map
    guide-reports/          placeholder (אין חומר מקור עדיין)
    videos/                 placeholder (אין חומר מקור עדיין)
  components/
    Navbar.tsx               ניווט ראשי, client component עם useUser()
    PlaceholderSection.tsx    קומפוננטת placeholder
  contexts/
    UserContext.tsx           React context ל-localStorage auth
  lib/
    localAuth.ts               קריאה/כתיבה/מחיקה של משתמש ב-localStorage
    progress.ts                 קריאה וסיכום של md_quiz_progress_v1
    basePath.ts                  קבוע BASE_PATH + embedUrl() helper
public/
  embeds/
    quizzes/{general,geology,history,iron-age}/  תוצרי vite build
    timelines/{biblical,egypt-canaan}/             תוצרי vite build
    map/                                            israel-heritage-map כפי שהוא
  shared/
    progress-tracker.js       נטען על ידי כל embed שאלון, כותב ל-localStorage
```

## מוסכמות

- כל ה-UI בעברית, `dir="rtl"` על ה-`<html>` (מוגדר ב-`src/app/layout.tsx`).
- פונט Rubik (תומך עברית) דרך `next/font/google`.
- קישורים ל-embeds חייבים לעבור דרך `embedUrl()` מ-`src/lib/basePath.ts`
  (לא `<Link>` של Next — אלה קבצים סטטיים חיצוניים ל-router של Next).
- `src/contexts/UserContext.tsx` נטען אך ורק ב-`useEffect` (client-only) כדי
  להימנע מ-hydration mismatch מול ה-HTML הסטטי שנוצר ב-build.

## רודמאפ פתוח

1. **דוחות הדרכה** ו**סרטונים** — עדיין placeholder, ממתינים לחומר מקור
   מהבעלים.
2. תמונות שאלון "general" (tourguidequiz) חסרות — כ-70 שאלות הצביעו במקור
   על שרת אחסון תמונות של Manus (`/manus-storage/...`) שלא קיים יותר; קבצי
   התמונות המקוריים לא היו בתוך ה-ZIP. השאלון עובד תקין, רק בלי תמונות
   (נכשל בחן, לא קורס). אם יימצאו קבצי התמונות המקוריים — להעתיק ל-
   `public/embeds/quizzes/general/` ולעדכן את הנתיבים.
3. שדרוג עתידי אפשרי: מעבר מ-localStorage ל-DB אמיתי (Vercel/Postgres) לצורך
   סנכרון בין מכשירים — ידרוש לוותר על GitHub Pages כפלטפורמת אחסון.

## פקודות שימושיות

```bash
npm run dev              # שרת פיתוח (ללא basePath - ראו הערה למטה)
npm run build             # next build --  static export ל-out/
npx serve out              # תצוגה מקדימה של תוצר הבנייה
```

הערה: ב-`next dev` (פיתוח מקומי) ה-`basePath` עדיין חל, כך שיש לגשת ל-
`http://localhost:3000/moreh-derech/` ולא ל-`http://localhost:3000/`.
