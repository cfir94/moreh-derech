import type { Metadata } from "next";
import { embedUrl } from "@/lib/basePath";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function BiblicalClassicPage() {
  return <div className="h-[calc(100dvh-60px)] min-h-[500px] w-full"><iframe src={embedUrl("timelines/biblical/")} title="הגרסה הקלאסית של צירי הברית החדשה" className="h-full w-full border-0" allow="fullscreen" allowFullScreen /></div>;
}
