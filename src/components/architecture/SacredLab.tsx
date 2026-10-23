"use client";

import { useState } from "react";
import { cx, Info, Plate, Seg, styles, usePick, type PartInfo } from "./shared";

/* ------------------------------ XI. synagogues ------------------------------ */

type SType = "galilean" | "golan" | "basilical" | "hebron";
const TYPES: Record<SType, PartInfo & { short: string }> = {
  galilean: { title: "גליליים", short: "חזית לירושלים", text: "חזית מפוארת עם שלושה פתחים הפונה דרומה — לירושלים; אולם עם עמודים בשלושה צדדים ורצפת אבן. פעם נחשבו 'קדומים' (המאות 2–3), אבל מטבעות מן המאה ה־5 מתחת לרצפת כפר נחום הראו שזו אינה הבחנה כרונולוגית.", site: "כפר נחום, ברעם, כורזים" },
  golan: { title: "גולניים", short: "בזלת", text: "בנויים בזלת — אבן האזור — בתכנון דומה לגליליים: אולם מלבני עם עמודים ומשקופים מעוטרים.", site: "עין קשתות (אום אל־קנאטיר), קצרין" },
  basilical: { title: "דמויי כנסייה", short: "אפסיס ופסיפס", text: "בתבנית הבסיליקה: חצר ונרתקס, תווך וסטרות, ואפסיס לארון הקודש בקיר הפונה לירושלים. רצפת פסיפס — ודווקא בהם גלגל המזלות.", site: "בית אלפא, חמת טבריה, ציפורי" },
  hebron: { title: "דרום הר חברון", short: "אולם רחב", text: "אולם רחב (הכניסה בצד הארוך) בלי עמודים, כניסה ממזרח, וגומחה לארון הקודש בקיר הצפוני — לכיוון ירושלים.", site: "אשתמוע, סוסיא, מעון" },
};

function TypePlan({ type, showDir }: { type: SType; showDir: boolean }) {
  const dirDown = <g className={styles.jerusalem}><path d="M80 128v10m-5 -5l5 6 5 -6" /><text x={80} y={154} textAnchor="middle">ירושלים</text></g>;
  return <svg viewBox="0 0 160 160" className={cx(styles.svg, styles.still)} aria-hidden>
    {type === "galilean" && <><rect x={30} y={20} width={100} height={100} className={styles.pave} />{[45, 65, 85, 105].map((y) => <circle key={`l${y}`} cx={44} cy={y - 10} r={3} />)}{[45, 65, 85, 105].map((y) => <circle key={`r${y}`} cx={116} cy={y - 10} r={3} />)}{[64, 80, 96].map((x) => <circle key={x} cx={x} cy={32} r={3} />)}<path className={styles.ln} d="M30 120h100" strokeWidth={4} />{[52, 80, 108].map((x) => <rect key={x} x={x - 6} y={117} width={12} height={6} className={styles.gap} />)}</>}
    {type === "golan" && <><rect x={30} y={20} width={100} height={100} className={styles.basalt} />{[40, 60, 80, 100].map((y) => <g key={y}><circle cx={56} cy={y} r={3} /><circle cx={104} cy={y} r={3} /></g>)}<rect x={74} y={116} width={12} height={6} className={styles.gap} /></>}
    {type === "basilical" && <><rect x={40} y={6} width={80} height={22} /><rect x={40} y={28} width={80} height={10} className={styles.dark} /><rect x={40} y={38} width={80} height={72} />{[52, 64, 76, 88, 100].map((y) => <g key={y}><circle cx={60} cy={y} r={2.5} /><circle cx={100} cy={y} r={2.5} /></g>)}<circle cx={80} cy={74} r={13} className={styles.mosaic} /><path d="M66 110 a14 14 0 0 0 28 0Z" className={styles.dark} /></>}
    {type === "hebron" && <><rect x={20} y={46} width={120} height={60} className={styles.pave} /><path d="M70 46 a10 10 0 0 1 20 0Z" className={styles.dark} /><rect x={137} y={70} width={6} height={12} className={styles.gap} /><text x={150} y={96} textAnchor="end" className={styles.svgLabel}>כניסה</text></>}
    {showDir && (type === "hebron"
      ? <g className={styles.jerusalem}><path d="M80 32v-14m-5 5l5 -6 5 6" /><text x={80} y={12} textAnchor="middle">ירושלים</text></g>
      : type === "golan" ? <g className={styles.jerusalem}><path d="M80 128l-10 12m0 -7v7h7" /><text x={60} y={154} textAnchor="middle">ירושלים</text></g> : dirDown)}
  </svg>;
}

const THEODOTUS: [string, string][] = [
  ["ΘΕΟΔΟΤΟΣ ΟΥΕΤΤΗΝΟΥ", "תיאודוטוס בן וטנוס"],
  ["ΙΕΡΕΥΣ ΚΑΙ ΑΡΧΙΣΥΝΑΓΩΓΟΣ", "כוהן וראש כנסת,"],
  ["ΥΙΟΣ ΑΡΧΙΣΥΝΑΓΩΓΟΥ ΥΙΩΝΟΣ ΑΡΧΙΣΥΝΑΓΩΓΟΥ", "בן ראש כנסת ונכד ראש כנסת,"],
  ["ΩΚΟΔΟΜΗΣΕ ΤΗΝ ΣΥΝΑΓΩΓΗΝ", "בנה את בית הכנסת"],
  ["ΕΙΣ ΑΝΑΓΝΩΣΙΝ ΝΟΜΟΥ ΚΑΙ ΕΙΣ ΔΙΔΑΧΗΝ ΕΝΤΟΛΩΝ", "לקריאת התורה וללימוד המצוות,"],
  ["ΚΑΙ ΤΟΝ ΞΕΝΩΝΑ ΚΑΙ ΤΑ ΔΩΜΑΤΑ ΚΑΙ ΤΑ ΧΡΗΣΤΗΡΙΑ ΤΩΝ ΥΔΑΤΩΝ", "ואת האכסניה והחדרים ומתקני המים"],
  ["ΕΙΣ ΚΑΤΑΛΥΜΑ ΤΟΙΣ ΧΡΗΖΟΥΣΙΝ ΑΠΟ ΤΗΣ ΞΕΝΗΣ", "לאכסון הנזקקים הבאים מן הנכר,"],
  ["ΗΝ ΕΘΕΜΕΛΙΩΣΑΝ ΟΙ ΠΑΤΕΡΕΣ ΑΥΤΟΥ ΚΑΙ ΟΙ ΠΡΕΣΒΥΤΕΡΟΙ ΚΑΙ ΣΙΜΩΝΙΔΗΣ", "שאת יסודותיו הניחו אבותיו, הזקנים ושמעונידס."],
];

const SIGNS = [
  ["טלה", "ניסן", "♈"], ["שור", "אייר", "♉"], ["תאומים", "סיוון", "♊"], ["סרטן", "תמוז", "♋"], ["אריה", "אב", "♌"], ["בתולה", "אלול", "♍"],
  ["מאזניים", "תשרי", "♎"], ["עקרב", "חשוון", "♏"], ["קשת", "כסלו", "♐"], ["גדי", "טבת", "♑"], ["דלי", "שבט", "♒"], ["דגים", "אדר", "♓"],
];

export function SynagoguesLab() {
  const [type, setType] = useState<SType>("galilean");
  const [showDir, setShowDir] = useState(true);
  const [phrase, setPhrase] = useState(4);
  const [sign, setSign] = useState<number | null>(null);
  const early = usePick<"benches" | "columns" | "hall">("benches");
  const EARLY: Record<"benches" | "columns" | "hall", PartInfo> = {
    benches: { title: "ספסלים מדורגים", text: "לאורך כל הקירות — הקהל יושב ומקשיב. מתאים לקריאה בתורה ולימוד בציבור." },
    columns: { title: "עמודים", text: "תומכים בגג, בשורה סביב האולם." },
    hall: { title: "אולם מרכזי", text: "בלי אפסיס, בלי ארון קודש קבוע ובלי פסיפס דמויות — אלה יופיעו רק בתקופה הביזנטית." },
  };
  const sweep = (i: number) => {
    const a1 = (i / 12) * Math.PI * 2 - Math.PI / 2, a2 = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;
    const p = (a: number, r: number) => `${110 + Math.cos(a) * r} ${110 + Math.sin(a) * r}`;
    return `M${p(a1, 40)} L${p(a1, 98)} A98 98 0 0 1 ${p(a2, 98)} L${p(a2, 40)} A40 40 0 0 0 ${p(a1, 40)} Z`;
  };

  return <Plate id="synagogues" numeral="XI" title="בתי הכנסת הקדומים" lead="מאולם הספסלים של ימי בית שני ועד רצפות הפסיפס הביזנטיות עם גלגל המזלות — ראשיתם, תפקודם ומאפייניהם האדריכליים.">
    <h3 className={styles.subTitle}>בתי הכנסת הראשונים — ימי בית שני</h3>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 400 220" className={styles.svg} role="img" aria-label="בית כנסת מימי בית שני">
          <g {...early.bind("benches", "ספסלים")}>{[0, 1, 2].map((i) => <rect key={i} x={20 + i * 14} y={14 + i * 14} width={360 - i * 28} height={192 - i * 28} />)}</g>
          <g {...early.bind("hall", "אולם")}><rect x={62} y={56} width={276} height={108} className={styles.pave} /></g>
          <g {...early.bind("columns", "עמודים")}>{[90, 150, 210, 270, 310].map((x) => <g key={x}><circle cx={x} cy={70} r={6} /><circle cx={x} cy={150} r={6} /></g>)}<circle cx={80} cy={110} r={6} /><circle cx={320} cy={110} r={6} /></g>
        </svg>
        <figcaption className={styles.caption}>סכמה בהשראת בית הכנסת בגמלא.</figcaption>
      </figure>
      <Info info={early.active === "benches" ? { ...EARLY.benches, site: "גמלא, מצדה, הרודיון, מגדלא" } : EARLY[early.active]} />
    </div>

    <div className={styles.inscription}>
      <h3 className={styles.subTitle}>כתובת תיאודוטוס בן וטנוס</h3>
      <p className={styles.small}>נמצאה בעיר דוד בירושלים (חפירות ריימון וייל, 1913–1914). העבירו את העכבר על השורות.</p>
      <div className={styles.stone} dir="ltr" lang="grc">{THEODOTUS.map(([g], i) => <button key={i} type="button" className={cx(styles.greek, phrase === i && styles.lit)} onMouseEnter={() => setPhrase(i)} onFocus={() => setPhrase(i)} onClick={() => setPhrase(i)}>{g}</button>)}</div>
      <p className={styles.translation}>{THEODOTUS.map(([, h], i) => <span key={i} className={phrase === i ? styles.lit : undefined}>{h} </span>)}</p>
      <p className={styles.small}><b>החשיבות:</b> עדות לבית כנסת בירושלים לפני החורבן — בזמן שהמקדש עוד עמד; לתפקידו (קריאה בתורה ולימוד — לא תפילה); ולעלייה לרגל מן התפוצות, עם אכסניה ומתקני מים (ייתכן שמקוואות).</p>
    </div>

    <h3 className={styles.subTitle}>ארבעה טיפוסים — לפי הכיוון לירושלים</h3>
    <div className={styles.controls}><label className={styles.toggle}><input type="checkbox" checked={showDir} onChange={(e) => setShowDir(e.target.checked)} />להציג את הכיוון לירושלים</label></div>
    <div className={styles.types}>{(Object.keys(TYPES) as SType[]).map((t) => <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={styles.typeCard}>
      <TypePlan type={t} showDir={showDir} /><b>{TYPES[t].title}</b><small>{TYPES[t].short}</small>
    </button>)}</div>
    <Info info={TYPES[type]} label="טיפוס" />
    <p className={styles.small}>המחקר היום: ההבדלים בין הטיפוסים משקפים בעיקר <b>אזור</b>, לא זמן בנייה.</p>

    <h3 className={styles.subTitle}>גלגל המזלות</h3>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="-10 -10 240 240" className={cx(styles.svg, styles.zodiac)} role="img" aria-label="גלגל מזלות">
          <rect x={-8} y={-8} width={236} height={236} className={styles.mosaicBg} />
          {["תקופת תשרי", "תקופת טבת", "תקופת ניסן", "תקופת תמוז"].map((s, i) => <text key={s} x={i % 2 ? 214 : 6} y={i < 2 ? 4 : 222} textAnchor={i % 2 ? "end" : "start"} className={styles.season}>{s}</text>)}
          {SIGNS.map(([name, , glyph], i) => { const a = ((i + 0.5) / 12) * Math.PI * 2 - Math.PI / 2; return <g key={name} className={cx(styles.part, sign === i && styles.hot)} tabIndex={0} role="button" aria-label={name} onMouseEnter={() => setSign(i)} onFocus={() => setSign(i)} onClick={() => setSign(i)}>
            <path d={sweep(i)} /><text x={110 + Math.cos(a) * 80} y={110 + Math.sin(a) * 80 + 4} textAnchor="middle" className={styles.glyph}>{glyph}{"︎"}</text><text x={110 + Math.cos(a) * 58} y={110 + Math.sin(a) * 58 + 3} textAnchor="middle" className={styles.signName}>{name}</text>
          </g>; })}
          <circle cx={110} cy={110} r={38} className={styles.sun} /><text x={110} y={106} textAnchor="middle" className={styles.svgLabel}>הליוס</text><text x={110} y={120} textAnchor="middle" className={styles.svgLabel}>במרכבתו</text>
        </svg>
      </figure>
      <Info info={sign === null
        ? { title: "גלגל המזלות בבית הכנסת", text: "12 המזלות במעגל, אל השמש הליוס במרכבה במרכז, ובפינות ארבע 'התקופות' — עונות השנה. בימי בית שני כמעט נמנעו מדמויות; בתקופה הביזנטית — כשהאיום הוא כבר הנצרות ולא עבודת האלילים — הרסן משתחרר.", site: "חמת טבריה (המאה ה־4, המוקדם); ציפורי (5); בית אלפא (6); נערן. בעין גדי — רק שמות המזלות, בכתב." }
        : { title: `מזל ${SIGNS[sign][0]}`, text: `מזל ${SIGNS[sign][0]} מקביל לחודש ${SIGNS[sign][1]}. בפסיפסים המזלות מסומנים בשמותיהם העבריים, לצד הדמויות.` }} label="גלגל המזלות" />
    </div>
  </Plate>;
}

/* ------------------------------ XII. churches ------------------------------ */

type CPart = "atrium" | "narthex" | "nave" | "aisles" | "stylobates" | "bema" | "apse" | "prothesis" | "diaconicon";
const CHURCH: Record<CPart, PartInfo> = {
  atrium: { title: "אטריום", latin: "atrium", text: "החצר שלפני הכנסייה, לרוב מוקפת עמודים ובה בור מים. המונח לקוח מן הבית הרומי." },
  narthex: { title: "נרתקס", latin: "narthex", text: "אולם מעבר רוחבי בין האטריום לכנסייה. שם עמדו המתנצרים (קטכומנים) — עוד לא נוצרים, אבל בדרך — וצפו בטקס בלי להיכנס." },
  nave: { title: "תווך (נווה)", latin: "navis", text: "האולם המרכזי, הגבוה — 'ספינה' בלטינית. חלונות בחלקו העליון מכניסים אור." },
  aisles: { title: "סטרות", text: "אולמות הצד, הנמוכים יותר, מימין ומשמאל לתווך. המונח ארמי." },
  stylobates: { title: "שורות העמודים", text: "שתי שורות עמודים על סטילובטים מחלקות את האולם לשלושה." },
  bema: { title: "בימה", text: "האזור המוגבה לפני האפסיס, מופרד במחיצה — לאנשי הכמורה." },
  apse: { title: "אפסיס מרכזי", text: "גומחת התפילה המעוגלת, בדרך כלל בקצה המזרחי. בבסיליקה האזרחית — מקום מושבו של השופט." },
  prothesis: { title: "פרותזיס", latin: "prothesis", text: "חדר או אפסיס צדדי להכנת לחם הקודש (לרוב בצד הצפוני)." },
  diaconicon: { title: "דיאקוניקון", latin: "diaconicon", text: "חדר או אפסיס צדדי לשמירת בגדי הכהונה (לרוב בצד הדרומי)." },
};

export function ChurchesLab() {
  const pick = usePick<CPart>("nave");
  const [view, setView] = useState<"plan" | "section">("plan");
  const ids = Object.keys(CHURCH) as CPart[];

  return <Plate id="churches" numeral="XII" title="כנסיות — בסיליקה ומבנה רכזי" lead="'בסיליקה' לא נולדה ככנסייה: עד המאה ה־4 היא מבנה ציבורי אזרחי — למסחר ולמשפט. כשמדריכים קבוצות נוצריות כדאי להבהיר זאת. לצידה — הכנסייה הרכזית, שמנציחה מקום.">
    <div className={styles.controls}><Seg label="תצוגה" value={view} onChange={setView} options={[{ id: "plan", title: "תוכנית — כנסיית כורסי" }, { id: "section", title: "חתך רוחב" }]} /></div>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        {view === "plan" ? <svg viewBox="0 0 580 250" className={styles.svg} role="img" aria-label="תוכנית בסיליקה">
          <g {...pick.bind("atrium", "אטריום")}><rect x={10} y={40} width={150} height={170} /><rect x={30} y={60} width={110} height={130} className={styles.pave} /><circle cx={85} cy={125} r={12} className={styles.water} /></g>
          <g {...pick.bind("narthex", "נרתקס")}><rect x={160} y={40} width={36} height={170} className={styles.dark} />{[85, 125, 165].map((y) => <rect key={y} x={194} y={y - 8} width={6} height={16} className={styles.gap} />)}</g>
          <g {...pick.bind("aisles", "סטרות")}><rect x={196} y={40} width={268} height={44} /><rect x={196} y={166} width={268} height={44} /></g>
          <g {...pick.bind("nave", "תווך")}><rect x={196} y={84} width={268} height={82} className={styles.mosaic} /></g>
          <g {...pick.bind("stylobates", "עמודים")}><rect x={204} y={81} width={230} height={6} className={styles.dark} /><rect x={204} y={163} width={230} height={6} className={styles.dark} />{Array.from({ length: 8 }, (_, i) => <g key={i}><circle cx={212 + i * 30} cy={84} r={5} /><circle cx={212 + i * 30} cy={166} r={5} /></g>)}</g>
          <g {...pick.bind("bema", "בימה")}><rect x={434} y={84} width={30} height={82} className={styles.dark} /></g>
          <g {...pick.bind("apse", "אפסיס")}><path d="M464 90 a36 36 0 0 1 0 70Z" /></g>
          <g {...pick.bind("prothesis", "פרותזיס")}><path d="M464 46 a18 18 0 0 1 0 34Z" /></g>
          <g {...pick.bind("diaconicon", "דיאקוניקון")}><path d="M464 170 a18 18 0 0 1 0 34Z" /></g>
          <text x={540} y={130} className={styles.svgLabel} textAnchor="middle">מזרח</text><text x={20} y={232} className={styles.svgLabel}>מערב</text>
        </svg> : <svg viewBox="0 0 500 260" className={styles.svg} role="img" aria-label="חתך בסיליקה">
          <g {...pick.bind("aisles", "סטרות")}><path d="M40 240V150L150 120V240Z M460 240V150L350 120V240Z" /></g>
          <g {...pick.bind("nave", "תווך")}><path d="M150 240V60L250 20L350 60V240Z" className={styles.mosaic} />{[180, 230, 280].map((x) => <rect key={x} x={x} y={74} width={16} height={26} className={styles.sky} />)}<path className={cx(styles.ln, styles.light)} d="M188 100 L210 230M238 100 L250 230M288 100 L290 230" strokeDasharray="3 5" /></g>
          <g {...pick.bind("stylobates", "עמודים")}>{[150, 350].map((x) => <rect key={x} x={x - 6} y={120} width={12} height={120} />)}</g>
          <path className={styles.ln} d="M20 240h460" />
          <text x={250} y={256} textAnchor="middle" className={styles.svgLabel}>התווך גבוה מן הסטרות — ולכן אפשר לפתוח בו חלונות</text>
        </svg>}
      </figure>
      <Info info={CHURCH[pick.active]} />
    </div>
    <ul className={styles.partList}>{ids.map((id, i) => <li key={id}><button type="button" aria-pressed={pick.active === id} onClick={() => { pick.setActive(id); if (!["aisles", "nave", "stylobates"].includes(id)) setView("plan"); }}><span aria-hidden>{i + 1}</span>{CHURCH[id].title}</button></li>)}</ul>
    <div className={styles.cards3}>
      <article className={styles.miniCard}><svg viewBox="0 0 100 70" aria-hidden className={cx(styles.svg, styles.still)}>{[30, 20].map((r) => <path key={r} d={Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; return `${i ? "L" : "M"}${50 + Math.cos(a) * r} ${35 + Math.sin(a) * r}`; }).join(" ") + "Z"} />)}<circle cx={50} cy={35} r={6} className={styles.dark} /></svg><h4>כנסיית הקתיסמה</h4><p>מתומן סביב הסלע שעליו, לפי המסורת, ישבה מרים בדרך מנצרת לבית לחם — &apos;קתיסמה&apos; מלשון ישיבה.</p></article>
      <article className={styles.miniCard}><svg viewBox="0 0 100 70" aria-hidden className={cx(styles.svg, styles.still)}><circle cx={74} cy={35} r={22} /><circle cx={74} cy={35} r={7} className={styles.dark} /><rect x={8} y={20} width={44} height={30} /></svg><h4>כנסיית הקבר</h4><p>רוטונדה — מבנה רכזי סביב הסלע של הקבר — לצד בסיליקה. השורש פגני: הפנתאון ברומא.</p></article>
      <article className={styles.miniCard}><svg viewBox="0 0 100 70" aria-hidden className={cx(styles.svg, styles.still)}><rect x={8} y={14} width={84} height={50} className={styles.wall} /><rect x={20} y={30} width={60} height={12} /><path d="M44 30 h16 l-3 -10 h-10 Z" transform="rotate(180 52 30)" /><circle cx={30} cy={52} r={6} /></svg><h4>ספוליה</h4><p>&apos;שלל&apos;: עמודים, כותרות ומשקופים ממבנים חרבים שנבנו לתוך מבנים חדשים — לפעמים אפילו הפוכים. נפוץ בתקופה הביזנטית ואחריה.</p></article>
    </div>
  </Plate>;
}
