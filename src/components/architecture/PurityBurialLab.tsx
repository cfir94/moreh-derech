"use client";

import { useState } from "react";
import { cx, Info, Section, Plate, styles, usePick, type PartInfo } from "./shared";

/* ------------------------------ IX. purity ------------------------------ */

type Water = "clean" | "dirty" | "drawn" | "kosher";
const WATER: Record<Water, { label: string; drawn: boolean; note: string }> = {
  clean: { label: "מי גשם", drawn: false, note: "החורף מילא את המקווה במי גשם שזרמו בכוח עצמם — כשר." },
  dirty: { label: "מים מלוכלכים", drawn: false, note: "הקיץ עבר, המים התלכלכו מן השימוש — ואין גשם שימלא מחדש." },
  drawn: { label: "מים שאובים", drawn: true, note: "רוקנו ומילאו במים שאובים בכלי — נקיים, אבל פסולים לטבילה." },
  kosher: { label: "הוכשרו במגע", drawn: false, note: "הפקק הוסר: מי המקווה נוגעים במי האוצר הכשרים — ובכך הם מוכשרים." },
};

export function PurityLab() {
  const [water, setWater] = useState<Water>("clean");
  const w = WATER[water];
  const next: Partial<Record<Water, [Water, string]>> = { clean: ["dirty", "הקיץ עובר…"], dirty: ["drawn", "לרוקן ולמלא במים שאובים"], drawn: ["kosher", "להסיר את הפקק לאוצר"] };
  const steps = "M20 40 L20 62 L50 62 L50 84 L80 84 L80 106 L110 106 L110 128 L140 128 L140 150 L170 150 L170 172 L200 172 L200 194 L224 194 L224 222 L300 222 L300 40 Z";

  return <Plate id="purity" numeral="IX" title="מקוואות — טהרה בימי הבית השני" lead="במקווה טובלים לא כדי להתנקות אלא כדי להיטהר מטומאה. מקוואות מופיעים לראשונה בתקופה החשמונאית, עם ההקפדה הגוברת על טהרה ('פרצה טהרה בישראל') ועם העלייה לרגל — אי אפשר להקריב פסח בטומאה.">
    <Section title="המקווה">
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 560 250" className={styles.svg} role="img" aria-label="חתך מקווה עם אוצר">
          <defs><clipPath id="pool"><path d={steps} /></clipPath></defs>
          <path className={styles.earth} d="M0 40h560v210H0Z" />
          <path d={steps} className={styles.cavity} />
          <rect x={0} y={118} width={300} height={110} clipPath="url(#pool)" className={cx(styles.mikveh, styles[water])} />
          <rect x={318} y={92} width={84} height={130} className={styles.cavity} />
          <rect x={318} y={120} width={84} height={102} className={styles.water} />
          <rect x={300} y={204} width={18} height={10} className={water === "kosher" ? styles.water : styles.dark} />
          {water !== "kosher" && <rect x={304} y={200} width={8} height={18} className={styles.plug} />}
          <text x={360} y={86} textAnchor="middle" className={styles.svgLabel}>אוצר</text>
          <text x={150} y={30} textAnchor="middle" className={styles.svgLabel}>מדרגות רחבות אל בריכת הטבילה</text>
          <g transform="translate(430 40)">
            <rect width={110} height={180} className={styles.inset} />
            {Array.from({ length: 8 }, (_, i) => <path key={i} className={styles.ln} d={`M6 ${16 + i * 20}h98`} />)}
            <path d="M53 6v168" className={styles.divider} />
            <path className={styles.ln} d="M28 30v120m-6 -10l6 10 6 -10M82 150V30m-6 10l6 -10 6 10" />
            <text x={28} y={196} textAnchor="middle" className={styles.svgLabel}>יורדים</text>
            <text x={82} y={196} textAnchor="middle" className={styles.svgLabel}>עולים</text>
          </g>
        </svg>
        <figcaption className={styles.caption}>משמאל: חתך המקווה והאוצר. מימין: מבט מלמעלה על מדרגות עם קו מפריד — כמו בקומראן.</figcaption>
      </figure>
      <Info info={{ title: w.label, text: w.note }} label="מצב המים">
        <ul className={styles.checks}>
          <li className={styles.ok}>40 סאה של מים (לפי ההערכה המרבית — כמטר מעוקב)</li>
          <li className={w.drawn ? styles.bad : styles.ok}>מים שאינם שאובים — הגיעו בכוח הכובד, לא ביד אדם</li>
          <li className={water === "dirty" ? styles.bad : styles.ok}>מים נקיים מספיק לטבילה</li>
        </ul>
        {next[water] ? <button type="button" className={styles.action} onClick={() => setWater(next[water]![0])}>{next[water]![1]}</button>
          : <button type="button" className={styles.action} onClick={() => setWater("clean")}>מן ההתחלה</button>}
      </Info>
    </div>
    </Section>
    <Section title="אוצר, נתיבים וכלי אבן">
    <div className={styles.cards3}>
      <article className={styles.miniCard}><h4>האוצר — נדיר</h4><p>אחד הפתרונות שמוכרים מן ההלכה שלאחר החורבן. ברוב המקרים היו פתרונות אחרים, שאיננו מכירים — ההבנה שלנו חלקית.</p></article>
      <article className={styles.miniCard}><h4>נתיבים</h4><p>במקוואות עם קו מפריד במדרגות, ההשערה המקובלת: נתיב לטמאים שיורדים ונתיב לטהורים שעולים. <b>בארץ:</b> קומראן.</p></article>
      <article className={styles.miniCard}><h4>כלי אבן</h4><p>כלי אבן אינם מקבלים טומאה — בניגוד לחרס, מתכת ועץ. לכן נפוצים בסוף ימי בית שני, ואצל העשירים אפילו שולחנות אבן. <b>בארץ:</b> הרובע ההרודיאני.</p></article>
    </div>
    <p className={styles.small}>תפוצה: בעיקר בבתי עשירים, ובמקומות שאין בהם מעיין או ים — ירושלים (הרובע היהודי), קומראן, מצדה, ארמונות יריחו.</p>
    </Section>
  </Plate>;
}

/* ------------------------------ X. burial ------------------------------ */

type BPart = "kokh" | "arcosolium" | "sarcophagus" | "smallKokh" | "ossuary" | "pit" | "bench";
const BURIAL: Record<BPart, PartInfo> = {
  kokh: { title: "כוך", text: "גומחה צרה ועמוקה שנחצבה בדופן המערה; פתחה נאטם בדלת וטיח. כוך ארוך — לגופה שלמה: קבורה ראשונה. הכוכים הקדומים בארץ — במערות ההלניסטיות של מרשה.", site: "קברי הסנהדרין — אפילו שתי קומות של כוכים" },
  arcosolium: { title: "ארקוסוליום", latin: "arcosolium", text: "מדף חצוב ומעליו קשת (ארקוס). על מדף גדול — גופה שלמה; על קטן — עצמות. לא תמיד ליקטו אחר כך.", site: "קברי הסנהדרין" },
  sarcophagus: { title: "סרקופג", latin: "sarcophagus", text: "ארון מתים גדול לגופה שלמה — 'אוכל הבשר'. נדיר בבית שני, נפוץ אחר כך — אצל יהודים ושאינם יהודים.", site: "בית שערים" },
  smallKokh: { title: "כוך קטן", text: "קצר מכדי להכיל גופה — ולכן לקבורה שנייה של עצמות." },
  ossuary: { title: "גלוסקמה", text: "תיבה קטנה, לרוב מאבן ומעוטרת, לעצמות. ארוכה מעצם הירך, רחבה מן האגן וגבוהה מן הגולגולת. בירושלים מסוף המאה ה־1 לפנה״ס עד החורבן; בגליל ובדרום עוד כמאתיים שנה." },
  pit: { title: "בור עמידה", text: "שקע במרכז החדר, כדי שאפשר יהיה לעמוד זקוף במערה נמוכה." },
  bench: { title: "ספסלים", text: "סביב החדר — להנחת הנפטר בזמן ההכנות." },
};

type Phase = 0 | 1 | 2 | 3;
const PHASES = ["קבורה ראשונה בכוך", "כשנה — הבשר נרקב", "ליקוט העצמות", "קבורה שנייה בגלוסקמה"];

export function BurialLab() {
  const pick = usePick<BPart>("kokh");
  const [phase, setPhase] = useState<Phase>(0);
  const kokhs = [[60, 120], [60, 170], [60, 220]];

  return <Plate id="burial" numeral="X" title="קבורה" lead="בית ראשון: מאספה משפחתית לדורות. בית שני: קבורה שנייה אישית. היכנסו למערת קבורה מימי בית שני וליוו את התהליך.">
    <Section title="מערת הקבורה">
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 520 320" className={styles.svg} role="img" aria-label="תוכנית מערת קבורה">
          <path className={styles.earth} d="M0 0h520v320H0Z" />
          <g {...pick.bind("kokh", "כוכים")}>
            {kokhs.map(([x, y]) => <rect key={`l${y}`} x={x} y={y} width={100} height={30} className={styles.cavity} />)}
            {[200, 250].map((x) => <rect key={`t${x}`} x={x} y={10} width={30} height={90} className={styles.cavity} />)}
            {phase < 2 && <rect x={72} y={127} width={72} height={16} rx={8} className={styles.body} />}
            {phase === 2 && <g className={styles.bones}><path d="M76 135h40M120 132l8 6M86 130l6 10" /><circle cx={136} cy={134} r={5} /></g>}
          </g>
          <g {...pick.bind("arcosolium", "ארקוסוליום")}><path d="M300 100 V40 a40 30 0 0 1 80 0 V100Z" className={styles.cavity} /><rect x={304} y={70} width={72} height={26} /></g>
          <g {...pick.bind("smallKokh", "כוך קטן")}><rect x={360} y={150} width={44} height={30} className={styles.cavity} /></g>
          <g {...pick.bind("ossuary", "גלוסקמה")}>{phase === 3 ? <rect x={366} y={154} width={34} height={22} className={styles.ossuary} /> : <rect x={430} y={236} width={34} height={22} className={styles.ossuary} />}<text x={447} y={276} textAnchor="middle" className={styles.svgLabel}>{phase === 3 ? "" : "גלוסקמה ריקה"}</text></g>
          <g {...pick.bind("bench", "ספסלים")}><rect x={160} y={100} width={200} height={190} /></g>
          <g {...pick.bind("pit", "בור עמידה")}><rect x={190} y={130} width={140} height={160} className={styles.cavity} /></g>
          <g {...pick.bind("sarcophagus", "סרקופג")}><rect x={200} y={200} width={60} height={26} className={styles.ossuary} /><path className={styles.ln} d="M204 204h52v18h-52Z" /></g>
          <rect x={246} y={290} width={28} height={30} className={styles.cavity} />
          <text x={260} y={314} textAnchor="middle" className={styles.svgLabel}>פתח</text>
        </svg>
      </figure>
      <Info info={BURIAL[pick.active]} />
    </div>
    <ol className={styles.process}>{PHASES.map((p, i) => <li key={p}><button type="button" aria-pressed={phase === i} onClick={() => { setPhase(i as Phase); pick.setActive(i < 3 ? "kokh" : "ossuary"); }}><span>{i + 1}</span>{p}</button></li>)}</ol>
    </Section>
    <Section title="בית ראשון ובית שני">
    <div className={styles.compare}>
      <article><h4>בית ראשון</h4><p>רוב האנשים — כנראה בקברי שוחה שלא נמצאו. במערות: קבורה ראשונה של הגופה, ואחר כך ליקוט העצמות ל<b>מאספה משפחתית</b> — בור שבו מצטרפים הדורות.</p></article>
      <article><h4>בית שני ואילך</h4><p>קבורה ראשונה בכוך, בארקוסוליום או בסרקופג; קבורה שנייה <b>אישית</b> — בכוך קטן או בגלוסקמה.</p></article>
      <article><h4>למה השינוי?</h4><p><b>תאולוגי:</b> האמונה בתחיית המתים מתועדת לראשונה בתקופה ההלניסטית־חשמונאית — מי שמצפה לקום רוצה קבר משלו. <b>חברתי:</b> עליית האינדיבידואליזם. לשתי התאוריות יש קשיים.</p></article>
    </div>
    </Section>
    <Section title="נחל קדרון">
    <KidronLab />
    </Section>
    <Section title="גלוסקמה ואורנה">
    <div className={styles.cards3}>
      <article className={styles.miniCard}><h4>אורנה (urna)</h4><p>כד לאפר המת אחרי שריפת הגופה — המנהג הרומי הרווח עד המאה ה־2 לספירה, אז גברה הקבורה בגוף ובסרקופגים. יהודים לא שרפו את מתיהם.</p></article>
      <article className={styles.miniCard}><h4>מידות הגלוסקמה</h4><svg viewBox="0 0 160 82" aria-hidden className={cx(styles.svg, styles.still)}><rect x={20} y={20} width={110} height={36} /><path className={styles.ln} d="M20 64h110M140 20v36M30 12l12 -8h70" /><text x={75} y={78} textAnchor="middle" className={styles.svgLabel}>&gt; עצם הירך</text></svg><p>ארוכה מעצם הירך, רחבה מן האגן, גבוהה מן הגולגולת — ולכן ברור שלא לגופה שלמה.</p></article>
      <article className={styles.miniCard}><h4>בית שערים</h4><p>מערכות קבורה מפוארות וסרקופגים מן התקופה הרומית המאוחרת — אולי גם קבר רבי יהודה הנשיא.</p></article>
    </div>
    </Section>
  </Plate>;
}

type KPart = "qever" | "nefesh" | "hezirCols" | "hezirText" | "zechariah";
const KIDRON: Record<KPart, PartInfo> = {
  qever: { title: "הקבר — החלק החצוב", text: "ביד אבשלום הקבר הוא הקובייה החצובה בסלע — המקום לגופה. הפרצה הנראית היום מאוחרת; הכניסה המקורית מצד ימין." },
  nefesh: { title: "הנפש — החלק הבנוי", text: "מבנה הנצחה לנשמה: תוף עגול (טולוס) וגג קעור. ההבחנה בין 'קבר' ל'נפש' מוכרת מחז״ל ומכתובות נבטיות. אולי קבר אגריפס הראשון — השערה שהתחזקה כשאהוד נצר מצא בהרודיון קבר דומה של הורדוס." },
  hezirCols: { title: "דיסטילוס אין אנטיס", latin: "distylos in antis", text: "שני עמודים דוריים בין שתי מזוזות. מאחוריהם — הקבר בחלל החשוך; הנפש עמדה כנראה לצידו." },
  hezirText: { title: "הכתובת — בני חזיר", text: "מעל העמודים: 'זה הקבר והנפש של…' ושמות דורות של משפחת הכוהנים בני חזיר. השם היחיד בנחל קדרון שמבוסס על ממצא; יד אבשלום וקבר זכריה הם שמות עממיים." },
  zechariah: { title: "קבר זכריה", text: "קובייה מונוליתית חצובה וגג פירמידה. השם עממי: אין קשר לנביא או לכוהן מימי בית ראשון." },
};

function KidronLab() {
  const pick = usePick<KPart>("nefesh");
  return <div className={styles.sub}>
    <h3 className={styles.subTitle}>מצבות נחל קדרון — קבר ונפש</h3>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 520 260" className={styles.svg} role="img" aria-label="מצבות נחל קדרון">
          <path className={styles.earth} d="M0 230h520v30H0Z" />
          <g {...pick.bind("hezirText", "כתובת בני חזיר")}><rect x={20} y={70} width={130} height={22} /><path className={styles.ln} d="M30 81h110" strokeDasharray="4 3" /></g>
          <g {...pick.bind("hezirCols", "עמודי בני חזיר")}><rect x={20} y={92} width={130} height={138} className={styles.cavity} /><rect x={20} y={92} width={16} height={138} /><rect x={134} y={92} width={16} height={138} />{[64, 106].map((x) => <g key={x}><rect x={x - 7} y={100} width={14} height={130} /><rect x={x - 11} y={94} width={22} height={6} /></g>)}</g>
          <g {...pick.bind("qever", "קבר — יד אבשלום")}><rect x={200} y={120} width={110} height={110} />{[208, 248, 262, 302].map((x) => <rect key={x} x={x - 3} y={138} width={6} height={92} className={styles.dark} />)}<path className={styles.ln} d="M200 132h110" /></g>
          <g {...pick.bind("nefesh", "נפש — יד אבשלום")}><rect x={208} y={96} width={94} height={24} /><rect x={222} y={66} width={66} height={30} /><path d="M222 66 Q255 50 255 4 Q255 50 288 66 Z" /></g>
          <g {...pick.bind("zechariah", "קבר זכריה")}><rect x={370} y={130} width={100} height={100} /><path d="M366 130 L420 60 L474 130 Z" /></g>
          <text x={85} y={252} textAnchor="middle" className={styles.svgLabel}>קבר בני חזיר</text>
          <text x={255} y={252} textAnchor="middle" className={styles.svgLabel}>יד אבשלום</text>
          <text x={420} y={252} textAnchor="middle" className={styles.svgLabel}>קבר זכריה</text>
        </svg>
        <figcaption className={styles.caption}>סוף ימי הבית השני. סדרים קלאסיים — ובלי דמויות.</figcaption>
      </figure>
      <Info info={KIDRON[pick.active]} />
    </div>
  </div>;
}
