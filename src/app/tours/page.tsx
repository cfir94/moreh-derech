import { PageDecor } from "@/components/trail/PageDecor";
import { InkIcon } from "@/components/trail/Ink";
import { PageHead, TrailPage } from "@/components/trail/kit";
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
    <TrailPage decor={<PageDecor birds items={["signpost", "butterfly", "hills", "lake", "binoculars", "tent", "canteen", "compass"]} step={300} />}>
      <PageHead title="סיורים" art={<InkIcon name="signpost" size={72} />} lede="בוחרים אזור ופותחים את מאגר המידע של הסיור. כלים נוספים לסיורים יתווספו כאן בהמשך." />
      <TopicHub groups={TOUR_HUB} />
    </TrailPage>
  );
}
