import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { GeologyAid, type GeoPhotos } from "@/components/geology/GeologyAid";
import type { PracticeItem } from "@/components/learning-aid";
import geologyQuiz from "@/data/quizzes/geology";

export const metadata: Metadata = {
  title: "גאולוגיה של ארץ ישראל | אבן דרך",
  description: "מפה גאולוגית בתלת־ממד, עמוד הזמן של ארץ ישראל, סלעים וקרקעות, ותרגול.",
};

/** Only photos checked by eye ("approved") reach the page. */
function approvedPhotos(): GeoPhotos {
  const path = join(process.cwd(), "src/data/geology/photos.json");
  if (!existsSync(path)) return {};
  const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, Record<string, unknown>[]>;
  const out: GeoPhotos = {};
  for (const [id, entries] of Object.entries(raw)) {
    const ok = entries.filter((p) => p.status === "approved" && typeof p.src === "string");
    if (ok.length) out[id] = ok.map((p) => ({
      src: String(p.src), caption: String(p.caption ?? ""), alt: String(p.alt ?? ""),
      credit: [p.author, p.license].filter(Boolean).join(" · "),
    }));
  }
  return out;
}

/** The geology quiz's text questions (the photo questions need their picture). */
function practiceItems(): PracticeItem[] {
  return geologyQuiz.questions
    .filter((q) => !q.image && q.answers.length === 4 && q.answers.filter((a) => a.correct).length === 1)
    .map((q) => ({
      id: Number(q.id), prompt: q.question, choices: q.answers.map((a) => a.text),
      answer: q.answers.findIndex((a) => a.correct), explain: q.explanation,
    }));
}

export default function GeologyPage() {
  return <GeologyAid photos={approvedPhotos()} practice={practiceItems()} />;
}
