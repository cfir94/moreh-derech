"use client";

import { useState } from "react";
import { cx, Info, Plate, Seg, styles, usePick, type PartInfo } from "./shared";

/* ------------------------------ IV. roads ------------------------------ */

type RoadPart = "paving" | "fill" | "gravel" | "bedding" | "curb" | "ditch" | "rock" | "steps";
const ROAD: Record<RoadPart, PartInfo> = {
  paving: { title: "אבני הריצוף", text: "אבנים גדולות ומהודקות, בגב מעוגל קלות כדי שמי הגשם יזרמו לצדדים. ברחובות העיר — גם מדרכות ואבני מעבר לחציית הרחוב ביום גשם (כמו בפומפיי)." },
  fill: { title: "שכבת מילוי דקה", text: "חצץ דק וטיט — מצע ישר לאבני הריצוף." },
  gravel: { title: "שכבת חצץ", text: "אבנים בינוניות וחצץ, לפיזור העומס של עגלות וצבא." },
  bedding: { title: "תשתית", text: "אבנים גדולות על קרקע מיושרת. כך שמרו על מפלס הדרך בשטח לא אחיד." },
  curb: { title: "אבני שפה", text: "תוחמות את הדרך ומונעות מהריצוף 'לברוח' לצדדים." },
  ditch: { title: "תעלות ניקוז", text: "משני הצדדים, כדי שהמים לא יערערו את הדרך." },
  rock: { title: "דרך חצובה בסלע", text: "הפתרון הפשוט ביותר בהר: מגלחים את הסלע עצמו. כך נראית 'דרך הקיסר' ליד ירושלים, בדרך לחברון ולבית גוברין — היום מסלול הליכה." },
  steps: { title: "מדרגות חצובות", text: "בקטעים תלולים החציבה יצרה מדרגות, עם דפנות סלע מימין ומשמאל." },
};

function toRoman(n: number) {
  const table: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [value, glyph] of table) while (n >= value) { out += glyph; n -= value; }
  return out;
}

export function RoadsLab() {
  const [mode, setMode] = useState<"built" | "rock">("built");
  const pick = usePick<RoadPart>("paving");
  const [miles, setMiles] = useState(7);
  const choose = (m: "built" | "rock") => { setMode(m); pick.setActive(m === "rock" ? "rock" : "paving"); };

  return <Plate id="roads" numeral="IV" title="סלילת דרכים ואבני מיל" lead="הרומאים רישתו את האימפריה בדרכים: לתנועת הצבא, לסחורות ולהעברת המסים לרומא. כך נבנתה דרך — וכך ספרו אותה.">
    <div className={styles.controls}><Seg label="סוג דרך" value={mode} onChange={choose} options={[{ id: "built", title: "דרך בנויה בשכבות" }, { id: "rock", title: "דרך חצובה בסלע" }]} /></div>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 500 220" className={styles.svg} role="img" aria-label="חתך דרך רומית">
          {mode === "built" ? <>
            <path className={styles.earth} d="M0 120h500v100H0Z" />
            <g {...pick.bind("ditch", "תעלות ניקוז")}><path d="M10 120q20 30 40 0Z M450 120q20 30 40 0Z" className={styles.water} /></g>
            <g {...pick.bind("bedding", "תשתית")}><rect x={70} y={150} width={360} height={40} />{Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={92 + i * 40} cy={170} rx={17} ry={13} className={styles.dark} />)}</g>
            <g {...pick.bind("gravel", "שכבת חצץ")}><rect x={70} y={124} width={360} height={26} />{Array.from({ length: 24 }, (_, i) => <circle key={i} cx={80 + i * 15} cy={137 + (i % 3) * 3 - 3} r={4} className={styles.dark} />)}</g>
            <g {...pick.bind("fill", "שכבת מילוי")}><rect x={70} y={108} width={360} height={16} /></g>
            <g {...pick.bind("paving", "ריצוף")}>{Array.from({ length: 9 }, (_, i) => { const x = 74 + i * 39.5; const lift = 8 - Math.abs(i - 4) * 2; return <rect key={i} x={x} y={88 - lift} width={37} height={20 + lift} rx={4} />; })}</g>
            <g {...pick.bind("curb", "אבני שפה")}><rect x={56} y={72} width={16} height={76} /><rect x={428} y={72} width={16} height={76} /></g>
          </> : <>
            <g {...pick.bind("rock", "סלע חצוב")}><path d="M0 40h90v150h320V40h90v180H0Z" className={styles.earth} /><path className={styles.ln} d="M90 40v150M410 40v150" /></g>
            <g {...pick.bind("steps", "מדרגות")}>{[0, 1, 2, 3].map((i) => <rect key={i} x={90} y={110 + i * 20} width={320} height={20 - 0} className={i % 2 ? styles.dark : undefined} />)}</g>
            <text x={250} y={100} textAnchor="middle" className={styles.svgLabel}>מבט אל המדרגות בחתך הסלע</text>
          </>}
        </svg>
        <figcaption className={styles.caption}>{mode === "built" ? "חתך כללי של דרך רומית בנויה. לא כל דרך נבנתה בכל השכבות." : "דרך הקיסר ליד ירושלים — מן התקופה הרומית המאוחרת."}</figcaption>
      </figure>
      <Info info={ROAD[pick.active]} />
    </div>
    <div className={styles.milestone}>
      <div className={styles.mileStone} aria-hidden>
        <span>IMP · CAES</span><strong>{toRoman(miles)}</strong><span>M · P</span>
      </div>
      <div>
        <h3 className={styles.subTitle}>אבן מיל — מיליה פאסום</h3>
        <label className={styles.range}>מיל מן הפורום: <b>{miles}</b>
          <input type="range" min={1} max={20} value={miles} onChange={(e) => setMiles(Number(e.target.value))} />
        </label>
        <p className={styles.mileOut}>{miles} מיל ≈ <b>{(miles * 1.48).toFixed(1)} ק״מ</b> · {(miles * 1000).toLocaleString("he-IL")} צעדים</p>
        <p>מיל הוא <b>אלף צעדים</b> (milia passuum). המודדים יצאו עם עגלות, ומדדו את המרחק <b>מן הפורום</b> של העיר — לא משערה. על האבן נחקקו מספר המיל ושם הקיסר, ולכן היא גם <b>תעמולה</b>; כשהדרך שופצה מדדו שוב והציבו אבנים חדשות — ומכאן <b>ריכוזי אבני מיל</b>, כמו בגבעת ישעיהו שבשפלה ובדרך לחברון.</p>
        <p className={styles.small}>מפת פויטינגר — העתק מימי הביניים של מפת הדרכים הרומית — מראה את &quot;Aelia Capitolina&quot;, את הר הזיתים ואת רשת הדרכים שבין הערים.</p>
      </div>
    </div>
  </Plate>;
}

/* ------------------------------ V. water ------------------------------ */

type Station = "spring" | "hill" | "settling" | "valley" | "castellum" | "consumers";
const STATIONS: Record<Station, PartInfo> = {
  spring: { title: "1 · המעיין", text: "מקור המים יכול להיות במרחק עשרות קילומטרים. מכאן המים זורמים בכוח הכובד בלבד, בשיפוע קל מאוד — בממוצע לאורך הדרך, לא בכל נקודה." },
  hill: { title: "2 · מכשול: גבעה", text: "שני פתרונות: לעקוף את הגבעה לפי קו הגובה (הפשוט והנפוץ), או לחצוב מנהרה. חוצבים משני הקצוות, ופירים אנכיים מחלקים את העבודה לעוד חזיתות, מכניסים אוויר ואור ומאפשרים לסלק את הפסולת למעלה.", site: "מנהרת ארמון הנציב — שישה פירים, באמה התחתונה לירושלים" },
  settling: { title: "3 · בריכת שיקוע", text: "המים מזדהמים בדרך. בבריכה הם נחים, הלכלוך שוקע, והמים העליונים ממשיכים — ניקוי אוטומטי, בלי מגע יד אדם." },
  valley: { title: "4 · מכשול: עמק", text: "בתעלה פתוחה מים לא יעלו בחזרה. פתרון אחד — גשר קשתות ששומר על המפלס. פתרון שני — סיפון הפוך (גיכון): צינור סגור יורד ועולה, מעט נמוך יותר, לפי חוק הכלים השלובים. צינור חרס היה מתפוצץ, ולכן חוליות אבן.", site: "קשתות קיסריה; חוליות הסיפון של האמה העליונה לירושלים במוזיאון ישראל" },
  castellum: { title: "5 · קסטלום", text: "בפתח העיר: מבנה ויסות שמפצל את המים בצנרת לצרכנים השונים." },
  consumers: { title: "6 · הצרכנים", text: "בתי עשירים (רק הם קיבלו מים הביתה), מזרקות ונימפיאונים בפינות הרחובות, ובתי המרחץ — הצרכנים הגדולים ביותר." },
};

export function WaterLab() {
  const pick = usePick<Station>("spring");
  const [hill, setHill] = useState<"tunnel" | "detour">("tunnel");
  const [valley, setValley] = useState<"bridge" | "siphon">("bridge");
  const ids = Object.keys(STATIONS) as Station[];
  const level = (x: number) => 92 + (x - 40) * 0.13;

  return <Plate id="water" numeral="V" title="אמות מים — מהמעיין אל העיר" lead="הטכנולוגיה שאפשרה לערים לרדת מן התלים: להביא מים ממרחק במקום לשבת ליד המעיין. עקבו אחרי המים ובחרו איך לעבור כל מכשול.">
    <div className={styles.controls}>
      <Seg label="מעבר הגבעה" value={hill} onChange={(v) => { setHill(v); pick.setActive("hill"); }} options={[{ id: "tunnel", title: "מנהרה ופירים" }, { id: "detour", title: "עקיפה" }]} />
      <Seg label="מעבר העמק" value={valley} onChange={(v) => { setValley(v); pick.setActive("valley"); }} options={[{ id: "bridge", title: "גשר קשתות" }, { id: "siphon", title: "סיפון הפוך" }]} />
    </div>
    <figure className={cx(styles.figure, styles.wide)}>
      <svg viewBox="0 0 700 300" className={styles.svg} role="img" aria-label="מסלול אמת מים">
        <path className={styles.earth} d="M0 60 L60 72 L120 112 L170 100 L225 34 L285 100 L330 128 L410 140 L450 246 L500 254 L545 168 L700 184 L700 300 L0 300 Z" />
        <g {...pick.bind("spring", "מעיין")}><circle cx={40} cy={92} r={10} className={styles.water} /><path className={styles.ln} d="M34 84q6 -10 12 0" /></g>
        <g {...pick.bind("hill", "גבעה")}>
          {hill === "tunnel" ? <>
            <path className={styles.tunnel} d={`M168 ${level(168)} L292 ${level(292)}`} />
            {[196, 226, 256].map((x) => <path key={x} className={cx(styles.ln, styles.shaft)} d={`M${x} ${x < 225 ? 34 + (225 - x) * 1.1 + 4 : 34 + (x - 225) * 1.1 + 4} V${level(x)}`} />)}
          </> : <>
            <g transform="translate(560 6)"><rect width={130} height={82} rx={4} className={styles.inset} /><ellipse cx={60} cy={44} rx={40} ry={26} className={styles.ln} /><ellipse cx={60} cy={44} rx={24} ry={14} className={styles.ln} /><path className={cx(styles.ln, styles.waterLine)} d="M6 60 C20 74 100 82 110 60 C116 46 120 30 126 22" /><text x={65} y={78} textAnchor="middle" className={styles.svgLabel}>מבט מלמעלה</text></g>
            <path className={cx(styles.ln, styles.waterLine)} d={`M168 ${level(168)} L292 ${level(292)}`} strokeDasharray="2 6" />
          </>}
        </g>
        <path className={styles.flow} d={`M40 92 L168 ${level(168)} ${hill === "tunnel" ? "" : "M292 " + level(292)} L292 ${level(292)} L420 ${level(420)}`} />
        <g {...pick.bind("settling", "בריכת שיקוע")}><rect x={330} y={level(330) - 2} width={40} height={20} className={styles.water} /><path className={styles.ln} d={`M330 ${level(330) + 14}h40`} strokeDasharray="2 3" /></g>
        <g {...pick.bind("valley", "עמק")}>
          {valley === "bridge" ? <>
            <rect x={420} y={level(420) - 2} width={128} height={8} />
            {Array.from({ length: 6 }, (_, i) => { const x = 422 + i * 21; const ground = x < 450 ? 140 + (x - 410) * 2.6 : x < 500 ? 250 : 254 - (x - 500) * 1.9; return <path key={i} d={`M${x} ${ground} V${level(420) + 22} a9 9 0 0 1 18 0 V${ground} Z`} className={styles.dark} />; })}
            <path className={styles.flow} d={`M420 ${level(420)} L548 ${level(548)}`} />
          </> : <>
            <path className={styles.pipe} d={`M420 ${level(420)} L452 236 L500 244 L546 ${level(546) + 4}`} />
            <path className={styles.flow} d={`M420 ${level(420)} L452 236 L500 244 L546 ${level(546) + 4}`} />
            {[460, 474, 488].map((x) => <rect key={x} x={x} y={232} width={12} height={10} className={styles.dark} />)}
          </>}
        </g>
        <path className={styles.flow} d={`M548 ${level(548)} L600 ${level(600)}`} />
        <g {...pick.bind("castellum", "קסטלום")}><rect x={596} y={level(600) - 12} width={30} height={26} /></g>
        <g {...pick.bind("consumers", "צרכנים")}>
          <path className={cx(styles.ln, styles.waterLine)} d={`M626 ${level(600)} H650 V210 M626 ${level(600) + 6} H640 V250 M626 ${level(600) + 10} H680 V270`} />
          <path d="M640 196l12 -10 12 10v14h-24Z" /><circle cx={642} cy={252} r={7} className={styles.water} /><rect x={668} y={266} width={24} height={14} className={styles.water} />
        </g>
      </svg>
      <figcaption className={styles.caption}>חתך אורך סכמטי — לפי השרטוט שהוצג בהרצאה.</figcaption>
    </figure>
    <ul className={styles.stepper}>{ids.map((id) => <li key={id}><button type="button" aria-pressed={pick.active === id} onClick={() => pick.setActive(id)}>{STATIONS[id].title}</button></li>)}</ul>
    <Info info={STATIONS[pick.active]} label="תחנה" />
    <div className={styles.periods}>
      <article><h4>הלניסטית־חשמונאית</h4><p>הובלת מים ממרחק מוכרת בארץ בהיקף רחב מן התקופה הזו — לארמונות החשמונאים ביריחו ולמבצרי המדבר.</p></article>
      <article><h4>רומית</h4><p><b>קיסריה, האמה העליונה:</b> תעלת הורדוס, שהוכפלה בימי אדריאנוס (כ־130) בידי חיילי הלגיונות — כתובותיהם בקשתות. <b>ירושלים:</b> האמה העליונה (עם הסיפון ההפוך) והתחתונה (מנהרת ארמון הנציב).</p></article>
      <article><h4>ביזנטית</h4><p><b>קיסריה, האמה התחתונה (הנמוכה):</b> מסכר נחל תנינים, מקורה לכל אורכה לשמירה על ניקיון — אפשר ללכת בתוכה. האמות שירתו את העיר, בתיקונים, מאות שנים.</p></article>
    </div>
    <p className={styles.small}>במנהרת ארמון הנציב רואים שתי אמות: החלק המקורי, מימי בית שני, הוא רק העליון והרדוד; הרצפה הונמכה בידי הטורקים סביב 1900.</p>
  </Plate>;
}
