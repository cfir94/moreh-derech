"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { withBasePath } from "@/lib/basePath";
import type { FieldIconName } from "../FieldIcons";
import { HOME_SECTIONS } from "../homeData";
import { NotePaper } from "../NotePaper";
import { useHomeData } from "../useHomeData";
import { FoldIntro } from "./FoldIntro";
import { InkArrow, InkCompass, InkDefs, InkIcon, InkLockup, InkMoon, InkRuin, InkSun, InkTree } from "./Ink";
import { Birds, Prints, TopoPatch, Waypoints } from "./Zones";
import s from "./final.module.css";

/*
 * הגרסה המאוחדת (12.11): מה שהבעלים בחר מכל הסבבים.
 * נייר מפה (ביום) ומפה בשעת דמדומים (בכהה) · סימנים בדיו של מחברת שדה · כותרות בכתב יד ·
 * שביל מסומן שמצייר את עצמו · שלטים חומים רק בתחנות ובכפתור הכניסה · והדף עצמו הוא המפה
 * שנפתחת מהתרמיל (FoldIntro). התוכן נשאר גדול, ברור ונקי: הקהל בן 40–60.
 */

type Trail = "red" | "blue" | "green" | "black" | "orange";

const NAV: { href: string; label: string; trail: Trail }[] = [
  { href: "/design/final/quiz", label: "שאלונים", trail: "red" },
  { href: "/exams", label: "מבחנים", trail: "black" },
  { href: "/map", label: "מפה", trail: "green" },
  { href: "/timelines", label: "עזרי למידה", trail: "blue" },
  { href: "/games", label: "משחקים", trail: "orange" },
];

function Blaze({ trail, className = "" }: { trail: Trail; className?: string }) {
  return <span aria-hidden className={`${s.blaze} ${s[trail]} ${className}`} />;
}

// the trail runs through the middle of each sign: signs alternate between two columns
const WIDE = "M285 -8V30C285 110 195 110 195 195S285 250 285 325 195 380 195 455V528";
const NARROW = "M285 -8V30C285 110 239 110 239 195S285 250 285 325 239 380 239 455V528";

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("even-derech-theme", next);
  } catch {}
}

/** The dashed trail, revealed along its length by a mask: the line draws itself like a pen on the map. */
function TrailLine({ d, id, className }: { d: string; id: string; className: string }) {
  return (
    <g className={className}>
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="-10" width="400" height="540">
        <path d={d} pathLength={1} className={s.draw} />
      </mask>
      <path d={d} className={s.dash} mask={`url(#${id})`} />
    </g>
  );
}

export function FinalFrame({
  name,
  intro = false,
  children,
}: {
  name: string | null;
  intro?: boolean;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const vars = { "--topo": `url(${withBasePath("/design/jerusalem-topo.svg")})` } as React.CSSProperties;

  // background zones below the fold wait, and come in when the reader scrolls to them
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const zones = [...el.querySelectorAll<HTMLElement>("[data-zone]")];
    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.zone = "in";
          seen.unobserve(e.target);
        }
      },
      { root: el, threshold: 0.15 },
    );
    for (const zone of zones) {
      if (zone.getBoundingClientRect().top < window.innerHeight) continue;
      zone.dataset.zone = "wait";
      seen.observe(zone);
    }
    return () => seen.disconnect();
  }, []);

  return (
    <>
      {intro && (
        <FoldIntro
          always
          storageKey="md_intro_design_final"
          getTarget={() => root.current}
          onBefore={() => root.current?.setAttribute("data-anim", "wait")}
          onDone={() => root.current?.setAttribute("data-anim", "go")}
        />
      )}
      <div ref={root} className={s.root} style={vars}>
        <InkDefs />
        <div aria-hidden className={s.creases} />
        <div aria-hidden className={s.neat} />

        <header className={s.top}>
          <div className={s.topInner}>
            <Link href="/design/final" className={s.brand}>
              <InkLockup height={62} className={s.logo} />
            </Link>
            <nav aria-label="ניווט ראשי" className={s.nav}>
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className={s.navItem}>
                  <Blaze trail={n.trail} />
                  {n.label}
                </Link>
              ))}
            </nav>
            <button type="button" className={s.theme} onClick={toggleTheme} aria-label="החלפה בין מצב בהיר למצב כהה">
              <InkSun className={s.sun} />
              <InkMoon className={s.moon} />
              <span className={s.themeText}>
                <span className={s.sun}>מצב בהיר</span>
                <span className={s.moon}>מצב כהה</span>
              </span>
            </button>
            <Link href="/me" className={s.signBtn}>
              <InkIcon name="me" size={24} />
              {name ?? "כניסה"}
            </Link>
          </div>
          <span aria-hidden className={s.topTrail} />
        </header>
        {children}
      </div>
    </>
  );
}

export function FinalHome({ questionCount, examCount }: { questionCount: number; examCount: number }) {
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
    <FinalFrame name={d.name} intro>
      <main className={s.main}>
        <section className={s.hero}>
          <div className={s.greet}>
            <p className={s.here}>
              <span aria-hidden className={s.hereDot} />
              אתם כאן
            </p>
            <h1 className={s.hello}>{d.name ? `שלום, ${d.name}` : "ללמוד למבחן, להכין את הסיור הבא"}</h1>
            <svg aria-hidden className={s.underline} viewBox="0 0 300 14" preserveAspectRatio="none">
              <path d="M4 9c40-5 90-7 140-5s100 4 152-2" />
            </svg>
            <p className={s.lede}>
              {d.name
                ? "השביל של היום מסומן: מה שטעית בו, מבחן אחד, ותחנה במפה."
                : `${questionCount.toLocaleString("he-IL")} שאלות תרגול, ${examCount} מועדי רישוי, מפות ועזרי למידה. ההתקדמות נשמרת בחשבון.`}
            </p>
            {d.hasHistory && (
              <p className={s.tally}>
                <span>
                  <b>{d.answered.toLocaleString("he-IL")}</b> שאלות נענו
                </span>
                {d.accuracy !== null && (
                  <span>
                    <b>{d.accuracy}%</b> הצלחה
                  </span>
                )}
              </p>
            )}
            <InkCompass className={s.compass} />
          </div>

          <nav aria-label="השביל של היום" className={s.trail}>
            <TopoPatch className={s.trailTopo} />
            <svg aria-hidden className={s.trailSvg} viewBox="0 0 400 520">
              <TrailLine d={WIDE} id="trail-wide" className={s.wide} />
              <TrailLine d={NARROW} id="trail-narrow" className={s.narrow} />
            </svg>
            <InkTree className={`${s.doodle} ${s.tree}`} />
            <InkRuin className={`${s.doodle} ${s.ruin}`} />
            <p aria-hidden className={s.margin}>
              מתחילים כאן
              <InkArrow className={s.marginArrow} />
            </p>
            <ol className={s.stations}>
              {stations.map((st, i) => (
                <li key={st.href} className={s.station} style={{ "--i": i } as React.CSSProperties}>
                  <Link href={st.href} className={s.sign}>
                    <span className={s.signLabel}>
                      <InkIcon name={st.icon} size={30} />
                      {st.label}
                    </span>
                    <span className={st.alert ? `${s.signDetail} ${s.alert}` : s.signDetail}>{st.detail}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <NotePaper className={s.note} />
        </section>

        <div className={s.band} data-zone="">
          <Prints
            shape="boot"
            from={{ x: 940, y: 60 }}
            c1={{ x: 700, y: 260 }}
            c2={{ x: 380, y: 20 }}
            to={{ x: 60, y: 230 }}
            steps={15}
            size={1.9}
            spread={13}
            className={s.fill}
          />
        </div>

        <section aria-labelledby="legend-title" className={s.legend}>
          <h2 id="legend-title" className={s.legendTitle}>
            מקרא: כל מה שיש בתרמיל
          </h2>
          <ul className={s.legendGrid}>
            {HOME_SECTIONS.map((x) => (
              <li key={x.slug}>
                <Link href={x.href} className={s.legendItem}>
                  <span className={s.legendIcon}>
                    <InkIcon name={x.icon} size={34} />
                  </span>
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
          <div className={s.legendFoot}>
            <span className={s.scaleBar} aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>קנה מידה 1:50,000</span>
            <span>קווי גובה: ירושלים והעיר העתיקה</span>
          </div>
        </section>

        <div className={`${s.band} ${s.bandTall}`} data-zone="">
          <Waypoints className={s.fill} />
        </div>

        <footer className={s.lockup}>
          <Birds className={s.lockupBirds} />
          <InkLockup height={170} className={s.lockupMark} />
          <div className={s.lockupTracks} data-zone="">
            <Prints
              shape="hoof"
              from={{ x: 80, y: 220 }}
              c1={{ x: 300, y: 60 }}
              c2={{ x: 560, y: 260 }}
              to={{ x: 930, y: 90 }}
              steps={16}
              size={1.5}
              spread={8}
              className={s.fill}
            />
          </div>
        </footer>
      </main>
    </FinalFrame>
  );
}
