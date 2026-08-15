import { PlaceholderSection } from "@/components/PlaceholderSection";

export default function VideosPage() {
  return (
    <PlaceholderSection
      title="סרטונים מומלצים"
      description="ספריית סרטונים מומלצים לצפייה, מסודרת לפי נושאי הקורס."
      planned={[
        "סרטונים מסודרים לפי נושא, עם נגן מוטמע בתוך האתר",
        "סימון סרטונים שכבר צפיתם בהם",
        "קישור בין סרטון לנושאים הרלוונטיים בשאלונים",
      ]}
    />
  );
}
