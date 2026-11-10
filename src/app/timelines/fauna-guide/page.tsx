import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { FaunaGuide, type FaunaPhotos } from "@/components/fauna/FaunaGuide";

export const metadata: Metadata = { title: "מגדיר החי והציפורים | אבן דרך", description: "מגדיר לזיהוי בעלי חיים וציפורים שפוגשים בסיורים בארץ ישראל." };

/** Only photos checked by eye ("approved") reach the page. */
function approvedPhotos(): FaunaPhotos {
  const path = join(process.cwd(), "src/data/fauna/photos.json");
  if (!existsSync(path)) return {};
  const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, Record<string, unknown>[]>;
  const out: FaunaPhotos = {};
  for (const [id, entries] of Object.entries(raw)) {
    const ok = entries.filter((p) => p.status === "approved" && typeof p.src === "string");
    if (ok.length) out[id] = ok.map((p) => ({ src: String(p.src), caption: String(p.caption ?? ""), alt: String(p.alt ?? ""), credit: [p.author, p.license].filter(Boolean).join(" · ") }));
  }
  return out;
}

export default function FaunaGuidePage() { return <FaunaGuide photos={approvedPhotos()} />; }
