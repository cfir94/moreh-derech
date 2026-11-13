"use client";

import Link from "next/link";
import { LAUNCH } from "@/lib/launch";
import { useLaunch } from "@/lib/launchClient";

/** כותרת תחתונה עם המסמכים המשפטיים ויצירת קשר (חובת גילוי בעסקה מרחוק). פעילה עם ה-Paywall. */
export function SiteFooter() {
  const { paywall } = useLaunch();
  if (!paywall) return null;
  const links = [
    ["/pricing/", "מחירים"],
    ["/legal/terms/", "תנאי שימוש"],
    ["/legal/privacy/", "פרטיות"],
    ["/legal/cancellation/", "ביטול והחזרים"],
    ["/legal/accessibility/", "נגישות"],
  ] as const;
  return (
    <footer className="border-t border-line px-4 py-6 text-center text-base text-txt-dim">
      {/* the map's scale bar */}
      <p aria-hidden className="mb-3 flex items-center justify-center gap-3 text-sm">
        <span className="inline-flex h-2 w-40 border border-[var(--ink)] bg-[linear-gradient(90deg,var(--ink)_0_25%,transparent_25%_50%,var(--ink)_50%_75%,transparent_75%)]" />
        <span className="num">1:50,000</span>
      </p>
      <nav aria-label="מסמכים ומידע" className="mb-2 flex flex-wrap justify-center gap-x-5 gap-y-1 pencil">
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
