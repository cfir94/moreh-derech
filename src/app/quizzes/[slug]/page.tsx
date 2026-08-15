import { notFound } from "next/navigation";
import { QUIZZES, getQuiz } from "@/data/quizzes";
import { QuizRunner } from "@/components/quiz/QuizRunner";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ slug: q.slug }));
}

export default async function QuizPage({ params }: PageProps<"/quizzes/[slug]">) {
  const { slug } = await params;
  const quiz = getQuiz(slug);
  if (!quiz) notFound();

  return <QuizRunner quiz={quiz} />;
}
