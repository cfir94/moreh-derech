# חומרי שיווק: צילומי מסך וסרטונים מהאתר האמיתי

כל התמונות והסרטונים ב-`public/marketing/` צולמו מהאתר עצמו ב-Playwright, ולא בגרפיקה מומצאת.

1. בנייה בשורש: `NEXT_PUBLIC_BASE_PATH="" npm run build`, ואז הגשה מקומית: `cd out && python3 -m http.server 8811 --bind 127.0.0.1`.
2. `node tools/marketing/capture-screenshots.cjs`: מחשב (1440×900 @2x) וטלפון (iPhone 14), לתיקייה זמנית.
3. `node tools/marketing/record-clips.cjs`: סרטוני webm של שאלון, אטלס הזמן ואדריכלות בתלת-ממד.
4. המרה (כמו שנעשה ב-6.11):
   - סרטונים: `ffmpeg -ss <התחלה> -i in.webm -t <משך> -an -vf "scale=1280:-2,fps=30" -c:v libx264 -crf 28-30 -pix_fmt yuv420p -movflags +faststart clip-<name>.mp4`
   - תמונות: WebP ברוחב 1600 (מחשב) או 600 (טלפון), quality 76–78.
5. `capture-og.cjs`: תמונת השיתוף (1200×630) מתוך `/welcome` בשרת dev (`npx next dev -p 3000`).

**לפני שמחליפים תמונה:** להסתכל עליה. כל צילום חייב להראות את מה שהטקסט לידו אומר.
