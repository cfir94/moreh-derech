import { pageMeta } from "@/lib/seo";
import { TopicHub } from "@/components/topics/TopicHub";
import { TOUR_HUB } from "@/data/topic-hub";

export const metadata = pageMeta({
  title: "סיורים",
  description: "סיורי הקורס לפי אזור: מאגרי המידע של כל סיור במקום אחד.",
  path: "/tours/",
});

export default function ToursPage() {
  return (
    <div className="screen-in mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="grad-text text-4xl leading-tight font-black">סיורים</h1>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-txt-dim">
          בוחרים אזור ופותחים את מאגר המידע של הסיור. כלים נוספים לסיורים יתווספו כאן בהמשך.
        </p>
      </header>
      <TopicHub groups={TOUR_HUB} />
    </div>
  );
}
