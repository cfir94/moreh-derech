// החיפוש במאגר הידע של הדמות, בדפדפן. האינדקס נבנה ב-scripts/build-knowledge.mjs
// ונטען בעצלתיים בפעם הראשונה שמחפשים (או מראש, ברקע, כשהשיחה מתחילה).

import MiniSearch from "minisearch";
import { MINISEARCH_OPTIONS, rankedSearch } from "./shared/hebrew.mjs";

export interface Passage {
  ref: string;
  text: string;
  url: string;
}

export const MAX_RESULTS = 5;
export const MAX_CHARS = 2500;

type Doc = { id: number } & Passage;

/** חותך את התוצאות כך שסך הטקסט לא יעבור MAX_CHARS. */
export function fitResults(results: Passage[], maxChars = MAX_CHARS): Passage[] {
  const out: Passage[] = [];
  let left = maxChars;
  for (const r of results.slice(0, MAX_RESULTS)) {
    const share = Math.floor(left / (Math.min(results.length, MAX_RESULTS) - out.length));
    if (share < 80) break;
    const text = r.text.length > share ? r.text.slice(0, share - 1).replace(/\s+\S*$/, "") + "…" : r.text;
    out.push({ ref: r.ref, text, url: r.url });
    left -= text.length;
  }
  return out;
}

export class SourceSearch {
  private index?: Promise<MiniSearch<Doc>>;

  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  load(): Promise<MiniSearch<Doc>> {
    this.index ??= fetch(this.url)
      .then((r) => {
        if (!r.ok) throw new Error(`index ${r.status}`);
        return r.text();
      })
      .then((json) => {
        const data = JSON.parse(json) as { index: unknown };
        return MiniSearch.loadJS<Doc>(data.index as never, MINISEARCH_OPTIONS);
      });
    this.index.catch(() => (this.index = undefined));
    return this.index;
  }

  async search(query: string): Promise<Passage[]> {
    const ms = await this.load();
    const hits = rankedSearch(ms, query, MAX_RESULTS) as unknown as Passage[];
    return fitResults(hits);
  }
}
