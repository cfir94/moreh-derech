export type QuizProgressEntry = {
  ts: number;
  quiz: string;
  quizLabel: string;
  category?: string;
  correct: number;
  total: number;
  wrongQuestions: string[];
};

const PROGRESS_KEY = "md_quiz_progress_v1";

export function readProgress(): QuizProgressEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export type ProgressSummary = {
  totalAttempts: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracyPct: number;
  byQuiz: {
    quiz: string;
    quizLabel: string;
    attempts: number;
    correct: number;
    total: number;
    accuracyPct: number;
  }[];
  frequentMistakes: { question: string; count: number }[];
};

export function summarizeProgress(entries: QuizProgressEntry[]): ProgressSummary {
  const totalAttempts = entries.length;
  const totalQuestions = entries.reduce((sum, e) => sum + e.total, 0);
  const totalCorrect = entries.reduce((sum, e) => sum + e.correct, 0);

  const byQuizMap = new Map<
    string,
    { quiz: string; quizLabel: string; attempts: number; correct: number; total: number }
  >();
  for (const e of entries) {
    const existing = byQuizMap.get(e.quiz) ?? {
      quiz: e.quiz,
      quizLabel: e.quizLabel,
      attempts: 0,
      correct: 0,
      total: 0,
    };
    existing.attempts += 1;
    existing.correct += e.correct;
    existing.total += e.total;
    byQuizMap.set(e.quiz, existing);
  }

  const mistakeCounts = new Map<string, number>();
  for (const e of entries) {
    for (const q of e.wrongQuestions) {
      mistakeCounts.set(q, (mistakeCounts.get(q) ?? 0) + 1);
    }
  }

  return {
    totalAttempts,
    totalQuestions,
    totalCorrect,
    accuracyPct: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    byQuiz: Array.from(byQuizMap.values())
      .map((q) => ({
        ...q,
        accuracyPct: q.total ? Math.round((q.correct / q.total) * 100) : 0,
      }))
      .sort((a, b) => b.attempts - a.attempts),
    frequentMistakes: Array.from(mistakeCounts.entries())
      .map(([question, count]) => ({ question, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15),
  };
}
