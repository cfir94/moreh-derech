import { pageMeta } from "@/lib/seo";
import {FirstVisitTour} from "@/components/tour/FirstVisitTour";
import {HistoryAtlas} from "@/components/history-atlas/HistoryAtlas";
export const metadata = pageMeta({
  title: "אטלס הזמן",
  description: "אילן זמן אינטראקטיבי מראשית האדם עד הכיבוש המוסלמי, עם אירועים מאוירים, דמויות וקשרי משפחה, מקורות מחומר הקורס וזום מהמבט הרחב לכל פרט.",
  path: "/timelines/history-atlas",
});

export default function HistoryAtlasPage(){return <><HistoryAtlas/><FirstVisitTour id="history-atlas"/></>;}
