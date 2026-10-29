#!/usr/bin/env python3
"""Fetch the photos for the "גלימות ירושלים" clergy-identification game.

Reads tools/christian_dress_photos.json — a list of {id, group, file} plus the
caption, alt text and zoom focus written after each photo was looked at — asks
Wikimedia Commons for each file's author, licence and a 1280px rendition,
saves a WebP to public/images/christian-dress/<id>.webp and writes
src/data/christian-dress/photos.json (generated — do not edit by hand).

Only freely licensed files are kept. A file that is missing on Commons or
carries a licence we cannot reuse is skipped and listed in
tools/christian_dress_photos.report.txt instead of failing the run, so a long
candidate list can be fetched once and pruned after review. WebP files that
are no longer in the manifest are deleted.

upload.wikimedia.org throttles the build containers, so
.github/workflows/fetch-christian-dress-photos.yml runs this on GitHub's
runners whenever the manifest changes and commits the result.

  python3 tools/fetch_christian_dress_photos.py            # fetch what is missing
  python3 tools/fetch_christian_dress_photos.py --refresh  # re-download everything
"""
import html
import io
import json
import re
import subprocess
import sys
import time
import urllib.parse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "tools" / "christian_dress_photos.json"
REPORT = ROOT / "tools" / "christian_dress_photos.report.txt"
OUT_DIR = ROOT / "public" / "images" / "christian-dress"
DATA = ROOT / "src" / "data" / "christian-dress" / "photos.json"
UA = "MorehDerechStudyBot/1.0 (https://cfir94.github.io/moreh-derech/; educational)"
ALLOWED = re.compile(r"^(CC0|Public domain|CC BY(-SA)? [\d.]+( [a-z]+)?|Attribution|No restrictions|PD.*)$", re.I)
LONG_SIDE = 1200


def curl(url: str) -> bytes:
    """GET with the polite User-Agent Wikimedia asks for, backing off on 429."""
    for attempt in range(10):
        proc = subprocess.run(["curl", "-s", "-m", "90", "-A", UA, "-w", "\n%{http_code}", url], capture_output=True)
        body, _, code = proc.stdout.rpartition(b"\n")
        if code == b"200":
            return body
        print(f"  HTTP {code.decode()} — retrying", flush=True)
        time.sleep(10 * (attempt + 1))
    raise RuntimeError(f"HTTP {code.decode()} for {url}")


def plain(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", value or ""))).strip()


def main() -> None:
    refresh = "--refresh" in sys.argv
    items = json.loads(MANIFEST.read_text(encoding="utf-8"))
    titles = [f"File:{item['file']}" for item in items]
    info: dict[str, dict] = {}
    for start in range(0, len(titles), 40):
        params = {
            "action": "query", "format": "json", "prop": "imageinfo", "titles": "|".join(titles[start:start + 40]),
            "iiprop": "url|size|extmetadata", "iiurlwidth": 1280,
            "iiextmetadatafilter": "Artist|LicenseShortName|LicenseUrl|Credit|DateTimeOriginal",
        }
        data = json.loads(curl("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)))
        normalized = {n["to"]: n["from"] for n in data["query"].get("normalized", [])}
        for page in data["query"]["pages"].values():
            if "imageinfo" in page:
                info[normalized.get(page["title"], page["title"])] = page["imageinfo"][0]
        time.sleep(3)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows, skipped = [], []
    for item in items:
        meta = info.get(f"File:{item['file']}")
        if not meta:
            skipped.append(f"{item['id']}\tmissing on Commons\t{item['file']}")
            continue
        ext = meta.get("extmetadata", {})
        license_name = plain(ext.get("LicenseShortName", {}).get("value", ""))
        if not ALLOWED.match(license_name):
            skipped.append(f"{item['id']}\tlicence '{license_name}'\t{item['file']}")
            continue
        target = OUT_DIR / f"{item['id']}.webp"
        if refresh or not target.exists():
            try:
                image = Image.open(io.BytesIO(curl(meta.get("thumburl", meta["url"])))).convert("RGB")
            except Exception as error:  # a broken rendition should not sink the whole batch
                skipped.append(f"{item['id']}\tdownload failed: {error}\t{item['file']}")
                continue
            image.thumbnail((LONG_SIDE, LONG_SIDE))
            image.save(target, "WEBP", quality=78, method=6)
            time.sleep(2)
        width, height = Image.open(target).size
        row = {
            "id": item["id"], "group": item["group"],
            "src": f"/images/christian-dress/{item['id']}.webp", "width": width, "height": height,
            "author": re.sub(r"(Unknown author)+", "Unknown author", plain(ext.get("Artist", {}).get("value", ""))) or "לא צוין",
            "license": license_name, "licenseUrl": plain(ext.get("LicenseUrl", {}).get("value", "")),
            "source": meta["descriptionurl"], "file": item["file"],
        }
        for key in ("caption", "alt", "place", "focus", "hard"):
            if key in item:
                row[key] = item[key]
        rows.append(row)
        print(f"{item['id']:28} {width}x{height}  {license_name}", flush=True)

    keep = {f"{row['id']}.webp" for row in rows}
    for stale in OUT_DIR.glob("*.webp"):
        if stale.name not in keep:
            stale.unlink()
    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(json.dumps(rows, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    REPORT.write_text("\n".join(skipped) + ("\n" if skipped else ""), encoding="utf-8")
    print(f"wrote {len(rows)} photos, skipped {len(skipped)}")


if __name__ == "__main__":
    main()
