#!/usr/bin/env node
// בונה את מאגר הידע של כל הדמויות:
//   1. קורא את characters/<id>/sources/ (HTML מ-fetch-sources.mjs, HTML אחר או TXT),
//      מנקה תגיות, ניקוד וטעמים.
//   2. חותך לקטעים של 120–220 מילים, לכל קטע `ref` (חיבור, ספר, פרק, סעיף) ו-`url`.
//   3. בונה אינדקס MiniSearch עם הנרמול העברי שב-web/src/shared/hebrew.mjs,
//      ושומר ב-web/public/data/<id>/index.json.
//   4. כותב את רשימת הדמויות הציבורית (web/public/data/characters.json) ואת
//      הנתונים שהשרת צריך כדי להרכיב הוראות (src/worker/characters.generated.ts).
//   5. מעתיק את המדיה המוכנה ל-web/public/media/<id>/.
//   6. בודק שדף הידע לא חורג מכ-15 אלף טוקנים.

import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import MiniSearch from "minisearch";
import { MINISEARCH_OPTIONS, stripNiqqud } from "../web/src/shared/hebrew.mjs";
import { decodeEntities } from "./fetch-sources.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CHAR_DIR = join(ROOT, "characters");
const DATA_DIR = join(ROOT, "web/public/data");
const MIN_WORDS = 120;
const MAX_WORDS = 220;
const SHEET_TOKEN_LIMIT = 15_000;
const SHEET_WORD_LIMIT = 12_000;

const wordCount = (s) => s.split(/\s+/).filter(Boolean).length;
const clean = (s) => stripNiqqud(decodeEntities(s.replace(/<[^>]+>/g, " "))).replace(/\s+/g, " ").trim();

// הערכה גסה: בעברית כ-2.5 תווים לטוקן, באנגלית כ-4.
export function estimateTokens(text) {
  const hebrew = (text.match(/[א-ת]/g) ?? []).length;
  return Math.ceil(hebrew / 2.5 + (text.length - hebrew) / 4);
}

/**
 * ממיר קובץ מקור לרצף בלוקים: {kind:"book"|"chapter"|"para", text, anchor?}.
 * HTML: h1/h2 = ספר, h3/h4 = פרק, p = פסקה. TXT: פסקאות מופרדות בשורה ריקה;
 * שורה קצרה שמתחילה ב"ספר"/"פרק" נחשבת כותרת.
 */
export function parseSource(raw, ext) {
  const blocks = [];
  if (ext === ".html" || ext === ".htm") {
    const re = /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>|<p[^>]*>([\s\S]*?)<\/p>/gi;
    for (const m of raw.matchAll(re)) {
      if (m[1]) {
        const level = Number(m[1][1]);
        const anchor = m[2].match(/(?:data-anchor|id)="([^"]+)"/)?.[1];
        blocks.push({ kind: level <= 2 ? "book" : "chapter", text: clean(m[3]), anchor });
      } else {
        const text = clean(m[4]);
        if (text) blocks.push({ kind: "para", text });
      }
    }
  } else {
    for (const para of raw.split(/\r?\n\s*\r?\n/)) {
      const text = clean(para);
      if (!text) continue;
      if (text.length < 60 && /^(ספר|פרק)\s/.test(text)) {
        blocks.push({ kind: text.startsWith("ספר") ? "book" : "chapter", text });
      } else blocks.push({ kind: "para", text });
    }
  }
  return blocks;
}

// "א. יען כי…" → "א". פסקאות בתרגומי בן־יהודה ממוספרות כך לפי הסעיפים.
const sectionOf = (text) => text.match(/^([א-ת]{1,3})[.׳']\s/)?.[1];

function chapterLabel(text) {
  const short = text.split(/[:.]/)[0].trim();
  const dual = short.match(/^(\d+)-(\d+)$/); // קסיוס דיו: "66-4" = ספר 66, פרק 4
  if (dual) return `ספר ${dual[1]}, פרק ${dual[2]}`;
  if (/^\d+$/.test(short)) return `פרק ${short}`;
  return short.length > 40 ? short.slice(0, 40) + "…" : short;
}

function splitLong(text) {
  if (wordCount(text) <= MAX_WORDS) return [text];
  const sentences = text.match(/[^.!?;:]+[.!?;:]+["”’)]*\s*|[^.!?;:]+$/g) ?? [text];
  const out = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && wordCount(cur + s) > MAX_WORDS) {
      out.push(cur.trim());
      cur = "";
    }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  // משפט אחד ארוך מ-220 מילים: חותכים לפי מילים.
  return out.flatMap((part) => {
    const words = part.split(/\s+/);
    if (words.length <= MAX_WORDS * 1.5) return [part];
    const pieces = [];
    for (let i = 0; i < words.length; i += MAX_WORDS) pieces.push(words.slice(i, i + MAX_WORDS).join(" "));
    return pieces;
  });
}

/** חותך את הבלוקים של מקור אחד לקטעים עם הפניה. */
export function chunkSource(blocks, source) {
  const chunks = [];
  let book, chapter, anchor;
  let buf = [];
  let sections = [];

  const flush = () => {
    if (!buf.length) return;
    const text = buf.join(" ");
    const parts = [source.refTitle ?? source.title, book, chapter].filter(Boolean);
    const secs = sections.filter(Boolean);
    if (secs.length) parts.push(secs.length > 1 ? `סעיפים ${secs[0]}–${secs.at(-1)}` : `סעיף ${secs[0]}`);
    const base = source.url.split("#")[0];
    chunks.push({ ref: parts.join(", "), text, url: anchor ? `${base}#${anchor}` : base });
    buf = [];
    sections = [];
  };

  for (const b of blocks) {
    if (b.kind === "book") {
      flush();
      book = chapterLabel(b.text);
      chapter = undefined;
      anchor = b.anchor ?? anchor;
    } else if (b.kind === "chapter") {
      flush();
      chapter = chapterLabel(b.text);
      anchor = b.anchor ?? anchor;
    } else {
      for (const piece of splitLong(b.text)) {
        const words = wordCount(piece);
        const have = wordCount(buf.join(" "));
        if (have >= MIN_WORDS && have + words > MAX_WORDS) flush();
        buf.push(piece);
        sections.push(sectionOf(piece));
      }
    }
  }
  flush();
  // קטע קצרצר בסוף פרק מצטרף לקודם, אם הם מאותו פרק.
  return chunks.filter((c, i) => {
    const prev = chunks[i - 1];
    if (i > 0 && wordCount(c.text) < 40 && prev.url === c.url && wordCount(prev.text) + wordCount(c.text) <= MAX_WORDS * 1.3) {
      prev.text += " " + c.text;
      return false;
    }
    return true;
  });
}

// ---- אימות ציטוטים בדף הידע ----
// כל ציטוט בדף הידע כתוב בין «…». הבדיקה מוודאה שהוא מופיע כלשונו במקורות
// (אחרי נרמול ניקוד, מרכאות, מקפים ורווחים; "..." בתוך ציטוט = השמטה), ומחזירה
// את ההפניה של הקטע שבו נמצא — כדי שלא תיכנס לדף הידע הפניה שגויה.

const normQuote = (s) =>
  stripNiqqud(s)
    .replace(/[״"“”„«»]/g, '"')
    .replace(/[׳'‘’`]/g, "'")
    .replace(/[–—־‑-]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export function verifyQuotes(sheet, chunks) {
  let corpus = "";
  const starts = [];
  for (const c of chunks) {
    starts.push(corpus.length);
    corpus += normQuote(c.text) + " ";
  }
  const refAt = (pos) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= pos) lo = mid;
      else hi = mid - 1;
    }
    return chunks[lo]?.ref ?? null;
  };
  return [...sheet.matchAll(/«([^»]+)»/g)].map((m) => {
    const parts = normQuote(m[1]).split(/\s*(?:\.\.\.|…)\s*/).filter(Boolean);
    let from = 0;
    let first = -1;
    for (const part of parts) {
      const at = corpus.indexOf(part, from);
      if (at < 0 || (first >= 0 && at - first > 4000)) return { quote: m[1], ref: null };
      if (first < 0) first = at;
      from = at + part.length;
    }
    return { quote: m[1], ref: first >= 0 ? refAt(first) : null };
  });
}

async function buildCharacter(id) {
  const dir = join(CHAR_DIR, id);
  const char = JSON.parse(await readFile(join(dir, "character.json"), "utf8"));
  if (char.id !== id) throw new Error(`${id}: ה-id ב-character.json (${char.id}) שונה משם התיקייה`);
  const prompt = (await readFile(join(dir, "prompt.md"), "utf8")).trim();
  const sheetPath = join(dir, "knowledge-sheet.md");
  const sheet = existsSync(sheetPath) ? (await readFile(sheetPath, "utf8")).trim() : "";

  const chunks = [];
  const sourceFiles = existsSync(join(dir, "sources")) ? await readdir(join(dir, "sources")) : [];
  for (const file of sourceFiles.sort()) {
    const ext = extname(file).toLowerCase();
    if (![".html", ".htm", ".txt"].includes(ext)) continue;
    const meta = char.sources.find((s) => s.file === file) ?? { title: file.replace(/\.[^.]+$/, ""), url: "" };
    const blocks = parseSource(await readFile(join(dir, "sources", file), "utf8"), ext);
    chunks.push(...chunkSource(blocks, meta));
  }

  const ms = new MiniSearch(MINISEARCH_OPTIONS);
  ms.addAll(chunks.map((c, i) => ({ id: i, ...c })));
  await mkdir(join(DATA_DIR, id), { recursive: true });
  const indexJson = JSON.stringify({ version: 1, characterId: id, chunks: chunks.length, index: ms.toJSON() });
  await writeFile(join(DATA_DIR, id, "index.json"), indexJson);

  const sheetTokens = estimateTokens(sheet);
  const sheetWords = wordCount(sheet);
  const warn = [];
  if (!sheet) warn.push("אין knowledge-sheet.md — הדמות תסתמך רק על החיפוש");
  if (sheetTokens > SHEET_TOKEN_LIMIT) warn.push(`דף הידע ארוך מדי: ~${sheetTokens} טוקנים (מעל ${SHEET_TOKEN_LIMIT}) — מייקר כל תור`);
  if (sheetWords > SHEET_WORD_LIMIT) warn.push(`דף הידע ארוך מ-${SHEET_WORD_LIMIT} מילים (${sheetWords})`);
  if (!chunks.length) warn.push("אין מקורות ב-sources/ — search_sources יחזיר תוצאות ריקות");
  const quotes = verifyQuotes(sheet, chunks);
  for (const q of quotes.filter((x) => !x.ref)) warn.push(`ציטוט שלא נמצא במקורות: «${q.quote.slice(0, 60)}…»`);
  if (process.argv.includes("--quotes")) for (const q of quotes) console.log(`  ${q.ref ?? "✗ לא נמצא"} ⇐ «${q.quote.slice(0, 50)}…»`);

  // המדיה המוכנה (אחרי optimize-media.mjs) מועתקת לתיקייה הציבורית.
  const mediaDir = join(dir, "media");
  const has = (f) => existsSync(join(mediaDir, f));
  const publicMedia = join(ROOT, "web/public/media", id);
  await mkdir(publicMedia, { recursive: true });
  for (const f of ["portrait.webp", "idle.mp4", "talking.mp4", "idle.webm", "talking.webm"]) {
    if (has(f)) await copyFile(join(mediaDir, f), join(publicMedia, f));
  }
  const media = {
    portrait: has("portrait.webp") ? `/media/${id}/portrait.webp` : null,
    idle: has("idle.mp4") ? `/media/${id}/idle.mp4` : null,
    talking: has("talking.mp4") ? `/media/${id}/talking.mp4` : null,
    idleWebm: has("idle.webm") ? `/media/${id}/idle.webm` : null,
    talkingWebm: has("talking.webm") ? `/media/${id}/talking.webm` : null,
  };

  console.log(
    `${id}: ${chunks.length} קטעים, אינדקס ${(indexJson.length / 1024 / 1024).toFixed(1)}MB, ` +
      `דף ידע ${sheetWords} מילים (~${sheetTokens} טוקנים), ${quotes.length} ציטוטים`,
  );
  for (const w of warn) console.warn(`  ⚠ ${w}`);

  const { sources, voiceName, ...publicFields } = char;
  return {
    public: {
      ...publicFields,
      sources: sources.map(({ title, translator, url, license }) => ({ title, translator, url, license })),
      media,
    },
    server: { id, nameHe: char.nameHe, voiceName, openingLineHe: char.openingLineHe, prompt, knowledgeSheet: sheet },
  };
}

async function main() {
  const ids = (await readdir(CHAR_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && existsSync(join(CHAR_DIR, d.name, "character.json")))
    .map((d) => d.name)
    .sort();
  const built = [];
  for (const id of ids) built.push(await buildCharacter(id));

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, "characters.json"), JSON.stringify(built.map((b) => b.public), null, 2) + "\n");

  const server = Object.fromEntries(built.map((b) => [b.server.id, b.server]));
  await writeFile(
    join(ROOT, "src/worker/characters.generated.ts"),
    "// generated by scripts/build-knowledge.mjs — לא לערוך ידנית.\n" +
      'import type { ServerCharacter } from "./prompt.ts";\n\n' +
      `export const CHARACTERS: Record<string, ServerCharacter> = ${JSON.stringify(server, null, 2)};\n`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
