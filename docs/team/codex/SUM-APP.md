# SUM-APP · The 17 remaining topic summaries (Codex in the desktop app)

> **For the owner:** paste this whole file into the Codex app on your computer, in the `moreh-derech` folder. It needs the NotebookLM plugin.

## Why this goes to the desktop Codex
The GitHub Codex can't push. Its copy of the Judaism summary was lost in its sandbox. You can push, so each summary reaches the repo as a PR.

## What is done
`minorities`, `christianity` and `islam` are in `src/data/summaries/`. Read all three before you start: they are the model for structure, voice and the `remember` lines. Also read `src/data/summaries/types.ts` and `src/data/summaries/index.ts`.

## What to do
Write the 17 remaining topics, in this order:

judaism, prehistory, bible, second-temple, roman-byzantine, early-islam, crusader, mamluk-ottoman, modern-yishuv, state, jerusalem, geology, water-climate, flora-fauna, geography, art-arch, tourism

**The rules are in `docs/team/codex/SUM.md`.** In short:
- **The file:** one file per topic, `src/data/summaries/<key>.ts`, in the `Summary` format, with the title from `TOPICS` in `src/data/topics.ts`.
- **Length:** 1,500–3,000 words of Hebrew.
- **Content:** the big picture first, then periods and events with dates, key figures, sites and what you see there today, and exam terms.
- **`remember`:** every section ends with `remember`, 2–4 facts worded like exam questions.
- **Facts:** every fact gets a place or a date.
- **Your own words:** no text copied or closely paraphrased from anyone's summary, including Efrat Nakash's.

### Sources, in this order
1. **The course notebooks in NotebookLM.** Use the lecture notebook for the topic, from `src/data/notebooks.ts`. Ask it: "מה הנקודות המרכזיות בנושא X לפי המרצים? תאריכים, דמויות, אתרים ומושגים. צטט."
2. **The site's own data:**
   - the quiz for the topic in `src/data/quizzes/`;
   - the exams in `src/data/exams/`, which show what is actually asked;
   - the timelines, the learning map, the history atlas, and the geology, flora and fauna guides.
3. **General knowledge:** only when it is certain. A fact that isn't on the site and isn't certain doesn't go in.

### Code
After each file, add it to `SUMMARIES` in `src/data/summaries/index.ts` (import plus the array). Then run `npx tsc --noEmit` and `npx eslint src/data/summaries`.

## Git
- **Branches:** one branch per group of three topics, `codex/SUM-<first key>-<last key>`, each started from the latest `main`. Open a draft PR for each group as soon as it's done. Don't wait for an answer.
- **PR description:** for each topic, list the notebooks you used, the facts you added from outside, and what you weren't sure of.
- **Merging:** don't merge. Claude reviews and merges.

## Don't stop over small things
- **Small doubts:** if you're unsure of a fact, leave it out and say so in the PR. Then carry on.
- **No notebook for a topic:** use the site data and say so in the PR.
- **When to stop:** only if NotebookLM is unreachable, or `tsc` fails because of your file and you can't fix it.
- **Run to the end:** all 17 topics, without waiting for an answer between them.
