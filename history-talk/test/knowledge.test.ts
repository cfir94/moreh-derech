import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { chunkSource, estimateTokens, parseSource } from "../scripts/build-knowledge.mjs";

const para = (letter: string, words: number) => `<p>${letter}. ${Array.from({ length: words }, (_, i) => `מילה${i}`).join(" ")}</p>`;

test("חיתוך לקטעים של 120–220 מילים, עם הפניה לספר, פרק וסעיפים", () => {
  const html = [
    '<h2 data-anchor="heading-2">ספר ראשון</h2>',
    '<h3 data-anchor="heading-3">פרק חמישי: בתשע שנות מלכות אלכסנדרה</h3>',
    para("א", 90),
    para("ב", 90),
    para("ג", 90),
    para("ד", 90),
  ].join("\n");
  const chunks = chunkSource(parseSource(html, ".html"), {
    title: "תולדות מלחמת היהודים",
    refTitle: "מלחמת היהודים",
    url: "https://benyehuda.org/read/12030",
  });
  assert.equal(chunks.length, 2);
  for (const c of chunks) {
    const n = c.text.split(/\s+/).length;
    assert.ok(n >= 120 && n <= 220, `${n} מילים`);
  }
  assert.equal(chunks[0].ref, "מלחמת היהודים, ספר ראשון, פרק חמישי, סעיפים א–ב");
  assert.equal(chunks[0].url, "https://benyehuda.org/read/12030#heading-3");
});

test("פסקה ארוכה מ-220 מילים מתפצלת לפי משפטים", () => {
  const sentence = (i: number) => Array.from({ length: 30 }, (_, j) => `מ${i}_${j}`).join(" ") + ".";
  const long = `<h3 data-anchor="1">1</h3><p>${Array.from({ length: 12 }, (_, i) => sentence(i)).join(" ")}</p>`;
  const chunks = chunkSource(parseSource(long, ".html"), { title: "x", url: "https://e.x/a" });
  assert.ok(chunks.length >= 2);
  for (const c of chunks) assert.ok(c.text.split(/\s+/).length <= 220);
  assert.equal(chunks[0].ref, "x, פרק 1");
});

test("מספור כפול של קסיוס דיו", () => {
  const html = `<h3 data-anchor="66-4">66-4</h3>${para("x", 130)}`;
  const [c] = chunkSource(parseSource(html, ".html"), { title: "Dio", refTitle: "קסיוס דיו", url: "https://e.x/65*.html" });
  assert.equal(c.ref, "קסיוס דיו, ספר 66, פרק 4");
});

test("TXT: פסקאות מופרדות בשורה ריקה, כותרות ספר/פרק", () => {
  const txt = `ספר שני\n\nפרק ראשון\n\n${"מילה ".repeat(150)}\n\n${"אחרת ".repeat(50)}`;
  const chunks = chunkSource(parseSource(txt, ".txt"), { title: "חיבור", url: "" });
  assert.equal(chunks[0].ref, "חיבור, ספר שני, פרק ראשון");
});

test("הערכת טוקנים", () => {
  assert.equal(estimateTokens("שלום"), 2);
  assert.equal(estimateTokens("abcd"), 1);
});

test("אימות ציטוטים: נמצא כלשונו (גם עם השמטה), ומחזיר את ההפניה", async () => {
  const { verifyQuotes } = await import("../scripts/build-knowledge.mjs");
  const chunks = [
    { ref: "חיבור, פרק א", text: "בָּרִאשׁוֹנָה אומר, כי מתמיהה מאד דעת המאמינים", url: "" },
    { ref: "חיבור, פרק ב", text: "ואחרי־כן הייתי עד־ראיה למעשים בעל־כרחי וכתבתי", url: "" },
  ];
  const sheet = "«בראשונה אומר» ו«הייתי עד־ראיה ... בעל־כרחי» ו«משפט שלא נאמר»";
  assert.deepEqual(
    verifyQuotes(sheet, chunks).map((q: { ref: string | null }) => q.ref),
    ["חיבור, פרק א", "חיבור, פרק ב", null],
  );
});

test("כל הציטוטים בדפי הידע של הדמויות נמצאים במקורות", async () => {
  const { readFileSync, readdirSync, existsSync } = await import("node:fs");
  const { verifyQuotes } = await import("../scripts/build-knowledge.mjs");
  const root = fileURLToPath(new URL("../characters/", import.meta.url));
  for (const id of readdirSync(root)) {
    const sheetPath = `${root}${id}/knowledge-sheet.md`;
    if (!existsSync(sheetPath)) continue;
    const char = JSON.parse(readFileSync(`${root}${id}/character.json`, "utf8"));
    const chunks = readdirSync(`${root}${id}/sources`).flatMap((f: string) =>
      chunkSource(
        parseSource(readFileSync(`${root}${id}/sources/${f}`, "utf8"), ".html"),
        char.sources.find((s: { file: string }) => s.file === f) ?? { title: f, url: "" },
      ),
    );
    const missing = verifyQuotes(readFileSync(sheetPath, "utf8"), chunks).filter((q: { ref: string | null }) => !q.ref);
    assert.deepEqual(missing, [], `${id}: ציטוטים שלא נמצאו`);
  }
});
