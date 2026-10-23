# איך מוסיפים דמות חדשה (בערך חמש דקות + דף ידע)

1. **תיקייה**: `characters/<id>/` (id באנגלית, אותיות קטנות, למשל `herzl`).
2. **`character.json`** — לפי הסכמה:
   ```json
   {
     "id": "herzl", "nameHe": "בנימין זאב הרצל", "years": "1860–1904", "taglineHe": "חוזה המדינה",
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
   - `sources[].file` — שם הקובץ בתיקייה `sources/`. `refTitle` — השם הקצר שיופיע בהפניות.
     `includeBooks` (לא חובה) — רק הספרים האלה (כותרות h2) ייכנסו.
3. **`prompt.md`** — מי הדמות, קול ואופי, עמדות, מחלוקות, גבולות ידע. הכללים הכלליים (עברית בלבד, ציטוט
   מקורות, בטיחות) מתווספים אוטומטית מ-`src/worker/prompt.ts` — לא לחזור עליהם.
4. **מקורות**: `npm run fetch:sources <id>` מוריד מבן־יהודה ומ-LacusCurtius. מאתר אחר — לשמור ידנית
   כ-TXT (פסקאות מופרדות בשורה ריקה; שורה "ספר …"/"פרק …" היא כותרת) או HTML (h2 = ספר, h3 = פרק, p = פסקה).
5. **`knowledge-sheet.md`** — דף ידע קצר (עד ~15 אלף טוקנים; כדאי 2–4 אלף): ציר זמן, אנשים, מקומות,
   20–40 ציטוטים כלשונם בתוך «…» עם הפניה, מחלוקות, ומה הדמות לא ידעה.
6. **מדיה** (לא חובה): לשים ב-`characters/<id>/media/raw/` את `portrait.png` ואולי `idle.mp4` ו-`talking.mp4`,
   ולהריץ `npm run optimize:media <id>`. בלי מדיה מוצגת מונוגרמה בצבע הדמות.
7. **בנייה ובדיקה**: `npm run build:knowledge -- --quotes` — מראה לכל ציטוט את ההפניה שנמצאה, ומתריע על
   ציטוט שלא נמצא במקורות או על דף ידע ארוך מדי. אחר כך `npm test`.
8. **באתר**: להוסיף את הדמות ל-`TALK_CHARACTERS` ב-`src/data/history-talk.ts` (לכרטיס "בקרוב").
9. **בדיקת קבלה**: שיחה של שתי דקות לפי `docs/qa.md`, ואז `npm run deploy`.
