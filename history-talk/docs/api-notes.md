# הערות API — מה התיעוד אומר (נבדק 23.10.2026)

מקורות: Gemini Live API (Get started, Capabilities, Tools, Session management),
Ephemeral tokens, קוד המקור של `@google/genai` (גרסה 2.28.0, ו-2.31.0 להשוואה),
Cloudflare Workers Static assets, Rate Limiting binding, Turnstile siteverify.

## מודל
- `gemini-3.8-live` מופיע בכל דוגמאות הקוד בתיעוד (Live, טוקנים, ניהול שיחה).
  נשמר במשתנה `GEMINI_LIVE_MODEL`.
- ב-`gemini-3.8-live` **אסור** לשלוח `thinkingConfig` (רק בגרסת `-extended-thinking`).
- עברית (`he`) ברשימת 99 השפות. במודלי native audio אין קוד שפה: השפה נקבעת
  בהוראות המערכת בלבד — ולכן הכלל "דבר עברית בלבד" בהוראות הכלליות.

## אסימון זמני (ephemeral token)
- יצירה: `POST /auth_tokens` עם `x-goog-api-key`, או ב-SDK:
  `ai.authTokens.create({config:{uses, expireTime, newSessionExpireTime, liveConnectConstraints, lockAdditionalFields, httpOptions}})`.
- ברירות מחדל: `uses: 1`, `expireTime` 30 דקות, `newSessionExpireTime` דקה.
- הלקוח מעביר את `token.name` (מתחיל ב-`auth_tokens/`) כ-`apiKey`. ה-SDK מזהה זאת
  ומתחבר ל-`BidiGenerateContentConstrained` עם `access_token`.

### ⚠️ פער שדווח: גרסת ה-API
- **דף התיעוד** אומר שהאסימון עובד רק עם `v1beta`.
- **קוד ה-SDK** אומר "Support in v1alpha only", ומדפיס אזהרה אם הגרסה אינה `v1alpha`.
- לכן הגרסה היא משתנה (`GEMINI_API_VERSION`), וברירת המחדל היא `v1beta` לפי
  כלל "התיעוד קובע". אם בהעלאה החיבור נכשל ב-401/404 — לשנות ל-`v1alpha` (שינוי
  משתנה, בלי קוד). השרת והלקוח משתמשים תמיד באותה גרסה (השרת מחזיר אותה בתשובה).

### נעילת הגדרות
- `liveConnectConstraints: {model, config}` נועל את המודל ואת ההגדרות.
- לפי קוד ה-SDK (`convertBidiSetupToTokenSetup`):
  - **בלי** `lockAdditionalFields` → **כל** שדות ה-`LiveConnectConfig` נעולים;
    לפי הערות ה-SDK, ה-API מתעלם ממה שהלקוח שולח ב-`connect`. זו הבחירה שלנו (הבטוחה ביותר).
  - `lockAdditionalFields: []` → רק השדות שהוגדרו נעולים.
- מכאן: `systemInstruction`, `speechConfig`, `tools`, `contextWindowCompression`,
  `sessionResumption`, `inputAudioTranscription`, `outputAudioTranscription`,
  `realtimeInputConfig` — **כולם נבנים בשרת ונעולים באסימון**. גולש לא יכול להחליף
  את ההוראות ולהפוך את הדמות לצ'אט כללי.
- השלכה על חיבור מחדש: כיוון שגם `sessionResumption` נעול, ה-`handle` חייב להיכנס
  לאסימון **בשרת**. לכן `/api/token` מקבל `resume:{sessionId, handle}` ומנפיק אסימון
  חדש שבו `sessionResumption:{handle}`. (התיעוד מציין שאפשר לחדש עם אותו אסימון בתוך
  `expireTime`, אבל עם נעילה מלאה ה-handle מהלקוח לא ייכנס — לכן אסימון חדש.)

## שליחה וקבלה (מאומת מול התיעוד)
| נושא | שדה |
|---|---|
| שמע נכנס | `sendRealtimeInput({audio:{data, mimeType:'audio/pcm;rate=16000'}})` — PCM16 LE |
| טקסט | `sendRealtimeInput({text})` |
| הפסקת זרם | `sendRealtimeInput({audioStreamEnd:true})` |
| שמע יוצא | `serverContent.modelTurn.parts[].inlineData.data` — base64, PCM16 LE ‏24kHz |
| הפרעה | `serverContent.interrupted` |
| סוף תור | `serverContent.turnComplete` |
| תמלול | config: `inputAudioTranscription:{}`, `outputAudioTranscription:{}`; מגיע ב-`serverContent.inputTranscription.text` / `outputTranscription.text` |
| קול | `speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName` |
| VAD | `realtimeInputConfig.automaticActivityDetection` (`silenceDurationMs` מומלץ 500–800) |
| דחיסה | `contextWindowCompression:{slidingWindow:{}}` |
| חידוש | `sessionResumption:{handle}`; עדכון ב-`sessionResumptionUpdate.{resumable,newHandle}` |
| ניתוק צפוי | `goAway.timeLeft` |
| כלים | `tools:[{functionDeclarations:[…]}]`; `toolCall.functionCalls[].{id,name,args}`; `sendToolResponse({functionResponses:[{id,name,response}]})` |

- פונקציה בלי `behavior` היא חוסמת (blocking) — המודל ממתין לתשובה. זה מה שאנחנו רוצים.
- מגבלות: שיחת שמע בלי דחיסה — 15 דק'; חיבור בודד ~10 דק'; handle תקף שעתיים.

## Cloudflare
- **Static assets**: `assets:{directory, binding:"ASSETS", run_worker_first}`. אנחנו
  מריצים את ה-Worker קודם על כל בקשה, כדי להוסיף כותרות אבטחה גם לקבצים הסטטיים.
- **Rate limiting**: `ratelimits:[{name, namespace_id:"<מספר כמחרוזת>", simple:{limit, period:10|60}}]`
  (Wrangler 4.36+). `limit({key})` → `{success}`. נספר בנפרד בכל מיקום — משוער.
- **KV**: עקבי בסופו של דבר; הספירות היומיות משוערות. מספיק לשלב הזה.
- **Turnstile**: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`
  עם `secret`, `response`, `remoteip`. אסימון תקף 300 שניות ופעם אחת בלבד.
  מפתחות בדיקה: site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.
