import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "משחק אֶבֶן דֶּרֶךְ | משחקים",
  description: "משחק ידיעת הארץ של אֶבֶן דֶּרֶךְ",
};

export default function GeographyGamePage() {
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
