import { pageMeta } from "@/lib/seo";
import { TopicHub } from "@/components/topics/TopicHub";

export const metadata = pageMeta({
  title: "לפי נושא",
  description: "כל נושאי הלימוד במקום אחד: לכל נושא שאלון, מאגר מידע, סיכום, עזרי למידה, מפות ומשחקים.",
  path: "/topics/",
});

export default function TopicsPage() {
  return (
    <div className="screen-in mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="grad-text text-4xl leading-tight font-black">לפי נושא</h1>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-txt-dim">
          בוחרים נושא, ולוחצים על מה שרוצים: שאלון, מאגר מידע, סיכום, עזר למידה או משחק.
        </p>
      </header>
      <TopicHub />
    </div>
  );
}
