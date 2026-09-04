import type { Exam } from "@/data/exams/types";
import july2024 from "@/data/exams/july-2024";

export const EXAMS: Exam[] = [july2024];

export function getExam(slug: string): Exam | undefined {
  return EXAMS.find((e) => e.slug === slug);
}
