"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Fills exactly the screen under the site's header, so the map page never scrolls (owner, 20.11). */
export function FullMapFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = document.querySelector("header");
    const place = () => {
      const top = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      if (ref.current) ref.current.style.top = `${top}px`;
    };
    place();
    const ro = header ? new ResizeObserver(place) : null;
    if (header && ro) ro.observe(header);
    window.addEventListener("resize", place);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", place);
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <div ref={ref} data-ground="map" className="fixed inset-x-0 bottom-0 top-[3.6rem] z-10 flex flex-col overflow-hidden bg-[#2e4250]">
      {children}
    </div>
  );
}
