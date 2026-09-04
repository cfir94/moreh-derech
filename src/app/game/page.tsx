import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "המשחק | אבן דרך למורי דרך",
  description: "משחק אבן דרך בתוך מערכת הלמידה למורי דרך",
};

/**
 * The game remains an independent app, but is presented inside the site's
 * shell so navigation and the shared account stay available throughout play.
 */
export default function GamePage() {
  return (
    <div className="h-[calc(100dvh-60px)] min-h-[500px] w-full">
      <iframe
        src="https://cfir94.github.io/israel-geo-game/"
        title="משחק אבן דרך"
        className="h-full w-full border-0"
        allow="geolocation; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
