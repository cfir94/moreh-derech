import test from "node:test";
import assert from "node:assert/strict";
import { ARTICLES } from "../src/data/articles/index.ts";
import { resolvePhoto } from "../src/data/articles/photos.ts";
import { existsSync } from "node:fs";

test("every article is complete: title, lede, date, photo with credit, what to tell the group, sources", () => {
  const slugs = new Set();
  for (const a of ARTICLES) {
    assert(!slugs.has(a.slug), a.slug + " unique"); slugs.add(a.slug);
    assert(a.title.length <= 60, a.slug + " title up to 60");
    assert(a.lede.length <= 160, a.slug + " lede up to 160: " + a.lede.length);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(a.date), a.slug + " date");
    assert(a.sections.length >= 3 && a.say.length >= 2 && a.sources.length >= 1, a.slug + " body");
    for (const ref of [a.hero, ...a.sections.flatMap((s) => (s.photo ? [s.photo] : []))]) {
      const p = resolvePhoto(ref);
      assert(p.author && p.license && p.source, `${a.slug}: credit for ${ref.id}`);
      assert(existsSync(new URL("../public" + p.src, import.meta.url)), `${a.slug}: file ${p.src}`);
    }
    if (a.category === "אקטואליה") assert(a.news?.source, a.slug + " a topical article names its source");
  }
});
