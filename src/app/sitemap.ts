import type { MetadataRoute } from "next";
import { EXAMS } from "@/data/exams";
import { QUIZZES } from "@/data/quizzes";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

const PUBLIC_ROUTES = [
  "/",
  "/quizzes",
  "/exams",
  "/timelines",
  "/games",
  "/map",
  "/map/learn",
  "/resources",
  "/guide-reports",
  "/videos",
  "/pricing",
  "/welcome",
  "/legal/terms",
  "/legal/privacy",
  "/legal/accessibility",
  "/games/crossword",
  "/games/who-am-i",
  "/games/jerusalem-robes",
  "/timelines/history-atlas",
  "/timelines/roman",
  "/timelines/byzantine",
  "/timelines/classical-architecture",
  "/timelines/plants-guide",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const primaryPages: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
  const quizPages: MetadataRoute.Sitemap = QUIZZES.map(({ slug }) => ({
    url: absoluteUrl(`/quizzes/${slug}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const examPages: MetadataRoute.Sitemap = EXAMS.map(({ slug }) => ({
    url: absoluteUrl(`/exams/${slug}`),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...primaryPages, ...quizPages, ...examPages];
}
