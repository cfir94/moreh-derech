"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ModelId, ModelOptions, Viewer } from "./three/scenes";
import { cx, Info, Seg, styles, type PartInfo } from "./shared";
import { ORDER_PARTS } from "./OrdersLab";
import { TEMPLE_PARTS } from "./TemplesLab";
import studio from "./Studio.module.css";

type Status = "loading" | "ready" | "failed";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A three.js stage. The scene module (and three.js with it) is imported only
 * when this mounts, so the rest of the page never pays for it.
 */
function Viewer3D({ model, options, parts, intro, children }: { model: ModelId; options: ModelOptions; parts: Record<string, PartInfo>; intro: PartInfo; children?: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const latest = useRef({ model, options });
  const [status, setStatus] = useState<Status>("loading");
  const [hover, setHover] = useState<{ part: string; x: number; y: number } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [spin, setSpin] = useState(true);
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    let disposed = false;
    import("./three/scenes").then(({ createViewer }) => {
      if (disposed || !host.current) return;
      try {
        const v = createViewer(host.current, {
          onHover: (part, x, y) => setHover(part ? { part, x, y } : null),
          onPick: (part) => setPicked(part),
        });
        viewer.current = v;
        v.setModel(latest.current.model, latest.current.options);
        const spinning = !prefersReducedMotion();
        v.setAutoRotate(spinning);
        setSpin(spinning);
        setStatus("ready");
      } catch {
        setStatus("failed");
      }
    }).catch(() => setStatus("failed"));
    return () => { disposed = true; viewer.current?.dispose(); viewer.current = null; };
  }, []);

  useEffect(() => {
    latest.current = { model, options };
    viewer.current?.setModel(model, options);
  // optionsKey stands for options, which is a fresh object every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, optionsKey]);

  useEffect(() => { viewer.current?.highlight(picked); }, [picked, status]);

  const info = picked && parts[picked] ? parts[picked] : intro;
  const ids = Object.keys(parts);

  return <div className={styles.lab}>
    <div className={studio.stage3d}>
      <div ref={host} className={studio.canvasHost} role="img" aria-label={`מודל תלת־ממדי: ${intro.title}. גררו לסיבוב, גלגלו או צבטו לזום.`} />
      {status === "loading" && <div className={studio.stageNote} role="status"><span className={studio.spinner} aria-hidden />בונה את המודל…</div>}
      {status === "failed" && <div className={studio.stageNote} role="status">הדפדפן הזה לא מציג תלת־ממד. אפשר לעבור לשרטוט בלשונית הבאה.</div>}
      {hover && parts[hover.part] && <div className={studio.tooltip} style={{ transform: `translate(${hover.x}px, ${hover.y}px)` }}>{parts[hover.part].title}</div>}
      <div className={studio.stageBar}>
        <span className={studio.hint}>גררו לסיבוב · גלגלת לזום · הקישו על חלק</span>
        <button type="button" onClick={() => { const next = !spin; setSpin(next); viewer.current?.setAutoRotate(next); }} aria-pressed={spin}>{spin ? "עצירת סיבוב" : "סיבוב אוטומטי"}</button>
        <button type="button" onClick={() => viewer.current?.resetView()}>מבט מלא</button>
      </div>
    </div>
    <div className={studio.side}>
      {children && <div className={studio.modelControls}>{children}</div>}
      <Info info={info} label={picked ? "החלק שנבחר" : "המודל"} />
      <ul className={styles.partList}>{ids.map((id, i) => <li key={id}><button type="button" aria-pressed={picked === id} onClick={() => setPicked(picked === id ? null : id)}><span aria-hidden>{i + 1}</span>{parts[id].title}</button></li>)}</ul>
    </div>
  </div>;
}

/* ---------------- the four models ---------------- */

type Order = "doric" | "ionic" | "corinthian";
const ORDER_TITLES: Record<Order, string> = { doric: "דורי", ionic: "יוני", corinthian: "קורינתי" };
const ORDER_INTRO: Record<Order, PartInfo> = {
  doric: { title: "עמוד דורי", text: "גוץ וכבד — יחס של כ־1:5.5 בין הקוטר לגובה. צומח ישר מן הסטילובט בלי בסיס, כותרת חלקה, ובאפריז טריגליפים ומטופות.", site: "קבר יאסון ברחביה; קבר בני חזיר" },
  ionic: { title: "עמוד יוני", text: "צר יותר (כ־1:9), עומד על בסיס, ובכותרת שתי וולוטות. הסתובבו סביבו: מן הצד הוולוטות הופכות ל'כרית' שעוברת מקדימה לאחור.", site: "יד אבשלום" },
  corinthian: { title: "עמוד קורינתי", text: "הדק והמפואר (כ־1:10): כותרת גבוהה עטופה בשתי שורות עלי אקנתוס — קוציץ סורי — ובפינות סלסלים קטנים.", site: "כותרות קורינתיות בכל עיר רומית בארץ" },
};

export function Column3D() {
  const [order, setOrder] = useState<Order>("ionic");
  const [entasis, setEntasis] = useState(false);
  const [pedestal, setPedestal] = useState(false);
  const parts: Record<string, PartInfo> = {};
  const ids = ["stylobate", ...(pedestal ? ["pedestal"] : []), ...(order === "doric" ? [] : ["base"]), "shaft", "capital", "architrave", "frieze", "cornice"] as (keyof typeof ORDER_PARTS)[];
  for (const id of ids) {
    const p = ORDER_PARTS[id];
    parts[id] = { ...p, text: `${p.text} — ${ORDER_TITLES[order]}: ${p.per[["doric", "ionic", "corinthian"].indexOf(order)]}.` };
  }
  return <Viewer3D model="column" options={{ order, entasis, pedestal }} parts={parts} intro={ORDER_INTRO[order]}>
    <Seg label="סדר" value={order} onChange={setOrder} options={(Object.keys(ORDER_TITLES) as Order[]).map((id) => ({ id, title: ORDER_TITLES[id] }))} />
    <label className={styles.toggle}><input type="checkbox" checked={entasis} onChange={(e) => setEntasis(e.target.checked)} />אנטזיס מוגזם</label>
    <label className={styles.toggle}><input type="checkbox" checked={pedestal} onChange={(e) => setPedestal(e.target.checked)} />פדסטל</label>
  </Viewer3D>;
}

type Kind = "greek" | "roman" | "tholos";
const TEMPLE_INTRO: Record<Kind, PartInfo> = {
  greek: { title: "מקדש יווני", text: "מוקף עמודים ומדרגות מכל ארבעת הצדדים — הסתובבו סביבו ונסו למצוא את הכניסה. 'הסירו את הגג' כדי לראות שפסל האל עומד בחדר סגור בלב טור העמודים.", site: "אין בארץ; דוגמה: מקדש הפייסטוס באתונה" },
  roman: { title: "מקדש רומי", text: "על פודיום גבוה, עם מדרגות רק מקדימה ואכסדרת עמודים עמוקה: מבנה צירי שנבנה להיראות מן החזית.", site: "מקדש רומא ואוגוסטוס בקיסריה; חורבת עומרית; תל קדש" },
  tholos: { title: "טולוס", text: "מבנה עגול מוקף עמודים — מקדש (דלפי, הרקולס ברומא) ובהמשך גם קבר.", site: "ראש יד אבשלום הוא סוג של טולוס" },
};
const ROOF: PartInfo = { title: "גג, גמלון ואקרוטריות", text: "מערכת הקורות והגג המשולש. בחזית — הגמלון והטימפנון, ובראשו ובפינותיו — האקרוטריות." };

export function Temple3D() {
  const [kind, setKind] = useState<Kind>("greek");
  const [cutaway, setCutaway] = useState(false);
  const own = TEMPLE_PARTS[kind];
  const parts: Record<string, PartInfo> = {};
  for (const id of ["steps", "podium", "colonnade", "porch", "cella", "statue"] as const) if (own[id]) parts[id] = own[id]!;
  if (!cutaway) parts.roof = ROOF;
  return <Viewer3D model="temple" options={{ kind, cutaway }} parts={parts} intro={TEMPLE_INTRO[kind]}>
    <Seg label="טיפוס" value={kind} onChange={setKind} options={[{ id: "greek", title: "יווני" }, { id: "roman", title: "רומי" }, { id: "tholos", title: "טולוס" }]} />
    <label className={styles.toggle}><input type="checkbox" checked={cutaway} onChange={(e) => setCutaway(e.target.checked)} />להסיר את הגג</label>
  </Viewer3D>;
}

const PANTHEON: Record<string, PartInfo> = {
  dome: { title: "הכיפה", text: "כיפת בטון אדירה. הגומחות (הקסטות) שבתוכה מקלות על משקלה בלי לפגוע ביציבות." },
  oculus: { title: "האוקולוס", latin: "oculus", text: "'עין': פתח עגול בראש הכיפה, שמכניס אור, אוויר — וגם גשם." },
  rotunda: { title: "הרוטונדה", text: "האולם העגול. מבנה רכזי — הדגם שישמש אחר כך גם כנסיות הנצחה, כמו הרוטונדה בכנסיית הקבר." },
  portico: { title: "האכסדרה", text: "חזית מקדש רגילה — עמודים קורינתיים וגמלון — שהוצמדה לרוטונדה." },
  beam: { title: "קרן השמש", text: "האוקולוס הוא החלון היחיד. הזיזו את השעה וראו את כתם האור נודד על הרצפה ועל הקירות." },
};

export function Pantheon3D() {
  const [hour, setHour] = useState(11);
  const [cutaway, setCutaway] = useState(true);
  return <Viewer3D model="pantheon" options={{ hour, cutaway }} parts={PANTHEON} intro={{ title: "הפנתאון ברומא", text: "שיא השפה הרומית: קשת שסובבה סביב צירה הופכת לכיפה. במבנה הזה — שהוקדש כנראה לכל האלים — האדריכלות היוונית של עמוד וקורה פוגשת את הקמרון והכיפה הרומיים." }}>
    <label className={styles.range}>שעה ביום: <b>{hour}:00</b><input type="range" min={7} max={17} value={hour} onChange={(e) => setHour(Number(e.target.value))} /></label>
    <label className={styles.toggle}><input type="checkbox" checked={cutaway} onChange={(e) => setCutaway(e.target.checked)} />חתך — להציץ פנימה</label>
  </Viewer3D>;
}

const AQUEDUCT: Record<string, PartInfo> = {
  arches: { title: "תעלת הורדוס", text: "שורת קשתות ששומרת על מפלס קבוע מעל השטח הנמוך. הקשת מעבירה את משקל התעלה אל העמודים.", site: "האמה העליונה, חוף האקוודוקט בקיסריה" },
  hadrian: { title: "התעלה של אדריאנוס", text: "בימי אדריאנוס (כ־130) נבנתה תעלה שנייה צמודה לראשונה — והכפילה את כמות המים לעיר.", site: "קיסריה — שתי התעלות נראות זו לצד זו" },
  channel: { title: "התעלה", text: "על גבי הקשתות — תעלה פתוחה עם דפנות, בשיפוע קל מאוד." },
  water: { title: "המים", text: "זורמים בכוח הכובד בלבד, מן המעיינות שבמרחק קילומטרים." },
  inscription: { title: "כתובת הלגיון", text: "בקשתות אמת המים של קיסריה קבועות כתובות של הלגיונות שבנו ושיפצו אותה — בהן הלגיון העשירי." },
};

export function Aqueduct3D() {
  const [doubled, setDoubled] = useState(true);
  const parts = Object.fromEntries(Object.entries(AQUEDUCT).filter(([id]) => doubled || id !== "hadrian"));
  return <Viewer3D model="aqueduct" options={{ doubled }} parts={parts} intro={{ title: "אמת המים העליונה לקיסריה", text: "תעלת הורדוס, ובימי אדריאנוס — תעלה שנייה צמודה. כבו את התעלה השנייה וראו את האמה כפי שבנה אותה הורדוס.", site: "חוף האקוודוקט בקיסריה" }}>
    <label className={cx(styles.toggle)}><input type="checkbox" checked={doubled} onChange={(e) => setDoubled(e.target.checked)} />התעלה השנייה (אדריאנוס)</label>
  </Viewer3D>;
}
