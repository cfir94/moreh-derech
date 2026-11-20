# Route map (`/map/route`): the rebuild as a working tool for guides

The owner's notes (19.11), as tasks. The map itself stays a real map: the same MapLibre app in `public/embeds/map/`, with the same tiles and data. What changes is everything around it.

| Task | What | Who | Status |
|---|---|---|---|
| RM-01 | Follows the site's light/dark, with no separate map theme | Claude | done (19.11) |
| RM-02 | Opens clean; after that, with the layers the user last turned on (`ihm_layers_v1`) | Claude | done (19.11) |
| RM-03 | **No side panel.** The map fills the screen. Round icon buttons sit on its right edge, one per layer group. A layer with options opens a small popover with a gentle animation. A layer with nothing to choose (regions, for example) toggles straight from the button | Claude | done (19.11): `js/rail.js` moves the existing panels into the popover, so `app.js` is unchanged |
| RM-04 | **The site's style**: ink icons (`FieldIcons`/`HATCH`) instead of the old icons and banners (the whale, the grass and so on), the site's tokens, and the site's fonts. Make whatever new icons the layers need, check each at `/design/icons`, and replace all 40 icons in `icons/svg/` | Claude | partly done (19.11): the rail, the header and the colours use the ink icons (`icons/ink/`, exported from `/design/icons`). Still to do: the map markers and the icons inside the popovers |
| RM-05 | **A photo for every site you click**: from the learning-map photos (`src/data/learning-map/photos.ts`), matched by name or coordinates, with credit | Claude | done (19.11): 51 of 142 sites. `tools/export_route_map_photos.mjs` writes `js/data/photos.json`; a match needs the same name, or the same spot within 250 m. The exceptions were checked by eye |
| RM-06 | **"שאלו את מאגר המידע"** on every site that has a tour notebook: a link to the NotebookLM notebook, so a guide can ask it questions and build tour points from it. The site-to-notebook mapping comes from Codex (NB-4) | Claude, after NB-4 | done (20.11): the button sits on every tour stop and on the 43 sites that have notes from a tour |
| RM-07 | **Saved routes**: a name, a note, the stops and the active layers, kept in the user's account (a sync store in `src/lib/sync/stores.ts`). Plus 2–3 ready examples, such as "נוצרים בגליל" | Claude | done (19.11): `md_routes_v1:<user_id>`, the `routes` store. **Needs the migration `20261119_02_routes_store.sql`**; until it runs, routes stay on the device |
| NB-4 (done, 20.11) | Check the map's sites against the 25 tour notebooks: missing sites, thin descriptions, coordinates for missing sites, and which notebook covers each site | Codex in the desktop app (`docs/team/codex/NOTEBOOKLM-APP.md`) | waiting |
| RM-09 | **Regions**: drawn like a printed map (a light wash, a soft band along the border with a dashed ink line, the name in large letters, a highlight on hover) | Claude | done (19.11). **Still to do: the boundaries themselves are rough** (gaps between regions, the Carmel barely visible). Redraw them from a reliable source of Israel's geographic regions |
| RM-10 | **A bank of ready-made routes** from the course tours: the route, timings, what to tell at each stop, practical notes. The data comes from Codex (`docs/team/codex/NB-5.md`); Claude loads it into the map as "מסלולים מוכנים" | Codex, then Claude | waiting for NB-5 |
| RM-08 | Add the missing sites and fill the thin descriptions, from Codex's reports | Claude | done (20.11): `tools/import_nb4_tours.py` writes `js/data/tours.json`. That gives 81 new stops on a separate "סיורי הקורס" layer, after merging duplicates. In 43 existing sites the card shows "מה למדנו כאן בסיור". **Still to do: 64 places with no coordinates** (listed in the NB-4 reports as "צריך קואורדינטות") |

## Rules for this work
- The map is a working tool for a guide who has a group. Every change is judged by whether it helps in planning a day in the field.
- The app must keep working offline (the service worker and `sw.js`). A new file goes into the cache list.
- Every new photo is checked by eye, as with every other photo on the site.
