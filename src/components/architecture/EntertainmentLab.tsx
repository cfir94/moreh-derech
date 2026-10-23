"use client";

import { useEffect, useState } from "react";
import { cx, Info, Section, Plate, Seg, styles, usePick, type PartInfo } from "./shared";

type TPart = "scaenae" | "pulpitum" | "proscaenium" | "orchestra" | "ima" | "media" | "summa" | "aditus" | "vomitorium" | "ambulacrum";

export const THEATRE: Record<TPart, PartInfo & { n: number }> = {
  scaenae: { n: 1, title: "סקנה פרונס", latin: "scaenae frons", text: "הקיר שמאחורי הבמה, מול הקהל — קיר התפאורה, בכמה קומות ועם פתחים. בתיאטרון הרומי הוא גבוה וחוסם לגמרי את הנוף: הקהל 'נכנס' אל העולם הרומי. מכאן המילה 'סצנה'." },
  pulpitum: { n: 3, title: "פולפיטום — הבמה", latin: "pulpitum", text: "הבמה שעליה עמדו השחקנים — החלק בתיאטרון הרומי שבו נערכה ההופעה. בתוכן: אצל היוונים טרגדיות וקומדיות; אצל הרומאים יותר פנטומימה וחיקויים." },
  proscaenium: { n: 4, title: "פרוסקניון", latin: "proscaenium", text: "חזית הבמה, הפונה לאורכסטרה. בגומחות שבה עמדו פסלי אלים וגיבורים." },
  orchestra: { n: 5, title: "אורכסטרה", latin: "orchestra", text: "הרחבה שלפני הבמה. בתיאטרון הקלאסי עמדה בה המקהלה. ביווני היא עיגול שלם; ברומי — חצי עיגול." },
  ima: { n: 6, title: "קוואה תחתונה", latin: "ima cavea", text: "גושי המושבים נקראים קוואה. התחתון — לנכבדים: ככל שקרוב יותר לבמה, מעמדך גבוה יותר. החלוקה המעמדית נשמרת." },
  media: { n: 6, title: "קוואה אמצעית", latin: "media cavea", text: "הגוש האמצעי. בממצא נשמר לרוב רק החלק התחתון, לפעמים קומה שנייה." },
  summa: { n: 6, title: "קוואה עליונה", latin: "summa cavea", text: "הגוש העליון — לפחות בני המזל. לרוב לא שרד." },
  aditus: { n: 7, title: "אדיטוס מקסימוס", latin: "aditus maximus", text: "הכניסות הצדדיות, בין המושבים לבמה — דרכן נכנסו המכובדים ישירות אל המושבים התחתונים." },
  vomitorium: { n: 8, title: "וומיטוריום", latin: "vomitorium", text: "פתח בתוך גוש המושבים, דרכו נכנס הקהל ויצא. מלטינית — 'להקיא': כביכול התיאטרון 'פולט' את הקהל החוצה." },
  ambulacrum: { n: 9, title: "אמבולקרום", latin: "ambulacrum", text: "המעבר המקיף. נכנסים דרך הוומיטוריום, הולכים לאורכו ובוחרים לעלות או לרדת אל המקום." },
};

const CX = 250, CY = 236;
function half(r1: number, r2: number, a1 = 180, a2 = 360) {
  const p = (r: number, a: number) => `${CX + r * Math.cos((a * Math.PI) / 180)} ${CY + r * Math.sin((a * Math.PI) / 180)}`;
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${p(r2, a1)} A${r2} ${r2} 0 ${large} 1 ${p(r2, a2)} L${p(r1, a2)} A${r1} ${r1} 0 ${large} 0 ${p(r1, a1)} Z`;
}

function TheatreLab() {
  const [kind, setKind] = useState<"roman" | "greek">("roman");
  const pick = usePick<TPart>("pulpitum");
  const greek = kind === "greek";
  const [a1, a2] = greek ? [160, 380] : [180, 360];
  const ids = Object.keys(THEATRE) as TPart[];
  const label = (id: TPart, x: number, y: number) => <g className={styles.badge} aria-hidden><circle cx={x} cy={y} r={9} /><text x={x} y={y + 4} textAnchor="middle">{THEATRE[id].n}</text></g>;

  return <div className={styles.sub}>
    <h3 className={styles.subTitle}>חלקי התיאטרון</h3>
    <div className={styles.controls}><Seg label="טיפוס תיאטרון" value={kind} onChange={setKind} options={[{ id: "roman", title: "רומי" }, { id: "greek", title: "יווני" }]} /></div>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 500 320" className={styles.svg} role="img" aria-label="תוכנית תיאטרון">
          {greek && <path className={cx(styles.ln, styles.contour)} d="M10 120 C120 0 380 0 490 120 M30 160 C140 50 360 50 470 160" />}
          {!greek && <g {...pick.bind("ambulacrum", "אמבולקרום")}><path d={half(212, 224)} /></g>}
          <g {...pick.bind("summa", "קוואה עליונה")}><path d={half(166, 210, a1, a2)} /></g>
          <g {...pick.bind("media", "קוואה אמצעית")}><path d={half(118, 162, a1, a2)} /></g>
          <g {...pick.bind("ima", "קוואה תחתונה")}><path d={half(70, 114, a1, a2)} /></g>
          <g className={styles.stairs} aria-hidden>{[200, 220, 240, 260, 280, 300, 320, 340].map((a) => <path key={a} d={`M${CX + 70 * Math.cos((a * Math.PI) / 180)} ${CY + 70 * Math.sin((a * Math.PI) / 180)} L${CX + 210 * Math.cos((a * Math.PI) / 180)} ${CY + 210 * Math.sin((a * Math.PI) / 180)}`} />)}</g>
          {!greek && <g {...pick.bind("vomitorium", "וומיטוריום")}>{[210, 250, 290, 330].map((a) => { const r = (a * Math.PI) / 180; return <rect key={a} x={CX + 140 * Math.cos(r) - 7} y={CY + 140 * Math.sin(r) - 7} width={14} height={14} className={styles.dark} transform={`rotate(${a + 90} ${CX + 140 * Math.cos(r)} ${CY + 140 * Math.sin(r)})`} />; })}</g>}
          <g {...pick.bind("orchestra", "אורכסטרה")}>{greek ? <circle cx={CX} cy={CY} r={64} /> : <path d={`M${CX - 64} ${CY} A64 64 0 0 1 ${CX + 64} ${CY} Z`} />}</g>
          {greek
            ? <g {...pick.bind("scaenae", "סקנה")}><rect x={170} y={304} width={160} height={14} /></g>
            : <>
              <g {...pick.bind("pulpitum", "פולפיטום")}><rect x={110} y={240} width={280} height={30} /></g>
              <g {...pick.bind("proscaenium", "פרוסקניון")}><rect x={110} y={236} width={280} height={6} className={styles.dark} />{[150, 200, 300, 350].map((x) => <path key={x} d={`M${x - 6} 242 a6 6 0 0 1 12 0Z`} />)}</g>
              <g {...pick.bind("scaenae", "סקנה פרונס")}><path d="M100 270h300v18h-300Z" className={styles.dark} />{[160, 250, 340].map((x) => <rect key={x} x={x - 9} y={270} width={18} height={18} className={styles.gap} />)}</g>
              <g {...pick.bind("aditus", "אדיטוס מקסימוס")}><rect x={30} y={236} width={78} height={16} /><rect x={392} y={236} width={78} height={16} /></g>
            </>}
          {!greek && <>{label("scaenae", 250, 302)}{label("pulpitum", 410, 262)}{label("proscaenium", 90, 230)}{label("orchestra", 250, 215)}{label("ima", 250, 140)}{label("aditus", 44, 266)}{label("vomitorium", 160, 108)}{label("ambulacrum", 250, 4 + 9)}</>}
        </svg>
        <figcaption className={styles.caption}>{greek ? "יווני: חצוב במדרון הגבעה, האורכסטרה עיגול שלם, הסקנה נמוכה." : "רומי: נבנה גם במישור על קמרונות; המספרים לפי השקופית של התיאטרון בבוסרה."}</figcaption>
      </figure>
      <Info info={greek && !["orchestra", "ima", "media", "summa", "scaenae"].includes(pick.active)
        ? { title: "התיאטרון היווני", text: "נחצב אל תוך גבעה קיימת ומשתמש בה כבסיס. לרומאים כבר היה הקמרון — ולכן יכלו לבנות תיאטרון שלם במישור." }
        : THEATRE[pick.active]} />
    </div>
    <ul className={styles.partList}>{ids.map((id) => <li key={id}><button type="button" aria-pressed={pick.active === id} onClick={() => pick.setActive(id)}><span aria-hidden>{THEATRE[id].n}</span>{THEATRE[id].title}</button></li>)}</ul>
    <p className={styles.small}>טעות נפוצה בשטח: בקיסריה ובטבריה נדמה שהקהל צפה בנוף הים או הכנרת. לא כך — השלימו בדמיון את הסקנה פרונס לגובה מלא: היא חסמה את המבט.</p>
  </div>;
}

/* hippodrome: an oval loop around the spina */
const TOP = 70, BOT = 150, LX = 150, RX = 430, R = 40, STRAIGHT = RX - LX, ARC = Math.PI * R, LAP = 2 * STRAIGHT + 2 * ARC, LAPS = 7;
function onTrack(s: number) {
  s = ((s % LAP) + LAP) % LAP;
  if (s < STRAIGHT) return { x: RX - s, y: TOP, a: 180 };
  s -= STRAIGHT;
  if (s < ARC) { const t = -Math.PI / 2 - s / R; return { x: LX + R * Math.cos(t), y: 110 + R * Math.sin(t), a: 180 + (s / ARC) * 180 }; }
  s -= ARC;
  if (s < STRAIGHT) return { x: LX + s, y: BOT, a: 0 };
  s -= STRAIGHT;
  const t = Math.PI / 2 - s / R;
  return { x: RX + R * Math.cos(t), y: 110 + R * Math.sin(t), a: -(s / ARC) * 180 };
}

type HPart = "carceres" | "spina" | "metaPrima" | "metaSecunda" | "seats" | "counter" | "wall";
export const HIPPO: Record<HPart, PartInfo> = {
  carceres: { title: "תאי ההזנקה", latin: "carceres", text: "המרכבות והסוסים ממתינים בתאים; עם האות — הם דוהרים החוצה. בהיפודרומים גדולים המסלול באורך 300–400 מ'." },
  spina: { title: "ספינה", latin: "spina", text: "'עמוד השדרה' — הקיר המרכזי שהמרכבות מקיפות כמה סיבובים. יכול להיות צר או רחב, פשוט או מפואר." },
  metaPrima: { title: "מטה פרימה", latin: "meta prima", text: "נקודת הסיבוב בקצה הרחוק מתאי ההזנקה — הראשונה שאליה מגיעים. כאן התהפכו מרכבות." },
  metaSecunda: { title: "מטה סקונדה", latin: "meta secunda", text: "נקודת הסיבוב השנייה, בקצה הקרוב לתאי ההזנקה." },
  seats: { title: "מושבי הקהל", text: "ובהם תא מיוחד לנכבדים. בקיסריה רואים עד היום את מושבי המכובדים." },
  counter: { title: "סופרי הסיבובים", text: "פסלי דולפינים (או אחרים) על הספינה: אדם מיוחד הפך אחד אחרי כל סיבוב, כדי שכל הקהל יידע היכן המרוץ." },
  wall: { title: "הסבה לאמפיתיאטרון", text: "בקיסריה ובבית שאן הוסב ההיפודרום לאמפיתיאטרון: קיר רוחב קיצר את הזירה כדי שהקהל יראה את המאבק, ובמושבים התחתונים נחצבו שקעים לעמודי עץ ורשתות שהגנו מפני החיות." },
};

function HippodromeLab() {
  const pick = usePick<HPart>("spina");
  const [converted, setConverted] = useState(false);
  const [race, setRace] = useState({ running: false, s: 0 });

  useEffect(() => {
    if (!race.running) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const s = Math.min(((now - start) / 2200) * LAP, LAPS * LAP);
      setRace({ running: s < LAPS * LAP, s });
      if (s < LAPS * LAP) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [race.running]);

  const laps = Math.min(LAPS, Math.floor(race.s / LAP));
  const car = onTrack(race.s);
  const finished = !race.running && race.s >= LAPS * LAP;

  return <div className={styles.sub}>
    <h3 className={styles.subTitle}>היפודרום — מרוץ מרכבות</h3>
    <div className={styles.controls}>
      <button type="button" className={styles.action} onClick={() => setRace({ running: true, s: 0 })} disabled={race.running}>{race.running ? `סיבוב ${laps + 1} מתוך ${LAPS}…` : finished ? "מרוץ חוזר" : "להזניק את המרכבה"}</button>
      <label className={styles.toggle}><input type="checkbox" checked={converted} onChange={(e) => { setConverted(e.target.checked); pick.setActive(e.target.checked ? "wall" : "spina"); }} />הסבה לאמפיתיאטרון</label>
    </div>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 600 220" className={styles.svg} role="img" aria-label="תוכנית היפודרום">
          <g {...pick.bind("seats", "מושבים")}><path d="M570 12 H110 A98 98 0 0 0 110 208 H570 V190 H110 A80 80 0 0 1 110 30 H570 Z" /><rect x={250} y={190} width={50} height={18} className={styles.dark} /></g>
          <path className={styles.arena} d="M560 30 H110 A80 80 0 0 0 110 190 H560 Z" />
          {converted && <g {...pick.bind("wall", "קיר הסבה")}><rect x={318} y={30} width={8} height={160} /><path className={styles.ln} d="M60 110 a50 70 0 0 1 250 0 a50 70 0 0 1 -250 0" strokeDasharray="4 4" />{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={120 + i * 17} cy={36} r={2} className={styles.dark} />)}</g>}
          <g {...pick.bind("spina", "ספינה")}><rect x={150} y={104} width={280} height={12} /></g>
          <g {...pick.bind("metaPrima", "מטה פרימה")}><path d="M150 98a12 12 0 0 0 0 24Z" />{[101, 110, 119].map((y) => <circle key={y} cx={144} cy={y} r={3} className={styles.dark} />)}</g>
          <g {...pick.bind("metaSecunda", "מטה סקונדה")}><path d="M430 98a12 12 0 0 1 0 24Z" />{[101, 110, 119].map((y) => <circle key={y} cx={436} cy={y} r={3} className={styles.dark} />)}</g>
          <g {...pick.bind("counter", "דולפינים")}>{Array.from({ length: LAPS }, (_, i) => <path key={i} className={i < laps ? styles.flipped : undefined} d={`M${236 + i * 16} 110 q5 -9 10 0 q-5 -3 -10 0Z`} />)}</g>
          <g {...pick.bind("carceres", "תאי הזנקה")}>{Array.from({ length: 12 }, (_, i) => <rect key={i} x={554 - Math.abs(i - 5.5) * 2} y={32 + i * 13} width={12} height={11} className={styles.dark} />)}</g>
          {(race.running || race.s > 0) && <g transform={`translate(${car.x} ${car.y}) rotate(${car.a})`} className={styles.chariot} aria-hidden><path d="M-8 -5 L6 0 L-8 5 Z" /><circle cx={-6} cy={0} r={3} /></g>}
          <text x={146} y={140} textAnchor="middle" className={styles.svgLabel}>prima</text>
          <text x={434} y={140} textAnchor="middle" className={styles.svgLabel}>secunda</text>
        </svg>
        <figcaption className={styles.caption} role="status">{race.running ? `סיבוב ${laps + 1}/${LAPS} — שימו לב לדולפינים שמתהפכים` : finished ? "המרוץ הסתיים: שבעה סיבובים." : "המרכבות יוצאות מתאי ההזנקה ומקיפות את הספינה נגד כיוון השעון."}</figcaption>
      </figure>
      <Info info={HIPPO[pick.active]} />
    </div>
  </div>;
}

const BUILDINGS = [
  { id: "theatre", title: "תיאטרון", shape: "M10 40a30 30 0 0 1 60 0Z", use: "הצגות", site: "בית שאן, קיסריה, טבריה" },
  { id: "odeon", title: "אודיאון", shape: "M20 40a20 20 0 0 1 40 0Z M16 18h48", use: "תיאטרון קטן ומקורה — מוזיקה", site: "בן דודו של התיאטרון" },
  { id: "bouleuterion", title: "בולאוטריון", shape: "M16 40h48v-20h-48Z M22 34a18 12 0 0 1 36 0", use: "אולם מועצת העיר", site: "בבית שאן — מבנה שזוהה כאודיאון או בולאוטריון" },
  { id: "stadium", title: "אצטדיון", shape: "M6 22h56a12 12 0 0 1 0 24H6Z", use: "ריצה ואתלטיקה", site: "ההיפו־סטדיום בקיסריה" },
  { id: "hippodrome", title: "היפודרום", shape: "M74 18H22a16 16 0 0 0 0 32h52Z M24 33h40", use: "מרוצי מרכבות", site: "קיסריה, בית שאן" },
  { id: "amphitheatre", title: "אמפיתיאטרון", shape: "M40 14a32 20 0 1 0 0.1 0Z M40 24a18 10 0 1 0 0.1 0Z", use: "מונרה: גלדיאטורים וחיות", site: "בית גוברין — נבנה ככזה" },
];

export function EntertainmentLab() {
  return <Plate id="entertainment" numeral="VI" title="מבני בידור" lead="תיאטרון, אודיאון, אצטדיון, היפודרום ואמפיתיאטרון. המחקר החדש זהיר בחלוקה החדה: אותו מבנה יכול היה לשמש לכמה מטרות — וגם להיות מוסב.">
    <Section title="סוגי המבנים">
    <div className={styles.buildings}>{BUILDINGS.map((b) => <article key={b.id} className={styles.building}>
      <svg viewBox="0 0 80 56" aria-hidden className={cx(styles.svg, styles.still)}><path d={b.shape} /></svg>
      <h4>{b.title}</h4><p>{b.use}</p><p className={styles.small}>{b.site}</p>
    </article>)}</div>
    </Section>
    <Section title="תיאטרון">
    <TheatreLab />
    </Section>
    <Section title="היפודרום">
    <HippodromeLab />
    </Section>
  </Plate>;
}
