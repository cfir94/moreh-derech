import { embedUrl } from "@/lib/basePath";

/*
 * The heritage map is a self-contained MapLibre application (vector tiles,
 * offline service worker, ~90MB of map data). It runs in an iframe rather than
 * being rewritten as React components: it keeps its own map engine and caching
 * intact while staying inside the site shell, so the user never leaves.
 */
export default function MapPage() {
  return (
    <div className="flex h-[calc(100vh-3.6rem)] flex-col">
      <iframe
        src={embedUrl("map/")}
        title="מפת מורשת ישראל"
        className="h-full w-full border-0"
        allow="geolocation"
      />
    </div>
  );
}
