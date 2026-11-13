import { InkIcon } from "@/components/trail/Ink";
import { Chip, PageHead, TrailPage } from "@/components/trail/kit";
import { TOPIC_HUB } from "@/data/topic-hub";
import { pageMeta } from "@/lib/seo";
import { TopicHub } from "@/components/topics/TopicHub";

export const metadata = pageMeta({
  title: "עיוני",
  description: "כל נושאי הלימוד העיוני במקום אחד: לכל נושא שאלון, מאגר מידע, סיכום, עזרי למידה, מפות ומשחקים.",
  path: "/topics/",
});

export default function TopicsPage() {
  return (
    <TrailPage>
      <PageHead title="עיוני" art={<InkIcon name="resources" size={72} />} lede="כל נושאי הלימוד העיוני. בוחרים נושא, ולוחצים על מה שרוצים: שאלון, מאגר מידע, סיכום, עזר למידה או משחק." />
      <nav aria-label="קבוצות נושאים" className="mb-10 flex flex-wrap gap-2.5">
        {TOPIC_HUB.map((g) => (
          <Chip key={g.id} href={`#hub-${g.id}`}>
            {g.title}
          </Chip>
        ))}
      </nav>
      <TopicHub />
    </TrailPage>
  );
}
