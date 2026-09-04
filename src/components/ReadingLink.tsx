import { topicOf } from "@/data/topics";

/**
 * The one line that turns a wrong answer into something to do: the subject the
 * question belongs to, and the free summary for that subject.
 *
 * The summary is Efrat Nakash's and opens on her site — see CLAUDE.md on why
 * nothing of hers is copied here.
 */
export function ReadingLink({ topic }: { topic?: string }) {
  const subject = topicOf(topic);
  if (!subject) return null;

  return (
    <p className="mt-1.5 text-[11.5px] text-txt-dim">
      <span className="font-bold">{subject.label}</span>
      {subject.reading && (
        <>
          {" · "}
          <a
            href={subject.reading.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-teal hover:underline"
          >
            לחזור על הנושא ↗
          </a>
        </>
      )}
    </p>
  );
}
