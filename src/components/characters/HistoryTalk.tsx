"use client";

/**
 * המסגרת של "דבר עם ההיסטוריה". ה-iframe מקבל את ערכת הצבעים של האתר (?theme=)
 * ואת allow="microphone" — בלי זה הדפדפן לא יבקש רשות. כשהמיקרופון חסום בכל זאת,
 * יש קישור לפתיחה בחלון חדש.
 */
import { useSyncExternalStore } from "react";
import { HISTORY_TALK_ORIGIN, TALK_CHARACTERS } from "@/data/history-talk";

// ערכת הצבעים נקראת פעם אחת, בטעינה: שינוי של src היה טוען את המסגרת מחדש
// וקוטע שיחה באמצע. (בלי מנוי — החלפת ערכה אחר כך לא משנה את המסגרת.)
const noSubscribe = () => () => {};
const getTheme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

export function HistoryTalk() {
  const theme = useSyncExternalStore(noSubscribe, getTheme, () => "dark");
  const src = HISTORY_TALK_ORIGIN ? `${HISTORY_TALK_ORIGIN}/?embed=1&theme=${theme}` : "";

  return (
    <main className="screen-in mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10" dir="rtl">
      <header className="mb-6 max-w-3xl">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-teal">
          <span className="h-px w-8 bg-teal" aria-hidden="true" />
          עזרי למידה
        </div>
        <h1 className="grad-text text-3xl leading-tight sm:text-4xl">דבר עם ההיסטוריה</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-txt-dim">
          שאלו את יוסף בן מתתיהו למה נכנע ביודפת, ואת טיטוס אם רצה לשרוף את המקדש — בקול, בעברית.
          כל דמות היא שחזור מבוסס בינה מלאכותית שמחפש במקורות הכתובים ומצטט אותם.
        </p>
      </header>

      {src ? (
        <>
          <iframe
            src={src}
            title="דבר עם ההיסטוריה — שיחה עם דמויות היסטוריות"
            allow="microphone; autoplay"
            loading="lazy"
            className="h-[min(820px,calc(100dvh-9rem))] min-h-[640px] w-full rounded-[var(--r-lg)] border border-line bg-card"
          />
          <p className="mt-3 text-sm text-txt-dim">
            המיקרופון לא עובד בתוך המסגרת?{" "}
            <a href={`${HISTORY_TALK_ORIGIN}/?theme=${theme}`} target="_blank" rel="noopener" className="font-bold text-teal underline">
              פתחו את השיחה בחלון חדש
            </a>
            .
          </p>
        </>
      ) : (
        <section className="rounded-[var(--r-lg)] border border-line bg-card p-6">
          <h2 className="text-xl text-txt">בקרוב</h2>
          <p className="mt-2 leading-relaxed text-txt-dim">
            השיחות עם הדמויות עוד בהקמה. הדמויות הראשונות:
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {TALK_CHARACTERS.map((c) => (
              <li key={c.id} className="rounded-[var(--r-md)] border border-line bg-card-2 p-4">
                <p className="text-lg font-black text-txt">{c.name}</p>
                <p className="text-sm text-txt-dim">
                  <span dir="ltr">{c.years}</span> · {c.tagline}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-sm leading-relaxed text-txt-dim">
        לבני 18 ומעלה. השמע והטקסט נשלחים ל-Google Gemini לעיבוד, ובתוכנית החינמית Google רשאית להשתמש בהם
        לשיפור המוצרים שלה. האתר לא שומר תמלולים.
      </p>
    </main>
  );
}
