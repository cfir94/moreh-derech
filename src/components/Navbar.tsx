"use client";

/**
 * ניווט אבן דרך: קישורים קצרים בשורה אחת במחשב ותפריט נגיש בנייד.
 * קישור המחברות מצטרף למרכזי הלמידה בלי להעמיס על שורת הניווט.
 */
import Link from "next/link";
import { useLaunch } from "@/lib/launchClient";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SiteSearch } from "@/components/SiteSearch";
import { UpdatesBell } from "@/components/updates/UpdatesBell";
import { NotesButton, openNotes } from "@/components/notes/NotesDrawer";
import brandIcon from "@/assets/brand-icon.png";

const baseLinks = [
  // "שאלונים", "סיכומים" ו"מאגרי מידע" הוסתרו (10.11, בקשת הבעלים): הם נגישים מ"עיוני" ו"סיורים".
  { href: "/topics", label: "עיוני" },
  { href: "/tours", label: "סיורים" },
  { href: "/games", label: "משחקים" },
  { href: "/exams", label: "מבחן מלא" },
  { href: "/timelines", label: "עזרי למידה" },
  { href: "/map", label: "מפה" },
  { href: "/guide-reports", label: "דוחות הדרכה" },
  { href: "/videos", label: "סרטונים" },
];

export function Navbar() {
  const { user, ready } = useUser();
  const pathname = usePathname();
  const { paywall } = useLaunch();
  const links = paywall ? [...baseLinks, { href: "/pricing", label: "מחירים" }] : baseLinks;
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex min-h-[60px] max-w-6xl items-center gap-1.5 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src={brandIcon}
            alt=""
            priority
            className="h-11 w-11 rounded-[15px] shadow-[0_12px_30px_-14px_var(--teal)]"
          />
          <span className="grad-text hidden text-lg font-black sm:inline xl:hidden">
            אֶבֶן דֶּרֶךְ למורי דרך
          </span>
        </Link>

        <ul className="mr-2 hidden min-w-0 flex-1 items-center gap-0.5 xl:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-bold transition ${
                  isActive(link.href)
                    ? "border border-line bg-card-2 text-txt"
                    : "text-txt-dim hover:bg-card hover:text-txt"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mr-auto flex shrink-0 items-center gap-2 xl:mr-0">
          <SiteSearch />
          <div className="hidden min-[400px]:block">
            <UpdatesBell />
          </div>
          {/* below 360px the bar has no room: the menu opens the notes instead */}
          <div className="hidden min-[360px]:block">
            <NotesButton />
          </div>
          <ThemeToggle />
          {ready && user ? (
            <Link
              href="/me"
              className={`max-w-[9rem] truncate whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-bold transition ${
                isActive("/me")
                  ? "border border-line bg-card-2 text-txt"
                  : "text-txt-dim hover:bg-card hover:text-txt"
              }`}
            >
              {user.name}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full px-4 py-2.5 text-sm font-extrabold text-on-accent transition active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
                boxShadow: "0 10px 26px -10px var(--teal)",
              }}
            >
              כניסה
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="תפריט"
            aria-expanded={open}
            className="grid h-[42px] w-[42px] place-items-center rounded-[14px] border border-line bg-card text-lg transition active:scale-90 xl:hidden"
          >
            ☰
          </button>
        </div>
      </nav>

      {open && (
        <ul className="border-t border-line bg-sheet px-4 pb-3 xl:hidden">
          <li className="min-[400px]:hidden">
            <Link href="/updates/" onClick={() => setOpen(false)} className="block rounded-[14px] px-3 py-3 text-sm font-bold text-txt-dim hover:bg-card">
              🔔 מה חדש
            </Link>
          </li>
          <li className="min-[360px]:hidden">
            <button type="button" onClick={() => { setOpen(false); openNotes(); }} className="block w-full rounded-[14px] px-3 py-3 text-right text-sm font-bold text-txt-dim hover:bg-card">
              🗒️ הפתקים שלי
            </button>
          </li>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-[14px] px-3 py-3 text-sm font-bold transition ${
                  isActive(link.href)
                    ? "bg-card-2 text-txt"
                    : "text-txt-dim hover:bg-card"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
