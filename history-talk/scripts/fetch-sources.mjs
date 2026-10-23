#!/usr/bin/env node
// מוריד את המקורות של כל דמות (לפי sources[] ב-character.json) ושומר אותם
// כ-HTML מנוקה ב-characters/<id>/sources/<file>: רק כותרות (h2 = ספר, h3 = פרק)
// ופסקאות, עם עוגן (data-anchor) לכל כותרת כדי שאפשר יהיה לקשר לקטע המדויק.
//
// נתמכים: פרויקט בן־יהודה (benyehuda.org/read/<id>), LacusCurtius
// (penelope.uchicago.edu), ספריא (source.sefaria — API v3, לפי מהדורה מפורשת),
// CCEL (source.ccel — כרך ThML של אבות הכנסייה, NPNF) ופרויקט גוטנברג
// (source.gutenberg — קובץ טקסט עם BOOK/CHAPTER). מקור אחר — מורידים ידנית ושמים
// בתיקייה, בפורמט TXT או HTML, עם "manual": true; build-knowledge.mjs קורא גם אותם.
//
// שימוש: node scripts/fetch-sources.mjs [characterId...] [--force]

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { stripNiqqud } from "../web/src/shared/hebrew.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
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

const cache = new Map();
/** כל כתובת יורדת פעם אחת בכל הרצה — כרך CCEL אחד משרת כמה מקורות. */
function get(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { headers: { "user-agent": "history-talk/0.1 (educational; fetch-sources)" } }).then((res) => {
        if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
        return res.text();
      }),
    );
  }
  return cache.get(url);
}

// 1–399 באותיות: א, ב… טו, טז… קכג. בלי גרשיים — כך sectionOf ב-build-knowledge מזהה אותן.
const ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HUNDREDS = ["", "ק", "ר", "ש"];
export function hebrewNumeral(n) {
  const h = HUNDREDS[Math.floor(n / 100)];
  const rest = n % 100;
  if (rest === 15) return h + "טו";
  if (rest === 16) return h + "טז";
  return h + TENS[Math.floor(rest / 10)] + ONES[rest % 10];
}

const ROMAN = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
export function fromRoman(s) {
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const v = ROMAN[s[i]];
    const next = ROMAN[s[i + 1]] ?? 0;
    total += v < next ? -v : v;
  }
  return total;
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

// ספריא: source.sefaria = { version, refs: ["II_Kings.18", "Gittin.56a"…], unit, numbered }.
// כל ref הופך לכותרת h3 (פרק / דף / הלכה) עם עוגן = הכתובת המלאה בספריא, ו-h2 לכל
// חיבור ("מלכים ב", "גיטין"). numbered: פסוקים/משניות ממוספרים באותיות.
const SEFARIA_UNITS = {
  perek: (x) => `פרק ${x}`,
  daf: (x) => `דף ${x.replace(/ א$/, " ע״א").replace(/ ב$/, " ע״ב")}`,
  halakha: (x) => {
    const [p, h] = x.split(":");
    return h ? `פרק ${p} הלכה ${h}` : `פרק ${p}`;
  },
  siman: (x) => x.replace(/:/g, " "),
};

const flat = (t) => (Array.isArray(t) ? t.flatMap(flat) : [t]);

function sefariaText(s) {
  return stripNiqqud(decodeEntities(s.replace(/<[^>]+>/g, " ")))
    .replace(/\{[פס]\}/g, "")
    .replace(/[\u200b-\u200f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractSefaria(source) {
  const { version, refs, unit = "perek", numbered = false } = source.sefaria;
  const out = [];
  let work;
  for (const ref of refs) {
    const api = `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(ref)}?version=${encodeURIComponent(`hebrew|${version}`)}&return_format=text_only`;
    const data = JSON.parse(await get(api));
    const v = data.versions?.[0];
    if (!v || v.versionTitle !== version) throw new Error(`${ref}: אין בספריא מהדורה "${version}"`);
    if (data.heIndexTitle !== work) out.push(`<h2>${escapeHtml(data.heIndexTitle)}</h2>`);
    work = data.heIndexTitle;
    const local = data.heRef.slice(data.heIndexTitle.length).trim();
    const url = `https://www.sefaria.org/${ref}?lang=he`;
    out.push(`<h3 data-anchor="${url}">${escapeHtml(SEFARIA_UNITS[unit](local))}</h3>`);
    const first = data.sections?.length > 1 ? Number(data.sections.at(-1)) : 1; // "Avot.2.8" מתחיל במשנה ח
    flat(v.text).forEach((seg, i) => {
      const t = sefariaText(String(seg ?? ""));
      if (t) out.push(`<p>${escapeHtml(numbered ? `${hebrewNumeral(first + i)}. ${t}` : t)}</p>`);
    });
  }
  return out;
}

// CCEL: source.ccel = { volume: "npnf201", ids: ["iv.vi.iii.xlii"…], labels? }. הכרך כולו יורד
// כ-ThML פעם אחת; לכל div מבוקש (ולכל div בתוכו) — h3 מה-shorttitle, עם עוגן לדף
// הפרק ב-CCEL. labels: כותרת מפורשת לפרק שאין לו shorttitle. הערות השוליים של העורכים
// (<note>) אינן חלק מהטקסט.
function ccelLabel(attrs) {
  const title = attrs.match(/\stitle="([^"]*)"/)?.[1] ?? "";
  let short = attrs.match(/shorttitle="([^"]*)"/)?.[1] || title;
  if (short.endsWith("...")) short = title; // shorttitle קטוע: "Preface to the Book on the Sites and..."
  const m = short.match(/^(Chapter|Letter|Book)\s+([IVXLCDM]+)\b/);
  if (!m) return short;
  const word = { Chapter: "פרק", Letter: "איגרת", Book: "ספר" }[m[1]];
  return `${word} ${fromRoman(m[2])}`;
}

async function extractCcel(source) {
  const { volume, ids, labels = {} } = source.ccel;
  const xml = await get(`https://www.ccel.org/ccel/schaff/${volume}.xml`);
  const out = [];
  for (const id of ids) {
    const open = new RegExp(`<div(\\d)\\b([^>]*\\bid="${id.replace(/\./g, "\\.")}"[^>]*)>`).exec(xml);
    if (!open) throw new Error(`${volume}: לא נמצא div ${id}`);
    const end = xml.indexOf(`</div${open[1]}>`, open.index);
    const body = xml.slice(open.index, end).replace(/<note\b[\s\S]*?<\/note>/g, "");
    for (const m of body.matchAll(/<div\d\b([^>]*)>|<p\b[^>]*>([\s\S]*?)<\/p>/g)) {
      if (m[1] !== undefined) {
        const divId = m[1].match(/\bid="([^"]+)"/)?.[1];
        const label = labels[divId] ?? ccelLabel(m[1]);
        if (divId && label) {
          out.push(`<h3 data-anchor="https://www.ccel.org/ccel/schaff/${volume}.${divId}.html">${escapeHtml(label)}</h3>`);
        }
      } else {
        const t = textOf(m[2]);
        if (t) out.push(`<p>${escapeHtml(t)}</p>`);
      }
    }
  }
  return out;
}

// גוטנברג: source.gutenberg = { id, books: ["X", "XV"…], chapters? } — ויסטון: הגוף מתחיל
// אחרי תוכן העניינים, "BOOK X." בתחילת שורה, "CHAPTER 1." לכל פרק, סעיפים "1. …".
// או { id, slices: [{ label, from, to }] } — קטעים לפי ביטויים רגולריים (שורה שלמה);
// from נלקח מהמופע האחרון שלו, כי הראשון הוא בדרך כלל בתוכן העניינים.
// הערות השוליים של המתרגם (אחרי "FOOTNOTES", "12 (return) [ …") אינן חלק מהטקסט.
const paragraphs = (text) =>
  text
    .split(/^\s*FOOTNOTES\s*$/m)[0]
    .split(/\n\s*\n/)
    .map((para) => para.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim())
    .filter((t) => t && !/^(\[|\d+ \(return\))/.test(t))
    .map((t) => `<p>${escapeHtml(t)}</p>`);

async function extractGutenberg(source) {
  const { id, books = [], chapters, slices = [] } = source.gutenberg;
  let txt = (await get(`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`)).replace(/\r\n/g, "\n");
  const stop = txt.indexOf("*** END OF THE PROJECT GUTENBERG");
  if (stop > 0) txt = txt.slice(0, stop);
  const out = [];
  for (const { label, from, to } of slices) {
    const starts = [...txt.matchAll(new RegExp(from, "gm"))];
    if (!starts.length) throw new Error(`pg${id}: לא נמצא ${from}`);
    const start = starts.at(-1).index + starts.at(-1)[0].length;
    const end = txt.slice(start).search(new RegExp(to, "m"));
    out.push(`<h3>${escapeHtml(label)}</h3>`, ...paragraphs(txt.slice(start, end > 0 ? start + end : undefined)));
  }
  for (const book of books) {
    const heads = [...txt.matchAll(new RegExp(`^BOOK ${book}\\.`, "gm"))];
    if (!heads.length) throw new Error(`pg${id}: לא נמצא BOOK ${book}`);
    const start = heads.at(-1).index; // המופע הראשון הוא בתוכן העניינים
    const next = txt.slice(start + 5).search(/^BOOK [IVXLC]+\./m);
    const text = txt.slice(start, next > 0 ? start + 5 + next : undefined);
    out.push(`<h2>ספר ${fromRoman(book)}</h2>`);
    for (const ch of text.split(/^CHAPTER (?=\d+\.)/m).slice(1)) {
      const num = Number(ch.match(/^(\d+)/)[1]);
      if (chapters?.[book] && !chapters[book].includes(num)) continue;
      // הפסקה הראשונה היא כותרת הפרק של ויסטון.
      out.push(`<h3>פרק ${num}</h3>`, ...paragraphs(ch.split(/\n\s*\n/).slice(1).join("\n\n")));
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
  let parts;
  if (source.sefaria) parts = await extractSefaria(source);
  else if (source.ccel) parts = await extractCcel(source);
  else if (source.gutenberg) parts = await extractGutenberg(source);
  else if (source.url.includes("benyehuda.org")) parts = extractBenYehuda(await get(source.url), source);
  else if (source.url.includes("penelope.uchicago.edu")) parts = extractLacusCurtius(await get(source.url));
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
      if (!source.file || source.manual) continue;
      await fetchSource(id, source);
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
