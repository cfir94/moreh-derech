"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Frank_Ruhl_Libre } from "next/font/google";
import { FAMILIES, FAMILY_BY_ID, GROUPS, GROUP_BY_ID, type FamilyId, type GroupId } from "@/data/christian-dress/groups";
import rawPhotos from "@/data/christian-dress/photos.json";
import { acceptsGroup, createRound, KIND_LABELS, score, type Answer, type Photo, type Question, type QuestionKind } from "@/lib/christianDress";
import { withBasePath } from "@/lib/basePath";
import styles from "./JerusalemRobesGame.module.css";

const serif = Frank_Ruhl_Libre({ subsets: ["hebrew", "latin"], weight: ["500", "700", "900"], display: "swap" });

const PHOTOS = rawPhotos as Photo[];
const PHOTO_BY_ID = new Map(PHOTOS.map(photo => [photo.id, photo]));
const KINDS = Object.keys(KIND_LABELS) as QuestionKind[];
const LETTERS = ["א", "ב", "ג", "ד"];
// Clearest first: the field guide and the review list lead with a photo that has a marked detail.
const rank = (photo: Photo) => (photo.hard ? 2 : 0) + (photo.focus && photo.focus[2] > 1.2 ? 0 : 1);
const photosOf = (group: GroupId) => PHOTOS.filter(photo => photo.group === group).sort((a, b) => rank(a) - rank(b));
const LIVE_GROUPS = GROUPS.filter(group => photosOf(group.id).length);

type Session = { questions: Question[]; index: number; answers: Answer[]; picked: (string | null)[]; finished: boolean };
type View = "home" | "guide" | "play";

function prompt(question: Question): string {
  const group = GROUP_BY_ID.get(question.group)!;
  switch (question.kind) {
    case "who": return "מי עובר כאן בסמטה?";
    case "typed": return "לאיזו קהילה הוא שייך? כתבו את שמה.";
    case "detail": return "רק פרט אחד גלוי. למי הוא שייך?";
    case "pick": return `באיזו תמונה רואים את ${group.name}?`;
    case "family": return "לאיזו משפחה של כנסיות הוא שייך?";
    case "site": return "את הקהילה הזו תפגשו בעיקר ב…";
    case "sepulchre": return "לשש קהילות יש זכויות בכנסיית הקבר. מי מהארבעה אינו אחת מהן?";
  }
}

function JerusalemCross({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
    <path d="M42 8h16v34h34v16H58v34H42V58H8V42h34z" />
    <path d="M36 8h28v6H36zM36 86h28v6H36zM8 36h6v28H8zM86 36h6v28h-6z" />
    {[[22, 22], [78, 22], [22, 78], [78, 78]].map(([x, y]) => <path key={x + "-" + y} d={`M${x - 2.5} ${y - 9}h5v6.5h6.5v5h-6.5v6.5h-5v-6.5H${x - 9}v-5h6.5z`} />)}
  </svg>;
}

function StainedWindow() {
  return <svg className={styles.window} viewBox="0 0 200 300" aria-hidden="true">
    <defs>
      <clipPath id="robes-arch"><path d="M0 300V128C0 58 46 18 100 0c54 18 100 58 100 128v172z" /></clipPath>
      <radialGradient id="robes-glow" cx="50%" cy="36%" r="70%">
        <stop offset="0" stopColor="#fff3c4" stopOpacity=".95" /><stop offset=".45" stopColor="#f0b847" stopOpacity=".35" /><stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </defs>
    <g clipPath="url(#robes-arch)">
      <rect width="200" height="300" fill="#16233f" />
      {[["#8f1d2c", "M0 300V150h50v150z"], ["#1f4a8a", "M50 300V150h50v150z"], ["#c7952c", "M100 300V150h50v150z"], ["#1e6a52", "M150 300V150h50v150z"],
        ["#1f4a8a", "M0 150V90L50 60v90z"], ["#8f1d2c", "M200 150V90l-50-30v90z"], ["#2d5ea8", "M50 150V60l50-40 50 40v90z"],
        ["#b8322f", "M0 240h200v20H0z"], ["#e0b04a", "M0 198h200v8H0z"]].map(([fill, d], i) => <path key={i} d={d} fill={fill} opacity=".88" />)}
      <circle cx="100" cy="104" r="44" fill="#c7952c" opacity=".9" />
      <circle cx="100" cy="104" r="36" fill="#7c1424" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d="M100 104V60" stroke="#1a1410" strokeWidth="2.4" transform={`rotate(${i * 30} 100 104)`} />)}
      <circle cx="100" cy="104" r="17" fill="#e8c35c" stroke="#1a1410" strokeWidth="2.4" />
      <path d="M96 92h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="#7c1424" />
      <rect width="200" height="300" fill="url(#robes-glow)" className={styles.windowGlow} />
      <path d="M50 300V60M100 300V20M150 300V60M0 150h200M0 240h200" stroke="#1a1410" strokeWidth="4" fill="none" />
    </g>
    <path d="M0 300V128C0 58 46 18 100 0c54 18 100 58 100 128v172" fill="none" stroke="#d6b15e" strokeWidth="6" />
  </svg>;
}

function Credit({ photo }: { photo: Photo }) {
  return <span className={styles.credit}>
    צילום: {photo.author} · <a href={photo.licenseUrl || photo.source} target="_blank" rel="noreferrer">{photo.license}</a> · <a href={photo.source} target="_blank" rel="noreferrer">ויקישיתוף ↗</a>
  </span>;
}

function SinglePhoto({ photo, zoomed, revealed }: { photo: Photo; zoomed: boolean; revealed: boolean }) {
  const [x, y, z] = photo.focus ?? [50, 40, 1];
  return <figure className={styles.frame}>
    <div className={styles.frameInner} style={{ aspectRatio: `${photo.width} / ${photo.height}`, width: `min(100%, calc(min(60vh, 560px) * ${photo.width / photo.height}))` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBasePath(photo.src)} alt={revealed ? photo.alt : "תמונה של איש דת או נזירה — מי הם?"} width={photo.width} height={photo.height}
        style={zoomed ? { transform: `scale(${z})`, transformOrigin: `${x}% ${y}%` } : undefined} data-photo={photo.id} />
    </div>
    {revealed && <figcaption>{photo.caption}<Credit photo={photo} /></figcaption>}
  </figure>;
}

export function JerusalemRobesGame() {
  const [view, setView] = useState<View>("home");
  const [families, setFamilies] = useState<FamilyId[]>(FAMILIES.map(f => f.id));
  const [kinds, setKinds] = useState<QuestionKind[]>(KINDS);
  const [length, setLength] = useState(12);
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState("");
  const [unzoomed, setUnzoomed] = useState(false);
  const promptRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLHeadingElement>(null);

  const pool = useMemo(() => LIVE_GROUPS.filter(group => families.includes(group.family)).map(group => group.id), [families]);
  const question = session && !session.finished ? session.questions[session.index] : null;
  const answer = session?.answers[session.index];
  const picked = session?.picked[session.index] ?? null;
  const stats = score(session?.answers ?? []);

  useEffect(() => {
    if (view !== "play" || !session) return;
    (answer ? feedbackRef : promptRef).current?.focus({ preventScroll: !answer });
  }, [view, session?.index, session?.finished, answer, session]);

  function start(onlyGroups?: GroupId[]) {
    const groups = onlyGroups ?? pool;
    const questions = createRound(PHOTOS, groups, kinds, onlyGroups ? Math.max(onlyGroups.length * 2, 6) : length);
    if (!questions.length) return;
    setInput(""); setUnzoomed(false);
    setSession({ questions, index: 0, answers: [], picked: [], finished: false });
    setView("play");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(correct: boolean, given: string, pick: string | null = null) {
    if (!question || answer) return;
    setSession(current => {
      if (!current || current.answers[current.index]) return current;
      const picks = [...current.picked]; picks[current.index] = pick;
      return { ...current, answers: [...current.answers, { group: question.group, correct, given }], picked: picks };
    });
  }

  function next() {
    setInput(""); setUnzoomed(false);
    setSession(current => current && (current.index + 1 === current.questions.length
      ? { ...current, finished: true } : { ...current, index: current.index + 1 }));
  }

  useEffect(() => {
    if (view !== "play" || !question) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      const n = Number(event.key);
      if (!answer && n >= 1 && n <= 4) document.querySelectorAll<HTMLButtonElement>("[data-choice]")[n - 1]?.click();
      if (answer && event.key === "Enter") { event.preventDefault(); next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const toggle = <T,>(list: T[], value: T) => list.includes(value) ? list.filter(item => item !== value) : [...list, value];
  const missed = [...new Set(session?.answers.filter(a => !a.correct).map(a => a.group) ?? [])];

  return <section className={`${styles.game} ${serif.className}`} data-robes dir="rtl">
    {view === "home" && <>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}><JerusalemCross className={styles.miniCross} /> משחק זיהוי · העיר העתיקה</span>
          <h1>גלימות<br /><span>ירושלים</span></h1>
          <p className={styles.lead}>מי עובר שם בסמטה?</p>
          <p>ברדס מחודד, חבל עם שלושה קשרים, כובע שעולה ישר כמו ארובה — בירושלים הלבוש מספר לאיזו כנסייה האדם שייך. מתרגלים על תמונות אמיתיות, ומזהים בשטח.</p>
          <div className={styles.heroMeta}><span>{LIVE_GROUPS.length} קהילות ומסדרים</span><span>{PHOTOS.length} תמונות אמיתיות</span><span>מזרח · מערב</span></div>
          <div className={styles.heroActions}>
            <a href="#robes-setup" className={styles.primary}>לבחירת המשחק <span aria-hidden="true">↓</span></a>
            <button type="button" className={styles.secondary} onClick={() => setView("guide")}>מדריך השדה</button>
          </div>
        </div>
        <div className={styles.art}><StainedWindow /><span className={styles.candle} aria-hidden="true" /></div>
      </header>

      <div className={styles.map}>
        <h2 className={styles.sectionTitle}><span>I</span> מזרח ומערב: ארבע משפחות</h2>
        <p className={styles.muted}>כל קהילה בעיר שייכת לאחת מארבע משפחות. החלוקה הגדולה היא בין הכנסיות המזרחיות למערביות; בתוך המזרח, ועידת כלקדון (451) מפרידה בין האורתודוקסים לכנסיות המזרחיות העתיקות. לחצו על משפחה כדי לכלול אותה במשחק או להוציא אותה ממנו.</p>
        <div className={styles.sides}>
          {(["east", "west"] as const).map(side => <div key={side} className={styles.side} data-side={side}>
            <h3>{side === "east" ? "הכנסיות המזרחיות" : "הכנסיות המערביות"}</h3>
            {FAMILIES.filter(f => f.side === side).map(family => {
              const groups = LIVE_GROUPS.filter(g => g.family === family.id);
              return <button type="button" key={family.id} className={styles.family} data-family={family.id} aria-pressed={families.includes(family.id)} onClick={() => setFamilies(toggle(families, family.id))}>
                <strong>{family.label}</strong>
                <small>{family.summary}</small>
                <span className={styles.members}>{groups.map(g => <span key={g.id}>{g.name}</span>)}</span>
                <b aria-hidden="true">{families.includes(family.id) ? "✓ במשחק" : "+ להוסיף"}</b>
              </button>;
            })}
          </div>)}
        </div>
      </div>

      <div className={styles.setup} id="robes-setup">
        <h2 className={styles.sectionTitle}><span>II</span> סוגי השאלות</h2>
        <p className={styles.muted}>כל שאלה נשענת על תמונה. אפשר לשלב הכול או להתמקד בסוג אחד.</p>
        <div className={styles.kinds} role="group" aria-label="סוגי שאלות">
          {KINDS.map(kind => <button key={kind} type="button" aria-pressed={kinds.includes(kind)} onClick={() => setKinds(toggle(kinds, kind))}>
            {KIND_LABELS[kind]}<span aria-hidden="true">{kinds.includes(kind) ? " ✓" : " +"}</span>
          </button>)}
        </div>
        <div className={styles.launch}>
          <fieldset><legend>אורך הסבב</legend>
            <div className={styles.segmented}>{[8, 12, 20, 30].map(value => <button key={value} type="button" aria-pressed={length === value} onClick={() => setLength(value)}>{value}</button>)}</div>
          </fieldset>
          <div className={styles.launchInfo}>
            <strong>{pool.length} קהילות בבחירה</strong>
            <small>{!pool.length ? "יש לבחור משפחה אחת לפחות" : !kinds.length ? "יש לבחור סוג שאלה אחד לפחות" : `${length} שאלות · מספרים 1–4 על המקלדת בוחרים תשובה`}</small>
          </div>
          <button type="button" className={styles.primary} disabled={!pool.length || !kinds.length} onClick={() => start()}>יוצאים לסמטאות <span aria-hidden="true">←</span></button>
        </div>
      </div>
    </>}

    {view === "guide" && <div className={styles.guide}>
      <header className={styles.bar}>
        <button type="button" className={styles.textButton} onClick={() => setView("home")}>← חזרה לשער</button>
        <span>מדריך השדה · {LIVE_GROUPS.length} קהילות</span>
        <button type="button" className={styles.textButton} onClick={() => start()} disabled={!pool.length || !kinds.length}>לתרגול ←</button>
      </header>
      <div className={styles.guideIntro}>
        <JerusalemCross className={styles.bigCross} />
        <h2>מדריך השדה ללבוש הכנסיות</h2>
        <p>למי שבאמצע סיור ושכח: מה מסגיר כל קהילה, איפה פוגשים אותה, ואיך לא להתבלבל. בכנסיית הקבר מחזיקות זכויות שש קהילות — <b>היוונים, הלטינים (הפרנציסקנים) והארמנים</b>, ולצדן <b>הקופטים, הסורים והאתיופים</b> — לפי הסטטוס קוו.</p>
      </div>
      {FAMILIES.map(family => <section key={family.id} className={styles.guideFamily} data-family={family.id}>
        <h3><small>{family.side === "east" ? "מזרח" : "מערב"}</small>{family.label}</h3>
        <p className={styles.muted}>{family.summary}</p>
        {LIVE_GROUPS.filter(g => g.family === family.id).map(group => <article key={group.id} className={styles.entry} id={`robes-${group.id}`}>
          <div className={styles.entryPhotos}>{photosOf(group.id).slice(0, 3).map(photo => <figure key={photo.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBasePath(photo.src)} alt={photo.alt} loading="lazy" width={photo.width} height={photo.height} style={{ objectPosition: `${photo.focus?.[0] ?? 50}% ${photo.focus?.[1] ?? 35}%` }} />
            <figcaption>{photo.caption}<Credit photo={photo} /></figcaption>
          </figure>)}</div>
          <div className={styles.entryBody}>
            <h4>{group.name}{group.holySepulchre && <span className={styles.badge} title="אחת משש הקהילות בכנסיית הקבר">כנסיית הקבר</span>}</h4>
            <p className={styles.entrySub}>{group.body}</p>
            <p className={styles.tell}><b>הסימן המובהק</b>{group.tell}</p>
            <ul>{group.cues.map(cue => <li key={cue}>{cue}</li>)}</ul>
            <p className={styles.places}><b>איפה פוגשים</b>{group.places.join(" · ")}</p>
            <p className={styles.mnemonic}>✦ {group.mnemonic}</p>
            {group.confusedWith && <p className={styles.trap}><b>לא להתבלבל</b>{group.confusedWith}</p>}
          </div>
        </article>)}
      </section>)}
    </div>}

    {view === "play" && session && question && <div className={styles.play} data-kind={question.kind}>
      <header className={styles.bar}>
        <button type="button" className={styles.textButton} onClick={() => { setSession(null); setView("home"); }}>← לשער</button>
        <span>שאלה <b>{session.index + 1}</b> מתוך {session.questions.length}</span>
        <span className={styles.score}>{stats.correct} נכונות · רצף {stats.streak}</span>
      </header>
      <div className={styles.progress} role="progressbar" aria-label="התקדמות בסבב" aria-valuenow={session.answers.length} aria-valuemin={0} aria-valuemax={session.questions.length}>
        <span style={{ width: `${session.answers.length / session.questions.length * 100}%` }} />
      </div>
      <div className={styles.stage}>
        <div className={styles.questionHead}>
          <span className={styles.kindTag}>{KIND_LABELS[question.kind]}</span>
          <h2 ref={promptRef} tabIndex={-1} data-prompt>{prompt(question)}</h2>
        </div>

        {"photo" in question && <SinglePhoto key={question.photo} photo={PHOTO_BY_ID.get(question.photo)!} revealed={!!answer}
          zoomed={question.kind === "detail" && !answer && !unzoomed} />}
        {question.kind === "detail" && !answer && <button type="button" className={styles.textButton} disabled={unzoomed} onClick={() => setUnzoomed(true)}>✧ להציג את כל התמונה (רמז)</button>}

        {"photos" in question && <div className={styles.grid} role="group" aria-label="ארבע תמונות">
          {question.photos.map((id, i) => {
            const photo = PHOTO_BY_ID.get(id)!;
            const right = photo.group === question.group;
            const state = !answer ? undefined : right ? "right" : picked === id ? "wrong" : "dim";
            return <button key={id} type="button" data-choice={id} data-state={state} disabled={!!answer}
              onClick={() => submit(right, GROUP_BY_ID.get(photo.group)!.name, id)} aria-label={`תמונה ${LETTERS[i]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBasePath(photo.src)} alt={answer ? photo.alt : `תמונה ${LETTERS[i]}`} width={photo.width} height={photo.height}
                style={{ objectPosition: `${photo.focus?.[0] ?? 50}% ${photo.focus?.[1] ?? 35}%` }} />
              <span className={styles.gridLetter} aria-hidden="true">{LETTERS[i]}</span>
              {answer && <span className={styles.gridName}>{GROUP_BY_ID.get(photo.group)!.name}</span>}
            </button>;
          })}
        </div>}

        {!answer && (question.kind === "who" || question.kind === "detail" || question.kind === "site") && <div className={styles.choices}>
          {question.choices.map((id, i) => {
            const label = question.kind === "site" ? GROUP_BY_ID.get(id)!.site : GROUP_BY_ID.get(id)!.name;
            return <button key={id} type="button" data-choice={id} onClick={() => submit(id === question.group, label)}><span aria-hidden="true">{LETTERS[i]}</span>{label}</button>;
          })}
        </div>}
        {!answer && question.kind === "family" && <div className={styles.choices}>
          {question.choices.map((id, i) => <button key={id} type="button" data-choice={id} onClick={() => submit(id === GROUP_BY_ID.get(question.group)!.family, FAMILY_BY_ID.get(id)!.label)}>
            <span aria-hidden="true">{LETTERS[i]}</span>{FAMILY_BY_ID.get(id)!.label}<small>{FAMILY_BY_ID.get(id)!.side === "east" ? "מזרח" : "מערב"}</small>
          </button>)}
        </div>}
        {!answer && question.kind === "typed" && <form className={styles.typed} onSubmit={event => { event.preventDefault(); if (input.trim()) submit(acceptsGroup(GROUP_BY_ID.get(question.group)!, input), input.trim()); }}>
          <label htmlFor="robes-answer">שם הקהילה או המסדר</label>
          <div><input id="robes-answer" autoComplete="off" spellCheck={false} value={input} onChange={event => setInput(event.target.value)} placeholder="למשל: ארמנים" maxLength={80} />
            <button type="submit" className={styles.primary} disabled={!input.trim()}>בדיקה</button></div>
          <small>אפשר ביחיד או ברבים, עם ה׳ הידיעה או בלעדיה.</small>
        </form>}
        {!answer && <button type="button" className={styles.skip} onClick={() => submit(false, "")}>לא יודע/ת — לחשוף</button>}

        {answer && <IdentityCard question={question} answer={answer} feedbackRef={feedbackRef} last={session.index + 1 === session.questions.length} onNext={next} />}
      </div>
    </div>}

    {view === "play" && session?.finished && <div className={styles.summary} data-summary>
      <JerusalemCross className={styles.bigCross} />
      <h2 ref={promptRef} tabIndex={-1}>הסיור הסתיים</h2>
      <div className={styles.ring}><strong>{stats.percent}<small>%</small></strong><span>דיוק</span></div>
      <p className={styles.resultLine}>{stats.correct} מתוך {stats.total} זיהויים נכונים · רצף שיא {stats.best}</p>
      <div className={styles.summaryActions}>
        {!!missed.length && <button type="button" className={styles.primary} onClick={() => start(missed)}>סבב חיזוק על {missed.length} הקהילות שהתבלבלתי בהן</button>}
        <button type="button" className={styles.secondary} onClick={() => start()}>סבב חדש</button>
        <button type="button" className={styles.textButton} onClick={() => setView("guide")}>למדריך השדה</button>
        <button type="button" className={styles.textButton} onClick={() => { setSession(null); setView("home"); }}>לשנות בחירה</button>
      </div>
      {!!missed.length && <div className={styles.review}><h3>שווה להציץ שוב</h3>
        {missed.map(id => { const group = GROUP_BY_ID.get(id)!; const photo = photosOf(id)[0]; return <div key={id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {photo && <img src={withBasePath(photo.src)} alt={photo.alt} width={72} height={90} style={{ objectPosition: `${photo.focus?.[0] ?? 50}% ${photo.focus?.[1] ?? 35}%` }} />}
          <p><strong>{group.name}</strong>{group.tell}</p>
        </div>; })}
      </div>}
      {!missed.length && <p className={styles.perfect}>זיהוי מושלם. נסו להוסיף סוגי שאלות או להאריך את הסבב.</p>}
    </div>}
  </section>;
}

function IdentityCard({ question, answer, feedbackRef, last, onNext }: {
  question: Question; answer: Answer; feedbackRef: React.RefObject<HTMLHeadingElement | null>; last: boolean; onNext: () => void;
}) {
  const group = GROUP_BY_ID.get(question.group)!;
  const family = FAMILY_BY_ID.get(group.family)!;
  const headline = answer.correct ? "זיהוי נכון!" : answer.given ? "לא בדיוק." : "הנה התשובה.";
  return <div className={styles.card} data-feedback data-correct={answer.correct} aria-live="polite">
    <h3 ref={feedbackRef} tabIndex={-1}>{headline}</h3>
    {!answer.correct && answer.given && <p className={styles.given}>בחרת: {answer.given}</p>}
    <p className={styles.cardName}>
      {question.kind === "sepulchre" ? <>{group.name} — אינם בין שש הקהילות של כנסיית הקבר.</> : <>{group.name}</>}
    </p>
    <p className={styles.cardMeta}>{family.label} · {family.side === "east" ? "מזרח" : "מערב"}{question.kind === "site" && <> · {group.site}</>}</p>
    <p className={styles.tell}><b>הסימן המובהק</b>{group.tell}</p>
    <ul>{group.cues.slice(0, 3).map(cue => <li key={cue}>{cue}</li>)}</ul>
    <p className={styles.mnemonic}>✦ {group.mnemonic}</p>
    {group.confusedWith && <p className={styles.trap}><b>לא להתבלבל</b>{group.confusedWith}</p>}
    {"photos" in question && <p className={styles.credits}>{question.photos.map(id => <Credit key={id} photo={PHOTO_BY_ID.get(id)!} />)}</p>}
    <button type="button" className={styles.primary} onClick={onNext}>{last ? "לסיכום הסיור" : "לשאלה הבאה"} <span aria-hidden="true">←</span></button>
  </div>;
}
