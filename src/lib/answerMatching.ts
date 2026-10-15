/** Free-text grading accepts punctuation, spacing, articles and / alternatives. */
function normalize(text: string) {
  return text.replace(/[\u0591-\u05C7]/g, "")
    .replace(/["'׳״.,:;!?()\-–—]/g, "").replace(/\s+/g, " ").trim();
}

export function matchesAnswer(typed?: string, expected?: string) {
  if (!typed || !expected) return false;
  const given = normalize(typed);
  if (!given) return false;
  return expected.split("/").map(normalize).some((variant) =>
    variant.length > 0 && (variant === given || variant === `ה${given}` || given === `ה${variant}`));
}
