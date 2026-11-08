/**
 * הפנים מאחורי האתר (docs/launch/PAYMENTS-MANUAL.md). התמונה תגיע מהבעלים; עד אז עיגול עם ראשי תיבות.
 * כשתגיע: לשמור ב-public/owner/cfir.webp ולהחליף את העיגול ב-<img>.
 */
export function OwnerCard() {
  return (
    <div className="flex items-start gap-4" data-owner-card>
      <div
        aria-hidden
        className="grid size-16 shrink-0 place-items-center rounded-full text-xl font-black text-on-accent"
        style={{ background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)" }}
      >
        כי
      </div>
      <div className="text-sm leading-relaxed text-txt">
        <p className="font-black">כפיר יעקובי</p>
        <p className="text-txt-dim">
          מורה דרך בהכשרה, שבנה את האתר הזה בשביל עצמו ובשביל החברים בכיתה. כל כלי כאן נולד משאלה שעלתה
          בשיעור או בסיור, ונבדק מול חומר הקורס.
        </p>
        <p className="mt-1 text-txt-dim">
          בונה גם אתרים מקצועיים, חבילות שיווק ועזרי למידה ייעודיים לקורסים ולהשתלמויות. מוזמנים לכתוב.
        </p>
      </div>
    </div>
  );
}
