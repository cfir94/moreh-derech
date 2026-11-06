import Link from "next/link";
import { LAUNCH } from "@/lib/launch";

/** כותרת תחתונה עם המסמכים המשפטיים ויצירת קשר (חובת גילוי בעסקה מרחוק). פעילה עם ה-Paywall. */
export function SiteFooter() {
  if (!LAUNCH.paywall) return null;
  const links = [
    ["/pricing/", "מחירים"],
    ["/legal/terms/", "תנאי שימוש"],
    ["/legal/privacy/", "פרטיות"],
    ["/legal/cancellation/", "ביטול והחזרים"],
    ["/legal/accessibility/", "נגישות"],
  ] as const;
  return (
    <footer className="border-t border-line px-4 py-6 text-center text-xs text-txt-dim">
      <nav aria-label="מסמכים ומידע" className="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="hover:text-txt">
            {label}
          </Link>
        ))}
        <a href={`mailto:${LAUNCH.supportEmail}`} dir="ltr" className="hover:text-txt">
          {LAUNCH.supportEmail}
        </a>
      </nav>
      <p>{LAUNCH.siteName} · אינו קשור למשרד התיירות</p>
    </footer>
  );
}
