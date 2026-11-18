import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/data/articles";
import { resolvePhoto } from "@/data/articles/photos";
import { ArticleView } from "@/components/articles/ArticleView";
import { absoluteUrl, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const base = pageMeta({ title: article.title, description: article.lede, path: `/articles/${slug}` });
  const image = absoluteUrl(resolvePhoto(article.hero).src);
  return {
    ...base,
    openGraph: { ...base.openGraph, type: "article", publishedTime: article.date, images: [image] },
  };
}

export default async function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  return <ArticleView article={article} />;
}
