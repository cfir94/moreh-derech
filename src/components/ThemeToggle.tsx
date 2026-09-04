"use client";

/**
 * Global Even Derech theme control: explicit light-first behavior, a compact
 * navigation footprint, and shared state with embedded tools such as the map.
 */
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "even-derech-theme";
const THEME_EVENT = "even-derech-theme-change";

function setDocumentTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage is optional; the current document can still change theme.
  }
}

function getThemeSnapshot(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_EVENT, onStoreChange);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "dark");

  const isDark = theme === "dark";
  const nextLabel = isDark ? "מצב בהיר" : "מצב כהה";

  const toggleTheme = () => {
    const nextTheme: Theme = isDark ? "light" : "dark";
    setDocumentTheme(nextTheme);
    window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: nextTheme }));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`מעבר ל${nextLabel}`}
      aria-pressed={isDark}
      title={`מעבר ל${nextLabel}`}
      className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] border border-line bg-card p-0 text-txt shadow-[0_9px_24px_-18px_var(--teal)] transition hover:border-teal/45 hover:bg-card-2 active:scale-95"
    >
      {isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.5 14.5A8.2 8.2 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
        </svg>
      )}
      <span className="sr-only">{nextLabel}</span>
    </button>
  );
}
