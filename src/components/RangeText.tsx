import { Fragment } from "react";

const RANGE = /(\d[\d\s,.–-]*\d)/g;

/**
 * Text with every number range ("12,500–9,500", "705–701") set left to right in a <bdi>, so a Hebrew
 * line doesn't print the two ends in reverse. Same rule as isolateRanges (src/lib/bidi.ts), but as
 * elements: the text a reader copies, or a test reads, has no invisible isolate characters in it.
 */
export function RangeText({ text }: { text: string | undefined | null }) {
  if (!text) return null;
  const parts = text.split(RANGE);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <bdi key={i} dir="ltr">
            {part}
          </bdi>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
