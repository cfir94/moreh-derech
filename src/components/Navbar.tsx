"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import brandIcon from "@/assets/brand-icon.png";

const links = [
  { href: "/game", label: "המשחק" },
  { href: "/quizzes", label: "שאלונים" },
  { href: "/exams", label: "מבחן מלא" },
  { href: "/timelines", label: "צירי זמן" },
  { href: "/map", label: "מפה" },
  { href: "/guide-reports", label: "דוחות הדרכה" },
  { href: "/videos", label: "סרטונים" },
];

export function Navbar() {
  const { user, ready } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex min-h-[60px] max-w-5xl items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={brandIcon}
            alt=""
            priority
            className="h-11 w-11 rounded-[15px] shadow-[0_12px_30px_-14px_var(--teal)]"
          />
          <span className="grad-text text-lg font-black">
            אֶבֶן דֶּרֶךְ למורי דרך
          </span>
        </Link>

        <ul className="mr-3 hidden flex-1 items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`rounded-full px-3.5 py-2 text-sm font-bold transition ${
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

        <div className="mr-auto flex items-center gap-2 md:mr-0">
          {ready && user ? (
            <Link
              href="/me"
              className={`rounded-full px-3.5 py-2 text-sm font-bold transition ${
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
            className="grid h-[42px] w-[42px] place-items-center rounded-[14px] border border-line bg-card text-lg transition active:scale-90 md:hidden"
          >
            ☰
          </button>
        </div>
      </nav>

      {open && (
        <ul className="border-t border-line bg-sheet px-4 pb-3 md:hidden">
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
