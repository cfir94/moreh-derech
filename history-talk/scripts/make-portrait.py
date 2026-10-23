#!/usr/bin/env python3
# מכין את הדיוקן של דמות לבמת ההילה: PNG שקוף 800x1000 בצילום בינוני — מרכז הראש ב-(400, 350) וגובה הראש
# כ-215 פיקסלים — ושומר ב-characters/<id>/media/raw/portrait.png. אחר כך: npm run optimize:media <id>.
#
# ההגדרות ב-character.json, בשדה "portrait":
#   commonsFile  — שם הקובץ בוויקישיתוף; מורד (תמונה ממוזערת ברוחב sourceWidth) ל-media/raw/source.<ext>
#   head, headH  — מרכז הראש וגובהו (קודקוד עד סנטר), בפיקסלים של קובץ המקור
#   mode         — cutout: הסרת רקע במודל פילוח (BiRefNet; "model": "isnet" לחלופה)
#                  vignette: אליפסה רכה מתוך היצירה — לציורי קיר דהויים שאי אפשר לחתוך
#                  lineart: חיתוך עץ — הקווים הכהים הופכים לקווי אור על שקוף
#   oval [cx, cy, rx, ry] — אליפסה (בפיקסלים של הפלט) שגם חותכת שאריות רקע; enhance — מתיחת ניגודיות
#   targetH, targetY, erode, keep, segBox, fade — כוונונים לדמות מסוימת
#
# תלויות: pip install onnxruntime pillow numpy scipy, ושני מודלים בתיקייה HISTORY_TALK_MODELS
# (ברירת מחדל ~/.cache/history-talk):
#   https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx
#   https://github.com/danielgatis/rembg/releases/download/v0.0.0/BiRefNet-general-bb_swin_v1_tiny-epoch_232.onnx
#
# שימוש: python3 scripts/make-portrait.py [characterId...]

import hashlib
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
MODELS = Path(os.environ.get("HISTORY_TALK_MODELS", Path.home() / ".cache" / "history-talk"))
BIREFNET = "BiRefNet-general-bb_swin_v1_tiny-epoch_232.onnx"
W, H = 800, 1000
HEAD_X, HEAD_Y, HEAD_H = 400, 350, 215
sess = None


def isnet(rgb: Image.Image) -> np.ndarray:
    global sess
    if sess is None:
        sess = ort.InferenceSession(str(MODELS / "isnet-general-use.onnx"), providers=["CPUExecutionProvider"])
    inp = sess.get_inputs()[0].name
    x = np.asarray(rgb.resize((1024, 1024), Image.LANCZOS), dtype=np.float32) / 255.0 - 0.5
    pred = sess.run(None, {inp: x.transpose(2, 0, 1)[None]})[0][0, 0]
    pred = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
    return np.asarray(Image.fromarray((pred * 255).astype(np.uint8)).resize(rgb.size, Image.LANCZOS), dtype=np.float32) / 255


bsess = None


def birefnet(rgb: Image.Image) -> np.ndarray:
    global bsess
    if bsess is None:
        bsess = ort.InferenceSession(str(MODELS / BIREFNET), providers=["CPUExecutionProvider"])
    inp = bsess.get_inputs()[0].name
    x = np.asarray(rgb.resize((1024, 1024), Image.LANCZOS), dtype=np.float32) / 255.0
    x = (x - np.array([0.485, 0.456, 0.406], dtype=np.float32)) / np.array([0.229, 0.224, 0.225], dtype=np.float32)
    pred = bsess.run(None, {inp: x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0, 0]
    pred = 1 / (1 + np.exp(-pred))
    pred = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
    return np.asarray(Image.fromarray((pred * 255).astype(np.uint8)).resize(rgb.size, Image.LANCZOS), dtype=np.float32) / 255


def frame(src: Image.Image, s: dict) -> Image.Image:
    """Crop/scale so the head lands at (HEAD_X, HEAD_Y) with height HEAD_H; transparent padding."""
    hx, hy = s["head"]
    scale = s.get("targetH", HEAD_H) / s["headH"]
    left, top = hx - HEAD_X / scale, hy - s.get("targetY", HEAD_Y) / scale
    box = (round(left), round(top), round(left + W / scale), round(top + H / scale))
    src = src.convert("RGBA")
    canvas = Image.new("RGBA", (box[2] - box[0], box[3] - box[1]), (0, 0, 0, 0))
    canvas.paste(src, (-box[0], -box[1]))
    return canvas.resize((W, H), Image.LANCZOS)


def keep_components(mask: np.ndarray, head: tuple, headH: float, how: str) -> np.ndarray:
    lab, n = ndimage.label(mask > 0.5)
    if n <= 1 or how == "all":
        return mask
    # keep components that touch the head or the column below it
    hx, hy = int(head[0]), int(head[1])
    r = int(headH * 0.45)
    probe = np.zeros_like(lab, dtype=bool)
    probe[max(0, hy - r) : hy + int(headH * 2.5), max(0, hx - r) : hx + r] = True
    ids = [i for i in np.unique(lab[probe & (lab > 0)])]
    keep = np.isin(lab, ids)
    keep = ndimage.binary_dilation(keep, iterations=6)
    return mask * keep


def cut(src: Image.Image, s: dict) -> Image.Image:
    """Segment the figure on the source itself (not on the padded frame)."""
    hx, hy = s["head"]
    hh = s["headH"]
    w, h = src.size
    box = s.get("segBox") or [hx - 2.4 * hh, hy - 1.3 * hh, hx + 2.4 * hh, hy + 3.6 * hh]
    box = [max(0, int(box[0])), max(0, int(box[1])), min(w, int(box[2])), min(h, int(box[3]))]
    crop = src.crop(box)
    rgb = Image.new("RGB", crop.size, (0, 0, 0))
    rgb.paste(crop.convert("RGB"), mask=crop.getchannel("A"))
    m = isnet(rgb) if s.get("model") == "isnet" else birefnet(rgb)
    m = np.clip((m - 0.12) / 0.76, 0, 1)
    m = keep_components(m, (hx - box[0], hy - box[1]), hh, s.get("keep", "center"))
    if s.get("erode"):
        m = ndimage.grey_erosion(m, size=(s["erode"], s["erode"]))
    m = m * np.asarray(crop.getchannel("A"), dtype=np.float32) / 255
    alpha = np.zeros((h, w), dtype=np.float32)
    alpha[box[1] : box[3], box[0] : box[2]] = m
    out = src.copy()
    out.putalpha(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0)))
    return out


def process(cid: str, s: dict) -> Image.Image:
    src = Image.open(s["src"]).convert("RGBA")
    if s.get("enhance"):
        # faded frescoes: stretch the contrast a little and warm the colour back up
        from PIL import ImageEnhance, ImageOps
        a = src.getchannel("A")
        rgb = ImageOps.autocontrast(src.convert("RGB"), cutoff=s["enhance"])
        rgb = ImageEnhance.Color(rgb).enhance(1.15)
        src = rgb.convert("RGBA")
        src.putalpha(a)
    if s["mode"] == "cutout":
        src = cut(src, s)
    img = frame(src, s)
    # where the source runs out inside the frame, fade softly instead of a hard edge
    where = frame(Image.new("RGBA", src.size, (255, 255, 255, 255)), s).getchannel("A")
    inside = np.asarray(where, dtype=np.float32) / 255 > 0.5
    edge = np.clip(ndimage.distance_transform_edt(inside) / s.get("fade", 110), 0, 1) if not inside.all() else 1
    a = np.asarray(img.getchannel("A"), dtype=np.float32) / 255 * edge
    if s["mode"] == "lineart":
        lum = np.asarray(img.convert("RGB").convert("L"), dtype=np.float32) / 255
        ink = a * np.clip((0.9 - lum) / 0.6, 0, 1)
        color = np.zeros((H, W, 3), dtype=np.uint8)
        color[:] = s.get("ink", [255, 226, 172])
        out = Image.fromarray(color, "RGB").convert("RGBA")
        out.putalpha(Image.fromarray((np.clip(ink * 0.92, 0, 1) * 255).astype(np.uint8)))
        return out
    if s["mode"] == "vignette" or "oval" in s:
        # a soft oval "fragment" of the artwork — for frescoes too faded to cut out
        cx, cy, rx, ry = s.get("oval", [400, 470, 300, 430])
        yy, xx = np.mgrid[0:H, 0:W]
        d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
        t = np.clip((1 - d) / 0.45, 0, 1)
        a = a * t * t * (3 - 2 * t)
    img.putalpha(Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)))
    return img



def fetch_source(cid: str, s: dict) -> Path:
    raw = ROOT / "characters" / cid / "media" / "raw"
    for ext in ("jpg", "jpeg", "png", "webp"):
        if (raw / f"source.{ext}").exists():
            return raw / f"source.{ext}"
    raw.mkdir(parents=True, exist_ok=True)
    name = s["commonsFile"].replace(" ", "_")
    md5 = hashlib.md5(name.encode()).hexdigest()
    q = urllib.parse.quote(name)
    url = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{md5[0]}/{md5[:2]}/{q}/{s['sourceWidth']}px-{q}"
    dest = raw / f"source{Path(name).suffix.lower()}"
    req = urllib.request.Request(url, headers={"User-Agent": "history-talk/0.1 (educational; make-portrait)"})
    for attempt in range(5):  # ויקימדיה מגבילה קצב — ממתינים ומנסים שוב
        try:
            dest.write_bytes(urllib.request.urlopen(req, timeout=90).read())
            return dest
        except Exception as e:  # noqa: BLE001
            print(f"  {cid}: {e} — מנסה שוב", file=sys.stderr)
            time.sleep(20 * (attempt + 1))
    sys.exit(f"{cid}: לא הצלחתי להוריד את {url} — הורד ידנית ל-{dest}")


def main(ids: list[str]) -> None:
    for model in ("isnet-general-use.onnx", BIREFNET):
        if not (MODELS / model).exists():
            sys.exit(f"חסר מודל: {MODELS / model} (ראו את הכתובות בראש הקובץ)")
    ids = ids or sorted(d.name for d in (ROOT / "characters").iterdir() if (d / "character.json").exists())
    for cid in ids:
        s = json.loads((ROOT / "characters" / cid / "character.json").read_text("utf8")).get("portrait")
        if not s:
            print(f"{cid}: אין שדה portrait — מדלג")
            continue
        s = {**s, "src": fetch_source(cid, s)}
        out = ROOT / "characters" / cid / "media" / "raw" / "portrait.png"
        process(cid, s).save(out)
        print(f"{cid}: {out.relative_to(ROOT)}")
    print("עכשיו: npm run optimize:media", " ".join(ids))


if __name__ == "__main__":
    main(sys.argv[1:])
