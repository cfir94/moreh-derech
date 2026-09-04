import Link from "next/link";

export default function HowToWriteReportPage() {
  return (
    <div className="screen-in mx-auto max-w-2xl px-4 py-10">
      <p className="mb-2 text-[12px] font-semibold text-txt-dim">
        <Link href="/guide-reports" className="hover:text-txt">
          דוחות הדרכה
        </Link>
        {" · "}
        מדריך לימוד
      </p>
      <h1 className="grad-text mb-3 text-3xl">איך כותבים דו״ח סיור</h1>
      <p className="mb-8 leading-relaxed text-txt-dim">
        הדו״ח מסכם <b className="text-txt">סיור כפי שבוצע בפועל</b> — לא תוכנית
        על הנייר. זה גם הפורמט שמתרגלים בקורס, וגם מה שנדרש להכיר לקראת מבחן
        הרישוי של משרד התיירות (בניית יום סיור וכתיבת דו״ח).
      </p>

      {/* Part I */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl">חלק I — תוכנית יום הטיול</h2>
        <p className="mb-4 text-[13.5px] leading-relaxed text-txt-dim">
          טבלה של עד 16 שורות, מתחילת הסיור בנקודת היציאה ועד החזרה/פרידה.
        </p>
        <div className="overflow-hidden rounded-lg border border-line">
          <div className="grid grid-cols-3 border-b border-line bg-card-2 text-[12px] font-extrabold">
            <div className="border-l border-line px-3 py-2.5">לוח זמנים</div>
            <div className="border-l border-line px-3 py-2.5">
              פירוט המסלול
            </div>
            <div className="px-3 py-2.5">תיאומים ומנהלות</div>
          </div>
          <div className="grid grid-cols-3 text-[12.5px] leading-relaxed">
            <div className="border-l border-line px-3 py-3">
              משעה עד שעה. בקפיצות של חצי שעה / שעה / שעתיים.
            </div>
            <div className="border-l border-line px-3 py-3">
              נסיעה / הליכה / ביקור / הפסקה. כללו{" "}
              <b>הדרכות דרך</b> אם היו. עד ~25 מילים.
            </div>
            <div className="px-3 py-3">
              ספירה, שירותים, ואוצ׳ר, תדרוך נהג, מים וכובעים… עד ~25 מילים.
            </div>
          </div>
        </div>
      </section>

      {/* Part II */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl">חלק II — יחידות הדרכה קצרות</h2>
        <p className="mb-3 text-[13.5px] leading-relaxed text-txt-dim">
          בין 4 ל־6 יחידות באתרים/תחנות שונות לאורך היום. לכל יחידה:
        </p>
        <ul className="mb-4 flex flex-col gap-2 text-[13.5px] leading-relaxed">
          <li className="flex gap-2">
            <span aria-hidden className="text-teal">
              ◆
            </span>
            <span>
              <b>האתר + משך זמן ההדרכה</b>
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-teal">
              ◆
            </span>
            <span>
              <b>תוכן היחידה</b> (תמצות ההדרכה בשטח, עד ~180 מילים) — כולל את{" "}
              <b>חמש המ״מים</b>
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-teal">
              ◆
            </span>
            <span>
              <b>אמצעים מתודיים</b> (עזרים, מפות, תנ״ך, תרשימים…) — עד ~20 מילים
            </span>
          </li>
        </ul>

        <div className="rounded-lg border border-line bg-card p-4">
          <p className="mb-2 text-sm font-extrabold">חמש המ״מים</p>
          <dl className="grid gap-2 text-[13px] sm:grid-cols-2">
            <div>
              <dt className="font-extrabold text-mc">מי</dt>
              <dd className="text-txt-dim">דמויות, עמים, בונים, גיבורים</dd>
            </div>
            <div>
              <dt className="font-extrabold text-mc">מה</dt>
              <dd className="text-txt-dim">מה רואים / מה קרה / מה זה</dd>
            </div>
            <div>
              <dt className="font-extrabold text-mc">מתי</dt>
              <dd className="text-txt-dim">תקופה, תאריך, רצף זמנים</dd>
            </div>
            <div>
              <dt className="font-extrabold text-mc">מאיפה</dt>
              <dd className="text-txt-dim">מקור, כיוון, הקשר גיאוגרפי</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-extrabold text-mc">מדוע</dt>
              <dd className="text-txt-dim">
                למה זה חשוב / למה כאן / למה דווקא כך
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Part III */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl">חלק III — יחידת הדרכה מורחבת</h2>
        <p className="mb-3 text-[13.5px] leading-relaxed text-txt-dim">
          תחנה אחת שנבחרת להעמיק בה — עד כ־400 מילים. זו נקודת ידע שתוכלו לחזור
          אליה במטלות ובמבחן.
        </p>
        <ul className="flex flex-col gap-2 text-[13.5px] leading-relaxed">
          <li className="flex gap-2">
            <span aria-hidden className="text-teal">
              ◆
            </span>
            האתר, הנושא, ומיקום הקבוצה בזמן ההדרכה
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-teal">
              ◆
            </span>
            תוכן עשיר ומדויק שמתייחס לשטח
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-teal">
              ◆
            </span>
            מתודי, מעורר עניין, אינטראקטיבי — עם פתיחה, מהלך וסיום
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-teal">
              ◆
            </span>
            אם בוצעה הדרכה בשטח: תיאור העזרים ומהלך ההדרכה
          </li>
        </ul>
      </section>

      {/* Exam connection */}
      <section className="mb-8 rounded-lg border border-line bg-card p-5">
        <h2 className="mb-2 text-lg">הקשר למבחן הרישוי</h2>
        <p className="mb-3 text-[13.5px] leading-relaxed text-txt-dim">
          במבחן הרישוי בכתב של משרד התיירות (חלק ב׳) מתבקשים לבחור קבוצת יעד
          ולבנות עבורה מסלול טיול. היכולת לתכנן יום, לנסח יחידות הדרכה ולחשוב
          על מנהלות — בדיוק מה שמתרגלים בדו״ח הסיור — היא הבסיס לחלק הזה.
        </p>
        <p className="text-[13.5px] leading-relaxed text-txt-dim">
          בקורס עצמו מגישים דו״ח אחרי כל סיור (בדרך כלל תוך שבועיים), לקבלת
          הערות מהרכז ותרגול כתיבה.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/guide-reports/example/dead-sea-sodom"
          className="rounded-full px-6 py-3.5 text-sm font-extrabold text-on-accent transition active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
            boxShadow: "0 10px 26px -10px var(--teal)",
          }}
        >
          לראות דוגמה מלאה
        </Link>
        <Link
          href="/guide-reports"
          className="rounded-full border border-line bg-card-2 px-6 py-3.5 text-sm font-extrabold transition active:scale-95"
        >
          חזרה לסקציה
        </Link>
      </div>
    </div>
  );
}
