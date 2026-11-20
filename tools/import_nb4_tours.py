"""Turn Codex's NB-4 reports (docs/team/reports/NB-4-*.md) into the route map's tour layer.

    python3 tools/import_nb4_tours.py

Writes public/embeds/map/js/data/tours.json:
  notebooks: {id: {title, url}}                 the tour notebooks, from src/data/notebooks.ts
  stops:     GeoJSON of places a course tour stood at that the map lacked (only those with sourced coordinates)
  notes:     {site id: [{nb, text, quote}]}      what a tour said at a site the map already has
Every text is the report's, drawn from the notebook; nothing is written here by hand.
"""
import json, re, glob, math, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS = sorted(glob.glob(os.path.join(ROOT, "docs/team/reports/NB-4-*.md")))
OUT = os.path.join(ROOT, "public/embeds/map/js/data/tours.json")
SITES = os.path.join(ROOT, "public/embeds/map/js/data/sites.geojson")

nb_src = open(os.path.join(ROOT, "src/data/notebooks.ts"), encoding="utf8").read()
notebooks = {}
for m in re.finditer(r'\{\s*id: "([^"]+)",(.*?)\n  \}', nb_src, re.S):
    body = m.group(2)
    t = re.search(r"""title: (?:"([^"]+)"|'([^']+)')""", body)
    u = re.search(r'url: "([^"]+)"', body)
    if t and u:
        notebooks[m.group(1)] = {"title": t.group(1) or t.group(2), "url": u.group(1)}

site_ids = {f["properties"]["id"] for f in json.load(open(SITES, encoding="utf8"))["features"]}
REL = {"יהדות": "judaism", "נצרות": "christianity", "אסלאם": "islam", "מוסלמ": "islam"}

def clean(s):
    s = re.sub(r"\*\*|`", "", s).strip()
    return re.sub(r"\s+", " ", s)

def km(a, b):
    r = math.pi / 180
    h = math.sin((b[0]-a[0])*r/2)**2 + math.cos(a[0]*r)*math.cos(b[0]*r)*math.sin((b[1]-a[1])*r/2)**2
    return 12742 * math.asin(math.sqrt(h))

stops, notes, need_coords = [], {}, []
for path in REPORTS:
    region = os.path.basename(path)[5:-3]
    text = open(path, encoding="utf8").read()
    for sec in re.split(r"\n(?=## )", text):
        nbm = re.search(r"מזהה מחברת:\s*`([^`]+)`", sec)
        if not nbm:
            continue
        nb = nbm.group(1)
        # the table: a known site, and what the tour said there
        for row in re.findall(r"^\|(.+)\|\s*$", sec, re.M):
            cells = [c.strip() for c in row.split("|")]
            if len(cells) < 5 or cells[1] not in ("thin", "ok"):
                continue
            sid = cells[2].strip("` ")
            if sid not in site_ids:
                continue
            said = clean(re.sub(r"\*חסר בתיאור:.*?\*", "", cells[3]))
            quote = clean(cells[4].split("—")[0])
            notes.setdefault(sid, [])
            if not any(n["nb"] == nb and n["text"] == said for n in notes[sid]):
                notes[sid].append({"nb": nb, "text": said, "quote": quote})
        # the links section: a known site that this tour covers, even without words of its own
        for sid in re.findall(r"^([a-z0-9-]+)\s*→\s*" + re.escape(nb), sec, re.M):
            if sid in site_ids and sid not in notes:
                notes[sid] = [{"nb": nb, "text": "", "quote": ""}]
        # missing places
        miss = re.search(r"### אתרים חסרים(.*?)(?=\n### |\Z)", sec, re.S)
        if not miss:
            continue
        for block in re.split(r"\n(?=#### )", miss.group(1)):
            h = re.match(r"#### (.+?)(?: — (.+))?\n", block.strip() + "\n")
            if not h:
                continue
            name_he = clean(h.group(1)); name_en = clean(h.group(2) or "")
            c = re.search(r"קואורדינטות:\s*\*\*(-?\d+\.\d+),\s*(-?\d+\.\d+)\*\*", block)
            desc = re.search(r"תיאור מן המחברת:\s*(.+)", block)
            quote = re.search(r"ציטוט:\s*(.+?)(?: — `|$)", block, re.M)
            rel = re.search(r"דת:\s*(.+)", block)
            period = re.search(r"תקופה:\s*(.+?)\.\s*דת:", block)
            src = re.search(r"מקור:\s*(.+)", block)
            if not c:
                need_coords.append(f"{region}: {name_he}")
                continue
            lat, lon = float(c.group(1)), float(c.group(2))
            if not (29 < lat < 34 and 34 < lon < 36.5):
                need_coords.append(f"{region}: {name_he} (out of range)")
                continue
            # the same place reached by two tours is one stop with two notebooks
            dup = next((s for s in stops if km((lat, lon), (s["geometry"]["coordinates"][1], s["geometry"]["coordinates"][0])) < 0.12), None)
            if dup:
                if nb not in dup["properties"]["notebooks"]:
                    dup["properties"]["notebooks"].append(nb)
                continue
            rels = sorted({v for k, v in REL.items() if rel and k in rel.group(1)})
            sid = "tour-" + re.sub(r"[^a-z0-9]+", "-", (name_en or name_he).lower()).strip("-")[:60]
            n = 2
            base = sid
            while any(s["properties"]["id"] == sid for s in stops):
                sid = f"{base}-{n}"; n += 1
            stops.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [round(lon, 5), round(lat, 5)]},
                "properties": {
                    "id": sid, "name_he": name_he, "name_en": name_en,
                    "description_he": clean(desc.group(1)) if desc else "",
                    "quote": clean(quote.group(1)) if quote else "",
                    "period_text": clean(period.group(1)) if period and "לא נמצא" not in period.group(1) else "",
                    "religions": rels, "notebooks": [nb], "region": region,
                    "coords_source": clean(re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", src.group(1)))[:160] if src else "",
                },
            })

used = {nb for s in stops for nb in s["properties"]["notebooks"]} | {n["nb"] for v in notes.values() for n in v}
out = {
    "notebooks": {k: v for k, v in notebooks.items() if k in used},
    "stops": {"type": "FeatureCollection", "features": stops},
    "notes": notes,
}
json.dump(out, open(OUT, "w", encoding="utf8"), ensure_ascii=False)
missing_nb = sorted(used - set(notebooks))
print(f"{len(stops)} new tour stops, {len(notes)} known sites with tour notes, {len(out['notebooks'])} notebooks")
print(f"{len(need_coords)} places still need coordinates; unknown notebook ids: {missing_nb}")
