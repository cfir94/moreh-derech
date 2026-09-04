"use client";

import { useEffect, useRef } from "react";
import { recordSummaryAttempt } from "@/lib/progress";
import { embedUrl } from "@/lib/basePath";

const HISTORY_TIMELINE_URL = embedUrl("history-timeline/");

type AttemptMessage = {
  type: "even-derech:historical-attempt";
  quiz: string;
  quizLabel: string;
  category: string;
  correct: number;
  total: number;
};

function isAttemptMessage(value: unknown): value is AttemptMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<AttemptMessage>;
  return (
    message.type === "even-derech:historical-attempt" &&
    typeof message.quiz === "string" &&
    typeof message.quizLabel === "string" &&
    typeof message.category === "string" &&
    typeof message.correct === "number" &&
    typeof message.total === "number" &&
    message.total > 0 &&
    message.correct >= 0 &&
    message.correct <= message.total
  );
}

export function EmbeddedHistoricalTool({
  view,
  title,
}: {
  view: "dating" | "drag" | "kings" | "archaeology" | "judaism";
  title: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const receiveAttempt = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!isAttemptMessage(event.data)) return;
      recordSummaryAttempt(event.data);
    };
    window.addEventListener("message", receiveAttempt);
    return () => window.removeEventListener("message", receiveAttempt);
  }, []);

  return (
    <div className="h-[calc(100dvh-60px)] min-h-[500px] w-full">
      <iframe
        ref={frameRef}
        src={`${HISTORY_TIMELINE_URL}?view=${view}`}
        title={title}
        className="h-full w-full border-0"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
}
