"use client";

/* eslint-disable @next/next/no-img-element -- a static export: next/image would need its loader turned off for these files anyway */
import { useCallback, useMemo, useState } from "react";
import { BUILDER_BY_ID, type MapSite } from "@/data/learning-map";
import { sitePhotos } from "@/data/learning-map/photo-index";
import type { SitePhoto } from "@/data/learning-map/photo-types";
import { recordAnswer, siteStatus, type MapProgress } from "@/lib/learningMapProgress";
import { withBasePath } from "@/lib/basePath";
import styles from "./LearningMap.module.css";

export type PracticeMode = "where" | "what" | "photo";

export const MODES: { id: PracticeMode; title: string; hint: string }[] = [
  { id: "where", title: "איפה זה?", hint: "שאלה בסגנון המבחן — מסמנים את האתר על המפה." },
  { id: "what", title: "מה זה?", hint: "נקודה מהבהבת על המפה — בוחרים את שם האתר." },
  { id: "photo", title: "זיהוי מתמונה", hint: "תמונה של אתר או של ממצא — מסמנים על המפה איפה זה." },
];

type Question = {
  site: MapSite;
  prompt: string;
  photo?: SitePhoto;
  options?: MapSite[];
};

export type PracticeState = {
  mode: PracticeMode;
  questions: Question[];
  index: number;
  answer?: { siteId: string; correct: boolean };
  score: number;
  misses: string[];
};

const ROUND = 10;

/** The "show me" answer: counts as a miss, marks nothing on the map. */
export const GIVE_UP = "__none__";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Distractors that are plausible: same period first, then anything. */
function optionsFor(site: MapSite, pool: MapSite[], all: MapSite[]) {
  const periods = new Set(site.layers.map((l) => l.period));
  const near = shuffle(pool.filter((s) => s.id !== site.id && s.layers.some((l) => periods.has(l.period))));
  const rest = shuffle(all.filter((s) => s.id !== site.id && !near.includes(s)));
  return shuffle([site, ...[...near, ...rest].slice(0, 3)]);
}

export function buildRound(mode: PracticeMode, pool: MapSite[], all: MapSite[], progress: MapProgress): Question[] {
  let candidates = pool;
  if (mode === "photo") candidates = pool.filter((s) => sitePhotos(s).length > 0);
  // sites waiting for review come first, then the rest at random
  const review = shuffle(candidates.filter((s) => siteStatus(progress[s.id]) === "review"));
  const others = shuffle(candidates.filter((s) => siteStatus(progress[s.id]) !== "review"));
  return [...review, ...others].slice(0, ROUND).map((site) => {
    if (mode === "where") return { site, prompt: pickOne(site.ask) };
    if (mode === "what") return { site, prompt: "איזה אתר מסומן על המפה?", options: optionsFor(site, pool, all) };
    const photo = pickOne(sitePhotos(site)).photo;
    return { site, photo, prompt: "איפה זה? סמנו את האתר על המפה." };
  });
}

export function usePractice() {
  const [state, setState] = useState<PracticeState | null>(null);

  const start = useCallback((mode: PracticeMode, pool: MapSite[], all: MapSite[], progress: MapProgress) => {
    const questions = buildRound(mode, pool, all, progress);
    setState({ mode, questions, index: 0, score: 0, misses: [] });
    return questions[0]?.site;
  }, []);

  const answer = useCallback((siteId: string) => {
    setState((s) => {
      if (!s || s.answer || s.index >= s.questions.length) return s;
      const target = s.questions[s.index].site;
      const correct = siteId === target.id;
      recordAnswer(target.id, correct);
      return {
        ...s,
        answer: { siteId, correct },
        score: s.score + (correct ? 1 : 0),
        misses: correct ? s.misses : [...s.misses, target.id],
      };
    });
  }, []);

  const next = useCallback(() => {
    setState((s) => (s ? { ...s, index: s.index + 1, answer: undefined } : s));
  }, []);

  const stop = useCallback(() => setState(null), []);

  return { state, start, answer, next, stop };
}

type PanelProps = {
  practice: ReturnType<typeof usePractice>;
  poolSize: number;
  photoPoolSize: number;
  scopeLabel: string;
  onStart: (mode: PracticeMode) => void;
  onAnswer: (siteId: string) => void;
  onNext: () => void;
  onShowSite: (siteId: string) => void;
  nameOf: (id: string) => string;
};

export function PracticePanel({ practice, poolSize, photoPoolSize, scopeLabel, onStart, onAnswer, onNext, onShowSite, nameOf }: PanelProps) {
  const s = practice.state;
  const q = s?.questions[s.index];

  const summary = useMemo(() => {
    if (!s || q) return null;
    return { score: s.score, total: s.questions.length, misses: s.misses };
  }, [s, q]);

  if (!s) {
    return (
      <div className={styles.practiceStart}>
        <p className={styles.scope}>
          תרגול על <b>{poolSize}</b> אתרים — {scopeLabel}. אתרים שסומנו לחזרה, או שטעיתם בהם, נשאלים ראשונים.
        </p>
        {MODES.map((m) => {
          const disabled = m.id === "photo" ? photoPoolSize === 0 : poolSize < (m.id === "what" ? 2 : 1);
          return (
            <button key={m.id} type="button" className={styles.modeBtn} onClick={() => onStart(m.id)} disabled={disabled}>
              <strong>{m.title}</strong>
              <span>{m.id === "photo" && photoPoolSize === 0 ? "אין עדיין תמונות לאתרים שבסינון." : m.hint}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (summary) {
    const pct = Math.round((summary.score / Math.max(1, summary.total)) * 100);
    return (
      <div className={styles.practiceEnd}>
        <div className={styles.scoreRing} style={{ ["--pct" as string]: pct }}>
          <strong>{summary.score}/{summary.total}</strong>
        </div>
        <p>{pct >= 90 ? "מצוין — אתם מכירים את האתרים." : pct >= 60 ? "יפה. כדאי לעבור שוב על הטעויות." : "כדאי לחזור על האתרים ולנסות שוב."}</p>
        {summary.misses.length > 0 && (
          <>
            <h3>לחזור על:</h3>
            <ul className={styles.missList}>
              {summary.misses.map((id) => (
                <li key={id}><button type="button" onClick={() => onShowSite(id)}>{nameOf(id)}</button></li>
              ))}
            </ul>
          </>
        )}
        <div className={styles.practiceActions}>
          <button type="button" className={styles.primary} onClick={() => onStart(s.mode)}>עוד סבב</button>
          <button type="button" onClick={practice.stop}>לבחור תרגול אחר</button>
        </div>
      </div>
    );
  }

  if (!q) return null;
  const a = s.answer;
  const layer = q.site.layers.find((l) => l.key) ?? q.site.layers[0];
  const builder = layer.builder ? BUILDER_BY_ID[layer.builder] : undefined;

  return (
    <div className={styles.question}>
      <div className={styles.qMeta}>
        <span>{MODES.find((m) => m.id === s.mode)?.title}</span>
        <span>שאלה {s.index + 1} מתוך {s.questions.length} · {s.score} נכונות</span>
      </div>
      <div className={styles.qProgress}><span style={{ width: `${(s.index / s.questions.length) * 100}%` }} /></div>

      {q.photo && (
        <figure className={styles.qPhoto}>
          <img src={withBasePath(q.photo.src)} alt="תמונה לזיהוי" width={q.photo.width} height={q.photo.height} />
          {a && <figcaption>{q.photo.caption}</figcaption>}
        </figure>
      )}
      <p className={styles.qPrompt}>{q.prompt}</p>
      {!a && s.mode !== "what" && <p className={styles.qHint}>לחצו על הנקודה הנכונה במפה. אתרי ירושלים — בגיליון &quot;ירושלים&quot;.</p>}

      {q.options && (
        <div className={styles.options}>
          {q.options.map((o) => {
            const state = !a ? "" : o.id === q.site.id ? styles.optRight : o.id === a.siteId ? styles.optWrong : styles.optFade;
            return (
              <button key={o.id} type="button" className={state} disabled={!!a} onClick={() => onAnswer(o.id)}>
                {o.name}
              </button>
            );
          })}
        </div>
      )}

      {a && (
        <div className={`${styles.feedback} ${a.correct ? styles.fbRight : styles.fbWrong}`} role="status">
          <strong>{a.correct ? "✓ נכון!" : "✗ לא בדיוק"}</strong>
          <p>
            {q.site.name}
            {!a.correct && a.siteId !== GIVE_UP && <> — סימנתם את {nameOf(a.siteId)}</>}
          </p>
          <p className={styles.fbFact}>
            {layer.date}{builder ? ` · ${builder.name}` : ""} · {layer.title}
          </p>
          <p className={styles.fbTip}>💡 {q.site.tip}</p>
          <div className={styles.practiceActions}>
            <button type="button" className={styles.primary} onClick={onNext}>
              {s.index + 1 < s.questions.length ? "לשאלה הבאה ←" : "לסיכום ←"}
            </button>
            <button type="button" onClick={() => onShowSite(q.site.id)}>פרטי האתר</button>
          </div>
        </div>
      )}

      {!a && (
        <button type="button" className={styles.giveUp} onClick={() => onAnswer(GIVE_UP)}>לא יודע — הראו לי</button>
      )}
    </div>
  );
}
