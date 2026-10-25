#!/usr/bin/env python3
"""Fetch the photos of the learning map (/map/learn) from Wikimedia Commons.

Reads tools/learning_map_photos.json — a list of {id, caption, alt} with one
way to find the picture:

  "file":   a Commons file name;
  "wiki":   "he:<title>" / "en:<title>" — the lead image of that Wikipedia article;
  "search": a Commons search; the first freely-licensed photo wins.

The file each entry resolved to is pinned in tools/learning_map_photos.lock.json,
so a search never silently swaps a photo that was already checked by eye. To
replace a photo, put an explicit "file" in the manifest (it beats the lock) or
delete its lock entry.

Saves a 1280px JPEG to public/learning-map/photos/<id>.jpg and writes
src/data/learning-map/photos.ts (generated — do not edit) with the attribution
every CC licence asks for. Like fetch_architecture_photos.py, it runs on
GitHub's runners (.github/workflows/fetch-learning-map-photos.yml), because
upload.wikimedia.org throttles the build containers.

  python3 tools/fetch_learning_map_photos.py            # fetch what is missing
  python3 tools/fetch_learning_map_photos.py --refresh  # re-download everything
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
MANIFEST = ROOT / "tools" / "learning_map_photos.json"
LOCK = ROOT / "tools" / "learning_map_photos.lock.json"
OUT_DIR = ROOT / "public" / "learning-map" / "photos"
DATA = ROOT / "src" / "data" / "learning-map" / "photos.ts"
UA = "MorehDerechStudyBot/1.0 (https://cfir94.github.io/moreh-derech/; educational)"
ALLOWED = re.compile(r"^(CC0|Public domain|CC BY(-SA)? [\d.]+( [a-z]+)?|Attribution|No restrictions|PD.*)$", re.I)
COMMONS = "https://commons.wikimedia.org/w/api.php?"


def curl(url: str) -> bytes:
    """GET with the polite User-Agent Wikimedia asks for, backing off on 429."""
    for attempt in range(8):
        proc = subprocess.run(["curl", "-s", "-m", "90", "-A", UA, "-w", "\n%{http_code}", url], capture_output=True)
        body, _, code = proc.stdout.rpartition(b"\n")
        if code == b"200":
            return body
        print(f"  HTTP {code.decode()} — retrying", flush=True)
        time.sleep(10 * (attempt + 1))
    raise RuntimeError(f"HTTP {code.decode()} for {url}")


def api(base: str, **params) -> dict:
    time.sleep(1.5)
    return json.loads(curl(base + urllib.parse.urlencode({"format": "json", **params})))


def plain(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", value or ""))).strip()


def image_info(files: list[str]) -> dict[str, dict]:
    """imageinfo for Commons files, keyed by the name as asked."""
    out: dict[str, dict] = {}
    for start in range(0, len(files), 40):
        chunk = files[start:start + 40]
        data = api(COMMONS, action="query", prop="imageinfo", titles="|".join(f"File:{f}" for f in chunk),
                   iiprop="url|size|mime|extmetadata", iiurlwidth=1280,
                   iiextmetadatafilter="Artist|LicenseShortName|LicenseUrl")
        normalized = {n["to"]: n["from"] for n in data["query"].get("normalized", [])}
        for page in data["query"]["pages"].values():
            asked = normalized.get(page["title"], page["title"])[len("File:"):]
            if "imageinfo" in page:
                out[asked] = page["imageinfo"][0]
    return out


def usable(meta: dict) -> bool:
    license_name = plain(meta.get("extmetadata", {}).get("LicenseShortName", {}).get("value", ""))
    return meta.get("mime") == "image/jpeg" and meta.get("width", 0) >= 640 and bool(ALLOWED.match(license_name))


def lead_image(spec: str) -> str | None:
    lang, title = spec.split(":", 1)
    data = api(f"https://{lang}.wikipedia.org/w/api.php?", action="query", prop="pageimages", piprop="name",
               redirects=1, titles=title)
    for page in data["query"]["pages"].values():
        if page.get("pageimage"):
            return page["pageimage"]
    return None


def search(query: str) -> str | None:
    data = api(COMMONS, action="query", generator="search", gsrsearch=f"{query} filetype:bitmap", gsrnamespace=6,
               gsrlimit=12, prop="imageinfo", iiprop="size|mime|extmetadata",
               iiextmetadatafilter="LicenseShortName")
    pages = sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    for page in pages:
        meta = (page.get("imageinfo") or [{}])[0]
        if usable(meta):
            return page["title"][len("File:"):]
    return None


def main() -> None:
    refresh = "--refresh" in sys.argv
    items = json.loads(MANIFEST.read_text(encoding="utf-8"))
    lock: dict[str, str] = json.loads(LOCK.read_text(encoding="utf-8")) if LOCK.exists() else {}

    # 1. resolve every entry to a Commons file name
    chosen: dict[str, str] = {}
    for item in items:
        name = item.get("file") or lock.get(item["id"])
        if not name and "wiki" in item:
            name = lead_image(item["wiki"])
        if not name and "search" in item:
            name = search(item["search"])
        if name:
            chosen[item["id"]] = name.replace("_", " ")
        else:
            print(f"{item['id']:30} — nothing found", flush=True)

    info = image_info(sorted(set(chosen.values())))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows, missing = [], []
    for item in items:
        name = chosen.get(item["id"])
        meta = info.get(name or "")
        if not meta:
            missing.append(item["id"])
            continue
        ext = meta.get("extmetadata", {})
        license_name = plain(ext.get("LicenseShortName", {}).get("value", ""))
        if not ALLOWED.match(license_name):
            print(f"{item['id']:30} — licence '{license_name}' is not one we can reuse", flush=True)
            missing.append(item["id"])
            continue
        target = OUT_DIR / f"{item['id']}.jpg"
        if refresh or not target.exists() or lock.get(item["id"]) != name:
            try:
                image = Image.open(io.BytesIO(curl(meta.get("thumburl", meta["url"])))).convert("RGB")
            except RuntimeError as error:
                print(f"{item['id']:30} — {error}", flush=True)
                missing.append(item["id"])
                continue
            image.thumbnail((1280, 1280))
            image.save(target, "JPEG", quality=80, optimize=True, progressive=True)
            time.sleep(2)
        lock[item["id"]] = name
        width, height = Image.open(target).size
        rows.append({
            "id": item["id"], "caption": item["caption"], "alt": item["alt"],
            "src": f"/learning-map/photos/{item['id']}.jpg", "width": width, "height": height,
            "author": plain(ext.get("Artist", {}).get("value", "")) or "לא צוין",
            "license": license_name, "licenseUrl": plain(ext.get("LicenseUrl", {}).get("value", "")),
            "source": meta["descriptionurl"],
        })
        print(f"{item['id']:30} {width}x{height}  {license_name:14} {name}", flush=True)

    LOCK.write_text(json.dumps(dict(sorted(lock.items())), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    DATA.write_text(
        "// Generated by tools/fetch_learning_map_photos.py from tools/learning_map_photos.json — do not edit by hand.\n"
        "import type { SitePhoto } from \"./photo-types\";\n\n"
        f"export const LEARNING_MAP_PHOTOS: SitePhoto[] = {json.dumps(rows, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"wrote {len(rows)} photos; missing: {', '.join(missing) or 'none'}")


if __name__ == "__main__":
    main()
