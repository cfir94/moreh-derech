# Roman people: a visual learning journey (25 October 2026)

The previous view hid the useful portrait collection behind a text-heavy list and gave the learner little invitation to start. This revision keeps all historical data, sources, portrait credits, comparisons, filters and the original full recall deck. No authentication or progress storage changes.

## Research translated into design

- Experimental Museum Interfaces, Edge Hill University: https://emi.computing.edgehill.ac.uk/index.html . Its collection explorers offer visual entry points before requiring a search. Applied here as a selectable portrait gallery, three photographic portrait entry points, and illustrated period destinations.
- Nielsen Norman Group, Progressive Disclosure: https://www.nngroup.com/articles/progressive-disclosure/ . Applied as one immediately legible core action plus two memory cues, with historical context and credits in the existing expandable section. The core learning facts stay visible together.
- Nielsen Norman Group, Memory Recognition and Recall in User Interfaces: https://www.nngroup.com/articles/recognition-and-recall/ . Applied to navigation with faces and names; actual recall still hides the identity until the learner requests the answer. This distinction avoids confusing easy navigation with effective testing.
- The Effects of Different Feedback Types on Learning With Mobile Quiz Apps: https://pmc.ncbi.nlm.nih.gov/articles/PMC8200521/ . The discussion motivates keeping feedback compact and manageable, not promising that any particular visual skin improves learning.

These are design inputs, not evidence that this particular implementation improves exam scores.

## Result

A warm ivory reading surface sits below a deep green, burgundy or lapis introduction. Portraits are larger in the reading exhibit and act as visible navigation targets. Roman fluted-column lines, imperial drapery and Byzantine mosaic/arch treatments vary the shapes and texture alongside the existing symbolic helmet/sword/cross art. All historical images and their provenance remain unchanged.

The timeline is a gallery ordered by the original event date, not an assertion of a single succession. Desktop shows it below the exhibit; the mobile picker opens above the exhibit and closes upon selection. Previous/next and keyboard arrows remain. Comparison includes a visual pair picker and the original accessible select.

An optional five-person round is immediately accessible. It follows the current filters, starts with up to five people, can shuffle on restart, and repeats missed cards as before. The ordinary practice tab still uses the entire filtered deck. Starting another short round always resets it, including after completion. No timer, invented mastery score or new persistent tracking.

## Validation

Data source files unchanged. Existing three data checks pass. Targeted ESLint passes. The actual component and CSS passed the existing UI flow locally through a minimal harness: all 35 portraits, filters, alias search, comparisons, recall and missed-card retry, keyboard navigation, reduced widths, both themes and the five-person round. The harness substitutes only Next Link and supplies local assets without network; the complete site index and unchanged companion images are checked on the actual export in CI. QA screenshots reviewed for desktop, mobile reading, period changes and dark mode. Production build and export UI verification run in the existing GitHub workflow on publication.
