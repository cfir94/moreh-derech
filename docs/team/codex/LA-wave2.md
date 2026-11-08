# Learning aids, wave 2: seven Codex tasks

Written by Claude on 8.11.2026. Claude will be offline for about two days. Work through the tasks below; each has its own GitHub issue. **One task per reply.** Claude reviews every diff when back, with screenshots, before anything merges.

## Rules for every task (read first)

1. Read `CLAUDE.md`, `AGENTS.md`, `docs/team/PROTOCOL.md` and **`docs/learning-aids/DESIGN.md`** (the spec; it wins over component habits). Node: `nvm use 22`. The build works offline (local fonts).
2. Build on the shell that is already on `main`: `src/components/learning-aid/*` (`AidHeader`, `AidTabs` + `useHashTab`, `AidSearch`, `SummaryCard`, `PhotoFigure`, `PracticeDeck`). The demo is `src/app/timelines/shell-demo/page.tsx`. Do not fork these components; if one needs a new prop, add it backwards-compatibly.
3. **Tokens only.** No hex and no raw Tailwind colours in components. An aid may keep **one** "material" palette as CSS variables in its module, with light **and** dark values.
4. **Never write new facts.** Content comes from the existing data files. You may select, group and lay out fields. Summaries are written by Claude (see LA-11).
5. **Never break deep links** (`#ST-012`, `#RO-012`, `#BY-012`, `#t-<id>`): site search and the atlas use them. Use `useHashTab`'s `resolve` so a card hash opens its tab and scrolls to the card.
6. Do not touch: the history atlas, history-talk, the architecture studio, `src/lib/sync/**`, `src/lib/progress.ts` (call its functions, don't change them), `api/**`, workflows other than the one a task names.
7. Stay inside the task's scope. If you must change a file outside it, say why in the report.
8. Checks, all must pass: `npm run lint`, `npx tsc --noEmit`, `npm run test:regressions`, `npm run build`. You cannot run Playwright; write the UI test anyway and Claude will run it.
9. **You cannot push.** Reply with the full `git diff main` (run `git add -N .` first so new files are included) in ONE ```diff block, then a short report in ONE ```markdown block: what you did, each command and its result, what you did not do, and any question. The diff is the deliverable; a summary alone is not.
10. Strings shown to users are Hebrew, short and plain. RTL. Phone first (360px, no horizontal scroll, tap targets ≥ 44px).

---

## LA-11: Second Temple on the shell

**Scope:** `src/components/timeline/SecondTemple*`, `src/app/timelines/second-temple/**`, new `src/data/second-temple/summaries.ts`, `src/data/tours.ts` (one new entry), `tests/second-temple-ui.mjs` (update), `docs/team/reports/LA-11.md`.

Today the page is one long scroll of 88 cards, about 660 characters each. Rebuild it on the shell:
- `AidHeader` (slug `second-temple`) with a stat line (events, periods).
- One tab per period (`TEMPLE_PERIODS`), plus a first tab "תמונה כוללת": one row per period with its years and its 3 events marked `concept` (if fewer, the first 3).
- Each event is a `SummaryCard`: title, date chip, **summary**, up to 3 tags (people/places from the data), detail fields inside "עוד" as short labelled rows. Drop the research notebook's working fields (`gaps`, open questions) from the display.
- **Summaries:** create `src/data/second-temple/summaries.ts` exporting `SUMMARIES: Record<string, { summary: string; concept?: boolean }> = {}` (empty; Claude fills it). Until an id has an entry, show the event's existing shortest descriptive field cut at a word boundary to ≤ 200 characters, followed by "…". Put that fallback in one pure function with a unit test in `tests/second-temple-content.test.mjs`.
- `AidSearch` with `matchesTempleQuery`; a match opens its tab and scrolls to the card.
- A practice tab with `PracticeDeck` (`quizSlug: "second-temple"`). Question types, built **only** from the data: "מה קרה ב-<year>?" (4 event titles), "באיזו תקופה…?" (4 period names). Wrong distractors from the same or neighbouring period.
- First-visit tour entry in `src/data/tours.ts`.
- Keep `#ST-xxx` deep links working (they are in `tests/second-temple-ui.mjs`).

## LA-20: Roman and Byzantine on the shell

**Scope:** `src/components/timeline/{RomanTimeline,ByzantineTimeline}*`, `src/components/timeline/useEraTimeline.ts` (only if needed), `src/app/timelines/{roman,byzantine}/**`, `src/data/tours.ts`, `tests/era-timelines*` (UI test new: `tests/era-timelines-ui.mjs`), `docs/team/reports/LA-20.md`.

- Keep each aid's **material**: Roman road and milestones, tabula ansata, Pompeian red/copper; Byzantine mosaic. Move every colour into CSS variables with light and dark values (check for hard-coded hex today).
- Wrap them in `AidHeader` and `AidTabs`: one tab per period plus the existing sub-views (emperors and legions, sites; emperors and councils, churches/monasteries/synagogues, pilgrims) as tabs, in the hash.
- Event cards: summary first, detail in "עוד". For the summary, use the existing short field if there is one (≤ 200 characters), otherwise the same fallback function as LA-11 (import it, don't copy it).
- Mark `concept: true` events with the "מושג למבחן" badge (`SummaryCard` already has it).
- A practice tab per aid (`PracticeDeck`, slugs `roman` / `byzantine`): order/date and "who did it" questions built only from the data.
- `#RO-012` / `#BY-012` must still open the right tab and card.

## LA-41: New Testament and Egypt–Canaan as local pages

**Scope:** `src/app/timelines/{biblical,egypt-canaan}/**`, new `src/components/timeline/{Biblical,EgyptCanaan}*`, `src/data/tours.ts`, `tests/biblical-egypt-ui.mjs`, `docs/team/reports/LA-41.md`. **Do not edit `src/data/timelines/*.ts`.**

These pages embed built apps from `public/embeds/timelines/` with no source. The data already exists in `src/data/timelines/biblical.ts` and `egypt-canaan.ts`. Build local pages on the shell from that data: tabs by period/section as the data groups them, `SummaryCard`s, search, a practice tab. **The life-of-Jesus content must appear exactly as in the data: no rewording, no reordering, nothing dropped.** Keep the old embed reachable at `<page>/classic` (noindex, not linked) until Claude approves removing it.

## LA-50: Periods table, "who's who in Rome", and the learning-aids index

**Scope:** `src/components/timeline/{PeriodsTable,RomanPeople,RomanStory}*`, `src/app/timelines/page.tsx`, `src/app/timelines/{periods,roman-people}/**`, `tests/periods-table-ui.mjs`, `tests/roman-people-ui.mjs`, `docs/team/reports/LA-50.md`.

- Move every colour to tokens or the module's material variables with light and dark values. Today `[data-roman-people]` is forced to a white background in both themes (the UI test even asserts `rgb(255, 255, 255)`); make dark mode real and update the test.
- **Flaky test:** `tests/roman-people-ui.mjs` (line ~207, "centered stops at 320") fails intermittently in CI (received 35, expected ≤ 1) and passes on re-run. Find the cause (likely measuring during a scroll/transition or before fonts/images settle) and fix it in the test or the layout. Do not loosen the tolerance and do not skip the check.
- `/timelines` index: one uniform card per aid (icon/colour from `domains.ts`, title, one-line description, what you can do there: "סיכומים · תרגול · מפה"). Same card component for all.

## LA-31T: plants photo tooling

**Scope:** new `tools/fetch_plants_photos.py`, new `tools/plants_photos.json`, new `.github/workflows/fetch-plants-photos.yml`, new `src/data/plants/photos.json` (empty `{}` placeholder), `tests/plants.test.mjs` (extend), `docs/team/reports/LA-31T.md`.

Copy the pattern of `tools/fetch_christian_dress_photos.py` + `fetch-christian-dress-photos.yml` (Wikimedia Commons only, free licences only, author + licence recorded, 1280px JPEG, polite User-Agent and rate limit, lock file).
- `tools/plants_photos.json`: for each of the 40 plants in `src/data/plants/plants.ts`, up to 3 candidate **searches** (Commons category or search by scientific name `sci`; views: whole plant, leaf, flower/fruit). Mark them `"status": "candidate"`. **Do not write captions**: Claude looks at each photo and writes the caption, then sets `"status": "approved"`.
- The workflow downloads candidates to `public/plants/photos/` and writes `src/data/plants/photos.json`; the game will use only `approved` entries.
- Test: every plant id in the manifest exists in `plants.ts`; approved entries have author, licence and caption.

## LA-32: the plants game

**Scope:** new `src/components/games/Plants*`, new `src/lib/plants.ts`, `src/app/games/plants/page.tsx`, new `tests/plants-ui.mjs`, `tests/plants.test.mjs` (extend), `docs/team/reports/LA-32.md`. Model: `src/components/games/JerusalemRobesGame.tsx` + `src/lib/christianDress.ts` (read them closely).

- Data: `src/data/plants/plants.ts` (40 plants, 7 groups: name, sci, group, habit, sign, season, habitat, where, confuse[], fact). Photos: `src/data/plants/photos.json`, **approved entries only**.
- Rounds of 10. Question types: name from photo; photo from name (4 photos); "what gives it away" (the `sign` field, 4 options); habitat; season; "don't confuse": which of two look-alikes (`confuse`) is shown; group. **A photo question is used only when the plant has an approved photo**, otherwise the round uses text types. The game must work, and be tested, with `photos.json` empty.
- Field guide tab: 7 groups, a card per plant with all fields; photos with credit via `PhotoFigure`.
- Progress via `src/lib/progress.ts` (`quiz: "plants"`), wrong plants first next round. First-visit tour.
- Replace the iframe in `src/app/games/plants/page.tsx` with the new game. Keep the old embed at `/games/plants/classic` (noindex, unlinked) until Claude approves removing it.

## LA-40: iron age, kings and Judaism: extract the data

**Scope:** new `src/data/history-timeline/**`, new `tools/extract_history_timeline.mjs`, new `tests/history-timeline-data.test.mjs`, `docs/team/reports/LA-40.md`. **Data only: no UI in this task.**

`public/embeds/history-timeline/` is a built app (about 250KB of HTML/JS) with three views (`?view=` iron, kings, judaism) and the dating tool. Write a script that extracts its data (events, dates, periods, people, descriptions, image references) into typed TS files, one per view, plus `index.ts`. Keep every text **verbatim** (no rewording; fix only obvious encoding damage and list each fix in the report). The test checks counts against the embed (write down the numbers you find in the report), unique ids, and that each date parses. A later task builds the pages.
