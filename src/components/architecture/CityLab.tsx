"use client";

import { useState } from "react";
import { cx, Info, Plate, Seg, styles, usePick, type PartInfo } from "./shared";

type Variant = "ideal" | "jerusalem" | "sussita";
type Part = "wall" | "cardo" | "decumanus" | "tetrapylon" | "forum" | "basilica" | "insula" | "temple" | "theatre" | "baths" | "nymphaeum" | "aqueduct" | "arch" | "cardoEast" | "templeMount" | "sepulchre" | "eccehomo" | "damascus" | "hill";

const INFO: Record<Variant, Partial<Record<Part, PartInfo>>> = {
  ideal: {
    wall: { title: "חומה ושערים", text: "תוכנית היפודמית — רחובות שתי וערב, על שם האדריכל היווני היפודמוס. זו תוכנית אידאלית: יש ערים שנראות כך, ויש שהותאמו לה רק בחלקן." },
    cardo: { title: "קרדו מקסימוס", latin: "cardo", text: "רחוב האורך הראשי, בדרך כלל צפון–דרום: רחב, עם עמודים, חנויות ותהלוכות. 'קרדו' בלטינית — ציר של דלת. יש הרבה קרדינס, אבל אחד הוא 'הגדול'.", site: "ירושלים; אנטיפטריס (תל אפק)" },
    decumanus: { title: "דקומנוס מקסימוס", latin: "decumanus", text: "רחוב הרוחב הראשי, מזרח–מערב. יש בשם 'דקה' (עשר), אבל פירושו אינו ידוע.", site: "סוסיתא" },
    tetrapylon: { title: "טטרפילון", latin: "tetrapylon", text: "'ארבעה שערים': מבנה בצומת הקרדו והדקומנוס, שנכנסים דרכו לכיכר מארבעה צדדים. לא בכל עיר.", site: "בחו״ל: ג'רש ותדמור" },
    forum: { title: "פורום / אגורה", latin: "forum", text: "כיכר השוק — לב חיי העיר: מסחר, כינוס, פגישות. כאן היא צמודה לצומת, אבל זה לא חובה, ויש ערים עם כמה פורומים.", site: "האגורה ליד רחוב פלדיוס בבית שאן" },
    basilica: { title: "בסיליקה", latin: "basilica", text: "מבנה ציבורי אזרחי — למסחר ולמשפט. אולם מוארך ובקצהו אפסיס, שבו ישב השופט. רק מן המאה ה־4 נבנות כנסיות בצורה הזו." },
    insula: { title: "אינסולות", latin: "insula", text: "גושי בתים בין הרחובות — 'מבננים', לעתים בני כמה קומות ובהם עשרות ומאות דיירים.", site: "קיסריה" },
    temple: { title: "מקדש", text: "לרוב בקצה רחוב או פורום, על ציר ברור." },
    theatre: { title: "תיאטרון", text: "מבנה הבידור הקלאסי. ראו לוח VI." },
    baths: { title: "בית מרחץ", text: "לב החיים החברתיים של העיר הרומית. ראו לוח VII." },
    nymphaeum: { title: "נימפיאון", text: "מזרקה ציבורית מפוארת ברחוב הראשי, מוזנת מאמת המים." },
    aqueduct: { title: "אמת מים וקסטלום", text: "המים מגיעים ממרחק ומתפצלים בקסטלום — לבתים, למזרקות ולמרחצאות. ראו לוח V." },
    arch: { title: "שער ניצחון", text: "קשת הנצחה — לא שער בחומה. יכולה לעמוד מחוץ לעיר או בתוכה." },
  },
  jerusalem: {
    wall: { title: "איליה קפיטולינה", text: "ירושלים הרומית, פחות או יותר בתחום העיר העתיקה של היום. העיר בנויה משני גושים — הגבעה המערבית הגבוהה והאזור הנמוך של הר הבית — ולכן צריך שני רחובות אורך." },
    damascus: { title: "שער שכם", text: "משער שכם יוצאים שני הקרדינס. מתחתיו נחשף צד שמאל של שער ניצחון משולש של אדריאנוס: קשת, מזוזות, פדסטלים ובסיסי עמודים — וכתובת שמזכירה את איליה קפיטולינה." },
    cardo: { title: "הקרדו המערבי", text: "לאורך רחוב בית הבד של היום. ברובע היהודי נחשפו כ־200 מ' — אבל זו ההרחבה הביזנטית (כנראה יוסטיניאנוס, המאה ה־6); הקרדו הרומי הגיע עד אזור כנסיית הקבר." },
    cardoEast: { title: "הקרדו המזרחי", text: "לאורך רחוב הגיא (אל־ואד) — הקרדו הנמוך, בגיא שליד הר הבית." },
    decumanus: { title: "דקומנוס משוער", text: "רוב החוקרים סבורים שרחוב רוחב חצה את העיר ממזרח למערב, אבל שרידים ברורים שלו עוד לא נמצאו, והוא לא מופיע במפת מידבא." },
    templeMount: { title: "הר הבית", text: "לנקודת התמצאות." },
    eccehomo: { title: "קשת אקה הומו", text: "הקשת המרכזית של שער ניצחון משולש מעל ויה דולורוזה, ליד מנזר האחיות ציון. הקשת הימנית חבויה בכנסייה; השמאלית לא שרדה." },
    sepulchre: { title: "ליד כנסיית הקבר", text: "בכנסייה הרוסית על שם אלכסנדר נבסקי נחשפו שרידי קשת ניצחון שלישית." },
    arch: { title: "מצפון לשער שכם", text: "קשת ניצחון רביעית, מחוץ לעיר העתיקה של היום — אינה נראית כיום." },
  },
  sussita: {
    hill: { title: "סוסיתא (היפוס)", text: "עיר על ראש הר מוארך ממזרח לכנרת, מעל עין גב. נחפרת שנים רבות בידי אוניברסיטת חיפה." },
    decumanus: { title: "דקומנוס בלבד", text: "רחוב ראשי אחד, מזרח–מערב, לאורך ההר. העיר 'דמוית נקניק', ולכן אין צורך ברחוב צפון–דרום — אין קרדו מקסימוס." },
    forum: { title: "פורום", text: "כיכר העיר במרכז הדקומנוס." },
    wall: { title: "שערים במזרח ובמערב", text: "השערים בשני קצות הרחוב — דוגמה לסטייה מן הדגם ה'אידאלי' בגלל הטופוגרפיה." },
  },
};

const START: Record<Variant, Part> = { ideal: "cardo", jerusalem: "damascus", sussita: "decumanus" };

export function CityLab() {
  const [variant, setVariant] = useState<Variant>("ideal");
  const pick = usePick<Part>("cardo");
  const info = INFO[variant][pick.active] ?? INFO[variant][START[variant]]!;
  const choose = (v: Variant) => { setVariant(v); pick.setActive(START[v]); };
  const ids = Object.keys(INFO[variant]) as Part[];

  return <Plate id="city" numeral="III" title="תכנון העיר" lead="העיר הקלאסית היא עיר מתוכננת. השוו את התוכנית האידאלית לשתי ערים בארץ שסטו ממנה — ולמה.">
    <div className={styles.controls}>
      <Seg label="עיר" value={variant} onChange={choose} options={[{ id: "ideal", title: "התוכנית האידאלית" }, { id: "jerusalem", title: "ירושלים — שני קרדו" }, { id: "sussita", title: "סוסיתא — רק דקומנוס" }]} />
    </div>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 600 400" className={styles.svg} role="img" aria-label="תוכנית עיר">
          {variant === "ideal" && <IdealCity bind={pick.bind} />}
          {variant === "jerusalem" && <Jerusalem bind={pick.bind} />}
          {variant === "sussita" && <Sussita bind={pick.bind} />}
          <g className={styles.compass} aria-hidden><path d="M574 382v-26l-6 10M574 356l6 10" /><text x={574} y={350} textAnchor="middle">N</text></g>
        </svg>
      </figure>
      <Info info={info} />
    </div>
    <ul className={styles.partList}>{ids.map((id, i) => <li key={id}><button type="button" aria-pressed={pick.active === id} onClick={() => pick.setActive(id)}><span aria-hidden>{i + 1}</span>{INFO[variant][id]!.title}</button></li>)}</ul>
    <ConstructionLab />
    <ArchLab />
  </Plate>;
}

type Bind = ReturnType<typeof usePick<Part>>["bind"];

function Colonnade({ x1, y1, x2, y2, n }: { x1: number; y1: number; x2: number; y2: number; n: number }) {
  return <>{Array.from({ length: n }, (_, i) => <circle key={i} cx={x1 + ((x2 - x1) * i) / (n - 1)} cy={y1 + ((y2 - y1) * i) / (n - 1)} r={1.8} className={styles.dark} />)}</>;
}

function IdealCity({ bind }: { bind: Bind }) {
  const grid = [90, 160, 230, 370, 440, 510];
  return <>
    <g {...bind("wall", "חומה")}><rect x={20} y={20} width={560} height={330} className={styles.wall} /></g>
    <g className={styles.streets} aria-hidden>{grid.map((x) => <path key={`v${x}`} d={`M${x} 20v330`} />)}{[90, 140, 250, 300].map((y) => <path key={`h${y}`} d={`M20 ${y}h560`} />)}</g>
    <g {...bind("insula", "אינסולות")}>{[[30, 30], [100, 30], [170, 30], [30, 100], [100, 100], [30, 260], [100, 260], [170, 150], [240, 260], [450, 150], [520, 150], [450, 260], [520, 260], [240, 30]].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={50} height={y === 150 ? 40 : 30} />)}</g>
    <g {...bind("cardo", "קרדו")}><rect x={292} y={20} width={16} height={330} className={styles.street} /><Colonnade x1={289} y1={26} x2={289} y2={344} n={30} /><Colonnade x1={311} y1={26} x2={311} y2={344} n={30} /></g>
    <g {...bind("decumanus", "דקומנוס")}><rect x={20} y={189} width={560} height={14} className={styles.street} /><Colonnade x1={26} y1={186} x2={574} y2={186} n={50} /><Colonnade x1={26} y1={206} x2={574} y2={206} n={50} /></g>
    <g {...bind("tetrapylon", "טטרפילון")}>{[[286, 183], [306, 183], [286, 203], [306, 203]].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={8} height={8} className={styles.dark} />)}</g>
    <g {...bind("forum", "פורום")}><rect x={320} y={212} width={110} height={78} /><rect x={328} y={220} width={94} height={62} className={styles.dark} /></g>
    <g {...bind("basilica", "בסיליקה")}><rect x={440} y={212} width={70} height={36} /><path d="M510 218a12 12 0 0 1 0 24Z" /><path className={styles.ln} d="M446 222h58M446 238h58" /></g>
    <g {...bind("temple", "מקדש")}><rect x={330} y={36} width={40} height={46} /><rect x={330} y={82} width={40} height={6} className={styles.dark} /></g>
    <g {...bind("theatre", "תיאטרון")}><path d="M110 340a50 50 0 0 1 100 0Z" /><path className={styles.ln} d="M130 340a30 30 0 0 1 60 0" /></g>
    <g {...bind("baths", "בית מרחץ")}><rect x={440} y={36} width={80} height={46} />{[455, 480, 505].map((x) => <circle key={x} cx={x} cy={59} r={8} className={styles.water} />)}</g>
    <g {...bind("nymphaeum", "נימפיאון")}><path d="M276 110a12 12 0 0 1 0 24Z" transform="translate(0 0)" /><rect x={268} y={110} width={8} height={24} className={styles.water} /></g>
    <g {...bind("aqueduct", "אמת מים")}><path className={cx(styles.ln, styles.waterLine)} d="M600 6 L556 30" /><rect x={540} y={26} width={22} height={16} className={styles.water} /><path className={cx(styles.ln, styles.waterLine)} d="M540 34H470V82M540 34V110L311 110" /></g>
    <g {...bind("arch", "שער ניצחון")}><rect x={276} y={360} width={48} height={22} /><path d="M291 382v-10a9 9 0 0 1 18 0v10Z M279 382v-6a4 4 0 0 1 8 0v6Z M313 382v-6a4 4 0 0 1 8 0v6Z" className={styles.dark} /></g>
  </>;
}

function Jerusalem({ bind }: { bind: Bind }) {
  return <>
    <g {...bind("wall", "איליה קפיטולינה")}><path d="M70 60 L300 40 L520 70 L540 330 L330 360 L90 340 Z" className={styles.wall} /></g>
    <g {...bind("templeMount", "הר הבית")}><path d="M400 160 L520 150 L530 320 L410 330 Z" className={styles.dark} /><text x={465} y={245} textAnchor="middle" className={styles.svgLabel}>הר הבית</text></g>
    <g {...bind("decumanus", "דקומנוס משוער")}><path className={styles.ln} d="M80 190 L395 175" strokeDasharray="8 6" strokeWidth={6} /></g>
    <g {...bind("cardo", "הקרדו המערבי")}><path className={styles.streetPath} d="M300 46 L240 200 L232 345" /></g>
    <g {...bind("cardoEast", "הקרדו המזרחי")}><path className={styles.streetPath} d="M300 46 L360 190 L380 345" /></g>
    <g {...bind("damascus", "שער שכם")}><rect x={282} y={30} width={36} height={22} /><path d="M290 52v-8a5 5 0 0 1 10 0v8Z" className={styles.dark} /><circle cx={300} cy={66} r={6} /></g>
    <g {...bind("arch", "קשת מצפון לשער שכם")}><rect x={286} y={2} width={28} height={14} /><path d="M296 16v-5a4 4 0 0 1 8 0v5Z" className={styles.dark} /></g>
    <g {...bind("sepulchre", "קשת ליד כנסיית הקבר")}><circle cx={205} cy={150} r={16} /><rect x={226} y={142} width={22} height={14} /><path d="M233 156v-5a4 4 0 0 1 8 0v5Z" className={styles.dark} /></g>
    <g {...bind("eccehomo", "קשת אקה הומו")}><path className={styles.ln} d="M330 130 L410 140" strokeDasharray="3 4" /><rect x={378} y={128} width={30} height={16} /><path d="M386 144v-6a7 7 0 0 1 14 0v6Z" className={styles.dark} /></g>
    <text x={150} y={300} className={styles.svgLabel}>הגבעה המערבית</text>
  </>;
}

function Sussita({ bind }: { bind: Bind }) {
  return <>
    <g {...bind("hill", "סוסיתא")}><path d="M30 210 C70 140 210 120 320 130 C430 138 540 150 575 200 C540 260 420 270 300 268 C190 266 70 270 30 210 Z" className={styles.dark} /><path className={styles.ln} d="M10 230 C80 300 520 300 590 230" strokeDasharray="2 5" /><text x={300} y={310} textAnchor="middle" className={styles.svgLabel}>מדרונות תלולים — הכנרת ממערב</text></g>
    <g {...bind("wall", "שערים")}><path d="M44 196h24v24h-24Z M534 186h24v24h-24Z" /></g>
    <g {...bind("decumanus", "דקומנוס")}><path className={styles.streetPath} d="M68 208 C200 196 400 194 534 198" /><Colonnade x1={80} y1={200} x2={520} y2={190} n={40} /><Colonnade x1={80} y1={216} x2={520} y2={206} n={40} /></g>
    <g {...bind("forum", "פורום")}><rect x={300} y={140} width={80} height={46} /></g>
  </>;
}

type Tech = "lintel" | "arch" | "vault" | "dome";
const TECH: Record<Tech, PartInfo> = {
  lintel: { title: "עמוד וקורה", text: "האדריכלות היוונית: עמודים אנכיים וקורות אופקיות, קווים ישרים. הקורה מגבילה את המרחק בין העמודים." },
  arch: { title: "קשת", text: "אבני טריז שנלחצות זו אל זו ומעבירות את המשקל הצידה ולמטה. האבן העליונה — אבן הראשה — 'נועלת' את הקשת. בארץ הקשת אינה חידוש: כבר בברונזה התיכונה, בשערי דן ואשקלון." },
  vault: { title: "קמרון", text: "קשת רחבה, 'מוארכת' לעומק. ההופעה המחודשת של הקמרון היא מאפיין של התרבות הרומית — למשל שרשרת הקשתות של אמת המים בקיסריה, או תיאטרון שנבנה במישור על קמרונות." },
  dome: { title: "כיפה ואוקולוס", text: "קשת שסובבה סביב צירה. בכיפת הבטון של הפנתאון ברומא: גומחות (קסטות) שמקלות על המשקל, ובראשה אוקולוס — 'עין' פתוחה שמכניסה אור, אוויר וגם גשם." },
};

function ConstructionLab() {
  const [tech, setTech] = useState<Tech>("lintel");
  return <div className={styles.sub}>
    <h3 className={styles.subTitle}>מיוון לרומא: איך מקרים חלל?</h3>
    <div className={styles.controls}><Seg label="שיטת בנייה" value={tech} onChange={setTech} options={[{ id: "lintel", title: "עמוד וקורה" }, { id: "arch", title: "קשת" }, { id: "vault", title: "קמרון" }, { id: "dome", title: "כיפה" }]} /></div>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 400 220" className={cx(styles.svg, styles.still)} role="img" aria-label={TECH[tech].title}>
          <path className={styles.ln} d="M10 206h380" />
          {tech === "lintel" && <><rect x={90} y={70} width={30} height={136} /><rect x={280} y={70} width={30} height={136} /><rect x={70} y={46} width={260} height={24} /><path className={cx(styles.ln, styles.force)} d="M200 20v26M120 90v50M280 90v50" /></>}
          {tech === "arch" && <><rect x={90} y={110} width={40} height={96} /><rect x={270} y={110} width={40} height={96} />{Array.from({ length: 9 }, (_, i) => { const a1 = Math.PI - (i * Math.PI) / 9, a2 = Math.PI - ((i + 1) * Math.PI) / 9; const p = (a: number, r: number) => `${200 + Math.cos(a) * r} ${110 - Math.sin(a) * r}`; return <path key={i} className={i === 4 ? styles.dark : undefined} d={`M${p(a1, 70)} L${p(a1, 100)} L${p(a2, 100)} L${p(a2, 70)} Z`} />; })}<path className={cx(styles.ln, styles.force)} d="M200 0v14M120 120l-14 40M280 120l14 40" /></>}
          {tech === "vault" && <><path d="M110 206V120a90 90 0 0 1 180 0v86h-22v-86a68 68 0 0 0 -136 0v86Z" className={styles.dark} /><path className={styles.ln} d="M150 206V96a90 90 0 0 1 180 0v110M110 120l40 -24M290 120l40 -24M200 30l40 -24" strokeDasharray="4 4" /><path className={cx(styles.ln, styles.force)} d="M200 10v14M120 150l-14 40M280 150l14 40" /></>}
          {tech === "dome" && <><path d="M60 170a140 140 0 0 1 280 0Z" />{[0, 1, 2].map((row) => Array.from({ length: 7 - row }, (_, i) => { const a = Math.PI * (0.18 + (i * 0.64) / (6 - row)); const r = 120 - row * 30; return <rect key={`${row}-${i}`} x={200 + Math.cos(a) * r - 6} y={170 - Math.sin(a) * r - 5} width={12} height={10} className={styles.dark} />; }))}<rect x={182} y={26} width={36} height={8} className={styles.sky} /><path className={cx(styles.ln, styles.light)} d="M190 34 L170 170M210 34 L240 170" strokeDasharray="3 5" /><rect x={60} y={170} width={280} height={36} /><text x={200} y={20} textAnchor="middle" className={styles.svgLabel}>אוקולוס</text></>}
        </svg>
      </figure>
      <Info info={TECH[tech]} label="שיטת בנייה" />
    </div>
  </div>;
}

type ArchPart = "central" | "side" | "pedestal" | "column" | "inscription";
const ARCH: Record<ArchPart, PartInfo> = {
  central: { title: "הקשת המרכזית", text: "גבוהה ורחבה. באקה הומו בירושלים שרדה הקשת המרכזית מעל ויה דולורוזה." },
  side: { title: "קשתות הצד", text: "שתיים, סימטריות, נמוכות וצרות יותר. בשער שכם נחשף צד שמאל של שער משולש — המקבילה לקשת הקטנה שבקשת ספטימיוס סוורוס ברומא." },
  pedestal: { title: "פדסטלים", text: "בסיסי העמודים אינם על הרצפה — הם מוגבהים על כַּן. בשער שכם הבסיסים נשמרו על פדסטלים." },
  column: { title: "עמודים", text: "עמודים משני צדי השערים. בשער שכם נשארו רק בסיסיהם." },
  inscription: { title: "הכתובת (אטיקה)", text: "כתובת גדולה למעלה מספרת את סיפור הקמת השער. בשער שכם — הקדשה בשם הקולוניה איליה קפיטולינה, כנראה לכבוד אדריאנוס." },
};

function ArchLab() {
  const pick = usePick<ArchPart>("side");
  return <div className={styles.sub}>
    <h3 className={styles.subTitle}>אנטומיה של שער ניצחון — וארבעת השערים של ירושלים</h3>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 400 240" className={styles.svg} role="img" aria-label="שער ניצחון משולש">
          <rect x={40} y={60} width={320} height={170} className={styles.wall} />
          <g {...pick.bind("inscription", "כתובת")}><rect x={60} y={14} width={280} height={46} /><path className={styles.ln} d="M80 30h240M90 44h220" /></g>
          <g {...pick.bind("central", "קשת מרכזית")}><path d="M160 230V140a40 40 0 0 1 80 0v90Z" className={styles.dark} /></g>
          <g {...pick.bind("side", "קשתות צד")}><path d="M72 230v-56a22 22 0 0 1 44 0v56Z M284 230v-56a22 22 0 0 1 44 0v56Z" className={styles.dark} /></g>
          <g {...pick.bind("column", "עמודים")}>{[56, 128, 262, 334].map((x) => <rect key={x} x={x} y={74} width={10} height={124} />)}</g>
          <g {...pick.bind("pedestal", "פדסטלים")}>{[52, 124, 258, 330].map((x) => <rect key={x} x={x} y={198} width={18} height={32} />)}</g>
        </svg>
        <figcaption className={styles.caption}>לפי הדגם של קשת ספטימיוס סוורוס ברומא, שנשתמרה במלואה.</figcaption>
      </figure>
      <Info info={ARCH[pick.active]} />
    </div>
    <ol className={styles.numbered}>
      <li><b>שער שכם</b> — צד שמאל של שער משולש של אדריאנוס, עם פדסטלים וכתובת איליה קפיטולינה.</li>
      <li><b>אקה הומו</b> — הקשת המרכזית מעל ויה דולורוזה, ליד מנזר האחיות ציון.</li>
      <li><b>כנסיית אלכסנדר נבסקי</b> — שרידי קשת סמוך לכנסיית הקבר.</li>
      <li><b>מצפון לשער שכם</b> — מחוץ לעיר העתיקה של היום; אינה נראית כיום.</li>
    </ol>
  </div>;
}
