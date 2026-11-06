# ChatGPT — הגדרה חד-פעמית (לבעלים)

> **הדרך הקצרה:** פותחים שיחה חדשה ב-ChatGPT, ומדביקים את הקישור או את התוכן של [`START-HERE.md`](START-HERE.md). שם יש את כל ההקשר, הבקשה להגדיר משימה מתוזמנת, והחיבור של Codex ל-GitHub.

## 1. פרויקט ייעודי

ב-ChatGPT: **Projects ← New project ← "מורי דרך — צוות שיווק ותוכן"**.
ב-**Instructions** של הפרויקט מדביקים את כל התוכן של [`PROJECT_INSTRUCTIONS.md`](PROJECT_INSTRUCTIONS.md).

## 2. מחבר GitHub

Settings ← Connectors (או Apps) ← **GitHub** ← מחברים ומאשרים גישה לריפו `cfir94/moreh-derech`.
כך ChatGPT קורא בעצמו את הלוח ואת קובצי המשימות, ואין צורך להעתיק אותם.

## 3. הפעלת משימה

בשיחה חדשה בתוך הפרויקט:

```
קרא מ-GitHub את docs/team/BOARD.md (בריפו cfir94/moreh-derech, ענף main).
קח את המשימה הבאה שמסומנת "ChatGPT" ו-"ready" (או: את GPT-02),
קרא את docs/team/chatgpt/<ID>.md ובצע אותה.
```

## 4. החזרת התוצרים לריפו

ל-ChatGPT בדרך כלל אין הרשאת כתיבה ל-GitHub. לכן:
- **טקסטים:** ChatGPT נותן קובץ `.md` להורדה. אתה שומר אותו ב-`marketing/inbox/<ID>/`. אפשר להעלות דרך GitHub באתר: Add file ← Upload files ← commit ל**ענף חדש** בשם `gpt/<ID>` ← Create pull request.
- **תמונות:** אותו דבר, לאותה תיקייה.
- **או:** שלח לי אותם בצ'אט עם Claude, ואני אכניס אותם.

## 5. משימה מתוזמנת (ChatGPT Tasks)

בפרויקט, או בשיחה רגילה: **"Schedule a task"** / "תזכיר לי כל יום ב-20:00":

```
כל יום ב-20:00: קרא מ-GitHub את docs/team/BOARD.md בריפו cfir94/moreh-derech.
כתוב לי רשימה קצרה:
(1) משימות ChatGPT שמסומנות ready — ואחת מהן בצע מיד אם אפשר;
(2) משימות Codex שמסומנות ready — כדי שאפעיל אותן ב-Codex;
(3) פעולות שמחכות לי ב-docs/launch/USER-ACTIONS.md שעדיין לא סומנו ✅.
```

כך הצוות ממשיך לעבוד גם כש-Claude ממתין לחידוש המכסה שלו.
