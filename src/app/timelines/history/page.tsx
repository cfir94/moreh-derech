import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ציר הזמן ההיסטורי | אֶבֶן דֶּרֶךְ למורי דרך",
  description: "ציר זמן אינטראקטיבי לתיארוך אירועים, דמויות ותקופות",
};

/**
 * The historical timeline is maintained as its own GitHub Pages app. Embedding
 * it here keeps its rich exercises intact while the site's navigation remains
 * visible around it.
 */
export default function HistoryTimelinePage() {
  return (
    <div className="h-[calc(100dvh-60px)] min-h-[500px] w-full">
      <iframe
        src="https://cfir94.github.io/History_timeline/"
        title="ציר הזמן ההיסטורי — קורס מורי דרך"
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
}
