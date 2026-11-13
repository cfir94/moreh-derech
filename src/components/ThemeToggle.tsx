"use client";

/**
 * Global Even Derech theme control: explicit light-first behavior, a compact
 * navigation footprint, and shared state with embedded tools such as the map.
 */
import { useSyncExternalStore } from "react";
import { InkIcon } from "@/components/trail/Ink";

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

/** The current theme, for components that must pick an asset per theme. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "dark");
}

/** Flip the site theme — also used by in-page controls such as the learning map's. */
export function toggleTheme() {
  const nextTheme: Theme = getThemeSnapshot() === "dark" ? "light" : "dark";
  setDocumentTheme(nextTheme);
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: nextTheme }));
}

export function ThemeToggle() {
  const theme = useTheme();

  const isDark = theme === "dark";
  const nextLabel = isDark ? "מצב בהיר" : "מצב כהה";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`מעבר ל${nextLabel}`}
      aria-pressed={isDark}
      title={`מעבר ל${nextLabel}`}
      className="ink-tool"
    >
      <InkIcon name={isDark ? "sun" : "moon"} size={26} />
      <span className="sr-only">{nextLabel}</span>
    </button>
  );
}
