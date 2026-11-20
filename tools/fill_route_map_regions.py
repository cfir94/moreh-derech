"""Fill the route map's regions so they tile the country with no holes, and give each a distinct colour.

    pip install shapely && python3 tools/fill_route_map_regions.py

Input: tools/route-map/regions-sketch.geojson (the hand-drawn regions, which left gaps between them and the
coast) and the Natural Earth coastline (tools/learning-map/geo/natural-earth.json).
Output: public/embeds/map/js/data/regions.geojson.

The country is an outline drawn here (the land borders, with the sea side left loose and cut by the coastline).
Every bit of it that no sketch covers goes to the nearest region: a Voronoi split of points along the
regions' edges. So the sketch still decides where each region is; this only closes the gaps.
"""
import json, os
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, MultiPoint
from shapely.ops import unary_union
from shapely import voronoi_polygons, make_valid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKETCH = os.path.join(ROOT, "tools/route-map/regions-sketch.geojson")
OUT = os.path.join(ROOT, "public/embeds/map/js/data/regions.geojson")
NE = os.path.join(ROOT, "tools/learning-map/geo/natural-earth.json")

# the land borders (Lebanon, Syria on the Golan, the Jordan and the Arava, Egypt), and loose points out at sea
OUTLINE = [
    (35.10, 33.09), (35.20, 33.08), (35.32, 33.10), (35.50, 33.09), (35.57, 33.28), (35.64, 33.25), (35.82, 33.33),
    (35.85, 33.20), (35.82, 33.08), (35.88, 32.97), (35.84, 32.83), (35.76, 32.74), (35.65, 32.68), (35.58, 32.64),
    (35.56, 32.40), (35.55, 32.10), (35.54, 31.76), (35.53, 31.45), (35.47, 31.10), (35.40, 30.95), (35.33, 30.75),
    (35.18, 30.42), (35.12, 30.20), (35.05, 29.85), (34.98, 29.55), (34.95, 29.49), (34.90, 29.49),
    (34.73, 29.93), (34.55, 30.40), (34.47, 30.70), (34.40, 30.90), (34.27, 31.22), (34.25, 31.32),
    (34.10, 31.40), (34.40, 32.00), (34.65, 32.60), (34.85, 33.10),
]
PALETTE = {  # neighbours never share a hue
    "golan": "#8e4f2f", "hula-valley": "#45b07a", "galilee-upper": "#2e6f3f", "galilee-lower": "#a3c94f",
    "jezreel-valley": "#e8c22e", "carmel": "#2f7f9a", "sharon": "#f39c3d", "samaria": "#a8482c",
    "jordan-valley": "#6fc7c0", "coastal-plain-south": "#f2d77e", "shfela": "#e0826a", "jerusalem-hills": "#8a5aa8",
    "judean-desert": "#d9b07a", "dead-sea": "#2563a8", "negev-north": "#c9962f", "negev-central": "#9c6b4a",
    "arava": "#e0663a", "eilat": "#18a5a0",
}

# the coastline file stops at 29.8°N; south of it the outline itself is the edge (Eilat)
land = unary_union([Polygon(r).buffer(0) for r in json.load(open(NE))["land"]] + [Polygon([(34, 29.3), (36, 29.3), (36, 29.82), (34, 29.82)])])
country = Polygon(OUTLINE).buffer(0).intersection(land)
sketch = json.load(open(SKETCH))
feats = sketch["features"]
geoms = [make_valid(shape(f["geometry"])).intersection(country) for f in feats]
# the sketch's regions must not overlap: an earlier one keeps a shared bit
taken = Polygon()
for i, g in enumerate(geoms):
    geoms[i] = g.difference(taken)
    taken = taken.union(geoms[i])

gaps = country.difference(taken)
pts, owner = [], []
for i, g in enumerate(geoms):
    for part in getattr(g, "geoms", [g]):
        if part.geom_type != "Polygon" or part.is_empty:
            continue
        ring = part.exterior
        n = max(8, int(ring.length / 0.004))
        for k in range(n):
            p = ring.interpolate(k / n, normalized=True)
            pts.append(p); owner.append(i)
cells = voronoi_polygons(MultiPoint(pts), extend_to=country.envelope.buffer(0.5))
from shapely.strtree import STRtree
tree = STRtree(pts)
grow = [[] for _ in geoms]
for cell in cells.geoms:
    piece = cell.intersection(gaps)
    if piece.is_empty:
        continue
    idx = tree.query(cell, predicate="contains")
    if len(idx) == 0:
        idx = [tree.nearest(cell.centroid)]
    grow[owner[idx[0]]].append(piece)

out = []
for i, f in enumerate(feats):
    g = unary_union([geoms[i], *grow[i]]).buffer(0.0004).buffer(-0.0004).simplify(0.0015, preserve_topology=True)
    parts = [x for x in getattr(g, "geoms", [g]) if x.geom_type == "Polygon" and x.area > 1e-6]
    g = MultiPolygon(parts) if len(parts) > 1 else parts[0]
    props = dict(f["properties"])
    props["color"] = PALETTE.get(props["id"], props.get("color"))
    geo = json.loads(json.dumps(mapping(g)))
    def rnd(c):
        return [rnd(x) for x in c] if isinstance(c[0], (list, tuple)) else [round(c[0], 5), round(c[1], 5)]
    geo["coordinates"] = rnd(geo["coordinates"])
    out.append({"type": "Feature", "properties": props, "geometry": geo})
json.dump({"type": "FeatureCollection", "features": out}, open(OUT, "w", encoding="utf8"), ensure_ascii=False)
left = country.difference(unary_union([shape(f["geometry"]) for f in out])).area
print(f"{len(out)} regions; country {country.area:.4f} sq deg, uncovered {left:.6f}")
