# NB-5 · A bank of ready-made routes, from the tour notebooks (Codex in the desktop app)

> **For the owner:** paste this whole file into the Codex app on your computer, in the `moreh-derech` folder. It needs the NotebookLM plugin. It can run after NB-4, or alongside it.

## The goal
The route map (`/map/route`) will offer guides a **bank of ready-made routes**: a day's route that a guide opens, sees on the map and adjusts for their own group. The routes come from the course tours themselves. Each course tour is already a tested route, with stops in order, timings and what to tell at each stop.

## The input
- **Tour notebooks:** the `mode: "tours"` entries in `src/data/notebooks.ts` (25 of them).
- **The map's sites:** `public/embeds/map/js/data/sites.geojson`. Each feature has an `id` and `name_he`; a point's coordinates are `[lon, lat]`.
- **Tour reports, where there are any:** `content/tour-reports/*.md` (from NB-3). If one exists for the tour, use it. If not, ask the notebook.

## What to do, for each tour notebook
1. Ask the notebook: "מה היה מסלול הסיור, תחנה אחר תחנה? לכל תחנה: כמה זמן עמדנו שם, מה רואים ומה מספרים. איפה עצרנו לאכול או לנוח? מה צריך לתאם מראש?"
2. Build **one route** from the course tour, as it was actually walked.
3. If the notebook clearly supports a **shorter variant** (a half day, or a version for families), add it as a second route. Don't invent stops the notebook doesn't mention.

## The output: `docs/team/reports/NB-5-<region>.json`
One file per region, holding an array of routes, in exactly this shape:

```json
[
  {
    "id": "galilee-christian-pilgrims",
    "name": "צליינים בגליל: מנצרת לכנרת",
    "region": "הגליל התחתון והכנרת",
    "audience": "קבוצה נוצרית",
    "length": "יום מלא",
    "season": "כל השנה; בקיץ להתחיל מוקדם",
    "note": "שניים־שלושה משפטים: על מה המסלול, ומה החוט שמחבר את התחנות.",
    "notebook": "<the notebook id from notebooks.ts>",
    "stops": [
      {
        "map_id": "church-of-annunciation-nazareth",
        "name_he": "כנסיית הבשורה, נצרת",
        "minutes": 60,
        "tell": "1–2 משפטים: מה מספרים כאן לקבוצה.",
        "quote": "ציטוט קצר מהמחברת"
      },
      {
        "map_id": null,
        "name_he": "מקום שאין במפה",
        "lat": 32.7019,
        "lon": 35.2971,
        "coords_source": "Wikipedia",
        "minutes": 30,
        "tell": "…",
        "quote": "…"
      }
    ],
    "practical": ["לתאם כניסה לכנסייה מראש", "לבוש צנוע"]
  }
]
```

- **`map_id`:** the `id` from `sites.geojson` when the place is there. Otherwise write `null`, and give `lat`, `lon` and `coords_source` from a named public source.
- **`minutes`:** what the notebook says. If it doesn't say, write `null`. Don't guess.
- **`tell` and `note`:** plain, short Hebrew, written from the notebook. Every `tell` comes with a `quote`.
- **`id`:** lowercase English with hyphens, unique across all regions.

## Rules
- **The notebook is the source.** No stop and no fact without a quote. Write "לא נמצא במחברת" where it says nothing.
- **Don't edit code or data files.** Write only the report JSON. Claude loads the routes into the map.
- **Check that the JSON is valid** before opening the PR: `python3 -m json.tool docs/team/reports/NB-5-<region>.json`.

## Git
- One branch and one draft PR per region: `codex/NB-5-<region>`, titled `NB-5-<region>: …`. Start each from the latest `main`.
- Don't merge. Claude reviews and merges.

## The order
1. Galilee and the Sea of Galilee.
2. Jerusalem.
3. The Judean Desert and the Dead Sea.
4. Then the rest.

## Don't stop over small things
- Meal breaks, toilets and travel between sites aren't stops. Skip them.
- Any small uncertainty (a place you can't identify, an unclear name, a missing time): write "לא ודאי" in the right cell and carry on.
- Stop only when a notebook won't open at all, or you have no NotebookLM access.
- Run the whole task to the end, and open a PR for each region as it's done. Don't wait for an answer between steps.
