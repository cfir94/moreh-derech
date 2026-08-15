"use client";

import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

const links = [
  { href: "/quizzes", label: "שאלונים" },
  { href: "/guide-reports", label: "דוחות הדרכה" },
  { href: "/videos", label: "סרטונים" },
  { href: "/timelines", label: "צירי זמן" },
  { href: "/map", label: "מפה" },
];

export function Navbar() {
  const { user, ready } = useUser();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          מורי דרך
        </Link>

        <ul className="flex flex-wrap items-center gap-4 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-neutral-700 transition hover:text-neutral-900"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="text-sm">
          {ready && user ? (
            <Link
              href="/me"
              className="font-medium text-neutral-900 hover:underline"
            >
              {user.name}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-700"
            >
              כניסה
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
