"use client";

import { useEffect, useMemo, useState } from "react";
import { matchesTempleQuery } from "@/data/second-temple";

/** The fields the Roman and Byzantine timelines share. */
export type EraEvent = {
  id: string;
  era: string;
  kind: string;
  key?: boolean;
  concept?: boolean;
};

function reveal(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const details = target.querySelector("details");
  if (details) details.open = true;
  target.scrollIntoView({ block: "start" });
  target.focus({ preventScroll: true });
}

/**
 * Filter state, search and #fragment deep links for an era timeline.
 * `idPattern` recognises the timeline's own event fragments (e.g. RO-012),
 * so a link from site search opens and focuses the right card.
 */
export function useEraTimeline<E extends EraEvent>(events: E[], idPattern: RegExp) {
  const [view, setView] = useState("timeline");
  const [era, setEra] = useState("all");
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [keyOnly, setKeyOnly] = useState(false);
  const [conceptOnly, setConceptOnly] = useState(false);
  const ids = useMemo(() => new Set(events.map((event) => event.id)), [events]);

  const visible = events.filter((event) =>
    (era === "all" || event.era === era) &&
    (kind === "all" || event.kind === kind) &&
    (!keyOnly || event.key) &&
    (!conceptOnly || event.concept) &&
    matchesTempleQuery(Object.values(event).join(" "), query));

  const filtered = query !== "" || era !== "all" || kind !== "all" || keyOnly || conceptOnly;

  function reset() { setQuery(""); setEra("all"); setKind("all"); setKeyOnly(false); setConceptOnly(false); }

  function jump(id: string) {
    setView("timeline"); reset();
    window.setTimeout(() => { window.location.hash = id; reveal(id); }, 0);
  }

  useEffect(() => {
    const current = () => {
      const id = window.location.hash.slice(1);
      if (idPattern.test(id) && ids.has(id)) return id;
      return null;
    };
    const first = current();
    if (first) reveal(first);
    const onHash = () => {
      const id = current();
      if (!id) return;
      setView("timeline"); setQuery(""); setEra("all"); setKind("all"); setKeyOnly(false); setConceptOnly(false);
      window.setTimeout(() => reveal(id), 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [idPattern, ids]);

  return { view, setView, era, setEra, kind, setKind, query, setQuery, keyOnly, setKeyOnly, conceptOnly, setConceptOnly, visible, filtered, reset, jump };
}

export function matches(value: unknown, query: string) {
  return matchesTempleQuery(JSON.stringify(value), query);
}
