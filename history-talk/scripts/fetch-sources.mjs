#!/usr/bin/env node
// מוריד את המקורות של כל דמות (לפי sources[] ב-character.json) ושומר אותם
// כ-HTML מנוקה ב-characters/<id>/sources/<file>: רק כותרות (h2 = ספר, h3 = פרק)
// ופסקאות, עם עוגן (data-anchor) לכל כותרת כדי שאפשר יהיה לקשר לקטע המדויק.
//
// נתמכים: פרויקט בן־יהודה (benyehuda.org/read/<id>) ו-LacusCurtius
// (penelope.uchicago.edu). מקור אחר — מורידים ידנית ושמים בתיקייה, בפורמט
// TXT או HTML; build-knowledge.mjs יודע לקרוא גם אותם.
//
// שימוש: node scripts/fetch-sources.mjs [characterId...] [--force]

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CHAR_DIR = join(ROOT, "characters");

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

// פרקי מבוא, הערות ולוחות של המתרגם אינם דברי הדמות — לא נכנסים למאגר.
const SKIP_BOOK = /מבוא|הקדמה|הערות|לוח מאורעות|טוען|הסימניה/;

const ENTITIES = { nbsp: " ", quot: '"', amp: "&", lt: "<", gt: ">", apos: "'", shy: "", mdash: "—", ndash: "–" };
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return String.fromCodePoint(code);
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function textOf(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/[​-‏⁠]/g, "")
    .replace(/🔗/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function get(url) {
  const res = await fetch(url, { headers: { "user-agent": "history-talk/0.1 (educational; fetch-sources)" } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

// בן־יהודה: הטקסט כולו בתוך #actualtext. כותרות h2/h3 עם id="heading-N".
function extractBenYehuda(html, source) {
  const start = html.indexOf('id="actualtext"');
  if (start < 0) throw new Error(`${source.url}: לא נמצא #actualtext`);
  let body = html.slice(start);
  // ההערות של המתרגם מרוכזות בסוף, ב-div.footnotes — לא דברי הדמות.
  const notes = body.indexOf('class="footnotes"');
  if (notes > 0) body = body.slice(0, notes);
  body = body
    // הפניות להערות שוליים: המספר והתוכן (ב-data-content) לא שייכים לטקסט.
    .replace(/<a[^>]*class="footnote"[^>]*>[\s\S]*?<\/a>/g, "");
  const out = [];
  let skipping = false;
  let keepBook = !source.includeBooks;
  const re = /<(h2|h3)[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/\1>|<p[^>]*>([\s\S]*?)<\/p>/g;
  for (const m of body.matchAll(re)) {
    if (m[1] === "h2") {
      const title = textOf(m[3]);
      skipping = SKIP_BOOK.test(title);
      if (source.includeBooks) keepBook = source.includeBooks.includes(title);
      if (!skipping && keepBook) out.push(`<h2 data-anchor="${m[2]}">${escapeHtml(title)}</h2>`);
    } else if (m[1] === "h3") {
      if (!skipping && keepBook) out.push(`<h3 data-anchor="${m[2]}">${escapeHtml(textOf(m[3]))}</h3>`);
    } else if (!skipping && keepBook) {
      const t = textOf(m[4]);
      if (t) out.push(`<p>${escapeHtml(t)}</p>`);
    }
  }
  return out;
}

// LacusCurtius: <A CLASS="chapter" NAME="n"> פותח פרק; ההערות מתחילות ב-<HR CLASS="endnotes">.
function extractLacusCurtius(html) {
  let body = html.slice(html.search(/<H1/i));
  const end = body.search(/<HR CLASS="endnotes"|<TABLE CLASS="footer|<DIV CLASS="footer|<TABLE CLASS="trailer/i);
  if (end > 0) body = body.slice(0, end);
  body = body
    .replace(/<SPAN CLASS="pagenum">[\s\S]*?<\/SPAN>\s*(<\/SPAN>)?/gi, "")
    .replace(/<A CLASS="ref"[^>]*>[\s\S]*?<\/A>/gi, "")
    .replace(/<A CLASS="sec"[^>]*>[\s\S]*?<\/A>/gi, "")
    .replace(/<A [^>]*HREF="\s*L\/[\s\S]*?<\/A>/gi, "") // קישור לגרסה הלטינית
    .replace(/<DIV CLASS="mynote">[\s\S]*?<\/DIV>/gi, "")
    .replace(/<A CLASS="chapter" NAME="([^"]+)">[\s\S]*?<\/A>/gi, "\n@@CHAPTER@@$1@@\n");
  const out = [];
  for (const para of body.split(/<P\b[^>]*>/i).slice(1)) {
    // החלק הראשון הוא המשך הפרק הקודם; כל חלק אחריו נפתח במספר פרק.
    for (const [i, piece] of para.split("\n@@CHAPTER@@").entries()) {
      let rest = piece;
      if (i > 0) {
        const [, num, tail] = piece.match(/^([^@]+)@@\n([\s\S]*)$/);
        out.push(`<h3 data-anchor="${num}">${num}</h3>`);
        rest = tail;
      }
      const t = textOf(rest);
      if (t && !/^\[/.test(t)) out.push(`<p>${escapeHtml(t)}</p>`);
    }
  }
  return out;
}

async function fetchSource(charId, source) {
  const dest = join(CHAR_DIR, charId, "sources", source.file);
  if (existsSync(dest) && !force) {
    console.log(`  ✓ ${source.file} (קיים, --force להורדה מחדש)`);
    return;
  }
  const html = await get(source.url);
  let parts;
  if (source.url.includes("benyehuda.org")) parts = extractBenYehuda(html, source);
  else if (source.url.includes("penelope.uchicago.edu")) parts = extractLacusCurtius(html);
  else throw new Error(`${source.url}: אתר לא נתמך — הורד ידנית לתיקייה sources/`);
  const header = `<!-- source: ${source.url} | title: ${source.title} | fetched: ${new Date().toISOString().slice(0, 10)} -->`;
  await writeFile(dest, [header, ...parts].join("\n") + "\n");
  const words = parts.join(" ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  console.log(`  ↓ ${source.file}: ${parts.length} רכיבים, ${words.toLocaleString()} מילים`);
}

async function main() {
  const ids = only.length ? only : (await readdir(CHAR_DIR, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const id of ids) {
    const char = JSON.parse(await readFile(join(CHAR_DIR, id, "character.json"), "utf8"));
    console.log(`${id}:`);
    await mkdir(join(CHAR_DIR, id, "sources"), { recursive: true });
    for (const source of char.sources) {
      if (!source.file) continue;
      await fetchSource(id, source);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
