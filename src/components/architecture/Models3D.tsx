"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ModelId, ModelOptions, Viewer } from "./three/scenes";
import { cx, Info, Seg, styles, type PartInfo } from "./shared";
import { ORDER_PARTS } from "./OrdersLab";
import { TEMPLE_PARTS } from "./TemplesLab";
import { ARCH } from "./CityLab";
import { ROAD } from "./RoadsWaterLab";
import { HIPPO, THEATRE } from "./EntertainmentLab";
import { ROOMS } from "./BathsDecorLab";
import { BURIAL, SARCOPHAGUS, WATER } from "./PurityBurialLab";
import { CHURCH, TYPES } from "./SacredLab";
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

/* ---------------- the second set: one model for every other chapter ---------------- */

const pick = <T extends PartInfo>(table: Record<string, T>, ids: string[]) => Object.fromEntries(ids.filter((id) => table[id]).map((id) => [id, table[id] as PartInfo]));

export function Arch3D() {
  return <Viewer3D model="arch" options={{}} parts={pick(ARCH, ["central", "side", "pedestal", "column", "inscription"])} intro={{ title: "שער ניצחון משולש", text: "קשת מרכזית גבוהה, שתי קשתות צד, עמודים על פדסטלים וכתובת למעלה — לפי הדגם של קשת ספטימיוס סוורוס ברומא. בירושלים שרד צד שמאל של שער כזה מתחת לשער שכם.", site: "שער שכם; אקה הומו" }} />;
}

export function Road3D() {
  const [miles, setMiles] = useState(7);
  const parts = { ...pick(ROAD, ["paving", "fill", "gravel", "bedding", "curb", "ditch"]), milestone: { title: "אבן מיל", latin: "milia passuum", text: `מיל ${miles}: על העמוד נחקקו שם הקיסר ומספר המיל מן הפורום — ולכן היא גם תעמולה.`, site: "גבעת ישעיהו; הדרך לחברון" } };
  return <Viewer3D model="road" options={{ miles }} parts={parts} intro={{ title: "דרך רומית בחתך", text: "שכבה על שכבה: תשתית אבנים גדולות, חצץ, מילוי דק ואבני ריצוף מעוגלות, בין אבני שפה ותעלות ניקוז. בצד — אבן מיל." }}>
    <label className={styles.range}>מיל מן הפורום: <b>{miles}</b><input type="range" min={1} max={20} value={miles} onChange={(e) => setMiles(Number(e.target.value))} /></label>
  </Viewer3D>;
}

export function Theatre3D() {
  const [full, setFull] = useState(true);
  return <Viewer3D model="theatre" options={{ fullScaena: full }} parts={pick(THEATRE, ["scaenae", "pulpitum", "proscaenium", "orchestra", "ima", "media", "summa", "aditus", "vomitorium", "ambulacrum"])} intro={{ title: "תיאטרון רומי", text: "חצי עיגול של שורות מושבים בשלושה גושים, אורכסטרה, במה, וקיר סקנה גבוה. כבו את 'הקיר בגובה מלא' כדי לראות אותו כפי שהוא בשטח היום — ואז דמיינו אותו חוסם את הנוף.", site: "בית שאן; קיסריה" }}>
    <label className={styles.toggle}><input type="checkbox" checked={full} onChange={(e) => setFull(e.target.checked)} />קיר הסקנה בגובה מלא</label>
  </Viewer3D>;
}

export function Hippodrome3D() {
  const [converted, setConverted] = useState(false);
  return <Viewer3D model="hippodrome" options={{ converted }} parts={pick(HIPPO, ["carceres", "spina", "metaPrima", "metaSecunda", "seats", "counter", ...(converted ? ["wall"] : [])])} intro={{ title: "היפודרום", text: "מרכבה מקיפה את הספינה שבעה סיבובים, ואחרי כל סיבוב דולפין על הספינה מתהפך. סמנו 'הסבה לאמפיתיאטרון' כדי לראות את קיר הרוחב שקיצר את הזירה.", site: "קיסריה; בית שאן" }}>
    <label className={styles.toggle}><input type="checkbox" checked={converted} onChange={(e) => setConverted(e.target.checked)} />הסבה לאמפיתיאטרון</label>
  </Viewer3D>;
}

export function Bath3D() {
  return <Viewer3D model="bath" options={{}} parts={pick(ROOMS, ["palaestra", "apodyterium", "frigidarium", "tepidarium", "caldarium", "hypocaust", "furnace"])} intro={{ title: "בית מרחץ בחתך", text: "מן הפלאסטרה אל הקלדריום. האש בתנור מחממת אוויר שזורם בין העמודונים שמתחת לרצפה — וממעל, אדים עולים מן הבריכה החמה.", site: "בית שאן; מצדה" }} />;
}

export function Mikveh3D() {
  const [water, setWater] = useState("clean");
  const next: Record<string, [string, string]> = { clean: ["dirty", "הקיץ עובר…"], dirty: ["drawn", "למלא במים שאובים"], drawn: ["kosher", "להסיר את הפקק"], kosher: ["clean", "מן ההתחלה"] };
  const state = WATER[water as keyof typeof WATER];
  const parts: Record<string, PartInfo> = {
    steps: { title: "מדרגות", text: "מדרגות רחבות יורדות אל בריכת הטבילה." },
    divider: { title: "קו מפריד", text: "נתיב לטמאים שיורדים ונתיב לטהורים שעולים — ההשערה המקובלת.", site: "קומראן" },
    pool: { title: "בריכת הטבילה", text: "40 סאה של מים שאינם שאובים — כמטר מעוקב לפי ההערכה המרבית." },
    water: { title: state.label, text: state.note },
    otzar: { title: "אוצר", text: "בור של מי גשמים כשרים. המגע במימיו מכשיר את מי המקווה." },
    pipe: { title: "הצינור והפקק", text: "כשהפקק מוסר, המים נוגעים זה בזה." },
  };
  return <Viewer3D model="mikveh" options={{ water }} parts={parts} intro={{ title: "מקווה עם אוצר", text: `${state.label}: ${state.note}` }}>
    <button type="button" className={styles.action} onClick={() => setWater(next[water][0])}>{next[water][1]}</button>
  </Viewer3D>;
}

const PHASES = ["קבורה ראשונה בכוך", "כשנה — הבשר נרקב", "ליקוט העצמות", "קבורה שנייה בגלוסקמה"];
export function Cave3D() {
  const [phase, setPhase] = useState(0);
  return <Viewer3D model="cave" options={{ phase }} parts={pick(BURIAL, ["kokh", "arcosolium", "smallKokh", "ossuary", "sarcophagus", "pit", "bench"])} intro={{ title: "מערת קבורה מימי בית שני", text: "בלי תקרה, כדי להציץ פנימה: כוכים בקירות, ארקוסוליום, בור עמידה וספסלים. עברו בין שלבי הקבורה וראו את הגלוסקמה נכנסת לכוך הקטן.", site: "קברי הסנהדרין" }}>
    <div className={studio.phaseRow}>{PHASES.map((p, i) => <button key={p} type="button" aria-pressed={phase === i} onClick={() => setPhase(i)}>{i + 1}. {p}</button>)}</div>
  </Viewer3D>;
}

export function Ossuary3D() {
  const [open, setOpen] = useState(true);
  const [xray, setXray] = useState(true);
  const parts: Record<string, PartInfo> = {
    femur: { title: "עצם הירך — קובעת את האורך", text: "העצם הארוכה בגוף, כ־45 ס״מ. הגלוסקמה ארוכה ממנה — ולכן אורכה כ־60 ס״מ." },
    pelvis: { title: "האגן — קובע את הרוחב", text: "העצם הרחבה בגוף. הגלוסקמה רחבה ממנו." },
    skull: { title: "הגולגולת — קובעת את הגובה", text: "העצם הגבוהה בגוף. הגלוסקמה גבוהה ממנה." },
    box: { title: "התיבה", text: "לרוב מאבן גיר רכה, לפעמים מעץ או מחומרים אחרים. קטנה מכדי להכיל אדם שלם — ולכן ודאי לקבורה שנייה." },
    rosettes: { title: "עיטור החזית", text: "רוזטות חרוטות במחוגה ומסגרת — העיטור הנפוץ. בגלוסקמאות מפוארות יש גם עיטור צמחי, כמו אשכולות ענבים." },
    lid: { title: "המכסה", text: "מכסה שטוח, משופע או מקומר. על חלק מהגלוסקמאות נחרט שם המת — ביוונית, בעברית או בארמית." },
    ...pick(BURIAL, ["ossuary"]),
  };
  return <Viewer3D model="ossuary" options={{ open: open ? 1 : 0, xray }} parts={parts} intro={{ title: "גלוסקמה — והעצמות שקובעות את מידותיה", text: "ארוכה מעצם הירך, רחבה מן האגן, גבוהה מן הגולגולת. רחפו על העצמות ועל קווי המידה, ופתחו את המכסה.", site: "גלוסקמאות מעוטרות במוזיאון ישראל" }}>
    <div className={studio.phaseRow}>
      <button type="button" aria-pressed={open} onClick={() => setOpen(!open)}>{open ? "לסגור את המכסה" : "לפתוח את המכסה"}</button>
      <button type="button" aria-pressed={xray} onClick={() => setXray(!xray)}>דפנות שקופות</button>
    </div>
  </Viewer3D>;
}

export function Sarcophagus3D() {
  const [open, setOpen] = useState(false);
  const [compare, setCompare] = useState(true);
  const parts: Record<string, PartInfo> = {
    chest: SARCOPHAGUS.sarcophagus,
    lid: SARCOPHAGUS.lid,
    acroteria: { title: "אקרוטריות — 'קרני' המכסה", text: "בליטות בפינות המכסה, כמו האקרוטריות שבפינות גג המקדש. נפוצות בסרקופגים של בית שערים." },
    garlands: { title: "זרים", text: "זרי פירות ועלים התלויים בין ראשי שוורים או עמודונים — מוטיב רומי נפוץ על סרקופגים." },
    rosettes: { title: "רוזטות", text: "פרח עגול בתוך לולאת הזר — אותו מוטיב שמעטר את הגלוסקמאות." },
    tabula: { title: "טבולה אנסטה", latin: "tabula ansata", text: "לוח כתובת עם 'אוזניים' משולשות, לשם הנקבר. לעיתים נשאר ריק." },
    lions: { title: "אריות", text: "בבית שערים גם יהודים קישטו סרקופגים בבעלי חיים: אריות, נשרים ושוורים." },
    body: SARCOPHAGUS.body,
    ossuary: SARCOPHAGUS.ossuary,
  };
  return <Viewer3D model="sarcophagus" options={{ open, compare }} parts={parts} intro={{ ...SARCOPHAGUS.sarcophagus, text: `${SARCOPHAGUS.sarcophagus.text} פתחו את המכסה, והשוו לגלוסקמה שלידו.` }}>
    <div className={studio.phaseRow}>
      <button type="button" aria-pressed={open} onClick={() => setOpen(!open)}>{open ? "לסגור את המכסה" : "להרים את המכסה"}</button>
      <button type="button" aria-pressed={compare} onClick={() => setCompare(!compare)}>גלוסקמה לצורך השוואה</button>
    </div>
  </Viewer3D>;
}

export function Synagogue3D() {
  const [cutaway, setCutaway] = useState(true);
  const parts: Record<string, PartInfo> = {
    facade: { title: "החזית לירושלים", text: "חזית מפוארת עם שלושה פתחים, הפונה דרומה — לכיוון ירושלים. המתפללים נכנסו ממנה, ואחר כך הסתובבו אליה." },
    columns: { title: "עמודים בשלושה צדדים", text: "שתי שורות לאורך האולם ושורה אחת מאחור — האולם מוקף עמודים בצורת ח." },
    benches: { title: "ספסלים", text: "ספסלים לאורך הקירות, כמו בבתי הכנסת הקדומים יותר." },
    hall: { title: "האולם", text: "רצפת אבן — לא פסיפס — כמו בכפר נחום ובברעם." },
    direction: { title: "הכיוון לירושלים", text: "בגליל ירושלים בדרום, ולכן החזית פונה דרומה. בדרום הר חברון — הקיר הצפוני הוא שפונה לירושלים." },
  };
  return <Viewer3D model="synagogue" options={{ cutaway }} parts={parts} intro={{ ...TYPES.galilean, title: "בית כנסת 'גלילי'" }}>
    <label className={styles.toggle}><input type="checkbox" checked={cutaway} onChange={(e) => setCutaway(e.target.checked)} />בלי גג</label>
  </Viewer3D>;
}

export function Basilica3D() {
  const [cutaway, setCutaway] = useState(true);
  return <Viewer3D model="basilica" options={{ cutaway }} parts={pick(CHURCH, ["atrium", "narthex", "nave", "aisles", "stylobates", "bema", "apse", "prothesis", "diaconicon"])} intro={{ title: "כנסייה בסיליקלית — בדגם כורסי", text: "מן האטריום דרך הנרתקס אל התווך הגבוה, עם חלונות מעל שורות העמודים, ועד שלוש האפסידות במזרח.", site: "כורסי" }}>
    <label className={styles.toggle}><input type="checkbox" checked={cutaway} onChange={(e) => setCutaway(e.target.checked)} />בלי גג</label>
  </Viewer3D>;
}
