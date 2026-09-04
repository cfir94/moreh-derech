export type Answer = {
  text: string;
  correct: boolean;
};

export type QuizImage = {
  url: string;
  fit?: "cover" | "contain";
  credit?: string;
};

export type Question = {
  id: number;
  question: string;
  category: string;
  answers: Answer[];
  image?: QuizImage;
  /** Shown after answering, when supplied by the source quiz. */
  explanation?: string;
  /** Course material or lecture on which the answer is based. */
  source?: string;
  /**
   * Subject from the licensing syllabus (`src/data/topics.ts`). Lets the bank
   * be drilled by subject as well as by sitting, and points a missed question
   * at the material to go and read.
   */
  topic?: string;
  /**
   * Set when a question is pulled into a mixed run (review mode) so its result
   * is still credited to the quiz it actually belongs to.
   */
  sourceQuiz?: string;
};

export type Quiz = {
  slug: string;
  label: string;
  categories: string[];
  questions: Question[];
  /**
   * What a category means in this quiz — subject areas in most, but exam
   * sittings in the past-exams quiz. Singular then plural.
   */
  categoryNoun?: { one: string; many: string };
};
