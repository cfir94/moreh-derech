# איך מוסיפים דמות חדשה (בערך חמש דקות + דף ידע)

1. **תיקייה**: `characters/<id>/` (id באנגלית, אותיות קטנות, למשל `herzl`).
2. **`character.json`** — לפי הסכמה:
   ```json
   {
     "id": "herzl", "nameHe": "בנימין זאב הרצל", "years": "1860–1904",
     "eraHe": "העת החדשה", "sortYear": 1897, "taglineHe": "חוזה המדינה",
     "voiceName": "Iapetus", "accentColor": "#1F5E7A",
     "openingLineHe": "שלום, אני תיאודור הרצל. זהו שחזור של דמותי מתוך כתביי.",
     "sampleQuestionsHe": ["…", "…", "…"],
     "sources": [
       { "title": "מדינת היהודים", "translator": "…", "url": "https://benyehuda.org/read/…",
         "license": "נחלת הכלל / פרויקט בן־יהודה", "file": "judenstaat.html", "refTitle": "מדינת היהודים" }
     ]
   }
   ```
   - `voiceName` — אחד מקולות Gemini (Sadaltager, Alnilam, Orus, Algenib, Iapetus, Gacrux…). כדאי להאזין
     לקולות במסך ה-Live של AI Studio לפני שקובעים.
   - `sortYear` — שנת המפתח של הדמות (שלילי = לפני הספירה); לפיה הסדר הכרונולוגי. `eraHe` — תווית התקופה בכרטיס.
   - `sources[].file` — שם הקובץ בתיקייה `sources/`. `refTitle` — השם הקצר שיופיע בהפניות (`""` כשכותרת
     החיבור כבר מופיעה, כמו בספריא). `includeBooks` (לא חובה) — רק הספרים האלה (כותרות h2) ייכנסו.
     `sectionLabel` (לא חובה) — למשל `["פסוק", "פסוקים"]` במקום "סעיף".
   - `portraitCredit` — `alt`, `text`, `url`, `license`, `licenseUrl` של הדיוקן. לדמות שאין לה דיוקן אמיתי —
     לכתוב זאת במפורש ("דמות מדומיינת", "אין דיוקן שלו — המחשה").
3. **`prompt.md`** — מי הדמות, קול ואופי, עמדות, מחלוקות, גבולות ידע. הכללים הכלליים (עברית בלבד, ציטוט
   מקורות, בטיחות) מתווספים אוטומטית מ-`src/worker/prompt.ts` — לא לחזור עליהם.
4. **מקורות**: `npm run fetch:sources <id>`. סוגי המקורות שהסקריפט מכיר:
   - **בן־יהודה** ו-**LacusCurtius** — לפי `url`.
   - **ספריא** — `"sefaria": { "version": "Tanach with Nikkud", "refs": ["II_Kings.18", …], "unit": "perek", "numbered": true }`.
     תמיד לציין מהדורה מפורשת ברישיון פתוח: תנ״ך "Tanach with Nikkud", משנה "Torat Emet 357", בבלי
     "Wikisource Talmud Bavli" (`"unit": "daf"`), ירושלמי מהדורת גוגנהיימר (`"unit": "halakha"`). מהדורת
     William Davidson היא CC BY-NC — לא להשתמש.
   - **CCEL** (אבות הכנסייה, NPNF) — `"ccel": { "volume": "npnf201", "ids": ["iv.vi.iii.xlii"], "labels": {…} }`.
   - **גוטנברג** — `"gutenberg": { "id": 2848, "books": ["XV"], "chapters": {"XV": [11]} }`, או `slices`
     לפי ביטויים רגולריים.
   - מאתר אחר — לשמור ידנית עם `"manual": true`, כ-TXT (פסקאות מופרדות בשורה ריקה; שורה "ספר …"/"פרק …" היא
     כותרת) או HTML (h2 = ספר, h3 = פרק, p = פסקה).
5. **`knowledge-sheet.md`** — דף ידע קצר (עד ~15 אלף טוקנים; כדאי 2–4 אלף): ציר זמן, אנשים, מקומות,
   20–40 ציטוטים כלשונם בתוך «…» עם הפניה, מחלוקות, ומה הדמות לא ידעה.
6. **דיוקן**: הבמה היא חלון שחור 4:5, ובו הילה מאחורי הראש, גחליליות ותנועה עדינה בתלת־ממד. הדיוקן הוא
   `characters/<id>/media/raw/portrait.png` — **PNG שקוף** 800×1000 בצילום בינוני: מרכז הראש בערך ב-(400, 350)
   וגובה הראש כ-215 פיקסלים, הדמות צמודה לתחתית (החושך בתחתית בולע את החיתוך). הרקע מוסר במודל פילוח (BiRefNet
   עובד טוב על ציורים); ציור קיר דהוי שאי אפשר לחתוך — אליפסה רכה מתוך הציור. חיתוך עץ — קווים בהירים על שקוף.
   הכול אוטומטי: מגדירים בשדה `portrait` של `character.json` את קובץ ויקישיתוף, את מרכז הראש וגובהו ואת השיטה,
   ומריצים `python3 scripts/make-portrait.py <id>` (התלויות והמודלים — בראש הסקריפט). אחר כך
   `npm run optimize:media <id>` (WebP עם שקיפות). אפשר גם `idle.mp4` ו-`talking.mp4`. בלי דיוקן מוצגת
   מונוגרמה בתוך ההילה.
7. **בנייה ובדיקה**: `npm run build:knowledge -- --quotes` — מראה לכל ציטוט את ההפניה שנמצאה, ומתריע על
   ציטוט שלא נמצא במקורות או על דף ידע ארוך מדי. אחר כך `npm test`.
8. **באתר**: להוסיף את הדמות ל-`TALK_CHARACTERS` ב-`src/data/history-talk.ts`, במקומה הכרונולוגי —
   `tests/history-talk-characters.test.mjs` של האתר בודק שהרשימות זהות.
9. **בדיקת קבלה**: שיחה של שתי דקות לפי `docs/qa.md`, ואז `npm run deploy`.
