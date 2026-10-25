"use client";

/**
 * The illustrated map: a painted relief (tools/build_learning_map_base.py)
 * under SVG vectors and markers, in the sheet's own Mercator units. Pan and
 * zoom move the viewBox; markers, labels and strokes are counter-scaled so they
 * keep their size on screen. Jerusalem has its own sheet — on the country sheet
 * its sites gather into one badge that opens it.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COUNTRY, JERUSALEM, type SheetFrame } from "@/data/learning-map/geometry";
import type { MapSite } from "@/data/learning-map";
import { withBasePath } from "@/lib/basePath";
import { useTheme } from "@/components/ThemeToggle";
import styles from "./LearningMap.module.css";

export type SheetId = "country" | "jerusalem";

export type MarkerStyle = { fill: string; ring?: string; dim?: boolean };

type ViewBox = { x: number; y: number; w: number; h: number };

const SHEETS = { country: COUNTRY, jerusalem: JERUSALEM } as const;

/** Where the Jerusalem badge sits on the country sheet. */
const JERUSALEM_POINT = { lat: 31.778, lng: 35.2345 };

export function project(frame: SheetFrame, lng: number, lat: number) {
  const x = (lng + 180) / 360;
  const s = Math.sin((lat * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
  // rounded: Math.log differs in the last digits between Node and browsers,
  // which would break hydration of the server-rendered SVG
  const round = (v: number) => Math.round(v * 100) / 100;
  return { x: round((x - frame.x0) * frame.scale), y: round((y - frame.y0) * frame.scale) };
}

export function sheetOf(site: MapSite): SheetId {
  return site.jerusalem ? "jerusalem" : "country";
}

// Atlas lettering. Positions are geographic; `r` rotates the label.
const COUNTRY_LABELS: { t: string; lat: number; lng: number; r?: number; kind?: "sea" | "lake" }[] = [
  { t: "הים התיכון", lat: 32.15, lng: 34.42, r: -72, kind: "sea" },
  { t: "הגליל", lat: 32.97, lng: 35.33 },
  { t: "עמק יזרעאל", lat: 32.62, lng: 35.27 },
  { t: "השומרון", lat: 32.12, lng: 35.08 },
  { t: "השפלה", lat: 31.72, lng: 34.8 },
  { t: "הרי יהודה", lat: 31.45, lng: 35.02 },
  { t: "מדבר יהודה", lat: 31.52, lng: 35.27, r: -70 },
  { t: "בקעת הירדן", lat: 32.18, lng: 35.56, r: -82 },
  { t: "הגולן", lat: 33.0, lng: 35.8 },
  { t: "עבר הירדן", lat: 31.95, lng: 35.86, r: -80 },
  { t: "הנגב", lat: 30.6, lng: 34.85 },
  { t: "הערבה", lat: 30.25, lng: 35.13, r: -72 },
  { t: "סיני", lat: 29.95, lng: 34.42 },
  { t: "ים המלח", lat: 31.47, lng: 35.5, r: -84, kind: "lake" },
  { t: "ים כנרת", lat: 32.82, lng: 35.6, kind: "lake" },
  { t: "מפרץ אילת", lat: 29.52, lng: 34.9, kind: "lake" },
];

const JERUSALEM_LABELS: { t: string; lat: number; lng: number; r?: number }[] = [
  { t: "העיר העתיקה", lat: 31.7838, lng: 35.2205 },
  { t: "(החומות של היום)", lat: 31.7829, lng: 35.2205 },
  { t: "הר הזיתים", lat: 31.7745, lng: 35.2478, r: -78 },
  { t: "נחל קדרון", lat: 31.7705, lng: 35.2383, r: -76 },
  { t: "גיא בן הינום", lat: 31.7678, lng: 35.2255, r: 18 },
  { t: "רחביה", lat: 31.7712, lng: 35.2115 },
  { t: "לבית לחם ↓", lat: 31.7352, lng: 35.2085 },
];

type Props = {
  sheet: SheetId;
  onSheet: (sheet: SheetId) => void;
  sites: MapSite[];
  styleOf: (site: MapSite) => MarkerStyle;
  selectedId?: string;
  /** Practice: the site the question points at (pulses). */
  pulseId?: string;
  /** Practice feedback rings. */
  verdicts?: Record<string, "right" | "wrong">;
  hideLabels?: boolean;
  onPick: (siteId: string) => void;
  /** Bump to re-centre on the selected site. */
  focusNonce?: number;
  /** A list row under the pointer: its dot shows its name. */
  highlightId?: string;
};

export function MapCanvas({ sheet, onSheet, sites, styleOf, selectedId, pulseId, verdicts, hideLabels, onPick, focusNonce, highlightId }: Props) {
  const theme = useTheme();
  const data = SHEETS[sheet];
  const frame = data.frame;
  const full = useMemo<ViewBox>(() => ({ x: 0, y: 0, w: frame.width, h: frame.height }), [frame]);
  // the country sheet opens on the Galilee-to-Negev-highlands band, where the
  // sites are; "כל המפה" zooms out to the Arava and Eilat
  const home = useMemo<ViewBox>(() => {
    if (sheet !== "country") return full;
    const top = project(frame, 34.15, 33.36).y;
    const bottom = project(frame, 34.15, 30.62).y;
    return { x: 0, y: top, w: frame.width, h: bottom - top };
  }, [sheet, frame, full]);
  const [vb, setVb] = useState<ViewBox>(home);
  const [hoverId, setHoverId] = useState<string>();
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 600, h: 800 });
  const anim = useRef<number>(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** px per map unit with preserveAspectRatio "meet". */
  const scale = Math.min(box.w / vb.w, box.h / vb.h) || 1;
  const u = 1 / scale; // map units per screen px
  const zoom = full.w / vb.w;

  const clamp = useCallback(
    (v: ViewBox): ViewBox => {
      const w = Math.min(Math.max(v.w, full.w / (sheet === "country" ? 14 : 5)), full.w);
      const h = (w / v.w) * v.h;
      const slackX = Math.max(0, (box.w / Math.min(box.w / w, box.h / h) - w) / 2);
      const slackY = Math.max(0, (box.h / Math.min(box.w / w, box.h / h) - h) / 2);
      const x = Math.min(Math.max(v.x, -slackX), full.w - w + slackX);
      const y = Math.min(Math.max(v.y, -slackY), full.h - h + slackY);
      return { x, y, w, h };
    },
    [full, sheet, box],
  );

  const animateTo = useCallback(
    (target: ViewBox) => {
      cancelAnimationFrame(anim.current);
      const from = vb;
      const to = clamp(target);
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 380;
      const start = performance.now();
      const step = (now: number) => {
        const t = duration ? Math.min(1, (now - start) / duration) : 1;
        const e = 1 - Math.pow(1 - t, 3);
        setVb({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e });
        if (t < 1) anim.current = requestAnimationFrame(step);
      };
      anim.current = requestAnimationFrame(step);
    },
    [vb, clamp],
  );

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number) => {
      setVb((v) => {
        const w = v.w / factor;
        const h = v.h / factor;
        return clamp({ x: cx - ((cx - v.x) / v.w) * w, y: cy - ((cy - v.y) / v.h) * h, w, h });
      });
    },
    [clamp],
  );

  const toMap = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }, []);

  // wheel zoom — attached by hand, because React's wheel listener is passive
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = toMap(e.clientX, e.clientY);
      zoomAt(Math.pow(1.0018, -e.deltaY), p.x, p.y);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [toMap, zoomAt]);

  // drag to pan, two fingers to pinch
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ moved: boolean; pinch?: number }>({ moved: false });
  const onPointerDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(anim.current);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    drag.current = { moved: false };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      drag.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && drag.current.pinch) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = toMap((a.x + b.x) / 2, (a.y + b.y) / 2);
      zoomAt(dist / drag.current.pinch, mid.x, mid.y);
      drag.current.pinch = dist;
      drag.current.moved = true;
      return;
    }
    if (!drag.current.moved && Math.hypot(dx, dy) < 3) return;
    if (!drag.current.moved) (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current.moved = true;
    setVb((v) => clamp({ ...v, x: v.x - dx / scale, y: v.y - dy / scale }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) drag.current.pinch = undefined;
  };

  // markers on this sheet
  const markers = useMemo(() => {
    return sites
      .filter((s) => !s.offMap && sheetOf(s) === sheet)
      .map((site) => ({ site, ...project(frame, site.lng, site.lat) }));
  }, [sites, sheet, frame]);

  const jerusalemBadge = useMemo(() => {
    if (sheet !== "country") return null;
    const inside = sites.filter((s) => s.jerusalem);
    const lit = inside.filter((s) => !styleOf(s).dim);
    return { ...project(frame, JERUSALEM_POINT.lng, JERUSALEM_POINT.lat), total: inside.length, lit: lit.length, ids: new Set(inside.map((s) => s.id)) };
  }, [sheet, sites, styleOf, frame]);

  const offMap = useMemo(() => {
    if (sheet !== "country") return [];
    return sites.filter((s) => s.offMap).map((site) => {
      const p = project(frame, site.lng, site.lat);
      return { site, x: Math.min(Math.max(p.x, 0), frame.width), y: Math.min(Math.max(p.y, 0), frame.height), dx: p.x, dy: p.y };
    });
  }, [sheet, sites, frame]);

  // re-centre on the selected site when asked (list click, practice question)
  useEffect(() => {
    if (!focusNonce || !selectedId) return;
    const m = markers.find((mk) => mk.site.id === selectedId);
    if (!m) return;
    const margin = vb.w * 0.12;
    const inView = m.x > vb.x + margin && m.x < vb.x + vb.w - margin && m.y > vb.y + margin && m.y < vb.y + vb.h - margin;
    if (inView && zoom > 1.6) return;
    // close enough that the neighbours separate: ~60 km of the country, ~2.5 km of Jerusalem
    const w = Math.min(vb.w, full.w / (sheet === "country" ? 2.6 : 2.2));
    const h = (w / vb.w) * vb.h;
    animateTo({ x: m.x - w / 2, y: m.y - h / 2, w, h });
    // only when asked to focus — not on every pan
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce, sheet]);

  const showAllLabels = !hideLabels && (sheet === "jerusalem" ? zoom >= 2.4 : zoom >= 4.5);
  const R = 6.5; // marker radius in px
  const relief = withBasePath(`/learning-map/${sheet}-${theme}.webp`);
  const unitsPerKm = frame.scale / (40075.016 * Math.cos((31.6 * Math.PI) / 180));
  const kmPx = unitsPerKm * scale;
  const scaleKm = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50].find((k) => k * kmPx >= 70) ?? 50;

  const pick = (id: string) => {
    if (drag.current.moved) return;
    onPick(id);
  };

  return (
    <div ref={wrapRef} className={styles.canvas} data-sheet={sheet}>
      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="group"
        aria-label={sheet === "country" ? "מפת הארץ" : "מפת ירושלים"}
      >
        <image href={relief} x={0} y={0} width={frame.width} height={frame.height} preserveAspectRatio="none" />
        <rect x={0} y={0} width={frame.width} height={frame.height} className={styles.neatline} />

        {sheet === "country" ? (
          <g className={styles.vectors}>
            <path d={COUNTRY.coast} className={styles.coastGlow} />
            <path d={COUNTRY.coast} className={styles.coast} />
            <path d={COUNTRY.lakes} className={styles.lake} />
            <path d={COUNTRY.jordan} className={styles.river} />
          </g>
        ) : (
          <g className={styles.vectors}>
            <path d={JERUSALEM.contoursMinor} className={styles.contourMinor} />
            <path d={JERUSALEM.contoursMajor} className={styles.contourMajor} />
            <path d={JERUSALEM.hinnom} className={styles.river} />
            <path d={JERUSALEM.cityOfDavid} className={styles.cityOfDavid} />
            <path d={JERUSALEM.oldCity} className={styles.oldCity} />
            <path d={JERUSALEM.templeMount} className={styles.templeMount} />
          </g>
        )}

        <g className={styles.atlasLabels} style={{ fontSize: 11.5 * u }}>
          {(sheet === "country" ? COUNTRY_LABELS : JERUSALEM_LABELS).map((l) => {
            const p = project(frame, l.lng, l.lat);
            const kind = "kind" in l ? l.kind : undefined;
            return (
              <text key={l.t} x={p.x} y={p.y} transform={l.r ? `rotate(${l.r} ${p.x} ${p.y})` : undefined} className={kind === "sea" || kind === "lake" ? styles.waterLabel : undefined} style={kind === "sea" ? { fontSize: 15 * u } : undefined}>
                {l.t}
              </text>
            );
          })}
        </g>

        {offMap.map(({ site, x, y, dx, dy }) => {
          const ang = (Math.atan2(dy - y, dx - x) * 180) / Math.PI;
          const st = styleOf(site);
          return (
            <g
              key={site.id}
              className={`${styles.offMap} ${st.dim ? styles.dim : ""} ${selectedId === site.id ? styles.selected : ""}`}
              transform={`translate(${x + 14 * u} ${y - 14 * u})`}
              role="button"
              tabIndex={0}
              aria-label={`${site.name} — מחוץ למפה`}
              onClick={() => pick(site.id)}
              onKeyDown={(e) => e.key === "Enter" && onPick(site.id)}
            >
              <path d={`M0 0 l${-9 * u} ${-5 * u} l0 ${10 * u} z`} transform={`rotate(${ang + 180})`} style={{ fill: st.fill }} />
              {!hideLabels && <text x={14 * u} y={-10 * u} style={{ fontSize: 11 * u }}>{site.name} ↙</text>}
            </g>
          );
        })}

        <g className={styles.markers}>
          {markers.map(({ site, x, y }) => {
            const st = styleOf(site);
            const selected = selectedId === site.id;
            const hovered = hoverId === site.id || highlightId === site.id;
            const verdict = verdicts?.[site.id];
            const r = (st.dim ? R * 0.55 : selected ? R * 1.35 : R) * u;
            const label = !hideLabels && !st.dim && (selected || hovered || showAllLabels) || (hideLabels && verdict);
            return (
              <g
                key={site.id}
                transform={`translate(${x} ${y})`}
                className={`${styles.marker} ${st.dim ? styles.dim : ""} ${selected ? styles.selected : ""}`}
                role="button"
                tabIndex={st.dim ? -1 : 0}
                aria-label={hideLabels ? "אתר על המפה" : site.name}
                onClick={() => pick(site.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick(site.id)}
                onPointerEnter={() => setHoverId(site.id)}
                onPointerLeave={() => setHoverId((h) => (h === site.id ? undefined : h))}
              >
                {(selected || pulseId === site.id) && <circle r={r * 2.3} className={styles.halo} style={{ stroke: pulseId === site.id ? "var(--lm-pulse)" : st.fill }} />}
                {verdict && <circle r={r * 2} className={verdict === "right" ? styles.right : styles.wrong} />}
                <circle r={r * 2.4} className={styles.hit} />
                {st.ring && !st.dim && <circle r={r + 2.6 * u} className={styles.ring} style={{ stroke: st.ring }} />}
                <circle r={r} className={styles.dot} style={{ fill: st.dim ? undefined : st.fill }} />
                {label && (
                  <text y={-r - 6 * u} className={styles.siteLabel} style={{ fontSize: (selected ? 13 : 11.5) * u }}>
                    {site.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        {/* above the markers: their touch targets must not swallow the badge */}
        {jerusalemBadge && (
          <g
            className={`${styles.badge} ${selectedId && jerusalemBadge.ids.has(selectedId) ? styles.badgeOn : ""}`}
            transform={`translate(${jerusalemBadge.x} ${jerusalemBadge.y})`}
            role="button"
            tabIndex={0}
            aria-label={`ירושלים — ${jerusalemBadge.lit} אתרים. פתיחת מפת ירושלים`}
            onClick={() => !drag.current.moved && onSheet("jerusalem")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSheet("jerusalem")}
          >
            {/* the label opens the sheet too, not only the disc */}
            <rect x={-66 * u} y={-15 * u} width={81 * u} height={30 * u} className={styles.badgeHit} />
            <circle r={13 * u} />
            <text y={4 * u} style={{ fontSize: 11 * u }}>{jerusalemBadge.lit}</text>
            <text x={-17 * u} y={4 * u} className={styles.badgeLabel} style={{ fontSize: 12.5 * u }}>ירושלים</text>
          </g>
        )}

      </svg>

      <div className={styles.cartouche}>
        <strong>{sheet === "country" ? "ארץ ישראל" : "ירושלים"}</strong>
        <span>{sheet === "country" ? "בית שני · רומית · ביזנטית" : "העיר וסביבתה"}</span>
      </div>

      <div className={styles.controls}>
        <div className={styles.sheetSwitch} role="tablist" aria-label="גיליון">
          <button type="button" role="tab" aria-selected={sheet === "country"} onClick={() => onSheet("country")}>הארץ</button>
          <button type="button" role="tab" aria-selected={sheet === "jerusalem"} onClick={() => onSheet("jerusalem")}>ירושלים</button>
        </div>
        <div className={styles.zoomBtns}>
          <button type="button" aria-label="התקרבות" onClick={() => zoomAt(1.6, vb.x + vb.w / 2, vb.y + vb.h / 2)}>+</button>
          <button type="button" aria-label="התרחקות" onClick={() => zoomAt(1 / 1.6, vb.x + vb.w / 2, vb.y + vb.h / 2)}>−</button>
          <button type="button" aria-label="כל המפה" onClick={() => animateTo(zoom > 1.05 ? home : full)}>⤢</button>
        </div>
      </div>

      <div className={styles.scalebar} aria-hidden>
        <span style={{ width: scaleKm * kmPx }} />
        <small>{scaleKm >= 1 ? `${scaleKm} ק״מ` : `${scaleKm * 1000} מ׳`}</small>
      </div>
      <svg className={styles.compass} viewBox="-20 -24 40 46" aria-hidden>
        <path d="M0 -18 L6 4 L0 0 L-6 4 Z" />
        <text y={20}>צ</text>
      </svg>
    </div>
  );
}
