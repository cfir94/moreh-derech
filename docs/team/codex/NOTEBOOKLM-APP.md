# Codex in the desktop app: the work that needs NotebookLM

> **For the owner:** paste this whole file into the Codex app on your computer, in the `moreh-derech` folder.
> The app is the only Codex with the NotebookLM plugin. The Codex that runs from GitHub (issues 182 and 183) has no NotebookLM, so it writes from the site's material and Claude checks it.
> Start with NB-0. If it fails, stop and tell Claude.

You are working on **moreh-derech**: a study site for the Israeli tour-guide licensing course, and a working tool for licensed guides. The course material lives in **NotebookLM notebooks** (lectures, tours, concept lists). Your job is to use them as the source of truth.

## The rules (all tasks)

1. **The notebook is the source.** Every fact you write or correct must come from a notebook answer. Write down which notebook and a short quote (up to 20 words) for each one.
2. **Don't guess.** If the notebook doesn't say it, write `לא נמצא במחברת`. Don't fill the gap from memory.
3. **Hebrew, plain and short.** Short sentences, no AI-style flourishes. The readers are 40–60, students and working guides.
4. **Change only the files the task names.**
5. **Git:**
   - Start each task from the latest `main` (`git fetch origin && git checkout -b codex/<task> origin/main`).
   - Commit on that branch, push it, and open a **draft** pull request titled `<task>: …`.
   - Don't merge; Claude reviews and merges.
6. **Never** paste notebook URLs, account details or secrets into files or the PR.

## Where the notebooks are listed

`src/data/notebooks.ts` lists every course notebook:
- `mode: "tours"`: a tour (`region`, `title`, `date`, `guide`, `places`);
- `mode: "theory"`: a lecture subject (`subject`, `focus`);
- `mode: "online"`: an online lesson.

Each entry has its NotebookLM `url`. Match a notebook to a topic by title, subject or places. If you can't tell which notebook covers a topic, list your candidates in the report and ask.

---

## NB-0 · Connection check (5 minutes, no files)

1. List the titles of the first 10 notebooks you can see.
2. Open the notebook whose title or places mention **קומראן** or **מצדה**. Ask it: "מה ראינו בסיור בקומראן? תן שלוש עובדות עם ציטוט קצר."
3. Reply with the list and the answer. **Change nothing.**

---

## NB-1 · Check the topic summaries against the notebooks

**Input:** each file in `src/data/summaries/` (today: `minorities.ts`, `christianity.ts`, `islam.ts`; more arrive every few days).

**For each summary:**
1. Find the notebook or notebooks for its topic (theory notebooks first).
2. Go through **every claim with a date, a name, a number or a place**. Ask the notebook about it.
3. Mark each claim:
   - ✓ the notebook confirms it;
   - ✗ the notebook says something else;
   - ? the notebook doesn't mention it.
4. **Fix only ✗ claims** in the `.ts` file, in the notebook's terms. Leave ? claims as they are, but list them.
5. Add what the notebook stresses that the summary misses: **at most 5 points per summary**, each with its source. Add them to the right section's `remember` list or body, in the same style.

**Output:**
- the corrected `src/data/summaries/<key>.ts`;
- `docs/team/reports/NB-1-<key>.md`: a table of every claim you checked (claim, mark, notebook, quote), then the list of what you added.

Branch `codex/NB-1-<key>`, one PR per summary.

---

## NB-2 · Check the uncertain exam-bank answers

**Input:**
- `tools/exam_bank/items.json`: 2,634 licensing-exam questions (`id`, `question`, `options`).
- `tools/exam_bank/keys/*.txt`: one line per question, `<id> <answer 0–3 or x> <h|m|l>`. The answers there were worked out without the notebooks, and `m` and `l` mean "not sure".

**List the questions to check:**
```bash
cat tools/exam_bank/keys/*.txt | awk '$3=="m" || $3=="l" || $2=="x"'
```

**For each one:** find the topic's notebook, ask it the question with the four options, and decide.

**Output:** `tools/exam_bank/notebook_check.txt`, one line per question:
```
<id> <answer 0-3 or x> <agree|change|unknown> # notebook title — short quote
```
- `agree`: the notebook supports the existing answer.
- `change`: the notebook supports a different option. Put the new index in the second column.
- `unknown`: the notebook doesn't settle it.

**Don't edit the `keys/*.txt` files.** Claude merges your verdicts into them.

Branch `codex/NB-2`. If the list is long, deliver it in batches of 100 (`NB-2a`, `NB-2b`…), one PR each.

---

## NB-3 · Tour reports, one per tour notebook

A tour report is what a guide opens the evening before a tour: where we stop, what we see, what we tell, and what the exam asks about the place.

**Input:** every notebook with `mode: "tours"` in `src/data/notebooks.ts`. Work region by region, in the order they appear in the file.

**Output:** `content/tour-reports/<notebook id>.md`, one file per tour, in exactly this template:

```markdown
---
notebook: <the id from notebooks.ts>
title: <the tour's title>
region: <region>
date: <date>
guide: <guide>
---

## בקצרה
שלושה משפטים: על מה הסיור, איזו תקופה או נושא מחבר את התחנות, ולמה הוא חשוב למבחן.

## תחנות
### 1. <שם התחנה>
- **מה רואים:** …
- **מה מספרים:** 2–4 נקודות, כל אחת משפט אחד.
- **למבחן:** 1–3 עובדות שנשאלות (שם, שנה, מי בנה).
- **מקור:** "<ציטוט קצר מהמחברת>"

### 2. …

## מושגים מהסיור
- **<מושג>:** הגדרה במשפט אחד.

## שאלות לחזרה
5 שאלות קצרות עם תשובה, מתוך מה שנאמר בסיור.
```

Stations follow the order of the tour as the notebook describes it. If the order isn't clear, say so under "בקצרה".

Branch `codex/NB-3-<region>`, one PR per region. Claude builds the screen that shows them.

---

---

## NB-4 · The route map against the tour notebooks

The route map (`/map/route`, the app in `public/embeds/map/`) is a working tool for guides. Its sites are in
`public/embeds/map/js/data/sites.geojson`: 142 features, each with `id`, `name_he`, `name_en`, `periods`, `religions`,
`temple_era`, `region`, `description_he` and `sources`. The owner wants every place we visited on a course tour to be on it, with what the tour taught.

**For each tour notebook** (`mode: "tours"` in `src/data/notebooks.ts`, 25 of them):
1. Ask the notebook for the list of stops: every place the group actually stood at.
2. For each stop, find it in `sites.geojson` by name (Hebrew or English, allowing for spelling variants).
3. Sort the stops into three kinds:
   - **missing:** no feature for this place;
   - **thin:** the feature exists, but its `description_he` lacks what the tour stressed;
   - **ok:** present, and the description covers it.

**Output:** `docs/team/reports/NB-4-<region>.md`, one per region, with one table per tour.
- Columns: stop, kind, map `id` (if any), what the tour said about it (2–3 sentences in Hebrew), and a notebook quote.
- **For missing places, also give coordinates** (lat, lon to 4 decimals) from a reliable public source, and name the source.
- **Don't edit `sites.geojson`.** Claude adds the places from your report.

Branch `codex/NB-4-<region>`, one PR per region.

**The link from a site to its notebook:** in the same report, for every map `id` that a tour notebook covers, write the notebook's `id` from `notebooks.ts`.
The map will show "שאלו את מאגר המידע" on that site.

## The order

1. NB-0
2. NB-1, for the three existing summaries
3. NB-2
4. NB-3, region by region
5. NB-4, region by region (it can run alongside NB-3: both read the tour notebooks)
6. NB-1 again whenever a new summary arrives in `src/data/summaries/`

## When something blocks you

Write it in the PR description, or reply in the chat and stop. Examples: a notebook you can't open, two notebooks that disagree, or a topic with no notebook. Don't work around it.

## Don't stop over small things
- Meal breaks, toilets and travel between sites aren't stops. Skip them.
- Any small uncertainty (a place you can't identify, an unclear name, a missing time): write "לא ודאי" in the right cell and carry on.
- Stop only when a notebook won't open at all, or you have no NotebookLM access.
- Run the whole task to the end, and open a PR for each region as it's done. Don't wait for an answer between steps.
