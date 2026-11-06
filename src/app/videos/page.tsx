import { pageMeta } from "@/lib/seo";
/**
 * עיצוב "שכבות של דרך": עמוד ייעודי לספריית צפייה, המשמר את מעטפת האתר הקיימת.
 */
import { VideoLibrary } from "@/components/videos/VideoLibrary";

export const metadata = pageMeta({
  title: "סרטונים למורי דרך",
  description: "ספריית סרטוני לימוד למורי דרך לפי נושאי הקורס, עם סיורים מצולמים, תכני העשרה, חיפוש וסינון ונגן לצפייה מסודרת במקום אחד.",
  path: "/videos",
});

export default function VideosPage() {
  return <VideoLibrary />;
}
