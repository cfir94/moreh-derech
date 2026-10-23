#!/usr/bin/env node
// דוחס את המדיה של הדמויות עם ffmpeg.
// קלט: characters/<id>/media/raw/ — portrait.(png|jpg|jpeg|webp), idle.(mp4|mov|webm), talking.(mp4|mov|webm)
//       (התיקייה raw/ לא נכנסת ל-Git; רק הקבצים המוכנים נכנסים.)
// פלט: characters/<id>/media/
//   portrait.webp — רוחב 768
//   idle.mp4 / talking.mp4 — H.264, עד 720p, בלי שמע, +faststart, עד 2MB
//   idle.webm / talking.webm — VP9, אותן מגבלות
// אם אין וידאו לדמות — מספיק הדיוקן; אם אין גם דיוקן — מוצגת מונוגרמה בצבע הדמות.
//
// שימוש: node scripts/optimize-media.mjs [characterId...]

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CHAR_DIR = join(ROOT, "characters");
const MAX_BYTES = 2 * 1024 * 1024;

const ffmpeg = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const probeDuration = (file) =>
  Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim(),
  );

function findRaw(rawDir, base, exts) {
  for (const ext of exts) {
    const f = join(rawDir, `${base}.${ext}`);
    if (existsSync(f)) return f;
  }
  return null;
}

// מקטין ל-720p לכל היותר (בלי להגדיל), וממספר זוגי של פיקסלים כנדרש ב-H.264.
const SCALE = "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2";

function encodeVideo(src, outBase) {
  const mp4 = `${outBase}.mp4`;
  const webm = `${outBase}.webm`;
  const common = ["-i", src, "-an", "-vf", SCALE, "-pix_fmt", "yuv420p"];
  ffmpeg([...common, "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-movflags", "+faststart", mp4]);
  ffmpeg([...common, "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-row-mt", "1", webm]);
  // עדיין מעל 2MB? קידוד מחדש בקצב סיביות שמתאים לאורך הסרטון.
  for (const [file, codec] of [
    [mp4, ["-c:v", "libx264", "-preset", "slow", "-movflags", "+faststart"]],
    [webm, ["-c:v", "libvpx-vp9", "-row-mt", "1"]],
  ]) {
    if (statSync(file).size <= MAX_BYTES) continue;
    const kbps = Math.floor(((MAX_BYTES * 8) / probeDuration(src) / 1000) * 0.9);
    ffmpeg([...common, ...codec, "-b:v", `${kbps}k`, "-maxrate", `${kbps}k`, "-bufsize", `${kbps * 2}k`, file]);
  }
  for (const f of [mp4, webm]) console.log(`  ${f.split("/").pop()}: ${(statSync(f).size / 1024).toFixed(0)}KB`);
}

function processCharacter(id) {
  const media = join(CHAR_DIR, id, "media");
  const raw = join(media, "raw");
  if (!existsSync(raw)) {
    console.log(`${id}: אין media/raw — מדלג`);
    return;
  }
  console.log(`${id}:`);
  const portrait = findRaw(raw, "portrait", ["png", "jpg", "jpeg", "webp"]);
  if (portrait) {
    const out = join(media, "portrait.webp");
    ffmpeg(["-i", portrait, "-vf", "scale='min(768,iw)':-2", "-c:v", "libwebp", "-quality", "82", out]);
    console.log(`  portrait.webp: ${(statSync(out).size / 1024).toFixed(0)}KB`);
  }
  for (const loop of ["idle", "talking"]) {
    const src = findRaw(raw, loop, ["mp4", "mov", "webm", "mkv"]);
    if (src) encodeVideo(src, join(media, loop));
  }
}

const only = process.argv.slice(2);
const ids = only.length
  ? only
  : readdirSync(CHAR_DIR).filter((d) => existsSync(join(CHAR_DIR, d, "character.json")));
for (const id of ids) processCharacter(id);
console.log("עכשיו: npm run build:knowledge (מעתיק את המדיה לאתר)");
