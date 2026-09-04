import { embedUrl } from "@/lib/basePath";

/*
 * Design philosophy: "אטלס שכבות חי" — the self-contained MapLibre field tool
 * keeps its offline engine, while its shell mirrors Even Derech's cool blue-grey
 * ground, translucent cards, teal actions and compact learning hierarchy.
 */
export default function MapPage() {
  return (
    <div className="flex h-[calc(100dvh-3.6rem)] flex-col overflow-hidden bg-bg">
      <iframe
        src={embedUrl("map/index.html")}
        title="מפת השטח של אבן דרך"
        className="h-full w-full border-0"
        allow="geolocation"
      />
    </div>
  );
}
