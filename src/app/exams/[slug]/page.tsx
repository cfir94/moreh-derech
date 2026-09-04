import { notFound } from "next/navigation";
import { EXAMS, getExam } from "@/data/exams";
import { ExamRunner } from "@/components/exam/ExamRunner";

export function generateStaticParams() {
  return EXAMS.map((e) => ({ slug: e.slug }));
}

export default async function ExamPage({ params }: PageProps<"/exams/[slug]">) {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) notFound();

  return <ExamRunner exam={exam} />;
}
