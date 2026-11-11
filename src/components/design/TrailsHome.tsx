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
  { href: "/design/trails/quiz", label: "שאלונים", trail: "red" },
  { href: "/exams", label: "מבחנים", trail: "black" },
  { href: "/map", label: "מפה", trail: "green" },
  { href: "/timelines", label: "עזרי למידה", trail: "blue" },
  { href: "/games", label: "משחקים", trail: "orange" },
];

type Props = { questionCount: number; examCount: number };

/** A painted blaze: white, colour, white. */
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

export function TrailsHome({ questionCount, examCount }: Props) {
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
    <TrailsFrame name={d.name} intro>
      <main className={s.main}>
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
export function TrailsFrame({ name, intro = false, children }: { name: string | null; intro?: boolean; children: React.ReactNode }) {
  const topo = { "--topo": `url(${withBasePath("/design/jerusalem-topo.svg")})` } as React.CSSProperties;
  return (
    <div className={s.root} style={topo}>
      {intro && <MapUnfold variant="trails" always storageKey="md_intro_design_trails" />}
      <div aria-hidden className={s.topo} />

      <header className={s.top}>
        <div className={s.topInner}>
          <Link href="/design/trails" className={s.brand}>
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
              <Link key={n.href} href={n.href} className={s.navItem}>
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
