"use client";

/**
 * הכותרת העליונה של "תרמיל מורה הדרך": לוגו בדיו, הסקציות בכתב דפוס בעיפרון, ושלט חום אחד
 * לכניסה. מתחת ל-1280px עשרת הקישורים לא נכנסים בשורה בגודל קריא, ולכן כפתור "תפריט" פותח
 * אותם כמקרא מפה: אייקון, שם ומשפט לכל סקציה.
 */
import Link from "next/link";
import { useLaunch } from "@/lib/launchClient";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { ThemeToggle, toggleTheme } from "@/components/ThemeToggle";
import { SiteSearch } from "@/components/SiteSearch";
import { UpdatesBell } from "@/components/updates/UpdatesBell";
import { NotesButton, openNotes } from "@/components/notes/NotesDrawer";
import { CommunityBadge, useCommunityUnread } from "@/components/community/CommunityBadge";
import { InkIcon, InkLockup } from "@/components/trail/Ink";
import type { FieldIconName } from "@/components/trail/FieldIcons";
import s from "./nav.module.css";

type NavLink = { href: string; label: string; icon: FieldIconName; desc: string };

const baseLinks: NavLink[] = [
  // "שאלונים", "סיכומים" ו"מאגרי מידע" הוסתרו (10.11, בקשת הבעלים): הם נגישים מ"עיוני" ו"סיורים".
  { href: "/topics", label: "עיוני", icon: "resources", desc: "כל נושאי הסילבוס: שאלונים, צירים וסיכומים" },
  { href: "/tours", label: "סיורים", icon: "footprint", desc: "סיכומי סיורים לפי אזור" },
  { href: "/community", label: "קהילה", icon: "community", desc: "הפורום של המחזור ולוח הפרסומים" },
  { href: "/games", label: "משחקים", icon: "games", desc: "מי אני?, גלימות, צמחים ותשבץ השבוע" },
  { href: "/exams", label: "מבחן מלא", icon: "exams", desc: "מועדי רישוי ומבחני הקורס בתנאי אמת" },
  { href: "/timelines", label: "עזרי למידה", icon: "timelines", desc: "צירי זמן, אטלס, אדריכלות וגאולוגיה" },
  { href: "/map", label: "מפה", icon: "map", desc: "מפת הלמידה ותכנון מסלול" },
  { href: "/guide-reports", label: "דוחות הדרכה", icon: "guide-reports", desc: "דוגמאות, תרגול וטיוטות" },
  { href: "/videos", label: "סרטונים", icon: "videos", desc: "שיעורים, סיורים והעשרה" },
];

export function Navbar() {
  const { user, ready } = useUser();
  const pathname = usePathname();
  const { paywall } = useLaunch();
  const links: NavLink[] = paywall
    ? [...baseLinks, { href: "/pricing", label: "מחירים", icon: "milestone", desc: "מחיר אחד, הכול פתוח" }]
    : baseLinks;
  const [open, setOpen] = useState(false);
  const unread = useCommunityUnread();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Esc closes the legend
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={s.top}>
      <nav aria-label="ניווט ראשי" className={s.inner}>
        <Link href="/" aria-label="אבן דרך למורי דרך — דף הבית" className={s.brand}>
          <InkLockup height={52} className={s.logo} />
        </Link>

        <ul className={s.links}>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`${s.link} ${isActive(link.href) ? s.active : ""}`}
              >
                <span className="pencil">{link.label}</span>
                {link.href === "/community" && <CommunityBadge count={unread} />}
              </Link>
            </li>
          ))}
        </ul>

        <div className={s.tools}>
          <SiteSearch />
          <div className="hidden min-[400px]:block">
            <UpdatesBell />
          </div>
          {/* below 360px the bar has no room: the menu opens the notes instead */}
          <div className="hidden min-[360px]:block">
            <NotesButton />
          </div>
          <div className={s.themeSlot}>
            <ThemeToggle />
          </div>
          {ready && user ? (
            <Link href="/me" className={s.sign} aria-current={isActive("/me") ? "page" : undefined}>
              <InkIcon name="me" size={22} />
              <span>{user.name}</span>
            </Link>
          ) : (
            <Link href="/login" className={s.sign}>
              <InkIcon name="me" size={22} />
              <span>כניסה</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-legend"
            className={s.menuBtn}
          >
            <InkIcon name="map" size={22} />
            <span className={`${s.menuText} pencil`}>{open ? "סגירה" : "תפריט"}</span>
          </button>
        </div>
      </nav>
      <span aria-hidden className={s.blaze} />

      {open && (
        <div id="site-legend" className={s.legend}>
          <div className={s.legendInner}>
            <p className={s.legendTitle}>מקרא: כל מה שיש בתרמיל</p>
            <ul className={s.legendList}>
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={s.legendItem}
                  >
                    <span className={s.legendMark}>
                      <InkIcon name={link.icon} size={28} />
                    </span>
                    <span>
                      <span className={`${s.legendName} pencil`}>
                        {link.label}
                        {link.href === "/community" && <CommunityBadge count={unread} />}
                      </span>
                      <span className={s.legendDesc}>{link.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
              <li className="min-[400px]:hidden">
                <Link href="/updates/" onClick={() => setOpen(false)} className={s.legendItem}>
                  <span className={s.legendMark}>
                    <InkIcon name="milestone" size={28} />
                  </span>
                  <span>
                    <span className={`${s.legendName} pencil`}>מה חדש</span>
                    <span className={s.legendDesc}>מה נוסף לאתר לאחרונה</span>
                  </span>
                </Link>
              </li>
              <li className={s.legendThemeItem}>
                <button type="button" onClick={toggleTheme} className={s.legendItem}>
                  <span className={s.legendMark}>
                    <InkIcon name="compass" size={28} />
                  </span>
                  <span>
                    <span className={`${s.legendName} pencil`}>מצב בהיר / כהה</span>
                    <span className={s.legendDesc}>נייר מפה ביום, או המפה בשעת דמדומים</span>
                  </span>
                </button>
              </li>
              <li className="min-[360px]:hidden">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openNotes();
                  }}
                  className={s.legendItem}
                >
                  <span className={s.legendMark}>
                    <InkIcon name="notes" size={28} />
                  </span>
                  <span>
                    <span className={`${s.legendName} pencil`}>הפתקים שלי</span>
                    <span className={s.legendDesc}>מה שרשמת לעצמך</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
