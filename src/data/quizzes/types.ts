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
};
