"use client";

import { useLayoutEffect } from "react";

// Back/Forward should keep the browser's own scroll restoration, so remember that the last
// navigation came from history.
let fromHistory = false;
// The first load belongs to the browser too (a reload keeps its place).
let firstLoad = true;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    fromHistory = true;
  });
}

/**
 * A new page opens at its top. Next scrolls to the new segment by itself, but from a long page
 * (the topics page, scrolled far down) it sometimes left the summary half-way down (owner, 20.11).
 * Mounted in the template, which mounts afresh on every navigation. A link with #anchor is left alone.
 */
export function ScrollToTop() {
  useLayoutEffect(() => {
    if (firstLoad) {
      firstLoad = false;
      return;
    }
    if (fromHistory) {
      fromHistory = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, []);
  return null;
}
