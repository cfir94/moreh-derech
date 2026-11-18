# SUM: our own syllabus summaries, written into the site

**Who:** Codex · **Supervised by:** Claude · **Written:** 18.11.2026.

## Why
Today `/resources` and the "לחזור על הנושא" links point to Efrat Nakash's summaries on her site. Her site says "All rights reserved". The owner wants our own summaries, in our own words, inside the site.

## What a "summary of our own" means (the legal condition)
- **Our wording and our structure.** No sentence is copied and none is reworded closely.
- **No borrowed structure.** We don't follow the order of her headings, and we don't take her examples, her mnemonics or her stories.
- **Facts are not protected; wording is.** Write facts in a new way.
- **What you may use:**
  - the site's own content;
  - general knowledge;
  - open sources: Wikipedia, gov.il, the Israel Antiquities Authority, the Nature and Parks Authority.

  The only role of her summary is as a checklist of topics that must not be left out. If you open it, don't copy anything from it.

## The site's sources, by topic (all in the repo)
- **Quizzes:** `src/data/quizzes/<slug>.ts`. Every question there is a fact a student needs to know.
- **Timelines:**
  - Second Temple: `src/data/history-atlas/research.json`
  - Roman: `src/data/roman/index.ts`
  - Byzantine: `src/data/byzantine/index.ts`
  - Kings: `src/data/history-timeline/`
  - Classical architecture: `src/data/classical-architecture/`
- **Learning map:** `src/data/learning-map/`
- **Geology:** `src/data/geology/`
- **Plants guide:** `src/data/plants/`
- **Fauna guide:** `src/data/fauna/`
- **The exams themselves:** `src/data/exams/` (what actually gets asked).

## Format
One file per topic: `src/data/summaries/<key>.ts`. The key comes from `TOPICS` in `src/data/topics.ts`. The 20 topics are:

minorities, christianity, islam, judaism, prehistory, bible, second-temple, roman-byzantine, early-islam, crusader, mamluk-ottoman, modern-yishuv, state, jerusalem, geology, water-climate, flora-fauna, geography, art-arch, tourism

```ts
import type { Summary } from "./types";
const summary: Summary = {
  key: "crusader",
  title: "התקופה הצלבנית",
  lede: "2–3 sentences: what this period is and why a guide needs it.",
  sections: [
    { title: "...", body: ["paragraph", "paragraph"], remember: ["short fact for the exam", "..."] },
  ],
  terms: [{ term: "...", def: "one sentence" }],   // the topic's glossary
  sites: ["site names where you meet the topic in the field"],
};
export default summary;
```

`src/data/summaries/types.ts` defines `Summary` with exactly these fields. Claude creates it, together with the page `/summaries/<key>`.

**Who the summary is for:** a tour guide, active or a student, preparing for the licensing exam and for guiding in the field. Not a school pupil and not an academic. So every summary:
- **opens with the big picture** in 3–4 sentences: when, who ruled, what changed in the land;
- **is arranged by what a guide needs:**
  - the periods and the main events, by date;
  - the key figures, with one line each on what they did;
  - the sites where you meet the topic in the field, and what you see there today;
  - the terms the exam asks about;
- **ends every section with `remember`:** 2–4 short facts, worded like an exam question ("מי בנה את…", "באיזו שנה…"), taken from the questions on the site;
- **leaves no fact without a place or a date**, wherever there is one. "In the Byzantine period" is not enough; write "בתקופה הביזנטית (324–638)".

**Style:**
- **Language and length:** clear Hebrew, paragraphs of 3–5 sentences, 1,500–3,000 words per topic.
- **Voice:** what a guide would tell a group, not an encyclopedia.
- **Dates:** `לפנה״ס` / `לספירה`.
- **Unsure facts:** check them against the quizzes on the site. A fact not on the site that isn't certain doesn't go in.

## The tasks: SUM-01 … SUM-20
One topic per task, in the order of the list above (SUM-01 = minorities … SUM-20 = tourism).

## Delivery
You can't push. Reply with:
1. **The file:** the whole thing, in a single ```ts block.
2. **A short report** in a ```markdown block:
   - which site sources you used;
   - which facts you added from outside the site and where from;
   - what you weren't sure of.

Claude saves the file, checks it against the course notebooks and the quizzes, and links it in place of the external link.
