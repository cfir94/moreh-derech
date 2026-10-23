# הטמעה באתר

האתר (`https://cfir94.github.io/moreh-derech/`) הוא Next.js סטטי ב-GitHub Pages, והשיחות רצות
ב-Worker נפרד. העמוד `/timelines/history-talk` באתר, בעזרי הלמידה (`src/app/timelines/history-talk/page.tsx` +
`src/components/characters/HistoryTalk.tsx`) כבר מטמיע אותן. כל מה שצריך אחרי ההעלאה:

```ts
// src/data/history-talk.ts
export const HISTORY_TALK_ORIGIN = "https://history-talk.<חשבון>.workers.dev";
```

עד אז העמוד מציג כרטיס "בקרוב".

## קטעי קוד לשימוש חופשי (עמודים אחרים באתר)

```html
<!-- כל הדמויות -->
<iframe src="https://history-talk.<חשבון>.workers.dev/?embed=1" title="דבר עם ההיסטוריה"
        allow="microphone; autoplay" loading="lazy"
        style="width:100%;height:760px;border:0;border-radius:16px"></iframe>

<!-- דמות אחת, למשל בעמוד על בית שני -->
<iframe src="https://history-talk.<חשבון>.workers.dev/talk.html?c=josephus&embed=1" title="שיחה עם יוסף בן מתתיהו"
        allow="microphone; autoplay" style="width:100%;height:680px;border:0"></iframe>

<!-- כפתור בלי מסגרת (עובד בכל פלטפורמה) -->
<a href="https://history-talk.<חשבון>.workers.dev/talk.html?c=titus">דברו עם טיטוס</a>
```

- `?theme=light` או `?theme=dark` — ערכת הצבעים (ברירת מחדל כהה, כמו האתר).
- `allow="microphone"` חובה. בלעדיו הדפדפן חוסם את המיקרופון, והעמוד מציג "פתח בחלון חדש"
  ו"המשך בכתיבה בלבד".
- רק דומיינים שמופיעים ב-`FRAME_ANCESTORS` (ב-`wrangler.jsonc`) יכולים להטמיע. דומיין חדש — להוסיף
  שם, וגם ל-`ALLOWED_ORIGINS` אם הוא קורא ל-API ישירות.
