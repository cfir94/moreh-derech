import Link from "next/link";
import { topicOf } from "@/data/topics";
import { getSummary } from "@/data/summaries";

/**
 * The one line that turns a wrong answer into something to do: the subject the
 * question belongs to, and our own summary of it once it is written.
 */
export function ReadingLink({ topic }: { topic?: string }) {
  const subject = topicOf(topic);
  if (!subject) return null;
  const summary = getSummary(subject.key);

  return (
    <p className="mt-1.5 text-[11.5px] text-txt-dim">
      <span className="font-bold">{subject.label}</span>
      {summary && (
        <>
          {" · "}
          <Link href={`/summaries/${summary.key}/`} className="font-bold text-teal hover:underline">
            לחזור על הנושא
          </Link>
        </>
      )}
    </p>
  );
}
