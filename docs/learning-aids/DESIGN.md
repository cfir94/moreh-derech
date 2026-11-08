# Learning aids — design system

> **For the owner:** this is the design brief for all the learning aids. Codex builds from it, and Claude reviews every PR against it. The exemplary aids are the history atlas, history-talk and the architecture studio. Everything else is being brought up to that level, one aid at a time (series LA on `docs/team/BOARD.md`).

**Read first:** `CLAUDE.md` ("מוסכמות ועיצוב"), `docs/team/PROTOCOL.md`. When this file and a component disagree, this file wins. When `CLAUDE.md` disagrees with this file, `CLAUDE.md` wins.

## 1. What a learning aid is for

A student preparing for the tour-guide licensing exam opens an aid to **understand and remember a topic in minutes**, not to read an encyclopedia. Every screen answers: *what do I need to remember here, and can I check myself?*

So, in priority order:
1. **Short first.** The headline fact is visible at a glance. Detail is one tap away, never in the way.
2. **One screen per topic.** No page that scrolls through 88 cards. Topics are tabs; the current tab lives in the URL hash so links and Back work.
3. **See it.** A real photo (with credit), a map pin or a drawing next to the text wherever one exists.
4. **Check yourself.** Each aid has a practice mode that records progress like the quizzes do.

## 2. The reference implementations (copy their patterns, not their code blindly)

| Pattern | Where it already works | Reuse |
|---|---|---|
| One screen per board, rail of boards (side on desktop, horizontal scroll on phone) | `src/components/architecture/ArchitectureStudio.tsx` + `Studio.module.css` | the layout |
| Tab state in `location.hash` via `useSyncExternalStore` (`hashchange`) | `ArchitectureStudio.tsx` lines ~60–95 | extract into `useHashTab()` |
| Each board has its own "material" background (`th_<id>`) | `Studio.module.css` | per-aid theme on top of tokens |
| Interactive SVG part picker | `src/components/architecture/shared.tsx` (`usePick`) | as is |
| Photo with author + licence under it | `src/components/architecture/PhotoGallery.tsx` | generalise to `PhotoFigure` |
| Short glossary entries (≤ 420 chars, test-enforced) | `tests/classical-architecture.test.mjs` | same idea for summaries (≤ 200) |
| Pure layout math + tests | `src/data/history-atlas/stage.ts` | logic out of components |
| First-visit tour | `src/components/tour/FirstVisitTour.tsx`, `src/data/tours.ts` | every rebuilt aid gets one |
| Shared filters/search/deep links | `src/components/timeline/useEraTimeline.ts`, `matchesTempleQuery` | as is |
| Photo-identification game | `src/components/games/JerusalemRobesGame.tsx` | the model for the plants game |

## 3. The shell (shared components in `src/components/learning-aid/`)

Every rebuilt aid is composed from these. Each is small, typed, RTL, tokens-only.

- **`AidHeader`** — breadcrumb (`עזרי למידה › <aid>`), title (`.grad-text`, weight 900), one-line subtitle, the domain colour from `domainStyle(slug)` (`src/lib/domains.ts`) as `--mc`, and an optional stat line ("88 אירועים · 6 תקופות"). Height on phone ≤ 160px: the content starts above the fold.
- **`AidTabs` + `useHashTab(ids, fallback)`** — the board rail. Desktop: vertical rail on the right (RTL). Phone: horizontal scroll strip, sticky under the navbar. `aria-current` on the active tab, arrow-key navigation, hash updated with `history.replaceState` + a dispatched `hashchange`.
- **`AidSearch`** — one input, Hebrew-normalised (`matchesTempleQuery`), results open the matching card/board and update the hash. Empty state in one short line.
- **`SummaryCard`** — the unit of content: title, date chip, **summary ≤ 200 chars**, up to 3 tags (person/place/concept), optional thumbnail. "עוד" expands the detail in place (native `<details>` is fine), detail fields as short labelled rows, never more than one screen tall. A `concept` badge ("מושג למבחן") when the item is on the course concept lists.
- **`PhotoFigure`** — image + caption + `צילום: <author> · <licence>` line, `loading="lazy"`, fixed aspect box so nothing jumps, `alt` required.
- **`PracticeDeck`** — question → choices (or order-the-cards) → feedback → next; 10 per round; wrong answers come back first next round; records via `src/lib/progress.ts` (`quiz` slug = the aid slug) so mistakes show up in "תרגול טעויות".

## 4. Visual rules

- **Tokens only** (`bg-card`, `bg-card-2`, `border-line`, `text-txt`, `text-txt-dim`, `text-mc`, `--teal`, `--blue`, `--gold`, `--r-md`, `--shadow`…). No raw Tailwind colours, no hex in components. An aid may define **one** extra palette (its "material", e.g. Roman red-copper, Byzantine gold) as CSS variables in its module, with values for light AND dark (`[data-theme="dark"]` and the dark media query).
- **Dark mode is first-class**: check every screen in both.
- **Type**: Heebo (the site font). Body 16px, line-height 1.7, max line ~70 characters. Headings 900. No decorative fonts except inside an aid's material (e.g. Frank Ruhl Libre via `font-serif`).
- **Density**: cards in a grid of 2–3 on desktop, 1 on phone. A board shows at most ~12 cards; more → sub-tabs or "הצג עוד".
- **Motion**: `.screen-in` on board change, `active:scale-95` on buttons, respect `prefers-reduced-motion`.
- **Phone first**: everything works at 360px, no horizontal page scroll, tap targets ≥ 44px.

## 5. Content rules (Claude owns content; Codex never invents it)

- **Source order (owner, 8.11): the course NotebookLM notebooks first, always.** Then web research to verify and to fill gaps; anything added from outside the course material is marked as a supplement ("השלמה"), like `extra: true` on the learning map.
- Facts come from the existing data files. A component may **select and lay out** fields, never write new facts.
- Summaries, "concept" flags and exam emphasis are written by Claude in separate files (e.g. `src/data/second-temple/summaries.ts`); the original data stays untouched.
- Working notes of the research notebook (`gaps`, open questions) are not shown to students.
- Photos only from Wikimedia Commons, free licences, through the existing fetch workflows; **every photo is looked at by Claude before it is used**, and the caption says what is actually visible.

## 6. Never

- A page that is one long scroll of cards.
- More than ~3 lines of text before the first interactive element or image.
- A new font, icon library or UI framework.
- Hex colours or raw Tailwind colours in components.
- Generated/AI images presented as photos.
- Breaking existing deep links (`#ST-012`, `#RO-012`, `#BY-012`, `#t-<id>`): they are used by site search and the atlas.

## 7. Definition of done for an aid

- Uses the shell components; tab in the hash; deep links still work.
- Summary layer present; detail behind "עוד".
- Practice mode recording progress.
- First-visit tour in `src/data/tours.ts`.
- `npm run lint`, `npx tsc --noEmit`, `npm run test:regressions`, `npm run build` pass.
- A Playwright UI test in `tests/<aid>-ui.mjs` (pattern: `tests/jerusalem-robes-ui.mjs`) covering desktop and phone.
- Screenshots at 360 / 1024 / 1440, light and dark, attached to the PR (or listed in the report).
