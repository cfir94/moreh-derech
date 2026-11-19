# NB-4 · The route map against the tour notebooks (Codex in the desktop app)

> **For the owner:** paste this whole file into the Codex app on your computer, in the `moreh-derech` folder. It needs the NotebookLM plugin.

## The goal
The route map (`/map/route`, the app in `public/embeds/map/`) is a working tool for licensed guides who plan a day in the field with a group. Every place we visited on a course tour has to be on it, with what the tour taught about it. Each site on the map should also link to its notebook, so a guide can ask the notebook questions and build tour points from it.

## The input
- **The map's sites:** `public/embeds/map/js/data/sites.geojson`, 142 features. Each has `id`, `name_he`, `name_en`, `periods`, `religions`, `temple_era`, `region`, `description_he` and `sources`. A point's coordinates are `[lon, lat]`.
- **The tour notebooks:** `src/data/notebooks.ts`, the 25 entries with `mode: "tours"`. Each has `id`, `region`, `title`, `date`, `guide`, `places` and the NotebookLM `url`.

## What to do, for each tour notebook
1. **The stops:** ask the notebook for every place the group actually stood at, in order. Ask it: "מה היו התחנות בסיור, לפי הסדר? לכל תחנה: מה ראינו שם ומה הוסבר. צטט."
2. **Find each stop on the map:** search `sites.geojson` by Hebrew or English name. Allow spelling variants ("כנסיית הבשורה" / "בזיליקת הבשורה"), and match the coordinates too.
3. **Classify each stop:**
   - **missing:** there is no feature for this place;
   - **thin:** the feature exists, but its `description_he` lacks what the tour stressed;
   - **ok:** the feature exists, and its description covers what the tour said.

## The output: `docs/team/reports/NB-4-<region>.md`, one file per region
For each tour, write a heading (the tour's title, date and guide), then one table:

| Stop | Kind | Map `id` | What the tour said (2–3 sentences, Hebrew) | Quote (up to 20 words) |
|---|---|---|---|---|

Then add two sections:
- **"אתרים חסרים"**: for each missing site, give its Hebrew and English name, `lat, lon` to 4 decimals with a named public source (for example Wikipedia or the Nature and Parks Authority), its period and religion if relevant, and a 3–4-sentence description in Hebrew, written from the notebook only.
- **"קישור למחברת"**: every map `id` the tour covers, followed by the notebook `id` from `notebooks.ts`, one per line: `<map id> → <notebook id>`.

## Rules
- **The notebook is the source.** No fact without a quote. Write "לא נמצא במחברת" when the notebook doesn't say it.
- **Coordinates come from a public source, not from guessing.** If you can't find one, write "צריך קואורדינטות" and move on.
- **Don't edit `sites.geojson` or any other code file.** Claude adds the sites from your reports.
- Write in plain, short Hebrew.

## Git
- One branch and one draft PR per region: `codex/NB-4-<region>`, titled `NB-4-<region>: …`. Start each from the latest `main`.
- Don't merge. Claude reviews and merges.

## The order
1. Galilee and Golan first: the owner is preparing "צליינים בגליל" routes.
2. Then Jerusalem.
3. Then the rest, in the order they appear in `notebooks.ts`.

## When something blocks you
Write it in the PR description and stop. Examples: a notebook that won't open, two notebooks that disagree, or a stop you can't place.

## Don't stop over small things
- Meal breaks, toilets and travel between sites aren't stops. Skip them.
- Any small uncertainty (a place you can't identify, an unclear name, a missing time): write "לא ודאי" in the right cell and carry on.
- Stop only when a notebook won't open at all, or you have no NotebookLM access.
- Run the whole task to the end, and open a PR for each region as it's done. Don't wait for an answer between steps.
