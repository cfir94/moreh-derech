import type {Metadata} from "next";
import {HistoryAtlas} from "@/components/history-atlas/HistoryAtlas";
export const metadata:Metadata={title:"אטלס הזמן — דמויות ואירועים | אבן דרך למורי דרך",description:"מפת זמן אינטראקטיבית של בית שני: זום מן המבט על אל כל דמות ואירוע, גרירה לאורך השנים, קשרים ומקורות מחומר הקורס."};
export default function HistoryAtlasPage(){return <HistoryAtlas/>;}
