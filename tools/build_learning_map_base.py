#!/usr/bin/env python3
"""Builds the illustrated base map of the learning map (/map/learn).

Two "sheets", each drawn once here and never at runtime:

- country — the land from the Lebanese coast to the Negev highlands and
  Transjordan, painted from the elevation tiles the route-planning map already
  ships (public/embeds/map/data/terrain, terrarium-encoded, zoom 11);
- jerusalem — the city and its valleys, with contour lines from the same tiles
  and the Old City / Temple Mount outlines from OpenStreetMap.

Outputs:
  public/learning-map/<sheet>-light.webp, <sheet>-dark.webp   painted relief
  src/data/learning-map/geometry.ts                           generated — vectors
                                                              and the projection

The vector sources sit in tools/learning-map/geo/ (Natural Earth, public
domain; OpenStreetMap, ODbL), clipped to the map extent so the build needs no
network. Requires numpy, pillow and contourpy.

    python3 tools/build_learning_map_base.py
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from contourpy import contour_generator
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
TERRAIN = ROOT / "public/embeds/map/data/terrain"
GEO = ROOT / "tools/learning-map/geo"
OUT_IMG = ROOT / "public/learning-map"
OUT_TS = ROOT / "src/data/learning-map/geometry.ts"

DEM_ZOOM = 11
TILE = 256

SHEETS = {
    "country": {"bounds": (34.15, 29.45, 36.02, 33.4), "width": 1000, "raster": 1200},
    "jerusalem": {"bounds": (35.198, 31.733, 35.259, 31.792), "width": 1000, "raster": 1000},
}


# ---------------------------------------------------------------- projection

def merc(lon: float, lat: float) -> tuple[float, float]:
    """Web Mercator in world units 0..1 (y grows southwards)."""
    x = (lon + 180) / 360
    s = math.sin(math.radians(lat))
    y = 0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)
    return x, y


def sheet_frame(sheet: dict) -> dict:
    lon0, lat0, lon1, lat1 = sheet["bounds"]
    x0, y0 = merc(lon0, lat1)
    x1, y1 = merc(lon1, lat0)
    w = sheet["width"]
    scale = w / (x1 - x0)
    return {"x0": x0, "y0": y0, "scale": scale, "w": w, "h": round((y1 - y0) * scale, 2)}


def project(frame: dict, lon: float, lat: float) -> tuple[float, float]:
    x, y = merc(lon, lat)
    return (x - frame["x0"]) * frame["scale"], (y - frame["y0"]) * frame["scale"]


# ---------------------------------------------------------------- elevation

def load_dem(frame: dict, out_w: int) -> np.ndarray:
    """Elevation (m) resampled onto the sheet's raster grid."""
    world = TILE * 2**DEM_ZOOM
    px0, py0 = frame["x0"] * world, frame["y0"] * world
    px1 = px0 + frame["w"] / frame["scale"] * world
    py1 = py0 + frame["h"] / frame["scale"] * world
    tx0, ty0, tx1, ty1 = int(px0 // TILE), int(py0 // TILE), int(px1 // TILE), int(py1 // TILE)
    mosaic = np.zeros(((ty1 - ty0 + 1) * TILE, (tx1 - tx0 + 1) * TILE), dtype=np.float32)
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            path = TERRAIN / str(DEM_ZOOM) / str(tx) / f"{ty}.png"
            if not path.exists():
                continue
            rgb = np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)
            elev = rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768
            mosaic[(ty - ty0) * TILE:(ty - ty0 + 1) * TILE, (tx - tx0) * TILE:(tx - tx0 + 1) * TILE] = elev
    # crop to the exact frame, then resample with bicubic interpolation
    ox, oy = px0 - tx0 * TILE, py0 - ty0 * TILE
    crop = Image.fromarray(mosaic, mode="F").crop((ox, oy, ox + (px1 - px0), oy + (py1 - py0)))
    out_h = round(out_w * frame["h"] / frame["w"])
    return np.asarray(crop.resize((out_w, out_h), Image.BICUBIC), dtype=np.float32)


def blur(a: np.ndarray, sigma: float) -> np.ndarray:
    """Separable Gaussian blur (Pillow cannot blur float images)."""
    r = max(1, int(sigma * 3))
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    pad = np.pad(a, r, mode="edge")
    rows = np.apply_along_axis(lambda v: np.convolve(v, k, mode="valid"), 1, pad)
    return np.apply_along_axis(lambda v: np.convolve(v, k, mode="valid"), 0, rows).astype(np.float32)


def hillshade(dem: np.ndarray, cell: float, exaggeration: float) -> np.ndarray:
    """0..1 shading lit from the north-west, the cartographer's convention."""
    gy, gx = np.gradient(dem * exaggeration, cell)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(315), math.radians(42)
    shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    return np.clip(shade, 0, 1)


def ramp(values: np.ndarray, stops: list[tuple[float, str]]) -> np.ndarray:
    keys = np.array([s[0] for s in stops], dtype=np.float32)
    cols = np.array([[int(c[i:i + 2], 16) for i in (1, 3, 5)] for _, c in stops], dtype=np.float32)
    return np.stack([np.interp(values, keys, cols[:, i]) for i in range(3)], axis=-1)


# ---------------------------------------------------------------- vectors

def rdp(points: list[tuple[float, float]], eps: float) -> list[tuple[float, float]]:
    if len(points) < 3:
        return points
    if points[0] == points[-1]:
        # a closed ring has no chord to measure from: split it at its far side
        start = np.array(points[0])
        far = int(np.argmax([np.hypot(*(np.array(p) - start)) for p in points]))
        return rdp(points[: far + 1], eps)[:-1] + rdp(points[far:], eps)
    a, b = np.array(points[0]), np.array(points[-1])
    ab = b - a
    norm = np.hypot(*ab) or 1e-9
    pts = np.array(points[1:-1])
    d = np.abs(ab[0] * (pts[:, 1] - a[1]) - ab[1] * (pts[:, 0] - a[0])) / norm
    i = int(np.argmax(d))
    if d[i] <= eps:
        return [points[0], points[-1]]
    left = rdp(points[: i + 2], eps)
    return left[:-1] + rdp(points[i + 1:], eps)


def path_d(lines: list[list[tuple[float, float]]], closed: bool = False, eps: float = 0.4) -> str:
    out = []
    for line in lines:
        pts = rdp(line, eps)
        if len(pts) < 2:
            continue
        out.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + ("Z" if closed else ""))
    return "".join(out)


def contour_lines(dem: np.ndarray, level: float, px_to_unit: float, min_len: int = 8):
    gen = contour_generator(z=dem, line_type="Separate")
    lines = []
    for seg in gen.lines(level):
        if len(seg) >= min_len:
            lines.append([(float(x) * px_to_unit, float(y) * px_to_unit) for x, y in seg])
    return lines


def ring_to_raster(frame: dict, ring, px: float):
    return [tuple(c * px for c in project(frame, lon, lat)) for lon, lat in ring]


# ---------------------------------------------------------------- sheets

LIGHT = {
    "sea": "#bcd6de", "sea_deep": "#a3c4cf", "lake": "#a9cbd6",
    "land": [(-430, "#e6e0c2"), (0, "#efe7cc"), (300, "#e8d8ae"), (600, "#ddc493"),
             (900, "#cfae78"), (1250, "#c09a63"), (2200, "#a9845a")],
    "shadow": (74, 55, 34), "light": (255, 250, 236), "grain": 5,
}
DARK = {
    "sea": "#0b1a29", "sea_deep": "#081422", "lake": "#123049",
    "land": [(-430, "#1a2730"), (0, "#1b2832"), (300, "#22323c"), (600, "#2b3c46"),
             (900, "#34464f"), (1300, "#3f5058"), (2200, "#4d5a5e")],
    "shadow": (2, 8, 14), "light": (176, 205, 220), "grain": 4,
}


# Jerusalem spans only ~250 m of relief, so its ramp is stretched over it.
J_LIGHT = {**LIGHT, "land": [(560, "#efe7cc"), (700, "#e7d6ab"), (840, "#d8bd88")]}
J_DARK = {**DARK, "land": [(560, "#1b2832"), (700, "#253540"), (840, "#31424c")]}


def paint(dem, shade, sea_mask, lake_mask, theme, seed) -> Image.Image:
    rgb = ramp(dem, theme["land"])
    shadow = np.array(theme["shadow"], dtype=np.float32)
    light = np.array(theme["light"], dtype=np.float32)
    s = shade[..., None]
    # shadows darken towards the ink, sunlit slopes lift towards the paper
    dark_amt = np.clip(0.62 - s, 0, 1) * 0.95
    lift_amt = np.clip(s - 0.72, 0, 1) * 0.55
    rgb = rgb * (1 - dark_amt) + shadow * dark_amt
    rgb = rgb * (1 - lift_amt) + light * lift_amt

    sea = ramp(np.clip(-dem, 0, 600), [(0, theme["sea"]), (600, theme["sea_deep"])])
    rgb = np.where(sea_mask[..., None], sea, rgb)
    lake = np.array([int(theme["lake"][i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)
    rgb = np.where(lake_mask[..., None], lake, rgb)

    rng = np.random.default_rng(seed)
    grain = rng.normal(0, theme["grain"], dem.shape)[..., None]
    rgb = np.clip(rgb + grain, 0, 255).astype(np.uint8)
    return Image.fromarray(rgb, "RGB")


def build_country(ne: dict) -> dict:
    sheet = SHEETS["country"]
    frame = sheet_frame(sheet)
    rw = sheet["raster"]
    px = rw / frame["w"]  # raster pixels per map unit
    dem = load_dem(frame, rw)
    h, w = dem.shape

    # The Mediterranean is where the coast-side terrain drops below 0 m; the
    # rift (Kinneret, Jordan valley, Dead Sea) is below 0 m too, so the sea test
    # only runs on the coastal side of the country.
    lon0, lat0, lon1, lat1 = sheet["bounds"]
    lons = np.linspace(lon0, lon1, w)[None, :].repeat(h, 0)
    lat_rows = np.array([lat1 - (lat1 - lat0) * i / (h - 1) for i in range(h)])  # approx.
    lats = lat_rows[:, None].repeat(w, 1)
    coastal = (lons < 35.25) & ((lats > 31.2) | (lons < 34.6))
    coastal |= (lats < 29.56) & (lons > 34.8) & (lons < 35.1)  # the head of the Gulf of Eilat
    coast_dem = np.where(coastal, dem, np.maximum(dem, 50.0))
    smooth = blur(coast_dem, 1.2)
    sea_mask = smooth < 0.5

    lake_img = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(lake_img)
    for lake in ne["lakes"]:
        draw.polygon(ring_to_raster(frame, lake["ring"], px), fill=255)
    lake_mask = np.asarray(lake_img) > 0

    cell = 40075016 * math.cos(math.radians(31.8)) / frame["scale"] / px  # metres per raster pixel
    shade = hillshade(dem, cell, exaggeration=2.2)
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    for name, theme, seed in (("light", LIGHT, 1), ("dark", DARK, 2)):
        img = paint(dem, shade, sea_mask, lake_mask, theme, seed)
        img.save(OUT_IMG / f"country-{name}.webp", "WEBP", quality=80, method=6)

    coast = contour_lines(smooth, 0.5, 1 / px, min_len=20)
    lakes = [[project(frame, lon, lat) for lon, lat in lake["ring"]] for lake in ne["lakes"]]
    jordan = [[project(frame, lon, lat) for lon, lat in line] for line in ne["jordan"]]
    return {
        "frame": frame,
        "coast": path_d(coast, eps=0.35),
        "lakes": path_d(lakes, closed=True, eps=0.3),
        "jordan": path_d(jordan, eps=0.3),
    }


def build_jerusalem(osm: dict) -> dict:
    sheet = SHEETS["jerusalem"]
    frame = sheet_frame(sheet)
    rw = sheet["raster"]
    px = rw / frame["w"]
    dem = load_dem(frame, rw)
    # z11 elevation is ~65 m a pixel and carries the city's roofs as noise;
    # a wide blur keeps the ridges and valleys and drops the buildings.
    dem = blur(dem, 7)
    cell = 40075016 * math.cos(math.radians(31.77)) / frame["scale"] / px  # metres per raster pixel
    shade = hillshade(dem, cell, exaggeration=0.9)
    no_water = np.zeros_like(dem, dtype=bool)
    for name, theme, seed in (("light", J_LIGHT, 3), ("dark", J_DARK, 4)):
        img = paint(dem, shade, no_water, no_water, theme, seed)
        img.save(OUT_IMG / f"jerusalem-{name}.webp", "WEBP", quality=80, method=6)

    lo, hi = int(dem.min() // 10 * 10 + 10), int(dem.max() // 10 * 10)
    minor, major = [], []
    for level in range(lo, hi + 1, 10):
        lines = contour_lines(dem, level, 1 / px, min_len=12)
        (major if level % 50 == 0 else minor).extend(lines)

    def poly(key):
        return path_d([[project(frame, lon, lat) for lon, lat in osm[key]]], closed=True, eps=0.6)

    return {
        "frame": frame,
        "contoursMinor": path_d(minor, eps=0.8),
        "contoursMajor": path_d(major, eps=0.8),
        "oldCity": poly("oldCity"),
        "templeMount": poly("templeMount"),
        "cityOfDavid": poly("cityOfDavid"),
        "hinnom": path_d([[project(frame, lon, lat) for lon, lat in osm["hinnom"]]], eps=0.6),
    }


def main() -> None:
    ne = json.loads((GEO / "natural-earth.json").read_text())
    osm = json.loads((GEO / "jerusalem-osm.json").read_text())
    country = build_country(ne)
    jerusalem = build_jerusalem(osm)

    def frame_ts(f):
        return (f'{{ x0: {f["x0"]!r}, y0: {f["y0"]!r}, scale: {f["scale"]!r}, '
                f'width: {f["w"]}, height: {f["h"]} }}')

    def bounds_ts(b):
        return f"[{b[0]}, {b[1]}, {b[2]}, {b[3]}]"

    lines = [
        "// Generated by tools/build_learning_map_base.py — do not edit by hand.",
        "// Sources: Natural Earth (public domain); © OpenStreetMap contributors (ODbL);",
        "// elevation: Mapzen / Amazon Terrain Tiles.",
        "export type SheetFrame = { x0: number; y0: number; scale: number; width: number; height: number };",
        "",
        "export const COUNTRY = {",
        f"  bounds: {bounds_ts(SHEETS['country']['bounds'])} as const,",
        f"  frame: {frame_ts(country['frame'])} as SheetFrame,",
        f'  coast: "{country["coast"]}",',
        f'  lakes: "{country["lakes"]}",',
        f'  jordan: "{country["jordan"]}",',
        "};",
        "",
        "export const JERUSALEM = {",
        f"  bounds: {bounds_ts(SHEETS['jerusalem']['bounds'])} as const,",
        f"  frame: {frame_ts(jerusalem['frame'])} as SheetFrame,",
    ]
    for key in ("contoursMinor", "contoursMajor", "oldCity", "templeMount", "cityOfDavid", "hinnom"):
        lines.append(f'  {key}: "{jerusalem[key]}",')
    lines += ["};", ""]
    OUT_TS.parent.mkdir(parents=True, exist_ok=True)
    OUT_TS.write_text("\n".join(lines), encoding="utf-8")
    for p in sorted(OUT_IMG.glob("*.webp")):
        print(f"{p.relative_to(ROOT)}  {p.stat().st_size // 1024} KB")
    print(f"{OUT_TS.relative_to(ROOT)}  {OUT_TS.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
