"use client";

import { useState } from "react";
import { cx, Info, Section, Plate, Seg, styles, usePick, type PartInfo } from "./shared";

/* ------------------------------ VII. baths ------------------------------ */

type Room = "palaestra" | "apodyterium" | "frigidarium" | "tepidarium" | "caldarium" | "hypocaust" | "furnace";
const ROOMS: Record<Room, PartInfo & { temp: string; heat: number }> = {
  palaestra: { title: "פלאסטרה", latin: "palaestra", temp: "בחוץ", heat: 0.35, text: "חצר פתוחה לפני המרחץ: התעמלות והתגוששות, להזיע ולהגביר את זרימת הדם לפני הרחצה." },
  apodyterium: { title: "אפודיטריום — מלתחה", latin: "apodyterium", temp: "רגיל", heat: 0.3, text: "כאן מניחים את הבגדים, לפעמים בתאים בקיר.", site: "חדר עם תאים באחד ממרחצאות קיסריה" },
  frigidarium: { title: "פריגידריום — הקר", latin: "frigidarium", temp: "קר", heat: 0, text: "הבריכה הקרה, הרחוקה ביותר מן התנורים (פריג'ידר — מקרר)." },
  tepidarium: { title: "טפידריום — הפושר", latin: "tepidarium", temp: "פושר", heat: 0.55, text: "חדר בטמפרטורת ביניים, כדי להרגיל את הגוף בהדרגה. לא בכל מרחץ." },
  caldarium: { title: "קלדריום — החם", latin: "caldarium", temp: "חם מאוד", heat: 1, text: "החדר החם, הסמוך לתנור: בריכה חמה ואדים — מים קרים שנשפכים על הרצפה החמה. צינורות בקירות חיממו גם אותם, כי התקרה גבוהה.", site: "בית שאן" },
  hypocaust: { title: "היפוקאוסט", latin: "hypocaustum", temp: "אוויר חם", heat: 0.9, text: "הרצפה 'צפה' על עמודונים מעל חלל; האוויר החם מן התנור זורם בחלל ומחמם את הרצפה. שמור היטב במרחץ המזרחי בבית שאן.", site: "המרחץ המזרחי בבית שאן" },
  furnace: { title: "התנור", latin: "praefurnium", temp: "אש", heat: 1, text: "מקור החום. בלי מים וחום — אין בית מרחץ." },
};
const WALK: Room[] = ["palaestra", "apodyterium", "frigidarium", "tepidarium", "caldarium"];

export function BathsLab() {
  const pick = usePick<Room>("caldarium");
  const [steam, setSteam] = useState(0);
  const step = WALK.indexOf(pick.active);
  const room = ROOMS[pick.active];
  const xs: Record<Room, number> = { palaestra: 20, apodyterium: 140, frigidarium: 240, tepidarium: 350, caldarium: 450, hypocaust: 350, furnace: 580 };

  return <Plate id="baths" numeral="VII" title="בית המרחץ" lead="לא רק ניקיון — לב החיים החברתיים של העיר הרומית: פוליטיקה, עסקים ופגישות. גם יהודים, ואף חכמים, ביקרו בו. לכו לאורך המסלול, מן הקר אל החם.">
    <Section title="מסלול הרחצה">
    <div className={styles.controls}>
      <button type="button" className={styles.action} onClick={() => pick.setActive(WALK[(step + 1) % WALK.length] ?? "palaestra")}>{step >= 0 && step < WALK.length - 1 ? "לחדר הבא ←" : "להתחיל מן הפלאסטרה"}</button>
      <button type="button" className={styles.action} onClick={() => { pick.setActive("caldarium"); setSteam((n) => n + 1); }}>לשפוך מים על הרצפה החמה</button>
    </div>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 640 260" className={styles.svg} role="img" aria-label="חתך בית מרחץ">
          <defs><linearGradient id="heat" x1="0" x2="1"><stop offset="0" stopColor="var(--cold)" /><stop offset=".55" stopColor="var(--cold)" /><stop offset="1" stopColor="var(--fire)" /></linearGradient></defs>
          <rect x={240} y={226} width={340} height={6} fill="url(#heat)" stroke="none" />
          <g {...pick.bind("palaestra", "פלאסטרה")}><rect x={10} y={150} width={120} height={50} className={styles.earth} />{[30, 70, 110].map((x) => <rect key={x} x={x - 3} y={110} width={6} height={40} />)}<path className={styles.ln} d="M16 110h108" /></g>
          <g {...pick.bind("apodyterium", "אפודיטריום")}><rect x={136} y={90} width={100} height={110} />{[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={150 + c * 26} y={104 + r * 26} width={18} height={18} className={styles.dark} />))}</g>
          <g {...pick.bind("frigidarium", "פריגידריום")}><rect x={240} y={70} width={106} height={130} /><rect x={256} y={160} width={74} height={40} className={styles.cold} /></g>
          <g {...pick.bind("tepidarium", "טפידריום")}><rect x={350} y={70} width={96} height={130} /></g>
          <g {...pick.bind("caldarium", "קלדריום")}><rect x={450} y={50} width={126} height={150} /><rect x={470} y={164} width={86} height={36} className={styles.hotWater} />{[462, 566].map((x) => <path key={x} className={styles.ln} d={`M${x} 60v130`} strokeDasharray="3 3" />)}</g>
          <g {...pick.bind("hypocaust", "היפוקאוסט")}><rect x={350} y={200} width={226} height={30} className={styles.cavity} />{Array.from({ length: 11 }, (_, i) => <rect key={i} x={356 + i * 20} y={204} width={8} height={26} />)}<path className={styles.hotAir} d="M580 216 H352" /></g>
          <g {...pick.bind("furnace", "תנור")}><rect x={580} y={180} width={50} height={52} /><path className={styles.flame} d="M592 228q8 -26 14 -8q4 -14 10 6q-6 6 -24 2Z" /></g>
          {steam > 0 && <g key={steam} className={styles.steam} aria-hidden>{[490, 512, 534].map((x, i) => <path key={x} style={{ animationDelay: `${i * 0.25}s` }} d={`M${x} 160 q-8 -14 0 -28 q8 -14 0 -28`} />)}</g>}
          {WALK.map((id, i) => <g key={id} className={styles.badge} aria-hidden><circle cx={xs[id] + 18} cy={40} r={10} /><text x={xs[id] + 18} y={44} textAnchor="middle">{i + 1}</text></g>)}
          <path className={cx(styles.ln, styles.route)} d="M38 40 H468" strokeDasharray="2 6" />
        </svg>
        <figcaption className={styles.caption}>חתך סכמטי: מסלול הרחצה משמאל לימין בשרטוט — מן הקר אל החם, והחום מגיע מן התנור דרך החלל שמתחת לרצפה.</figcaption>
      </figure>
      <Info info={room}><p className={styles.thermo}><span style={{ width: `${6 + room.heat * 64}%`, background: `color-mix(in srgb, var(--fire) ${Math.round(room.heat * 100)}%, var(--cold))` }} />{room.temp}</p></Info>
    </div>
    <ul className={styles.stepper}>{(Object.keys(ROOMS) as Room[]).map((id) => <li key={id}><button type="button" aria-pressed={pick.active === id} onClick={() => pick.setActive(id)}>{ROOMS[id].title}</button></li>)}</ul>
    </Section>
    <Section title="לטרינה ונימפיאון">
    <div className={styles.cards3}>
      <article className={styles.miniCard}><h4>לטרינה</h4><p>בית שימוש ציבורי: מושבים מעל תעלת ביוב, ולפניהם תעלה עם מים זורמים ומקל עם ספוג. <b>בארץ:</b> המרחץ המערבי בבית שאן.</p></article>
      <article className={styles.miniCard}><h4>נימפיאון</h4><p>מזרקה ציבורית מפוארת על שם הנימפות, מוזנת מאמת המים: גומחות, עמודים ובריכה. <b>בארץ:</b> קיסריה (שוקם, עם פסל היגיאה — מכאן &apos;היגיינה&apos;), בית שאן.</p></article>
      <article className={styles.miniCard}><h4>לאורך התקופות</h4><p><b>הלניסטית:</b> בריכות ואמבטיות, למשל בארמונות החשמונאים ביריחו. <b>רומית:</b> המרחץ המלא עם היפוקאוסט — גם במצדה ובהרודיון של הורדוס. <b>ביזנטית:</b> מרחצאות ציבוריים גדולים, כמו בבית שאן.</p></article>
    </div>
    </Section>
  </Plate>;
}

/* ------------------------------ VIII. decoration ------------------------------ */

type Paint = { wet: number; scrubbed: boolean } | null;

/** A floor motif sampled on a grid: 0 ground, 1 petals, 2 frame and ring, 3 centre. */
function rosette(x: number, y: number) {
  const dx = x - 0.5, dy = y - 0.5, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 0.42) return 2;
  if (r < 0.07) return 3;
  if (Math.abs(r - 0.37) < 0.025) return 2;
  if (r < 0.32 && r < 0.1 + 0.22 * Math.abs(Math.cos(2 * a))) return 1;
  return 0;
}

export function DecorLab() {
  const [wet, setWet] = useState(15);
  const [paint, setPaint] = useState<Paint>(null);
  const [stucco, setStucco] = useState(false);
  const [tile, setTile] = useState<"mosaic" | "sectile">("mosaic");
  const n = tile === "mosaic" ? 30 : 6;
  const fresco = paint ? paint.wet < 50 : false;
  const faded = paint?.scrubbed && !fresco;
  const verdict = !paint ? "בחרו מתי לצייר — וציירו." : fresco ? "פרסקו: הצבע נקשר כימית לטיח הלח." : "סקו: הצבע יושב על טיח יבש.";

  return <Plate id="decor" numeral="VIII" title="עיטורי קירות ורצפות" lead="פרסקו, סקו וסטוקו — בשלושתם יש טיח, אבל הטכניקה שונה. ופסיפס מול אופוס סקטילה — השאלה היא גודל האבן.">
    <Section title="ניסויי טיח ואבן">
    <div className={styles.twoUp}>
      <div className={styles.experiment}>
        <h3 className={styles.subTitle}>ניסוי: מתי מציירים על הטיח?</h3>
        <label className={styles.range}>זמן מאז הטיוח: <b>{wet < 50 ? "הטיח עוד לח" : "הטיח התייבש"}</b>
          <input type="range" min={0} max={100} value={wet} onChange={(e) => { setWet(Number(e.target.value)); setPaint(null); }} />
        </label>
        <svg viewBox="0 0 300 150" className={cx(styles.svg, styles.still)} role="img" aria-label="קיר מטויח">
          <rect x={0} y={0} width={300} height={150} className={styles.plaster} style={{ opacity: 1 - wet / 250 }} />
          {paint && <g className={cx(styles.painted, faded && styles.faded)}><path d="M40 110 L80 60 L120 110 Z M150 110 a30 30 0 1 1 60 0Z M230 110 l20 -50 l20 50Z" /></g>}
          {stucco && <g className={styles.stucco}><path d="M20 20 h260 v20 h-260Z" />{Array.from({ length: 9 }, (_, i) => <circle key={i} cx={36 + i * 29} cy={30} r={7} />)}</g>}
        </svg>
        <div className={styles.controls}>
          <button type="button" className={styles.action} onClick={() => setPaint({ wet, scrubbed: false })}>לצייר</button>
          <button type="button" className={styles.action} disabled={!paint} onClick={() => setPaint((p) => p && { ...p, scrubbed: true })}>לשפשף 2,000 שנה</button>
          <button type="button" className={styles.action} onClick={() => setStucco((s) => !s)}>{stucco ? "להסיר" : "לפסל בטיח"} (סטוקו)</button>
        </div>
        <p className={styles.verdict} role="status">{paint?.scrubbed ? (fresco ? "הפרסקו שרד — אי אפשר למחוק אותו בלי להרוס את הטיח." : "הסקו נמחק — הצבע לא נקשר לטיח.") : verdict}</p>
        <p className={styles.small}><b>פרסקו</b> — fresco, &apos;טרי&apos;: ציור על טיח לח; מטייחים ומציירים קטע אחר קטע, ולכן דורש מיומנות. <b>סקו</b> — secco, &apos;יבש&apos;: נוח, אבל נמחק בקלות. בעין לא מבחינים ביניהם. <b>סטוקו</b> — טיח שעוצב בתבליט, ביד או בדפוס; אופייני לארמונות הורדוס. בארץ: פרסקאות ברובע ההרודיאני, ובתא המלך בתיאטרון בהרודיון — אפילו עם דמויות.</p>
      </div>
      <div className={styles.experiment}>
        <h3 className={styles.subTitle}>פסיפס מול אופוס סקטילה</h3>
        <Seg label="גודל האבנים" value={tile} onChange={setTile} options={[{ id: "mosaic", title: "פסיפס — אבנים זעירות" }, { id: "sectile", title: "אופוס סקטילה — לוחות חתוכים" }]} />
        <svg viewBox="0 0 300 300" className={cx(styles.svg, styles.still, styles.tiles)} role="img" aria-label={tile === "mosaic" ? "פסיפס" : "אופוס סקטילה"}>
          {Array.from({ length: n * n }, (_, i) => { const x = i % n, y = Math.floor(i / n); const s = 300 / n; return <rect key={`${n}-${i}`} x={x * s + 0.6} y={y * s + 0.6} width={s - 1.2} height={s - 1.2} className={styles[`t${rosette((x + 0.5) / n, (y + 0.5) / n)}`]} />; })}
        </svg>
        <p className={styles.small}><b>פסיפס:</b> אבנים קטנטנות בצבעיהן הטבעיים — אפשר לפרט הבעות פנים ועלים. ברובע ההרודיאני: דגמים צמחיים וגאומטריים, <b>בלי דמויות</b> (איסור אמנות הדמות בימי בית שני). בתקופה הביזנטית אמנות הדמות פורחת — גם בבתי כנסת.</p>
        <p className={styles.small}><b>אופוס סקטילה</b> (&apos;עבודה חתוכה&apos;): לוחות אבן צבעוניים גדולים שנחתכו לצורות — רזולוציה נמוכה, צבעוניות עזה. שברים כאלה מפרויקט סינון עפר הר הבית (עמק צורים, בראשות גבי ברקאי) מלמדים שרחבת המקדש ההרודיאנית הייתה צבעונית מאוד — כפי שתיאר יוסף בן מתתיהו.</p>
      </div>
    </div>
    </Section>
  </Plate>;
}
