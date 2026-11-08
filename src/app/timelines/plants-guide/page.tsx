import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { FirstVisitTour } from "@/components/tour/FirstVisitTour";
import { PlantsGuide, type GuidePhotos } from "@/components/plants-guide";

export const metadata: Metadata = { title: "מגדיר צמחים | אבן דרך", description: "מגדיר אינטראקטיבי לזיהוי צמחי ארץ ישראל בשטח." };

function approvedPhotos(): GuidePhotos {
  const path = join(process.cwd(), "src/data/plants/photos.json");
  if (!existsSync(path)) return {};
  const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  const output: GuidePhotos = {};
  for (const [id, value] of Object.entries(raw)) {
    const entries = Array.isArray(value) ? value : [value];
    output[id] = entries.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const photo = entry as Record<string, unknown>;
      if (photo.status !== "approved") return [];
      const src = photo.src ?? photo.path;
      if (typeof src !== "string") return [];
      return [{ src, caption: String(photo.caption ?? ""), credit: [photo.author, photo.licence ?? photo.license].filter(Boolean).join(" · ") }];
    });
  }
  return output;
}

export default function PlantsGuidePage() { return <><PlantsGuide photos={approvedPhotos()} /><FirstVisitTour id="plants-guide" /></>; }
