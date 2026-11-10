import type { Metadata } from "next";
import { Suspense } from "react";
import { Community } from "@/components/community/Community";

export const metadata: Metadata = {
  title: "קהילה | אבן דרך",
  description: "פורום המחזור ולוח הפרסומים על השתלמויות וקורסים למורי דרך.",
  robots: { index: false },
};

export default function CommunityPage() {
  return <Suspense fallback={null}><Community /></Suspense>;
}
