"""Turn Codex's NB-5 reports (docs/team/reports/NB-5-*.json) into the route map's bank of ready-made routes.

    python3 tools/import_nb4_tours.py && python3 tools/import_nb5_routes.py

Writes public/embeds/map/js/data/route-bank.json: {routes: [...], places: GeoJSON}.
A stop is a map site (map_id), else the course-tour stop at the same spot (tours.json, within 300 m), else a
new place from its sourced coordinates. A stop with no coordinates stays in the route's steps as text only.
"""
import json, glob, math, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "public/embeds/map/js/data")
sites = {f["properties"]["id"] for f in json.load(open(f"{D}/sites.geojson", encoding="utf8"))["features"]}
tours = json.load(open(f"{D}/tours.json", encoding="utf8"))
tour_pts = [(f["properties"]["id"], f["geometry"]["coordinates"]) for f in tours["stops"]["features"]]

def km(a, b):
    r = math.pi / 180
    h = math.sin((b[1]-a[1])*r/2)**2 + math.cos(a[1]*r)*math.cos(b[1]*r)*math.sin((b[0]-a[0])*r/2)**2
    return 12742 * math.asin(math.sqrt(h))

places, routes, ids = [], [], set()
for path in sorted(glob.glob(os.path.join(ROOT, "docs/team/reports/NB-5-*.json"))):
    region_key = os.path.basename(path)[5:-5]
    for r in json.load(open(path, encoding="utf8")):
        stops, steps = [], []
        for s in r.get("stops", []):
            pid = s.get("map_id") if s.get("map_id") in sites else None
            lat, lon = s.get("lat"), s.get("lon")
            if not pid and isinstance(lat, (int, float)) and isinstance(lon, (int, float)) and 29 < lat < 34 and 34 < lon < 36.5:
                near = min(((km((lon, lat), c), i) for i, c in tour_pts), default=(9, None))
                if near[0] < 0.3:
                    pid = near[1]
                else:
                    near_p = min(((km((lon, lat), p["geometry"]["coordinates"]), p["properties"]["id"]) for p in places), default=(9, None))
                    if near_p[0] < 0.12:
                        pid = near_p[1]
                    else:
                        pid = "rb-" + re.sub(r"[^a-z0-9]+", "-", (r["id"] + "-" + str(len(places))).lower())
                        places.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [round(lon, 5), round(lat, 5)]},
                                       "properties": {"id": pid, "name_he": s.get("name_he", ""), "name_en": "", "description_he": s.get("tell", ""),
                                                      "quote": s.get("quote", ""), "notebooks": [r.get("notebook")] if r.get("notebook") else [],
                                                      "religions": [], "region": region_key, "coords_source": s.get("coords_source", "")}})
            if pid and pid not in stops:
                stops.append(pid)
            steps.append({"id": pid, "name": s.get("name_he", ""), "minutes": s.get("minutes"), "tell": s.get("tell", ""), "quote": s.get("quote", "")})
        rid = r["id"]
        while rid in ids:
            rid += "-2"
        ids.add(rid)
        routes.append({"id": rid, "name": r.get("name", ""), "region": r.get("region", ""), "audience": r.get("audience", ""),
                       "length": r.get("length", ""), "season": r.get("season", ""), "note": r.get("note", ""),
                       "notebook": r.get("notebook"), "practical": r.get("practical", []), "stops": stops, "steps": steps})

json.dump({"routes": routes, "places": {"type": "FeatureCollection", "features": places}},
          open(f"{D}/route-bank.json", "w", encoding="utf8"), ensure_ascii=False)
on_map = sum(len(r["stops"]) for r in routes); all_steps = sum(len(r["steps"]) for r in routes)
print(f"{len(routes)} routes; {on_map} of {all_steps} steps placed on the map; {len(places)} new places")
