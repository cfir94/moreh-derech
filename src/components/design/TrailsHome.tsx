"use client";

import Link from "next/link";
import { withBasePath } from "@/lib/basePath";
import { FieldIcon, type FieldIconName } from "./FieldIcons";
import { Footsteps } from "./Footsteps";
import { HOME_SECTIONS } from "./homeData";
import { MapUnfold } from "./MapUnfold";
import { NotePaper } from "./NotePaper";
import { useHomeData } from "./useHomeData";
import s from "./trails.module.css";

/*
 * גרסה ב׳: "סימון שבילים". העולם הוא סימון השבילים בארץ (לבן–צבע–לבן על סלע) ומפת סימון
 * השבילים: לכל פרק צבע שביל משלו, דף הבית הוא שביל עם תחנות על סלעים מסומנים, ורשימת
 * הכלים היא המקרא של המפה. קנה המידה מודד כמה שאלות כבר נענו.
 */

export type Trail = "red" | "blue" | "green" | "black" | "orange";

const TRAIL_OF: Record<string, Trail> = {
  quizzes: "red",
  exams: "black",
  map: "green",
  timelines: "blue",
  notebooks: "green",
  "guide-reports": "blue",
  games: "orange",
  videos: "orange",
  resources: "black",
  community: "red",
};

const NAV: { href: string; label: string; trail: Trail }[] = [
  { href: "/quiz", label: "שאלונים", trail: "red" },
  { href: "/exams", label: "מבחנים", trail: "black" },
  { href: "/map", label: "מפה", trail: "green" },
  { href: "/timelines", label: "עזרי למידה", trail: "blue" },
  { href: "/games", label: "משחקים", trail: "orange" },
];

/** "stone": the first grey-limestone take. "khaki": desert sand and khaki. "journey": the page walks from the Carmel to the Negev. */
export type TrailPalette = "stone" | "khaki" | "journey";

const BASE: Record<TrailPalette, string> = { stone: "/design/trails", khaki: "/design/khaki", journey: "/design/journey" };

type Props = { questionCount: number; examCount: number; palette?: TrailPalette };

/** A painted blaze: white, colour, white. */
/**
 * Low bushes beside the trail (the owner's "a bit of plant green"). Hand-placed, so the static HTML matches.
 * With `dry`, the lower ones thin out and turn olive-brown: the walk is heading for the Negev.
 */
function Shrubs({ dry }: { dry: boolean }) {
  const bush = (x: number, y: number, r: number, tone: string, leaves = 7) => (
    <g transform={`translate(${x} ${y})`} fill={tone}>
      {Array.from({ length: leaves }, (_, i) => {
        const a = (i / leaves) * Math.PI - Math.PI;
        return (
          <ellipse
            key={i}
            cx={Math.round(Math.cos(a) * r * 0.9 * 10) / 10}
            cy={Math.round(Math.sin(a) * r * 0.6 * 10) / 10}
            rx={r * 0.55}
            ry={r * 0.38}
            transform={`rotate(${Math.round((a * 180) / Math.PI + 90)} ${Math.round(Math.cos(a) * r * 0.9 * 10) / 10} ${Math.round(Math.sin(a) * r * 0.6 * 10) / 10})`}
          />
        );
      })}
      <ellipse cx={0} cy={-r * 0.2} rx={r * 0.7} ry={r * 0.45} />
    </g>
  );
  return (
    <svg aria-hidden className={s.shrubs} viewBox="0 0 400 520">
      {bush(392, 108, 16, "var(--t-green)")}
      {bush(240, 120, 11, "var(--t-green)")}
      {bush(392, 250, 13, "var(--t-green)", 6)}
      {bush(206, 372, 12, dry ? "var(--dry-green, #8a8a4a)" : "var(--t-green)", 6)}
      {bush(388, 500, dry ? 8 : 12, dry ? "var(--dry-green, #9a8a55)" : "var(--t-green)", dry ? 5 : 6)}
    </svg>
  );
}

export function Blaze({ trail, className = "" }: { trail: Trail; className?: string }) {
  return <span aria-hidden className={`${s.blaze} ${s[trail]} ${className}`} />;
}

/** Scale bar of a hiking map, measuring answered questions. */
function ScaleBar({ answered }: { answered: number }) {
  const step = answered > 2000 ? 1000 : answered > 400 ? 250 : 50;
  const end = Math.max(step * 4, Math.ceil((answered + 1) / step) * step);
  const ticks = Array.from({ length: end / step + 1 }, (_, i) => i * step);
  const at = Math.min(100, (answered / end) * 100);
  return (
    <figure className={s.scale}>
      <div className={s.scaleBar}>
        {ticks.slice(1).map((t, i) => (
          <span key={t} className={i % 2 ? s.scaleLight : s.scaleDark} />
        ))}
        <span className={s.scaleMark} style={{ insetInlineStart: `${at}%` }} />
      </div>
      <div className={s.scaleTicks}>
        {ticks.map((t) => (
          <span key={t}>{t.toLocaleString("he-IL")}</span>
        ))}
      </div>
      <figcaption>
        קנה מידה: <b>{answered.toLocaleString("he-IL")}</b> שאלות שנענו
      </figcaption>
    </figure>
  );
}

export function TrailsHome({ questionCount, examCount, palette = "stone" }: Props) {
  const d = useHomeData();

  const stations: { href: string; icon: FieldIconName; label: string; detail: string; trail: Trail; alert?: boolean }[] = [
    d.reviewCount > 0
      ? { href: "/quizzes/review", icon: "review", label: "חזרה על טעויות", detail: `${d.reviewCount} ממתינות לך`, trail: "red", alert: true }
      : { href: "/quizzes", icon: "quizzes", label: "תרגול שאלות", detail: `${questionCount.toLocaleString("he-IL")} שאלות`, trail: "red" },
    { href: "/exams", icon: "exams", label: "מבחן רישוי מלא", detail: `${examCount} מועדים`, trail: "black" },
    { href: "/map/learn", icon: "map", label: "מפת הלמידה", detail: "מי בנה, מתי ואיפה", trail: "green" },
    { href: "/games/crossword", icon: "notes", label: "תשבץ השבוע", detail: "חדש בכל שישי", trail: "orange" },
  ];

  return (
    <TrailsFrame name={d.name} intro palette={palette}>
      <main className={s.main}>
        {palette === "journey" && (
          <div aria-hidden className={s.regions}>
            <span>רכס הכרמל</span>
            <span>השפלה</span>
            <span>הנגב</span>
          </div>
        )}
        <section className={s.hero}>
          <div className={s.greet}>
            <p className={s.here}>
              <span aria-hidden className={s.hereDot} />
              אתם כאן
            </p>
            <h1 className={s.hello}>{d.name ? `שלום, ${d.name}` : "ללמוד למבחן, להכין את הסיור הבא"}</h1>
            <p className={s.lede}>
              {d.name
                ? "השביל של היום: מה שטעית בו, מבחן אחד, ותחנה במפה."
                : `${questionCount.toLocaleString("he-IL")} שאלות תרגול, ${examCount} מועדי רישוי, מפות ועזרי למידה. ההתקדמות נשמרת בחשבון.`}
            </p>
            {d.hasHistory && <ScaleBar answered={d.answered} />}
          </div>

          <nav aria-label="השביל של היום" className={s.trail}>
            {/* rocks sit 40px from the right edge, every other one 90px further in; 130px per station */}
            <svg aria-hidden className={s.trailLine} viewBox="0 0 400 520">
              <path className={s.pathWide} d="M360 0V65C330 130 280 140 270 195S340 270 360 325 280 410 270 455V520" />
              <path className={s.pathNarrow} d="M360 0V65C345 130 318 140 314 195S350 270 360 325 318 410 314 455V520" />
            </svg>
            <Footsteps
              className={s.steps}
              from={{ x: 900, y: 40 }}
              c1={{ x: 300, y: 120 }}
              c2={{ x: 900, y: 420 }}
              to={{ x: 250, y: 590 }}
              steps={12}
              size={2.2}
            />
            {palette !== "stone" && <Shrubs dry={palette === "journey"} />}
            <ol className={s.stations}>
              {stations.map((st) => (
                <li key={st.href} className={s.station}>
                  <Link href={st.href} className={s.stationLink}>
                    <span className={s.rock}>
                      <Blaze trail={st.trail} className={s.rockBlaze} />
                    </span>
                    <span className={s.tag}>
                      <span className={s.tagLabel}>
                        <FieldIcon name={st.icon} size={24} />
                        {st.label}
                      </span>
                      <span className={st.alert ? `${s.tagDetail} ${s.alert}` : s.tagDetail}>{st.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <NotePaper className={s.note} />
        </section>

        <section aria-labelledby="legend-title" className={s.legend}>
          <h2 id="legend-title" className={s.legendTitle}>
            מקרא
          </h2>
          <ul className={s.legendGrid}>
            {HOME_SECTIONS.map((x) => (
              <li key={x.slug}>
                <Link href={x.href} className={s.legendItem}>
                  <Blaze trail={TRAIL_OF[x.slug] ?? "black"} className={s.legendBlaze} />
                  <FieldIcon name={x.icon} size={26} className={s.legendIcon} />
                  <span className={s.legendText}>
                    <span className={s.legendName}>
                      {x.title}
                      {x.slug === "community" && d.unread > 0 && <span className={s.badge}>{d.unread}</span>}
                    </span>
                    <span className={s.legendLine}>{x.line}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={s.legendFoot}>
            <span>קנה מידה 1:50,000</span>
            <span>קווי גובה: ירושלים והעיר העתיקה</span>
          </p>
        </section>
      </main>
    </TrailsFrame>
  );
}

/** The frame of version B: the contour ground and the top bar with its painted trail. */
export function TrailsFrame({
  name,
  intro = false,
  palette = "stone",
  children,
}: {
  name: string | null;
  intro?: boolean;
  palette?: TrailPalette;
  children: React.ReactNode;
}) {
  const topo = { "--topo": `url(${withBasePath("/design/jerusalem-topo.svg")})` } as React.CSSProperties;
  const base = BASE[palette];
  return (
    <div className={`${s.root} ${s[`pal_${palette}`] ?? ""}`} style={topo}>
      {intro && <MapUnfold variant="trails" always storageKey="md_intro_design_trails" />}
      <div aria-hidden className={s.topo} />

      <header className={s.top}>
        <div className={s.topInner}>
          <Link href={base} className={s.brand}>
            <span className={s.mark}>
              <FieldIcon name="milestone" size={34} />
              <Blaze trail="red" className={s.markBlaze} />
            </span>
            <span className={s.brandText}>
              <span className={s.brandName}>אבן דרך</span>
              <span className={s.brandSub}>למורי דרך</span>
            </span>
          </Link>
          <nav aria-label="ניווט ראשי" className={s.nav}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href === "/quiz" ? `${base}/quiz` : n.href} className={s.navItem}>
                <Blaze trail={n.trail} className={s.navBlaze} />
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/me" className={s.me}>
            <FieldIcon name="me" size={22} />
            {name ?? "כניסה"}
          </Link>
        </div>
        <span aria-hidden className={s.topTrail} />
      </header>
      {children}
    </div>
  );
}
