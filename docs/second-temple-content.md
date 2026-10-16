# Second Temple timeline

Route: `/timelines/second-temple/`. Native React, static export, shared site navigation and theme.

## Content source

The owner supplied `second-temple-research-he.md`, collected on 2026-10-15 from the NotebookLM notebook linked in `research.json`. It reports reading six lesson transcripts, a derived summary and a glossary assignment. The audio was not played. The implementation does not claim a new independent reading of NotebookLM or external historical verification.

`src/data/second-temple/research.json` contains 89 preserved ST records, 78 P entries (some grouped), 54 A entries, 10 PR processes, 30 C editorial issues, 18 G gaps and eight source records. The original IDs are retained. `index.ts` defines the display chapters and filters. This is a new curated dataset, separate from previously imported timeline modules.

ST-086 is a learning target with insufficient evidence, so it is excluded from the 88-event timeline and search index. It is explained in the sources/gaps view. People mentioned only in the assignment are labelled as mentions, not full biographies.

ST-014's main date label uses the broad fifth-century context instead of promoting the disputed 445 to an established date. The detailed caution preserves the conflicting transcript/query versions. ST-036, 067, 069, 082 and 085 retain prominent cautions in their collapsed cards. All other cautions, attribution, date precision and source locator text remain in expanded records. No historical correction has been silently introduced.

## Representation

Chapters and card spacing are editorial navigation, not a proportional time scale. Ranges and processes can overlap. Display dates are preserved text, never coerced to an exact numeric point. Thus no fabricated dates or year-zero arithmetic are introduced. Pre-Temple background and post-70 aftermath are explicitly separate. The architectural ornament in the header is decorative and hidden from accessibility APIs; it is not a reconstruction.

Sources identify filenames and search terms. The notebook link opens the whole notebook: the supplied research did not provide stable per-passage URLs, timestamps or pages. SB is a derivative summary; SG is an assignment, not evidence for answers. The sources view preserves all 30 editorial issues and 18 gaps for inspection.

## Site integration

The timeline appears in `/timelines`, the home count is six, and global search includes the collection plus 88 event links. `search.json` is the lightweight projection of published event IDs, titles, date labels, summaries, people and places. When changing a record, keep this projection consistent. Direct event fragments open and focus the relevant native details card, including after client navigation. There are no new storage keys, account changes or backend dependencies.

## Verification

Run `node --test tests/second-temple-content.test.mjs`, changed-file ESLint, `npm run build`, and `node tests/second-temple-ui.mjs` (requires Playwright Chromium). The UI checks operate on `out/` with `/moreh-derech` preserved, cover filtering, empty states, directories, source cautions, keyboard expansion, fragment links, both themes and mobile overflow.

For a running local preview, `TEMPLE_TEST_BASE_URL` can point to its base URL including `/moreh-derech`; the default remains the production static export.

### Local results, 2026-10-16

- Two provenance/content tests, all nine existing state regression tests, and ESLint on changed application files passed.
- Next.js compilation and TypeScript passed. Windows rejected generated-directory creation with EPERM during both static export and development serving. Webpack and a temporary single-worker/thread configuration did not resolve it; the tracked Next configuration was restored unchanged.
- Fourteen Chromium UI checks passed against an isolated React component harness using the actual timeline, timeline-index, global-search and theme-toggle source, compiled site CSS and Heebo font. Only Next Link routing and the outer header were substituted for local serving. Desktop/mobile, both themes, keyboard expansion, cross-view event links, same-page global-search fragments, mentions/gaps and 320px overflow were exercised with no page errors. Desktop and mobile screenshots were inspected. These results are not a full Next.js integration/static-export pass.
- The workflow now runs the content checks and the same browser checks against the real static export. That full build/integration run remains pending GitHub upload authorization. No production deployment has occurred.
