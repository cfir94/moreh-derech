"use client";

import { useState } from "react";
import { Info, Plate, Seg, styles, usePick, type PartInfo } from "./shared";

type Kind = "greek" | "roman" | "tholos";
type Part = "steps" | "colonnade" | "cella" | "statue" | "porch" | "podium" | "approach";

const PARTS: Record<Kind, Partial<Record<Part, PartInfo>>> = {
  greek: {
    steps: { title: "מדרגות מכל ארבעת הצדדים", text: "המקדש היווני מוקף מדרגות מכל עבר — העליונה שבהן היא הסטילובט." },
    colonnade: { title: "טור עמודים היקפי", text: "עמודים מקיפים את המבנה מארבעה כיוונים, ולכן קשה לזהות במבט ראשון היכן הכניסה." },
    cella: { title: "חדר האל (צלה)", text: "מבנה סגור בלב טור העמודים. כאן — לא בחוץ, כפי שרבים טועים לחשוב — עמד פסל האל ועבדו הכוהנים." },
    porch: { title: "שני עמודים בכניסה", text: "בפתח החדר הפנימי — שני עמודים שמסמנים את הכניסה." },
    statue: { title: "פסל האל", text: "בתוך הצלה, מול הכניסה." },
    approach: { title: "גישה מכל צד", text: "אין ציר אחד ברור: המבנה נראה כמעט אותו דבר מכל כיוון. דוגמה: מקדש הפייסטוס באתונה." },
  },
  roman: {
    podium: { title: "בסיס מוגבה (פודיום)", text: "המקדש הרומי ניצב על בסיס גבוה — אין מדרגות בצדדים או מאחור." },
    steps: { title: "גרם מדרגות בחזית בלבד", text: "מדרגות רק מצד הכניסה: הציריות חשובה לרומאים." },
    porch: { title: "אכסדרת עמודים בחזית", text: "העמודים מקשטים בעיקר את החזית — לעתים קורינתיים, כמו במקדש אוגוסטוס בפולה." },
    cella: { title: "חדר האל", text: "החדר הסגור תופס את רוב הבסיס. בתוכו — פסל האל, ולעתים מזבח." },
    statue: { title: "פסל האל", text: "בקצה הציר. במקדש לרומא ולאוגוסטוס בקיסריה — גם פולחן הקיסר." },
    approach: { title: "ציר אחד", text: "הרבה פעמים המקדש עומד בקצה רחוב תהלוכות או פורום, והדרך מוליכה ישר אליו. בארץ: קיסריה, חורבת עומרית, תל קדש." },
  },
  tholos: {
    steps: { title: "מדרגות עגולות", text: "גם הטולוס מוקף מדרגות." },
    colonnade: { title: "טבעת עמודים", text: "כמה עשרות עמודים במעגל — כמו במקדש אתנה בדלפי ובמקדש הרקולס ברומא." },
    cella: { title: "קיר פנימי עגול", text: "חדר עגול בלב טבעת העמודים, ומעליו גג." },
    approach: { title: "גם לקבורה", text: "הצורה העגולה עוברת גם למבנים שאינם מקדשים — ראש יד אבשלום בנחל קדרון הוא סוג של טולוס." },
  },
};

const ORDER: Part[] = ["approach", "steps", "podium", "colonnade", "porch", "cella", "statue"];

export function TemplesLab() {
  const [kind, setKind] = useState<Kind>("greek");
  const pick = usePick<Part>("approach");
  const parts = PARTS[kind];
  const active = parts[pick.active] ? pick.active : "approach";
  const switchKind = (k: Kind) => { setKind(k); pick.setActive("approach"); };
  const dots = (xs: number[], ys: number[]) => xs.flatMap((x) => ys.map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={5} />));

  return <Plate id="temples" numeral="II" title="מקדשים — יווני, רומי, טולוס" lead="מבט מלמעלה על תוכנית המקדש. החליפו בין הטיפוסים ושימו לב לשאלה הכי חשובה: מאיפה נכנסים?">
    <div className={styles.controls}>
      <Seg label="טיפוס מקדש" value={kind} onChange={switchKind} options={[{ id: "greek", title: "יווני" }, { id: "roman", title: "רומי" }, { id: "tholos", title: "טולוס (עגול)" }]} />
    </div>
    <div className={styles.lab}>
      <figure className={styles.figure}>
        <svg viewBox="0 0 400 300" className={styles.svg} role="img" aria-label={`תוכנית מקדש ${kind}`}>
          {kind === "greek" && <>
            <g {...pick.bind("approach", "גישה")}><path className={styles.ln} d="M200 296v-18M8 150h18M392 150h-18M200 4v18" strokeDasharray="4 4" /><path d="M194 284l6 -8 6 8Z M14 144l8 6 -8 6Z M386 144l-8 6 8 6Z M194 16l6 8 6 -8Z" /></g>
            <g {...pick.bind("steps", "מדרגות")}><rect x={30} y={26} width={340} height={248} /><rect x={38} y={34} width={324} height={232} /><rect x={46} y={42} width={308} height={216} /></g>
            <g {...pick.bind("colonnade", "טור עמודים")}>{dots([62, 101, 140, 179, 221, 260, 299, 338], [58, 242])}{dots([62, 338], [98, 138, 178, 218])}</g>
            <g {...pick.bind("cella", "צלה")}><rect x={110} y={88} width={180} height={124} /><rect x={240} y={100} width={42} height={100} className={styles.dark} /></g>
            <g {...pick.bind("porch", "עמודי הכניסה")}><circle cx={290} cy={118} r={5} /><circle cx={290} cy={182} r={5} /></g>
            <g {...pick.bind("statue", "פסל האל")}><circle cx={140} cy={150} r={10} /><path className={styles.ln} d="M140 140v20M132 150h16" /></g>
          </>}
          {kind === "roman" && <>
            <g {...pick.bind("approach", "ציר")}><path className={styles.ln} d="M392 150H330" strokeDasharray="4 4" /><path d="M342 142l-10 8 10 8Z" /></g>
            <g {...pick.bind("podium", "פודיום")}><rect x={50} y={70} width={250} height={160} /></g>
            <g {...pick.bind("steps", "מדרגות בחזית")}><rect x={300} y={88} width={56} height={124} />{[310, 320, 330, 340].map((x) => <path key={x} className={styles.ln} d={`M${x} 88v124`} />)}</g>
            <g {...pick.bind("porch", "אכסדרת עמודים")}>{dots([288, 254], [86, 118, 150, 182, 214])}{dots([220], [86, 214])}</g>
            <g {...pick.bind("cella", "חדר האל")}><rect x={62} y={82} width={150} height={136} /></g>
            <g {...pick.bind("statue", "פסל האל")}><circle cx={86} cy={150} r={10} /><path className={styles.ln} d="M86 140v20M78 150h16" /></g>
          </>}
          {kind === "tholos" && <>
            <g {...pick.bind("approach", "שימושים")}><path className={styles.ln} d="M200 296v-28" strokeDasharray="4 4" /><path d="M194 278l6 -8 6 8Z" /></g>
            <g {...pick.bind("steps", "מדרגות")}><circle cx={200} cy={150} r={118} /><circle cx={200} cy={150} r={108} /></g>
            <g {...pick.bind("colonnade", "טבעת עמודים")}>{Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return <circle key={i} cx={200 + Math.cos(a) * 94} cy={150 + Math.sin(a) * 94} r={5} />; })}</g>
            <g {...pick.bind("cella", "חדר עגול")}><circle cx={200} cy={150} r={64} /></g>
          </>}
        </svg>
        <figcaption className={styles.caption}>{kind === "greek" ? "יווני: עמודים ומדרגות מכל הצדדים." : kind === "roman" ? "רומי: פודיום, מדרגות וחזית רק מצד אחד." : "טולוס: מבנה עגול מוקף עמודים."}</figcaption>
      </figure>
      <Info info={parts[active]!} />
    </div>
    <ul className={styles.partList}>{ORDER.filter((id) => parts[id]).map((id, i) => <li key={id}><button type="button" aria-pressed={active === id} onClick={() => pick.setActive(id)}><span aria-hidden>{i + 1}</span>{parts[id]!.title}</button></li>)}</ul>
    <div className={styles.cards3}>
      <article className={styles.miniCard}><h4>מקדש רומא ואוגוסטוס, קיסריה</h4><p>הורדוס הקדיש אותו לקיסר ולעיר רומא — פולחן הקיסר מתחיל בימי אוגוסטוס. השרידים נראים במרכז המבקרים.</p></article>
      <article className={styles.miniCard}><h4>חורבת עומרית ותל קדש</h4><p>מקדשים רומיים מן המאות ה־1–2 בצפון. בעומרית רואים היטב את גרם המדרגות היחיד; בקדש — קיר, פתח ומשקוף.</p></article>
      <article className={styles.miniCard}><h4>סקלום — מקדש קטן</h4><p>חדר פולחן קטן. במחנה הלגיון השישי ליד מגידו נחשף הסקלום: חדר הדגלים בלב המפקדה.</p></article>
    </div>
  </Plate>;
}
