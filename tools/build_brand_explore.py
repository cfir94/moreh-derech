#!/usr/bin/env python3
"""Three brand variations for "אבן דרך" (logo mark + 8 icons + spot), written as SVG.

Writes public/design/brand/v{1,2,3}/*.svg and public/design/brand/index.html, a board the owner opens
at /moreh-derech/design/brand/. Codex could not deliver CX-07 (its environment cannot push), so the
variations are drawn here. Run: python3 tools/build_brand_explore.py
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "design" / "brand"

NAMES = {
    "quizzes": "מאגר שאלונים", "exams": "מבחן רישוי", "map": "מפה", "timelines": "עזרי למידה",
    "review": "חזרה על טעויות", "notes": "פתקים", "community": "קהילה", "me": "אזור אישי",
}

# ---------------------------------------------------------------- shared line geometry (24 grid)
LINES = {
    "quizzes": ["M6.5 3h10.5a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5H6.5z", "M6.5 3v18",
                "M10.6 9.4a2.3 2.3 0 1 1 3.3 2.1c-.8.4-1.3.9-1.3 1.8v.4", "M12.6 16.7v.1"],
    "exams": ["M6 3h12M6 21h12", "M7.5 3c0 4.5 9 5 9 9s-9 4.5-9 9M16.5 3c0 4.5-9 5-9 9s9 4.5 9 9", "M10 18.5h4"],
    "map": ["M3 6.2 9 4l6 2.2L21 4v13.8L15 20l-6-2.2L3 20z", "M9 4v13.8M15 6.2V20"],
    "timelines": ["M3 6.5c3-1.4 6 1.4 9 0s6-1.4 9 0", "M3 11.5c3-1.4 6 1.4 9 0s6-1.4 9 0",
                  "M3 16.5c3-1.4 6 1.4 9 0s6-1.4 9 0", "M8 20.5h1.5M14 20.5h3"],
    "review": ["M19.5 13.5A7.5 7.5 0 1 1 17 6.5", "M17.8 2.8 17 6.5l3.7.8", "M12 9v3.5l2.3 1.4"],
    "notes": ["M5 3.5h10l4 4V20.5H5z", "M15 3.5v4h4", "M8 11h7M8 14.5h7M8 18h4"],
    "community": ["M4.5 20.5 19.5 16.5M4.5 16.5l15 4",
                  "M12 3c2.2 2.8 4 4.5 4 7.6a4 4 0 0 1-8 0c0-1.9.9-3.1 1.9-4 0 1.5.9 2.4 2.1 2.6-.4-2.2-.6-3.9 0-6.2z"],
    "me": ["M2.5 15.5c3.5 2.4 15.5 2.4 19 0", "M6.5 15.6c0-4.8 2.2-8.6 5.5-8.6s5.5 3.8 5.5 8.6",
           "M6.9 12.4c3.3 1 6.9 1 10.2 0"],
}

# where each V2 icon carries its painted blaze (x, y), and each V3 icon its hatching
BLAZE_AT = {"quizzes": (13.5, 5.5), "exams": (16, 12.2), "map": (17, 9), "timelines": (17.5, 13.6),
            "review": (3.5, 4), "notes": (14.5, 15.5), "community": (16, 3.5), "me": (16.5, 4)}
HATCH = {
    "quizzes": "M8.5 18l2-2M8.5 15.5l2-2M8.5 13l2-2",
    "exams": "M9.5 18.5l1.5-1.5M11.5 18.5l2-2M13.5 18.5l1-1",
    "map": "M15.6 18.8l2-2M15.6 16.3l3-3M15.6 13.8l3-3M15.6 11.3l3-3",
    "timelines": "M5 14.6l1.4-1.4M8 14.6l1.4-1.4M11 14.6l1.4-1.4M14 14.6l1.4-1.4",
    "review": "M6.5 16l1.4-1.4M5.6 13.6l1.4-1.4",
    "notes": "M16.2 19.5l2-2M14 19.5l2-2",
    "community": "M10 12.5l1.4-1.4M10.4 10.2l1-1",
    "me": "M7.5 15l1.6-1.6M10 15.4l2-2M12.6 15.4l2-2M15 15.2l1.6-1.6",
}

# ---------------------------------------------------------------- V1: solid pictograms (cut-outs)
V1 = {
    "quizzes": ("M5 3h12.6A2 2 0 0 1 19.6 5v14a2 2 0 0 1-2 2H5z",
                ["M7.6 3v18", "M10.6 9.3a2.3 2.3 0 1 1 3.3 2.1c-.8.4-1.3.9-1.3 1.8v.5"], [(12.6, 16.6, 1.15)]),
    "exams": ("M5.5 2h13v2.6c0 3.2-3 5.4-4.6 7.4 1.6 2 4.6 4.2 4.6 7.4V22h-13v-2.6c0-3.2 3-5.4 4.6-7.4C8.5 10 5.5 7.8 5.5 4.6z",
              ["M5.5 4.6h13", "M5.5 19.4h13", "M12 12v3.6"], []),
    "map": ("M2 5.6 8.9 3l6.2 2.4L22 2.8v15.6L15.1 21l-6.2-2.4L2 21.2z",
            ["M8.9 3v15.6", "M15.1 5.4V21"], [(12, 11.2, 1.5)]),
    "timelines": ("M3 3.5h18a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z",
                  ["M2 8.6c3.3-1.6 6.7 1.6 10 0s6.7-1.6 10 0", "M2 13.6c3.3-1.6 6.7 1.6 10 0s6.7-1.6 10 0"], [(7, 17.2, 0.9), (16.5, 6.2, 0.8)]),
    "review": ("M12 2.5a9.5 9.5 0 1 0 9.5 9.5h-3.4A6.1 6.1 0 1 1 15.4 6.9l-2.7 2.7h7.8V1.8l-2.7 2.7A9.4 9.4 0 0 0 12 2.5z",
               [], [(12, 12, 1.4)]),
    "notes": ("M4 2.5h11.5L20 7v14.5H4z", ["M15.5 2.5V7H20", "M7 11h10", "M7 14.6h10", "M7 18.2h6"], []),
    "community": ("M12 1.5c2.9 3.4 5.2 5.6 5.2 9.6a5.2 5.2 0 0 1-10.4 0c0-2.5 1.2-4.1 2.5-5.2 0 1.9 1.1 3 2.6 3.3-.5-2.8-.8-5 .1-7.7zM3 18.4l1-2.4 17 4.6-1 2.4zM3 20.6l17-4.6 1 2.4-17 4.6z",
                  [], [(12, 12.6, 1.6)]),
    "me": ("M1.8 15.2c.8-.3 2.4-.2 3.9.1C5.9 9.6 8.3 5.6 12 5.6s6.1 4 6.3 9.7c1.5-.3 3.1-.4 3.9-.1.6 1.3-1.6 3.4-10.2 3.4S1.2 16.5 1.8 15.2z",
           ["M6 12.4c3.9 1.2 8.1 1.2 12 0"], []),
}

ICON_ORDER = list(NAMES)


def svg(view: str, body: str, defs: str = "") -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}">'
            + (f"<defs>{defs}</defs>" if defs else "") + body + "</svg>\n")


def v1_icon(name: str) -> str:
    sil, cuts, dots = V1[name]
    mask = ('<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">'
            '<rect width="24" height="24" fill="#fff"/>'
            + "".join(f'<path d="{c}" fill="none" stroke="#000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' for c in cuts)
            + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#000"/>' for x, y, r in dots)
            + "</mask>")
    return svg("0 0 24 24", f'<path d="{sil}" fill="currentColor" mask="url(#m)"/>', mask)


ROUGH = ('<filter id="r" x="-10%" y="-10%" width="120%" height="120%">'
         '<feTurbulence type="fractalNoise" baseFrequency="{f}" numOctaves="2" seed="{s}"/>'
         '<feDisplacementMap in="SourceGraphic" scale="{k}" xChannelSelector="R" yChannelSelector="G"/></filter>')


def blaze(x: float, y: float, w: float = 5, h: float = 4) -> str:
    t = h / 3
    return (f'<g transform="rotate(-6 {x + w / 2} {y + h / 2})">'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx=".5" fill="#f6f2e8" stroke="currentColor" stroke-width=".6"/>'
            f'<rect x="{x}" y="{y + t}" width="{w}" height="{t}" fill="var(--icon-accent, #b83a2b)"/></g>')


def v2_icon(name: str, seed: int) -> str:
    lines = "".join(f'<path d="{d}"/>' for d in LINES[name])
    bx, by = BLAZE_AT[name]
    body = (f'<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#r)">{lines}</g>'
            + blaze(bx, by))
    return svg("0 0 24 24", body, ROUGH.format(f=".9", s=seed, k="1.1"))


def v3_icon(name: str, seed: int) -> str:
    lines = "".join(f'<path d="{d}"/>' for d in LINES[name])
    body = (f'<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" filter="url(#r)">'
            f'<g stroke-width="1.45">{lines}</g><path d="{HATCH[name]}" stroke-width=".8" opacity=".75"/></g>')
    return svg("0 0 24 24", body, ROUGH.format(f="1.6", s=seed, k=".55"))


# ---------------------------------------------------------------- logo marks (64 grid)
LOGO_V1 = svg("0 0 64 64",
              '<rect x="3" y="3" width="58" height="58" rx="9" fill="var(--sign, #5b3a21)"/>'
              '<rect x="7" y="7" width="50" height="50" rx="6" fill="none" stroke="#f3ead6" stroke-width="2.6"/>'
              '<path d="M20 50h24v-4.5H20z" fill="#f3ead6"/>'
              '<path d="M24 45.5V22c0-6 3.6-10.5 8-10.5s8 4.5 8 10.5v23.5z" fill="#f3ead6" mask="url(#c)"/>',
              '<mask id="c" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/>'
              '<path d="M28 24h8M28 29h8M29.5 34h5" stroke="#000" stroke-width="2.4" stroke-linecap="round"/></mask>')

LOGO_V2 = svg("0 0 64 64",
              '<path d="M6 55c8-3 14 2 22-1s12-6 18-3 8 3 12 2" fill="none" stroke="var(--icon-accent, #b83a2b)" stroke-width="2.6" stroke-dasharray="4 4" stroke-linecap="round" filter="url(#r)"/>'
              '<path d="M17 52h30v-5H17z" fill="#a99d82" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" filter="url(#r)"/>'
              '<path d="M22 47V20c0-7 4.4-12 10-12s10 5 10 12v27z" fill="#cfc5ae" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" filter="url(#r)"/>'
              '<g transform="rotate(-5 32 26)"><rect x="24.5" y="20" width="15" height="12" rx="1.2" fill="#f6f2e8" stroke="currentColor" stroke-width=".9"/>'
              '<rect x="24.5" y="24" width="15" height="4" fill="var(--icon-accent, #b83a2b)"/></g>'
              '<path d="M27 38h10M28.5 42h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>',
              ROUGH.format(f=".7", s=3, k="1.6"))

LOGO_V3 = svg("0 0 64 64",
              '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" filter="url(#r)">'
              '<path d="M2 58c10-6 18-9 30-10M62 58c-10-6-18-9-30-10" stroke-width="1.5"/>'
              '<path d="M32 49v4M32 56v5" stroke-width="1.5" stroke-dasharray="2 3"/>'
              '<path d="M8 30c6-3 12-3 17-1M44 27c5-2 9-1 13 1" stroke-width="1.1" opacity=".7"/>'
              '<path d="M20 48h20v-4H20z" stroke-width="1.7"/>'
              '<path d="M24 44V20c0-6 3.6-10.5 8-10.5s8 4.5 8 10.5v24" stroke-width="1.8"/>'
              '<path d="M28 22h8M28 27h8M29.5 32h5" stroke-width="1.3"/>'
              '<path d="M36.5 41l3-3M36.5 37l3-3M37 33l2.6-2.6M37.5 29l2-2" stroke-width=".9" opacity=".8"/></g>',
              ROUGH.format(f="1.2", s=5, k=".8"))


# ---------------------------------------------------------------- spot illustrations (320x200)
def spot(variant: int) -> str:
    sand, lime, brown, green, basalt = "#d9c7a3", "#e9dfcb", "#5b3a21", "#4f6b3a", "#2a221b"
    pack = (f'<path d="M110 70c0-20 22-34 50-34s50 14 50 34v8H110z" fill="{basalt}"/>'
            f'<path d="M100 84c0-12 10-20 22-20h76c12 0 22 8 22 20v86c0 12-10 20-22 20h-76c-12 0-22-8-22-20z" fill="{green}"/>'
            f'<path d="M104 88c0-10 9-18 20-18h72c11 0 20 8 20 18v22c0 7-6 11-12 11h-88c-6 0-12-4-12-11z" fill="#3e5230"/>'
            f'<rect x="132" y="112" width="12" height="54" rx="3" fill="{brown}"/><rect x="176" y="112" width="12" height="54" rx="3" fill="{brown}"/>')
    mapp = (f'<g transform="rotate(-8 160 52)"><path d="M128 18h64v58h-64z" fill="{lime}"/>'
            f'<path d="M149 18v58M171 18v58" stroke="{sand}" stroke-width="2"/>'
            f'<path d="M134 60c10-12 22-6 30-18s18-10 22-16" fill="none" stroke="{brown}" stroke-width="2.4" stroke-dasharray="5 4" stroke-linecap="round"/>'
            f'<circle cx="186" cy="26" r="3.5" fill="{brown}"/></g>')
    ground = f'<path d="M0 186c60-10 120-12 160-8s110 10 160 4V200H0z" fill="{sand}"/>'
    if variant == 1:  # flat sign-like: solid shapes, a brown site sign on a post
        extra = (f'<rect x="246" y="96" width="6" height="88" fill="{basalt}"/>'
                 f'<rect x="222" y="74" width="62" height="34" rx="5" fill="{brown}"/>'
                 f'<rect x="226" y="78" width="54" height="26" rx="3" fill="none" stroke="{lime}" stroke-width="2"/>'
                 f'<path d="M244 98V86c0-3 2-5 5-5s5 2 5 5v12zM240 98h18" fill="{lime}" stroke="{lime}" stroke-width="2"/>')
        return svg("0 0 320 200", ground + pack + mapp + extra)
    if variant == 2:  # painted: rough edges, a blazed rock and a trail
        extra = (f'<path d="M232 186c-6-20 8-38 30-36s32 20 26 36z" fill="#b3a88f"/>'
                 f'<g transform="rotate(-6 262 166)"><rect x="252" y="160" width="20" height="14" fill="#f6f2e8"/><rect x="252" y="164.7" width="20" height="4.6" fill="#b83a2b"/></g>'
                 f'<path d="M20 190c30-14 50-4 80-12" fill="none" stroke="#b83a2b" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>')
        body = f'<g filter="url(#r)">{ground}{pack}{mapp}{extra}</g>'
        return svg("0 0 320 200", body, ROUGH.format(f=".05", s=7, k="5"))
    # variant 3: ink sketch on paper: outlines and hatching, one wash colour
    ink = basalt
    body = (f'<rect width="320" height="200" fill="{lime}"/>'
            f'<g fill="none" stroke="{ink}" stroke-linecap="round" stroke-linejoin="round" filter="url(#r)">'
            f'<path d="M0 186c60-10 120-12 160-8s110 10 160 4" stroke-width="1.6"/>'
            f'<path d="M100 84c0-12 10-20 22-20h76c12 0 22 8 22 20v86c0 12-10 20-22 20h-76c-12 0-22-8-22-20z" fill="{green}" fill-opacity=".35" stroke-width="2"/>'
            f'<path d="M104 88c0-10 9-18 20-18h72c11 0 20 8 20 18v22c0 7-6 11-12 11h-88c-6 0-12-4-12-11z" stroke-width="1.6"/>'
            f'<path d="M132 112v54M144 112v54M176 112v54M188 112v54" stroke-width="1.4"/>'
            f'<path d="M200 130l14-14M200 146l18-18M200 162l18-18M202 178l16-16" stroke-width=".9"/>'
            f'<g transform="rotate(-8 160 52)"><path d="M128 18h64v58h-64zM149 18v58M171 18v58" stroke-width="1.6"/>'
            f'<path d="M134 60c10-12 22-6 30-18s18-10 22-16" stroke-width="1.3" stroke-dasharray="4 3"/></g>'
            f'<path d="M250 150c10-30 30-50 50-56M262 158c8-24 22-40 38-46" stroke-width="1.1" opacity=".7"/></g>')
    return svg("0 0 320 200", body, ROUGH.format(f="1.1", s=9, k="1.2"))


VARIANTS = {
    "v1": ("שלט מורשת", "פיקטוגרמות מלאות שנחתכות בשמנת על לוחית חומה, כמו השלטים החומים של אתרי המורשת והגנים הלאומיים.", "sign"),
    "v2": ("סימון צבוע", "משיחת מכחול על אבן גיר: קו עבה עם שוליים מחוספסים, וסימון שביל לבן–צבע–לבן בכל אייקון.", "paint"),
    "v3": ("דיו במחברת שדה", "סקיצה בעט של מורה דרך: קו דק עם רעד קל, וקווי הצללה מקבילים.", "ink"),
}


def build() -> None:
    for i, v in enumerate(VARIANTS, start=1):
        d = OUT / v
        d.mkdir(parents=True, exist_ok=True)
        for n, name in enumerate(ICON_ORDER):
            s = {1: v1_icon, 2: lambda x: v2_icon(x, 11 + n), 3: lambda x: v3_icon(x, 21 + n)}[i](name)
            (d / f"{name}.svg").write_text(s, encoding="utf-8")
        (d / "logo-mark.svg").write_text({1: LOGO_V1, 2: LOGO_V2, 3: LOGO_V3}[i], encoding="utf-8")
        (d / "spot.svg").write_text(spot(i), encoding="utf-8")

    counter = iter(range(10_000))

    def inline(v: str, name: str, size: int) -> str:
        """The SVG itself, inline, so currentColor and the accent colour both reach it. Ids are made unique."""
        src = (OUT / v / f"{name}.svg").read_text(encoding="utf-8").strip()
        k = next(counter)
        for i in ("m", "r", "c"):
            src = src.replace(f'id="{i}"', f'id="{i}{k}"').replace(f"url(#{i})", f"url(#{i}{k})")
        return src.replace("<svg ", f'<svg width="{size}" height="{size}" aria-hidden="true" ', 1)

    def icons(v: str, size: int) -> str:
        def one(n: str) -> str:
            ic = inline(v, n, size)
            if v == "v1":  # heritage-sign pictograms sit on their own brown plate
                ic = f'<span class="plate" style="--s:{size}px">{ic}</span>'
            return f"<figure>{ic}<figcaption>{NAMES[n]}</figcaption></figure>"
        return "".join(one(n) for n in ICON_ORDER)

    cols = []
    for v, (title, line, kind) in VARIANTS.items():
        cols.append(f"""
<section class="col {kind}">
  <h2>{v[1]} · {title}</h2>
  <p class="line">{line}</p>
  <div class="logos" role="img" aria-label="סימן הלוגו, {title}">{inline(v, "logo-mark", 128)}{inline(v, "logo-mark", 32)}
    <span class="word">אבן דרך<small>למורי דרך</small></span></div>
  <h3>על רקע בהיר · 48 ו-24</h3>
  <div class="grid light big">{icons(v, 48)}</div>
  <div class="grid light small">{icons(v, 24)}</div>
  <h3>על רקע כהה</h3>
  <div class="grid dark big">{icons(v, 48)}</div>
  <h3>סגנון איור</h3>
  <img class="spot" src="{v}/spot.svg" alt="איור: תרמיל פתוח ומפה מקופלת יוצאת ממנו, {title}">
</section>""")

    html = f"""<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>אבן דרך — שלוש שפות סימנים</title>
<style>
body{{margin:0;background:#e4dac4;color:#2a221b;font:16px/1.5 system-ui,"Heebo",sans-serif}}
header{{padding:24px 20px 4px;max-width:1240px;margin:auto}} h1{{margin:0;font-size:30px}} header p{{margin:6px 0 0;color:#574d3d}}
main{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;max-width:1240px;margin:auto;padding:16px 20px 40px}}
.col{{background:#efe8d8;border-radius:10px;padding:16px 16px 20px;box-shadow:0 0 0 1px #c9bc9c}}
h2{{margin:0;font-size:22px}} h3{{margin:16px 0 6px;font-size:14px;color:#574d3d}} .line{{margin:4px 0 10px;color:#574d3d;min-height:3em}}
.logos{{display:flex;align-items:center;gap:14px;color:#2a221b}} .word{{font-size:30px;font-weight:900;line-height:1}} .word small{{display:block;font-size:15px;font-weight:700}}
.grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:10px;border-radius:8px}}
.light{{background:#e9dfcb;color:#2a221b}} .dark{{background:#1f1a15;color:#efe5d2}}
.small figcaption{{display:none}} .small{{grid-template-columns:repeat(8,1fr)}}
figure{{margin:0;display:flex;flex-direction:column;align-items:center;gap:4px}} figcaption{{font-size:11.5px;text-align:center}}
.ic{{display:block;width:var(--s);height:var(--s);background:currentColor;-webkit-mask:var(--u) center/contain no-repeat;mask:var(--u) center/contain no-repeat}}
.plate{{display:grid;place-items:center;width:calc(var(--s)*1.45);height:calc(var(--s)*1.45);border-radius:calc(var(--s)*.18);background:#5b3a21;box-shadow:inset 0 0 0 calc(var(--s)*.05) #5b3a21,inset 0 0 0 calc(var(--s)*.09) #f3ead6;color:#f3ead6}}
.dark .plate{{background:#6b4426}}
.spot{{width:100%;height:auto;border-radius:8px;background:#e9dfcb}}
@media (max-width:900px){{main{{grid-template-columns:1fr}}}}
</style></head><body>
<header><h1>אבן דרך — שלוש שפות סימנים</h1><p>לוגו, שמונה אייקונים וסגנון איור בכל וריאציה. האייקונים מקבלים את הצבע מהערכה, ולכן עובדים בבהיר ובכהה.</p></header>
<main>{''.join(cols)}</main></body></html>
"""
    (OUT / "index.html").write_text(html, encoding="utf-8")


if __name__ == "__main__":
    build()
