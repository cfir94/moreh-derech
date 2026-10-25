"use client";

/**
 * מפת הלמידה: מימין רשימת האתרים לפי סדר הקמתם — עם סינון לפי תקופה ולפי
 * בונה — ומשמאל מפה מאוירת (רבע מן המסך, ואפשר לגרור את המפרידה). לחיצה על
 * אתר (במפה או ברשימה) מסמנת אותו ופותחת חלון אתר מעל הרשימה בלבד, כך שהמפה
 * נשארת גלויה. מצב "תרגול" שואל בסגנון המבחן.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BUILDERS,
  BUILDER_BY_ID,
  ERAS,
  PERIODS,
  PERIOD_BY_ID,
  ROWS,
  SITES,
  SITE_BY_ID,
  TEMPLE_SUBPERIODS,
  type BuilderId,
  type EraFilter,
  type Layer,
  type MapSite,
  type PeriodId,
} from "@/data/learning-map";
import { sitePhotos } from "@/data/learning-map/photo-index";
import type { CourseLink } from "@/data/learning-map/refs";
import { siteStatus, useMapProgress } from "@/lib/learningMapProgress";
import { useTheme } from "@/components/ThemeToggle";
import { MapCanvas, sheetOf, type MarkerStyle, type SheetId } from "./MapCanvas";
import { SiteCard } from "./SiteCard";
import { GIVE_UP, PracticePanel, usePractice, type PracticeMode } from "./Practice";
import { Splitter, splitStyle, useSplit } from "./Splitter";
import styles from "./LearningMap.module.css";

type View = "list" | "practice";

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[֑-ׇ]/g, "").replace(/[״"׳'־-]/g, " ").toLowerCase();
}

function layerInEra(layer: Layer, era: EraFilter) {
  if (era === "all") return true;
  const range = ERAS.find((e) => e.id === era);
  if (range) return layer.year >= range.from && layer.year <= range.to;
  return layer.period === era;
}

export function LearningMap({ links }: { links: Record<string, CourseLink[]> }) {
  const theme = useTheme();
  const progress = useMapProgress();
  const practice = usePractice();
  const split = useSplit();
  const pageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<View>("list");
  const [sheet, setSheet] = useState<SheetId>("country");
  const [era, setEra] = useState<EraFilter>("all");
  const [builder, setBuilder] = useState<BuilderId | "all">("all");
  const [query, setQuery] = useState("");
  const [onlyReview, setOnlyReview] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [layerId, setLayerId] = useState<string>();
  const [focusNonce, setFocusNonce] = useState(0);
  const [hoverId, setHoverId] = useState<string>();
  const [cardOpen, setCardOpen] = useState(false);

  const colorOf = useCallback((p: PeriodId) => (theme === "dark" ? PERIOD_BY_ID[p].dark : PERIOD_BY_ID[p].color), [theme]);

  const layerMatches = useCallback(
    (layer: Layer) => layerInEra(layer, era) && (builder === "all" || layer.builder === builder),
    [era, builder],
  );

  const siteMatches = useCallback(
    (site: MapSite) => {
      if (!site.layers.some(layerMatches)) return false;
      if (onlyReview && siteStatus(progress[site.id]) !== "review") return false;
      if (query.trim()) {
        const hay = normalize(
          [site.name, site.place, ...site.layers.map((l) => `${l.title} ${l.builder ? BUILDER_BY_ID[l.builder].name : ""}`), ...(site.finds ?? []).map((f) => f.title)].join(" "),
        );
        if (!normalize(query).split(/\s+/).filter(Boolean).every((t) => hay.includes(t))) return false;
      }
      return true;
    },
    [layerMatches, onlyReview, progress, query],
  );

  const pool = useMemo(() => SITES.filter(siteMatches), [siteMatches]);
  // one row per site, at its earliest phase inside the filter — the order of establishment
  const rows = useMemo(() => {
    const seen = new Set<string>();
    return ROWS.filter((r) => {
      if (seen.has(r.site.id) || !layerMatches(r.layer) || !siteMatches(r.site)) return false;
      seen.add(r.site.id);
      return true;
    });
  }, [layerMatches, siteMatches]);

  const styleOf = useCallback(
    (site: MapSite): MarkerStyle => {
      if (!siteMatches(site)) return { fill: "", dim: true };
      const primary = site.layers.find(layerMatches) ?? site.layers[0];
      const last = site.layers[site.layers.length - 1];
      return { fill: colorOf(primary.period), ring: last.period !== primary.period ? colorOf(last.period) : undefined };
    },
    [siteMatches, layerMatches, colorOf],
  );

  // builders that have phases inside the current period filter, in order of appearance
  const builderChips = useMemo(() => {
    const counts = new Map<BuilderId, number>();
    for (const r of ROWS) if (r.layer.builder && layerInEra(r.layer, era)) counts.set(r.layer.builder, (counts.get(r.layer.builder) ?? 0) + 1);
    return BUILDERS.filter((b) => counts.has(b.id))
      .map((b) => ({ ...b, count: counts.get(b.id)! }))
      .sort((a, b) => b.count - a.count);
  }, [era]);

  const select = useCallback((siteId: string, layer?: string, focus = true) => {
    const site = SITE_BY_ID.get(siteId);
    if (!site) return;
    setSelectedId(siteId);
    setLayerId(layer);
    setView("list");
    setCardOpen(true);
    if (!site.offMap) setSheet(sheetOf(site));
    if (focus) setFocusNonce((n) => n + 1);
    try {
      window.history.replaceState(null, "", `#${siteId}`);
    } catch {
      /* no history API — fine */
    }
  }, []);

  // deep links: /map/learn#nea (site search, shared links)
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (SITE_BY_ID.has(id)) select(id);
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [select]);

  const closeCard = useCallback(() => {
    setCardOpen(false);
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      /* ignore */
    }
  }, []);

  const cardShown = cardOpen && view === "list" && !!selectedId;
  // Esc closes the site window; a new site moves focus into it (without scrolling the page)
  useEffect(() => {
    if (!cardShown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) closeCard();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cardShown, closeCard]);
  useEffect(() => {
    if (cardShown) cardRef.current?.focus({ preventScroll: true });
  }, [cardShown, selectedId]);

  // ---- practice wiring
  const current = practice.state ? practice.state.questions[practice.state.index] : undefined;
  const answered = practice.state?.answer;
  const inPractice = view === "practice" && !!current;

  /** Point the map at a site: its sheet, selected, centred. */
  const reveal = (site: MapSite) => {
    setSelectedId(site.id);
    if (!site.offMap) setSheet(sheetOf(site));
    setFocusNonce((n) => n + 1);
  };

  /** Each question starts on the country sheet — except "what is this?", which shows its target. */
  const showQuestion = (mode: PracticeMode, site?: MapSite) => {
    if (mode === "what" && site) return reveal(site);
    setSelectedId(undefined);
    setSheet("country");
  };

  const startPractice = (mode: PracticeMode) => {
    setView("practice");
    showQuestion(mode, practice.start(mode, pool, SITES, progress));
  };

  const answer = (siteId: string) => {
    if (!current || answered) return;
    practice.answer(siteId);
    reveal(current.site);
  };

  const nextQuestion = () => {
    if (!practice.state) return;
    showQuestion(practice.state.mode, practice.state.questions[practice.state.index + 1]?.site);
    practice.next();
  };

  const onPick = (siteId: string) => {
    if (inPractice) {
      if (practice.state?.mode !== "what") answer(siteId);
      return;
    }
    select(siteId, undefined, false);
  };

  const verdicts = useMemo(() => {
    if (!inPractice || !answered || !current) return undefined;
    const out: Record<string, "right" | "wrong"> = { [current.site.id]: "right" };
    if (!answered.correct && answered.siteId !== GIVE_UP) out[answered.siteId] = "wrong";
    return out;
  }, [inPractice, answered, current]);

  const selected = selectedId ? SITE_BY_ID.get(selectedId) : undefined;
  const rowIndex = selected ? rows.findIndex((r) => r.site.id === selected.id) : -1;
  const stepRow = (delta: number) => {
    if (!rows.length) return;
    const i = ((rowIndex < 0 ? 0 : rowIndex) + delta + rows.length) % rows.length;
    select(rows[i].site.id, rows[i].layer.id);
  };

  const scopeLabel = [
    era === "all" ? "כל התקופות" : ERAS.find((e) => e.id === era)?.title ?? PERIOD_BY_ID[era as PeriodId].title,
    builder !== "all" ? BUILDER_BY_ID[builder].name : "",
    onlyReview ? "רק לחזרה" : "",
  ].filter(Boolean).join(" · ");

  const known = SITES.filter((s) => siteStatus(progress[s.id]) === "known").length;
  const review = SITES.filter((s) => siteStatus(progress[s.id]) === "review").length;

  // group the list by period sub-heading
  const grouped = useMemo(() => {
    const out: { period: PeriodId; rows: typeof rows }[] = [];
    for (const r of rows) {
      const last = out[out.length - 1];
      if (last && last.period === r.layer.period) last.rows.push(r);
      else out.push({ period: r.layer.period, rows: [r] });
    }
    return out;
  }, [rows]);

  const eraIsTemple = era === "temple" || TEMPLE_SUBPERIODS.includes(era as PeriodId);

  return (
    <div ref={pageRef} className={styles.page} style={splitStyle(split)}>
      <section className={styles.panel} aria-label="רשימת האתרים">
        <header className={styles.panelHead}>
          <div className={styles.titleRow}>
            <h1>מפת למידה</h1>
            <div className={styles.tabs} role="tablist">
              <button type="button" role="tab" aria-selected={view !== "practice"} onClick={() => { practice.stop(); setView("list"); }}>אתרים</button>
              <button type="button" role="tab" aria-selected={view === "practice"} onClick={() => { setView("practice"); practice.stop(); }}>תרגול</button>
            </div>
          </div>
          <p className={styles.stats}>
            {SITES.length} אתרים · <span className={styles.statKnown}>✓ {known} יודע</span> · <span className={styles.statReview}>↻ {review} לחזרה</span>
          </p>

          {!inPractice && (
            <div className={styles.filters}>
              <div className={styles.eraRow} role="group" aria-label="תקופה">
                {ERAS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={era === e.id || (e.id === "temple" && eraIsTemple)}
                    onClick={() => { setEra(e.id); setBuilder("all"); }}
                    title={e.range}
                  >
                    {e.title}
                  </button>
                ))}
              </div>
              {eraIsTemple && (
                <div className={styles.subRow} role="group" aria-label="תקופת משנה">
                  {TEMPLE_SUBPERIODS.map((p) => (
                    <button key={p} type="button" aria-pressed={era === p} onClick={() => { setEra(era === p ? "temple" : p); setBuilder("all"); }} style={{ ["--c" as string]: colorOf(p) }} title={PERIOD_BY_ID[p].range}>
                      <i aria-hidden /> {PERIOD_BY_ID[p].title}
                    </button>
                  ))}
                </div>
              )}
              <div className={styles.builderRow} role="group" aria-label="מי בנה">
                <button type="button" aria-pressed={builder === "all"} onClick={() => setBuilder("all")}>כל הבונים</button>
                {builderChips.map((b) => (
                  <button key={b.id} type="button" aria-pressed={builder === b.id} onClick={() => setBuilder(builder === b.id ? "all" : b.id)} title={b.note}>
                    {b.name} <small>{b.count}</small>
                  </button>
                ))}
              </div>
              <div className={styles.searchRow}>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש אתר, בונה או ממצא…" aria-label="חיפוש" />
                <label className={styles.reviewToggle}>
                  <input type="checkbox" checked={onlyReview} onChange={(e) => setOnlyReview(e.target.checked)} /> רק לחזרה
                </label>
              </div>
              {builder !== "all" && <p className={styles.builderNote}>{BUILDER_BY_ID[builder].note}</p>}
            </div>
          )}
        </header>

        <div className={styles.panelBody}>
          {view === "list" && (
            <>
              <div className={styles.listMeta}>
                <span>{rows.length} אתרים · לפי סדר הקמה</span>
                <span className={styles.legend} aria-label="מקרא">
                  {PERIODS.map((p) => (
                    <span key={p.id} style={{ ["--c" as string]: colorOf(p.id) }}><i aria-hidden />{p.title}</span>
                  ))}
                  <span className={styles.legendRing}><i aria-hidden />טבעת במפה = נבנה שוב</span>
                </span>
              </div>
              {rows.length === 0 ? (
                <div className={styles.empty}>
                  אין אתרים שמתאימים לסינון.{" "}
                  <button type="button" onClick={() => { setEra("all"); setBuilder("all"); setQuery(""); setOnlyReview(false); }}>לנקות סינון</button>
                </div>
              ) : (
                grouped.map((g, gi) => (
                  <div key={`${g.period}-${gi}`} className={styles.group}>
                    <h2 className={styles.groupHead} style={{ ["--c" as string]: colorOf(g.period) }}>
                      {PERIOD_BY_ID[g.period].title} <small>{PERIOD_BY_ID[g.period].range}</small>
                    </h2>
                    <ul className={styles.rows}>
                      {g.rows.map(({ site, layer }) => {
                        const status = siteStatus(progress[site.id]);
                        const b = layer.builder ? BUILDER_BY_ID[layer.builder] : undefined;
                        const later = [...new Set(site.layers.filter((l) => l.year > layer.year).map((l) => l.period))].filter((p) => p !== layer.period);
                        return (
                          <li key={site.id}>
                            <button
                              type="button"
                              className={styles.row}
                              aria-current={cardShown && selectedId === site.id ? "true" : undefined}
                              style={{ ["--c" as string]: colorOf(layer.period) }}
                              onClick={() => select(site.id, layer.id)}
                              onPointerEnter={() => setHoverId(site.id)}
                              onPointerLeave={() => setHoverId((h) => (h === site.id ? undefined : h))}
                            >
                              <span className={styles.rowDate}>{layer.date}</span>
                              <span className={styles.rowMain}>
                                <strong>{site.name} <small>{site.place}</small></strong>
                                <span>{layer.title}</span>
                              </span>
                              <span className={styles.rowSide}>
                                {b && <span className={styles.builderTag}>{b.name}</span>}
                                {later.map((p) => (
                                  <i key={p} className={styles.laterDot} style={{ ["--c" as string]: colorOf(p) }} title={`נבנה שוב: ${PERIOD_BY_ID[p].title}`} />
                                ))}
                                {status === "known" && <span className={styles.statKnown} title="יודע">✓</span>}
                                {status === "review" && <span className={styles.statReview} title="לחזרה">↻</span>}
                                {sitePhotos(site).length > 0 && <span className={styles.hasPhoto} title="יש תמונות">📷</span>}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </>
          )}

          {view === "practice" && (
            <PracticePanel
              practice={practice}
              poolSize={pool.length}
              photoPoolSize={pool.filter((s) => sitePhotos(s).length > 0).length}
              scopeLabel={scopeLabel}
              onStart={startPractice}
              onAnswer={answer}
              onNext={nextQuestion}
              onShowSite={(id) => { practice.stop(); select(id); }}
              nameOf={(id) => SITE_BY_ID.get(id)?.name ?? ""}
            />
          )}
        </div>

        {cardShown && selected && (
          <div className={styles.popup} onClick={(e) => e.target === e.currentTarget && closeCard()}>
            <div ref={cardRef} className={styles.popupCard} role="dialog" aria-modal="false" aria-labelledby={`site-${selected.id}`} tabIndex={-1}>
              <SiteCard
                key={selected.id}
                site={selected}
                activeLayerId={layerId}
                links={links[selected.id] ?? []}
                stat={progress[selected.id]}
                colorOf={colorOf}
                onClose={closeCard}
                onStep={rows.length > 1 ? stepRow : undefined}
                position={rowIndex >= 0 ? `${rowIndex + 1} / ${rows.length}` : undefined}
              />
            </div>
          </div>
        )}
      </section>

      <section className={styles.mapArea} aria-label="המפה">
        <MapCanvas
          key={sheet}
          sheet={sheet}
          onSheet={setSheet}
          sites={SITES}
          styleOf={styleOf}
          selectedId={inPractice && practice.state?.mode !== "what" && !answered ? undefined : selectedId}
          pulseId={inPractice && practice.state?.mode === "what" ? current?.site.id : undefined}
          verdicts={verdicts}
          hideLabels={inPractice && !answered}
          highlightId={view === "list" ? hoverId : undefined}
          onPick={onPick}
          focusNonce={focusNonce}
        />
        <Splitter pageRef={pageRef} split={split} />
      </section>
    </div>
  );
}
