import { readSession } from "@/lib/cloudAuth";

/*
 * Progress store (v2).
 *
 * Tracks two things per user, in localStorage:
 *  - attempts: one row per finished quiz run, for history + accuracy over time
 *  - questions: per-question mastery, keyed "<quizSlug>:<questionId>"
 *
 * Per-question state is what powers "תרגול טעויות" — a question counts as
 * needing review while its most recent answer was wrong, so getting it right
 * later clears it without erasing the fact that it was once missed.
 */

export type AttemptRecord = {
  ts: number;
  quiz: string;
  quizLabel: string;
  category: string;
  correct: number;
  total: number;
};

export type QuestionStat = {
  quiz: string;
  questionId: number;
  question: string;
  category: string;
  seen: number;
  wrong: number;
  lastCorrectAt: number | null;
  lastWrongAt: number | null;
};

export type ProgressState = {
  attempts: AttemptRecord[];
  questions: Record<string, QuestionStat>;
};

export const PROGRESS_KEY = "md_progress_v2";
export const PROGRESS_EVENT = "md-progress-changed";
const LEGACY_KEY = "md_quiz_progress_v1";

export const emptyProgress: ProgressState = { attempts: [], questions: {} };

export function questionKey(quiz: string, questionId: number) {
  return `${quiz}:${questionId}`;
}

/** Pure parse of the stored JSON, tolerant of corrupt or absent data. */
export function parseProgress(raw: string | null): ProgressState {
  if (!raw) return emptyProgress;
  try {
    const parsed = JSON.parse(raw);
    return {
      attempts: Array.isArray(parsed?.attempts) ? parsed.attempts : [],
      questions:
        parsed?.questions && typeof parsed.questions === "object"
          ? parsed.questions
          : {},
    };
  } catch {
    return emptyProgress;
  }
}

function parseLegacyProgress(raw: string | null): ProgressState {
  if (!raw) return emptyProgress;
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return emptyProgress;
    return {
      attempts: list.map((entry) => ({
        ts: entry.ts ?? Date.now(),
        quiz: entry.quiz ?? "unknown",
        quizLabel: entry.quizLabel ?? entry.quiz ?? "שאלון",
        category: entry.category ?? "הכל",
        correct: entry.correct ?? 0,
        total: entry.total ?? 0,
      })),
      questions: {},
    };
  } catch {
    return emptyProgress;
  }
}

export function readProgress(): ProgressState {
  if (typeof window === "undefined") return emptyProgress;

  const raw = window.localStorage.getItem(progressStorageKey());
  if (raw) return parseProgress(raw);

  // Signed-in accounts never inherit another browser user's guest data.
  if (readSession()) return emptyProgress;

  // Carry over attempt history written by the previous embed-based version.
  return parseLegacyProgress(window.localStorage.getItem(LEGACY_KEY));
}

function write(state: ProgressState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(progressStorageKey(), JSON.stringify(state));
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* quota or private mode — tracking is best-effort, never fatal */
  }
}

export type RecordedAnswer = {
  questionId: number;
  question: string;
  category: string;
  correct: boolean;
  /** Quiz this question belongs to; defaults to the attempt's quiz. */
  quiz?: string;
};

export function recordAttempt(args: {
  quiz: string;
  quizLabel: string;
  category: string;
  answers: RecordedAnswer[];
}) {
  const currentState = readProgress();
  // Never mutate the shared empty snapshot used during SSR/hydration.
  const state: ProgressState = {
    attempts: [...currentState.attempts],
    questions: { ...currentState.questions },
  };
  const now = Date.now();
  const correct = args.answers.filter((a) => a.correct).length;

  state.attempts.push({
    ts: now,
    quiz: args.quiz,
    quizLabel: args.quizLabel,
    category: args.category,
    correct,
    total: args.answers.length,
  });

  for (const a of args.answers) {
    // Review runs mix questions from several quizzes; credit each to its own.
    const owner = a.quiz ?? args.quiz;
    const key = questionKey(owner, a.questionId);
    const prev: QuestionStat = state.questions[key] ?? {
      quiz: owner,
      questionId: a.questionId,
      question: a.question,
      category: a.category,
      seen: 0,
      wrong: 0,
      lastCorrectAt: null,
      lastWrongAt: null,
    };

    state.questions[key] = {
      ...prev,
      question: a.question,
      category: a.category,
      seen: prev.seen + 1,
      wrong: prev.wrong + (a.correct ? 0 : 1),
      lastCorrectAt: a.correct ? now : prev.lastCorrectAt,
      lastWrongAt: a.correct ? prev.lastWrongAt : now,
    };
  }

  write(state);
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(progressStorageKey());
  if (!readSession()) window.localStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

/** Each signed-in user gets a separate local mirror; guests keep the old key. */
export function progressStorageKey(userId = readSession()?.user_id) {
  return userId ? `${PROGRESS_KEY}:${userId}` : PROGRESS_KEY;
}

function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const attempts = [...a.attempts];
  const seenAttempts = new Set(
    attempts.map((item) =>
      [item.ts, item.quiz, item.category, item.correct, item.total].join("|"),
    ),
  );
  for (const item of b.attempts) {
    const key = [item.ts, item.quiz, item.category, item.correct, item.total].join("|");
    if (!seenAttempts.has(key)) {
      attempts.push(item);
      seenAttempts.add(key);
    }
  }

  const questions = { ...a.questions };
  for (const [key, incoming] of Object.entries(b.questions)) {
    const current = questions[key];
    if (!current) {
      questions[key] = incoming;
      continue;
    }
    questions[key] = {
      ...current,
      question: incoming.question || current.question,
      category: incoming.category || current.category,
      seen: current.seen + incoming.seen,
      wrong: current.wrong + incoming.wrong,
      lastCorrectAt: Math.max(current.lastCorrectAt ?? 0, incoming.lastCorrectAt ?? 0) || null,
      lastWrongAt: Math.max(current.lastWrongAt ?? 0, incoming.lastWrongAt ?? 0) || null,
    };
  }
  return { attempts, questions };
}

/** One-time migration from the site's former browser-wide store. */
export function migrateGuestProgressToUser(userId: string) {
  if (typeof window === "undefined") return;
  const guestRaw = window.localStorage.getItem(PROGRESS_KEY);
  const legacyRaw = window.localStorage.getItem(LEGACY_KEY);
  if (!guestRaw && !legacyRaw) return;
  const userKey = progressStorageKey(userId);
  let merged = parseProgress(window.localStorage.getItem(userKey));
  if (guestRaw) merged = mergeProgress(merged, parseProgress(guestRaw));
  if (legacyRaw) merged = mergeProgress(merged, parseLegacyProgress(legacyRaw));
  window.localStorage.setItem(userKey, JSON.stringify(merged));
  window.localStorage.removeItem(PROGRESS_KEY);
  window.localStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

/** Questions whose most recent answer was wrong — the review queue. */
export function needsReview(state: ProgressState, quiz?: string): QuestionStat[] {
  return Object.values(state.questions)
    .filter((q) => (quiz ? q.quiz === quiz : true))
    .filter((q) => q.lastWrongAt !== null)
    .filter((q) => q.lastCorrectAt === null || q.lastWrongAt! > q.lastCorrectAt)
    .sort((a, b) => b.wrong - a.wrong || (b.lastWrongAt ?? 0) - (a.lastWrongAt ?? 0));
}

export type QuizSummary = {
  quiz: string;
  quizLabel: string;
  attempts: number;
  correct: number;
  total: number;
  accuracyPct: number;
  answeredQuestions: number;
  reviewCount: number;
  lastAt: number;
};

export type Summary = {
  totalAttempts: number;
  totalAnswered: number;
  totalCorrect: number;
  accuracyPct: number;
  reviewCount: number;
  byQuiz: QuizSummary[];
  recent: AttemptRecord[];
};

export function summarize(state: ProgressState): Summary {
  const totalAttempts = state.attempts.length;
  const totalAnswered = state.attempts.reduce((s, a) => s + a.total, 0);
  const totalCorrect = state.attempts.reduce((s, a) => s + a.correct, 0);

  const byQuizMap = new Map<string, QuizSummary>();
  for (const a of state.attempts) {
    const cur = byQuizMap.get(a.quiz) ?? {
      quiz: a.quiz,
      quizLabel: a.quizLabel,
      attempts: 0,
      correct: 0,
      total: 0,
      accuracyPct: 0,
      answeredQuestions: 0,
      reviewCount: 0,
      lastAt: 0,
    };
    cur.attempts += 1;
    cur.correct += a.correct;
    cur.total += a.total;
    cur.quizLabel = a.quizLabel;
    cur.lastAt = Math.max(cur.lastAt, a.ts);
    byQuizMap.set(a.quiz, cur);
  }

  for (const q of Object.values(state.questions)) {
    const cur = byQuizMap.get(q.quiz);
    if (cur) cur.answeredQuestions += 1;
  }

  for (const [slug, cur] of byQuizMap) {
    cur.accuracyPct = cur.total ? Math.round((cur.correct / cur.total) * 100) : 0;
    cur.reviewCount = needsReview(state, slug).length;
  }

  return {
    totalAttempts,
    totalAnswered,
    totalCorrect,
    accuracyPct: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    reviewCount: needsReview(state).length,
    byQuiz: Array.from(byQuizMap.values()).sort((a, b) => b.lastAt - a.lastAt),
    recent: [...state.attempts].sort((a, b) => b.ts - a.ts).slice(0, 8),
  };
}
