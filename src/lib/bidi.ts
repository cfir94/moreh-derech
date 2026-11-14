/**
 * Wrap every number range ("705–701", "12,500–9,500", "1563, 1565") in a left-to-right isolate (LRI…PDI).
 * In a Hebrew line the bidi algorithm otherwise prints the two numbers of a range in reverse order.
 * The thousands comma and the decimal point belong inside the run: without them "12,500–9,500"
 * was cut into three pieces and came out as "500,500–9,12".
 * For display only: the isolate characters must not reach a value that is compared or stored.
 */
export function isolateRanges(text: string) {
  return text.replace(/(\d[\d\s,.–-]*\d)/g, "\u2066$1\u2069");
}
