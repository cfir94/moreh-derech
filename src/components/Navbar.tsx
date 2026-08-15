"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";

const links = [
  { href: "/quizzes", label: "שאלונים" },
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
    <header className="sticky top-0 z-40 border-b border-border-base bg-bg-raised/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm text-accent-fg"
          >
            מ
          </span>
          מורי דרך
        </Link>

        <ul className="mr-2 hidden flex-1 items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  isActive(link.href)
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-fg-muted hover:bg-bg-sunken hover:text-fg"
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
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                isActive("/me")
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-fg-muted hover:bg-bg-sunken hover:text-fg"
              }`}
            >
              {user.name}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-fg transition hover:bg-accent-hover"
            >
              כניסה
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="תפריט"
            aria-expanded={open}
            className="rounded-md border border-border-base px-2.5 py-1.5 text-sm md:hidden"
          >
            ☰
          </button>
        </div>
      </nav>

      {open && (
        <ul className="border-t border-border-base bg-bg-raised px-4 pb-3 md:hidden">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2.5 text-sm transition ${
                  isActive(link.href)
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-fg-muted hover:bg-bg-sunken"
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
