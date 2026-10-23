"use client";

import { useState } from "react";
import { cx, Info, Section, PartList, Plate, Seg, styles, usePick, type PartInfo } from "./shared";

type Order = "doric" | "ionic" | "corinthian";
type Part = "acroteria" | "pediment" | "tympanum" | "cornice" | "frieze" | "architrave" | "capital" | "shaft" | "fluting" | "entasis" | "base" | "pedestal" | "stylobate";

const ORDERS: { id: Order; title: string; cx: number }[] = [
  { id: "doric", title: "דורי", cx: 500 },
  { id: "ionic", title: "יוני", cx: 300 },
  { id: "corinthian", title: "קורינתי", cx: 100 },
];

export const ORDER_PARTS: Record<Part, PartInfo & { per: [string, string, string] }> = {
  acroteria: { title: "אקרוטריות", latin: "acroteria", text: "פסלים או עיטורים על ראש הגמלון ובשתי פינותיו — 'כתר' לחזית.", per: ["כן", "כן", "כן"] },
  pediment: { title: "גמלון", latin: "pediment", text: "הגג המשולש שבחזית המקדש. דמיינו את המשך המבנה — כל החזית חוזרת על עצמה בסימטריה.", per: ["נמוך ורחב", "דומה", "דומה, עשיר בעיטור"] },
  tympanum: { title: "טימפנון", latin: "tympanon", text: "השדה המשולש שבתוך הגמלון — מקום לפסלים: קרבות, אלים, חיות מיתולוגיות.", per: ["פסלים", "פסלים", "פסלים"] },
  cornice: { title: "כרכוב", latin: "cornice", text: "השפה הבולטת שבראש מערכת הקורות, מתחת לגמלון — מרחיקה את מי הגשם מן הקיר.", per: ["פשוט", "עם שיניים (דנטילים)", "עם שיניים ותומכות"] },
  frieze: { title: "אפריז", latin: "frieze", text: "הרצועה שמעל הארכיטרב. בדורי — טריגליפים (שלושה פסים) ומטופות (הלוחות שביניהם); ביוני ובקורינתי — רצועה רציפה של תבליט.", per: ["טריגליפים ומטופות", "רצועה רציפה", "רצועה רציפה, לרוב צמחית"] },
  architrave: { title: "ארכיטרב", latin: "architrave", text: "קורת האבן שנחה ישירות על הכותרות — חיקוי באבן לקורת העץ של המבנים הקדומים.", per: ["חלק", "שלוש רצועות", "שלוש רצועות"] },
  capital: { title: "כותרת", latin: "capital", text: "ראש העמוד — סימן הזיהוי הבולט ביותר. הסתכלו קודם כל עליה.", per: ["חלקה: 'כרית' ולוח", "שתי וולוטות (שבלולים)", "עלי אקנתוס — קוציץ סורי"] },
  shaft: { title: "גוף העמוד", latin: "shaft", text: "היחס בין גובה העמוד לקוטרו קובע את האופי: הדורי גוץ וכבד, היוני צר יותר, הקורינתי הדק והאלגנטי מכולם.", per: ["≈1:5.5 — גוץ", "≈1:9", "≈1:10 — הדק ביותר"] },
  fluting: { title: "חריצים", latin: "fluting", text: "חריצים אנכיים לאורך העמוד, כמו קפלי שמלה. נותנים חן ומשווים לעמוד מראה רזה וגבוה יותר.", per: ["חריצים בחוד חד", "חריצים עם רצועה ביניהם", "כמו ביוני"] },
  entasis: { title: "אנטזיס", latin: "entasis", text: "עיבוי קל במרכז העמוד, כאילו הוא 'מתאמץ' תחת המשקל — השליה אופטית. בשרטוט העיבוי מוגזם כדי שיהיה אפשר לראות אותו.", per: ["בולט", "עדין", "עדין"] },
  base: { title: "בסיס", latin: "base", text: "הטבעות שבתחתית העמוד. העמוד הדורי 'צומח' ישר מן הסטילובט — בלי בסיס.", per: ["אין בסיס!", "יש", "יש"] },
  pedestal: { title: "פדסטל", latin: "pedestal", text: "כַּן מוגבה מתחת לבסיס. הוא אינו חלק מן העמוד — הוא מגביה אותו. בארץ: שער הניצחון הרומי מתחת לשער שכם.", per: ["אפשרי", "אפשרי", "אפשרי"] },
  stylobate: { title: "סטילובט", latin: "stylobate", text: "המדרגה העליונה שעליה עומדים העמודים. לפעמים מעל כמה מדרגות, ולפעמים רק רצועה מוגבהת ברצפה — כמו בבתי כנסת ובכנסיות.", per: ["כן", "כן", "כן"] },
};

const IDS = Object.keys(ORDER_PARTS) as Part[];

/** A column shaft with optional entasis, as a single closed path. */
function shaftPath(c: number, yb: number, yt: number, wb: number, wt: number, bulge: number) {
  const ym = (yb + yt) / 2;
  const half = (wb + wt) / 4;
  return `M${c - wb / 2} ${yb} Q${c - half - bulge * 2} ${ym} ${c - wt / 2} ${yt} L${c + wt / 2} ${yt} Q${c + half + bulge * 2} ${ym} ${c + wb / 2} ${yb} Z`;
}

const GEO: Record<Order, { capTop: number; capBot: number; shaftBot: number; wb: number; wt: number; flutes: number }> = {
  doric: { capTop: 160, capBot: 184, shaftBot: 410, wb: 46, wt: 36, flutes: 5 },
  ionic: { capTop: 160, capBot: 180, shaftBot: 396, wb: 28, wt: 24, flutes: 4 },
  corinthian: { capTop: 160, capBot: 198, shaftBot: 396, wb: 25, wt: 22, flutes: 4 },
};

export function Capital({ order, c, top = 160 }: { order: Order; c: number; top?: number }) {
  if (order === "doric") return <>
    <rect x={c - 30} y={top} width={60} height={8} />
    <path d={`M${c - 28} ${top + 8} Q${c - 26} ${top + 22} ${c - 18} ${top + 24} L${c + 18} ${top + 24} Q${c + 26} ${top + 22} ${c + 28} ${top + 8} Z`} />
  </>;
  if (order === "ionic") return <>
    <rect x={c - 22} y={top} width={44} height={4} />
    <path d={`M${c - 26} ${top + 4} L${c + 26} ${top + 4} L${c + 24} ${top + 12} Q${c} ${top + 22} ${c - 24} ${top + 12} Z`} />
    {[-1, 1].map((side) => <g key={side}>
      <circle cx={c + side * 22} cy={top + 13} r={9} />
      <path className={styles.ln} d={`M${c + side * 22} ${top + 13} m0 -5 a5 5 0 1 ${side > 0 ? 1 : 0} 0.1 0 m0 2 a3 3 0 1 ${side > 0 ? 0 : 1} 0.1 0`} />
    </g>)}
  </>;
  return <>
    <path d={`M${c - 12} ${top + 38} L${c - 18} ${top + 8} L${c + 18} ${top + 8} L${c + 12} ${top + 38} Z`} />
    {[-14, -5, 5, 14].map((dx) => { const s = dx > 0 ? 1 : -1; return <path key={`l${dx}`} d={`M${c + dx} ${top + 38} q${7 * s} -9 ${3 * s} -18 q${-6 * s} 7 ${-3 * s} 18 Z`} />; })}
    {[-9, 0, 9].map((dx) => <path key={`u${dx}`} d={`M${c + dx} ${top + 24} q5 -8 2 -15 q-6 6 -2 15 Z`} />)}
    {[-1, 1].map((side) => <circle key={side} cx={c + side * 19} cy={top + 9} r={3.5} />)}
    <path d={`M${c - 24} ${top} L${c + 24} ${top} L${c + 21} ${top + 8} L${c - 21} ${top + 8} Z`} />
  </>;
}

function Column({ order, c, bind, entasis }: { order: Order; c: number; bind: ReturnType<typeof usePick<Part>>["bind"]; entasis: boolean }) {
  const g = GEO[order];
  const bulge = entasis ? (order === "doric" ? 5 : 3.5) : 0;
  const flutes = Array.from({ length: g.flutes }, (_, i) => -0.7 + (1.4 * i) / (g.flutes - 1));
  const name = ORDERS.find((o) => o.id === order)!.title;
  return <g>
    {/* pediment and tympanum */}
    <g {...bind("pediment", `גמלון — ${name}`)}><path d={`M${c - 86} 102 L${c} 62 L${c + 86} 102 Z`} /></g>
    <g {...bind("tympanum", `טימפנון — ${name}`)}><path d={`M${c - 70} 98 L${c} 70 L${c + 70} 98 Z`} /></g>
    <g {...bind("acroteria", `אקרוטריות — ${name}`)}>
      <path d={`M${c} 64 l-7 -4 q7 -18 14 0 Z`} />
      <path d={`M${c - 86} 102 l0 -12 l10 0 Z`} /><path d={`M${c + 86} 102 l0 -12 l-10 0 Z`} />
    </g>
    {/* entablature */}
    <g {...bind("cornice", `כרכוב — ${name}`)}>
      <rect x={c - 88} y={102} width={176} height={10} />
      {order !== "doric" && Array.from({ length: 22 }, (_, i) => <rect key={i} x={c - 84 + i * 7.7} y={112} width={4} height={4} />)}
    </g>
    <g {...bind("frieze", `אפריז — ${name}`)}>
      <rect x={c - 80} y={order === "doric" ? 112 : 116} width={160} height={order === "doric" ? 26 : 22} />
      {order === "doric"
        ? Array.from({ length: 5 }, (_, i) => <g key={i}>
          <rect x={c - 80 + i * 37} y={112} width={12} height={26} className={styles.dark} />
          <path className={styles.ln} d={`M${c - 76 + i * 37} 114v22M${c - 72 + i * 37} 114v22`} />
          {i < 4 && <circle cx={c - 55.5 + i * 37} cy={125} r={6} className={styles.ln} />}
        </g>)
        : <path className={styles.ln} d={`M${c - 76} 127 ${Array.from({ length: 8 }, (_, i) => `q9 ${i % 2 ? 7 : -7} 19 0`).join(" ")}`} />}
    </g>
    <g {...bind("architrave", `ארכיטרב — ${name}`)}>
      <rect x={c - 80} y={138} width={160} height={22} />
      {order !== "doric" && <path className={styles.ln} d={`M${c - 80} 145h160M${c - 80} 152h160`} />}
    </g>
    {/* column */}
    <g {...bind("capital", `כותרת — ${name}`)}><Capital order={order} c={c} /></g>
    <g {...bind("shaft", `גוף העמוד — ${name}`)}><path d={shaftPath(c, g.shaftBot, g.capBot, g.wb, g.wt, bulge)} /></g>
    <g {...bind("fluting", `חריצים — ${name}`, styles.flutes)}>
      {flutes.map((f) => {
        const xb = c + (f * g.wb) / 2, xt = c + (f * g.wt) / 2;
        const xm = c + f * ((g.wb + g.wt) / 4 + bulge * 2);
        return <path key={f} className={styles.ln} d={`M${xb} ${g.shaftBot - 2} Q${xm} ${(g.shaftBot + g.capBot) / 2} ${xt} ${g.capBot + 2}`} />;
      })}
    </g>
    {order !== "doric" && <g {...bind("base", `בסיס — ${name}`)}>
      <path d={`M${c - 21} 410 l0 -4 q2 -5 4 -5 l34 0 q2 0 4 5 l0 4 Z`} />
      <path d={`M${c - 17} 401 q0 -5 4 -5 l26 0 q4 0 4 5 Z`} />
    </g>}
  </g>;
}

export function OrdersLab() {
  const pick = usePick<Part>("capital");
  const [view, setView] = useState<"all" | Order>("all");
  const [pedestal, setPedestal] = useState(false);
  const [entasisOn, setEntasisOn] = useState(false);
  const entasis = entasisOn || pick.active === "entasis";
  const shown = view === "all" ? ORDERS : ORDERS.filter((o) => o.id === view);
  const viewBox = view === "all" ? "0 0 600 470" : `${ORDERS.find((o) => o.id === view)!.cx - 115} 0 230 470`;
  const info = ORDER_PARTS[pick.active];

  const choose = (id: Part) => {
    pick.setActive(id);
    if (id === "pedestal") setPedestal(true);
  };

  return <Plate id="orders" numeral="I" title="הסדרים — דורי, יוני, קורינתי" lead={<>&quot;סדר&quot; הוא יותר מסגנון: בחירת העמוד קובעת גם את הכותרת, את העיטורים שמעליה ואת הפרופורציות. העבירו את העכבר (או הקישו) על חלקי השרטוט — אותו חלק יידלק בשלושת הסדרים יחד.</>}>
    <Section title="השוואה בשרטוט">
    <div className={styles.controls}>
      <Seg label="אילו סדרים להציג" value={view} onChange={setView} options={[{ id: "all", title: "השוואה" }, ...ORDERS.map((o) => ({ id: o.id, title: o.title }))]} />
      <label className={styles.toggle}><input type="checkbox" checked={pedestal} onChange={(e) => setPedestal(e.target.checked)} />פדסטל</label>
      <label className={styles.toggle}><input type="checkbox" checked={entasisOn} onChange={(e) => setEntasisOn(e.target.checked)} />אנטזיס (מוגזם)</label>
    </div>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox={viewBox} className={styles.svg} role="img" aria-label="שרטוט משווה של שלושת הסדרים">
          <g {...pick.bind("stylobate", "סטילובט")}>
            <rect x={6} y={410} width={588} height={10} /><rect x={0} y={420} width={600} height={10} /><rect x={-6} y={430} width={612} height={12} />
          </g>
          {pedestal && <g {...pick.bind("pedestal", "פדסטל")}>{shown.map((o) => <g key={o.id}><rect x={o.cx - 30} y={370} width={60} height={40} /><rect x={o.cx - 34} y={366} width={68} height={6} /></g>)}</g>}
          <g transform={pedestal ? "translate(0 -40)" : undefined}>
            {shown.map((o) => <Column key={o.id} order={o.id} c={o.cx} bind={pick.bind} entasis={entasis} />)}
          </g>
          {shown.map((o) => <text key={o.id} x={o.cx} y={464} textAnchor="middle" className={styles.svgLabel}>{o.title}</text>)}
        </svg>
        <figcaption className={styles.caption}>שרטוט סכמטי. הרוחב של כל עמוד משקף את היחס בין גובהו לקוטרו.</figcaption>
      </figure>
      <Info info={info}>
        <table className={styles.perOrder}>
          <tbody>{ORDERS.map((o, i) => <tr key={o.id}><th>{o.title}</th><td>{ORDER_PARTS[pick.active].per[i]}</td></tr>)}</tbody>
        </table>
      </Info>
    </div>
    <PartList ids={IDS} info={ORDER_PARTS} active={pick.active} onPick={choose} />
    </Section>
    <Section title="זהו את הסדר">
    <OrderQuiz />
    <div className={styles.cards3}>
      <article className={styles.miniCard}><h4>קבר יאסון, רחביה</h4><p>כותרת <b>דורית</b> בחזית — חלקה ופשוטה.</p></article>
      <article className={styles.miniCard}><h4>קבר בני חזיר, נחל קדרון</h4><p>שני עמודים <b>דוריים</b> בין שתי מזוזות — &quot;דיסטילוס אין אנטיס&quot;.</p></article>
      <article className={styles.miniCard}><h4>יד אבשלום, נחל קדרון</h4><p>כותרות <b>יוניות</b> עם וולוטות — ומעליהן אפריז דורי של טריגליפים ומטופות, בלי דמויות.</p></article>
    </div>
    </Section>
  </Plate>;
}

function OrderQuiz() {
  const [target, setTarget] = useState<Order>("ionic");
  const [answer, setAnswer] = useState<Order | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const guess = (id: Order) => {
    if (answer) return;
    setAnswer(id);
    setScore((s) => ({ right: s.right + (id === target ? 1 : 0), total: s.total + 1 }));
  };
  const next = () => {
    const pool = ORDERS.map((o) => o.id).filter((id) => id !== target);
    setTarget(pool[Math.floor(Math.random() * pool.length)]);
    setAnswer(null);
  };
  return <div className={styles.quiz}>
    <div className={styles.quizArt}>
      <svg viewBox="64 154 72 48" className={cx(styles.svg, styles.still)} role="img" aria-label="כותרת לזיהוי"><Capital order={target} c={100} /></svg>
    </div>
    <div className={styles.quizBody}>
      <p className={styles.quizQ}>זהו את הסדר לפי הכותרת:</p>
      <div className={styles.quizOptions}>{ORDERS.map((o) => <button key={o.id} type="button" onClick={() => guess(o.id)} className={cx(answer && o.id === target && styles.right, answer === o.id && o.id !== target && styles.wrong)}>{o.title}</button>)}</div>
      <p className={styles.quizStatus} role="status">{answer ? (answer === target ? "נכון!" : `לא — זו כותרת ${ORDERS.find((o) => o.id === target)!.title}`) : " "} <span>{score.right}/{score.total}</span></p>
      {answer && <button type="button" className={styles.linkBtn} onClick={next}>כותרת אחרת ←</button>}
    </div>
  </div>;
}
