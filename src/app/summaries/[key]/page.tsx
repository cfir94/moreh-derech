import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SummaryView } from "@/components/summaries/SummaryView";
import { getSummary, SUMMARIES } from "@/data/summaries";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return SUMMARIES.map((summary) => ({ key: summary.key }));
}

export async function generateMetadata({
  params,
}: PageProps<"/summaries/[key]">): Promise<Metadata> {
  const { key } = await params;
  const summary = getSummary(key);

  if (!summary) return {};

  return pageMeta({
    title: summary.title,
    description: summary.lede,
    path: `/summaries/${summary.key}`,
  });
}

export default async function SummaryPage({
  params,
}: PageProps<"/summaries/[key]">) {
  const { key } = await params;
  const summary = getSummary(key);

  if (!summary) notFound();

  return <SummaryView summary={summary} />;
}
