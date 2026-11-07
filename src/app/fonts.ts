import localFont from "next/font/local";

/**
 * Fonts are bundled (OFL-1.1, from Fontsource; licenses next to the files in src/assets/fonts),
 * so `next build` never reaches out to Google Fonts and builds the same offline.
 *
 * Each family is two variable files: Hebrew and Latin. They are chained in the font stack
 * (Latin first, then Hebrew): a glyph missing from the first file comes from the second.
 */
// The Hebrew subsets carry unicode-range "U+0307-0308, U+0590-05FF, …" (written out below:
// next/font needs literal option values, not shared constants).

const heeboLatin = localFont({
  src: "../assets/fonts/heebo-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-heebo-latin",
  // No Arial fallback between the Latin and Hebrew files, or Hebrew would render in Arial.
  adjustFontFallback: false,
  display: "swap",
});
const heeboHebrew = localFont({
  src: "../assets/fonts/heebo-hebrew-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-heebo-hebrew",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F" }],
});

const frankLatin = localFont({
  src: "../assets/fonts/frank-ruhl-libre-latin-wght-normal.woff2",
  weight: "300 900",
  variable: "--font-frank-latin",
  // No Arial fallback between the Latin and Hebrew files, or Hebrew would render in Arial.
  adjustFontFallback: false,
  display: "swap",
});
const frankHebrew = localFont({
  src: "../assets/fonts/frank-ruhl-libre-hebrew-wght-normal.woff2",
  weight: "300 900",
  variable: "--font-frank-hebrew",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F" }],
});

/** Class names that define the font CSS variables; put on <html>. */
export const fontVariables = [heeboLatin, heeboHebrew, frankLatin, frankHebrew].map((font) => font.variable).join(" ");
