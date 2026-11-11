"use client";

import Link from "next/link";
import { withBasePath } from "@/lib/basePath";
import { FieldIcon, type FieldIconName } from "./FieldIcons";
import { Footsteps } from "./Footsteps";
import { HOME_SECTIONS } from "./homeData";
import { MapUnfold } from "./MapUnfold";
import { NotePaper } from "./NotePaper";
import { useHomeData } from "./useHomeData";
import s from "./signs.module.css";

/*
 * גרסה א׳: "השלטים החומים". העולם הוא שילוט אתרי המורשת והגנים הלאומיים: פס שלט חום עם
 * מסגרת שמנת, פיקטוגרמות, ושלט הכוונה עם חצים לכל פרק. החום שמור לניווט בלבד. התוכן יושב
 * על לוח הסבר בהיר, והרקע הוא מפת קווי הגובה האמיתית של ירושלים, עם עקבות.
 */

type Props = { questionCount: number; examCount: number };

const NAV: { href: string; label: string; icon: FieldIconName }[] = [
  { href: "/design/signs/quiz", label: "שאלונים", icon: "quizzes" },
  { href: "/exams", label: "מבחנים", icon: "exams" },
  { href: "/map", label: "מפה", icon: "map" },
  { href: "/timelines", label: "עזרי למידה", icon: "timelines" },
  { href: "/games", label: "משחקים", icon: "games" },
];

export function SignsHome({ questionCount, examCount }: Props) {
  const d = useHomeData();

  const blades: { href: string; icon: FieldIconName; label: string; detail: string; alert?: boolean }[] = [
    d.reviewCount > 0
      ? { href: "/quizzes/review", icon: "review", label: "חזרה על טעויות", detail: `${d.reviewCount} ממתינות`, alert: true }
      : { href: "/quizzes", icon: "quizzes", label: "תרגול שאלות", detail: `${questionCount.toLocaleString("he-IL")} שאלות` },
    { href: "/exams", icon: "exams", label: "מבחן רישוי מלא", detail: `${examCount} מועדים` },
    { href: "/map/learn", icon: "map", label: "מפת הלמידה", detail: "מי בנה, מתי ואיפה" },
    { href: "/games/crossword", icon: "notes", label: "תשבץ השבוע", detail: "חדש בכל שישי" },
  ];

  return (
    <SignsFrame name={d.name} intro>
      <main className={s.main}>
        <section className={s.hero}>
          <Footsteps
            className={s.steps}
            from={{ x: 980, y: 560 }}
            c1={{ x: 760, y: 420 }}
            c2={{ x: 520, y: 600 }}
            to={{ x: 260, y: 300 }}
            steps={11}
            size={2.6}
          />

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
                ? "המפה, השאלות והטעויות שלך מחכים כאן. לאן ממשיכים היום?"
                : `${questionCount.toLocaleString("he-IL")} שאלות תרגול, ${examCount} מועדי רישוי, מפות ועזרי למידה. ההתקדמות נשמרת בחשבון.`}
            </p>
            {d.hasHistory && (
              <p className={s.km}>
                <span>
                  נענו <b>{d.answered.toLocaleString("he-IL")}</b> שאלות
                </span>
                {d.accuracy !== null && (
                  <span>
                    <b>{d.accuracy}%</b> הצלחה
                  </span>
                )}
              </p>
            )}
          </div>

          <nav aria-label="לאן ממשיכים" className={s.post}>
            <span aria-hidden className={s.pole} />
            {blades.map((b, i) => (
              <Link key={b.href} href={b.href} className={s.blade} style={{ "--tilt": `${[-1.2, 0.8, -0.5, 1.1][i]}deg` } as React.CSSProperties}>
                <span className={s.bladeFace}>
                  <FieldIcon name={b.icon} size={30} className={s.bladeIcon} />
                  <span className={s.bladeLabel}>{b.label}</span>
                  <span className={b.alert ? `${s.bladeDetail} ${s.alert}` : s.bladeDetail}>{b.detail}</span>
                </span>
              </Link>
            ))}
            <span aria-hidden className={s.stones} />
          </nav>

          <NotePaper className={s.note} />
        </section>

        <section aria-labelledby="board-title" className={s.board}>
          <h2 id="board-title" className={s.boardTitle}>
            כל מה שיש בתרמיל
          </h2>
          <ul className={s.grid}>
            {HOME_SECTIONS.map((x) => (
              <li key={x.slug}>
                <Link href={x.href} className={s.item}>
                  <span className={s.pict}>
                    <FieldIcon name={x.icon} size={26} />
                  </span>
                  <span className={s.itemText}>
                    <span className={s.itemTitle}>
                      {x.title}
                      {x.slug === "community" && d.unread > 0 && <span className={s.badge}>{d.unread}</span>}
                    </span>
                    <span className={s.itemLine}>{x.line}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </SignsFrame>
  );
}

/** The frame of version A: the contour ground and the brown sign band. Shared by every design page. */
export function SignsFrame({ name, intro = false, children }: { name: string | null; intro?: boolean; children: React.ReactNode }) {
  const topo = { "--topo": `url(${withBasePath("/design/jerusalem-topo.svg")})` } as React.CSSProperties;
  return (
    <div className={s.root} style={topo}>
      {intro && <MapUnfold variant="signs" always storageKey="md_intro_design_signs" />}
      <div aria-hidden className={s.topo} />

      <header className={s.band}>
        <div className={s.bandInner}>
          <Link href="/design/signs" className={s.brand}>
            <span className={s.mark}>
              <FieldIcon name="milestone" size={30} />
            </span>
            <span className={s.brandText}>
              <span className={s.brandName}>אבן דרך</span>
              <span className={s.brandSub}>למורי דרך</span>
            </span>
          </Link>
          <nav aria-label="ניווט ראשי" className={s.nav}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={s.navItem}>
                <FieldIcon name={n.icon} size={22} />
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/me" className={s.me}>
            <FieldIcon name="me" size={22} />
            {name ?? "כניסה"}
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
