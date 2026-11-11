/**
 * Wrap every number range ("705–701", "1563, 1565") in a left-to-right isolate (LRI…PDI).
 * In a Hebrew line the bidi algorithm otherwise prints the two numbers of a range in reverse order.
 */
export function isolateRanges(text: string) {
  return text.replace(/(\d[\d\s–-]*\d)/g, "⁦$1⁩");
}
