"""
Read the licensing-exam questions that Efrat Nakash sorted by subject.

She collected the multiple-choice items from the Ministry's licensing papers of
2000–2017 and grouped them into 23 subject files, each with a companion
"answers" PDF in which the answer she proposes is highlighted. Those files are
the closest thing that exists to "what the exam actually asks, by subject" —
which is exactly what a topical quiz here wants to be measured against.

Two things about provenance, both of which the output records:

* The **questions** are the Ministry's, copied from public exam papers. We treat
  Ministry papers as quotable, as we already do for `src/data/exams`.
* The **answers are hers, not the Ministry's.** Her own header says so: "אלה
  תשובות שאני מציעה. אם מצאתם טעות – אשמח אם תכתבו אלי ואתקן." So everything
  produced here is `keySource: "derived"` — never presented as an official key.

The marking is found the same two ways as in the Ministry's own PDFs: a
highlight rectangle drawn over the option, or the option set in bold. Detecting
both is why this reuses the geometry approach of tools/parse_exam.py rather
than a text scrape.

    python3 tools/parse_efrat.py --dir /workspace/sources/efrat --out tools/efrat_items.json
"""

import argparse
import json
import re
import statistics
import sys
from pathlib import Path

import pdfplumber

sys.path.insert(0, str(Path(__file__).resolve().parent))
from parse_exam import fix_bidi_runs  # noqa: E402

ITEM_RE = re.compile(r"^\s*(\d{1,3})\s*[.)]\s*(.*)$")
OPTION_RE = re.compile(r"^\s*([אבגד])\s*[).]\s*(.*)$")

# Her footer, and the page number that rides with it.
FOOTER_RE = re.compile(r"EfratNakash|efratnakash", re.I)


def line_rows(page):
    """Words clustered into visual lines, keeping each line's boxes."""
    rows = []
    for w in sorted(page.extract_words(), key=lambda w: (round(w["top"]), w["x0"])):
        for r in rows:
            overlap = min(r["bottom"], w["bottom"]) - max(r["top"], w["top"])
            if overlap > 0.5 * (w["bottom"] - w["top"]):
                r["ws"].append(w)
                r["top"] = min(r["top"], w["top"])
                r["bottom"] = max(r["bottom"], w["bottom"])
                break
        else:
            rows.append({"top": w["top"], "bottom": w["bottom"], "ws": [w]})
    return sorted(rows, key=lambda r: r["top"])


HEB_ONLY = re.compile(r"^[֐-׿]+$")


def merge_split_letters(words):
    """
    Rejoin a word whose last letter was emitted as its own token.

    These PDFs regularly break a final letter off ("לוחמי הגיטאו ת",
    "שוד ולחימ ה"), which would otherwise travel into the quiz. The tell is a
    one-letter Hebrew token sitting closer to its neighbour than the line's
    normal word spacing, so the line's own median gap is the threshold.
    `words` must already be in logical (right-to-left) order.
    """
    if len(words) < 2:
        return list(words)
    gaps = [words[i - 1]["x0"] - words[i]["x1"] for i in range(1, len(words))]
    median = statistics.median(gaps)
    out = [dict(words[0])]
    for i in range(1, len(words)):
        gap = words[i - 1]["x0"] - words[i]["x1"]
        letter, prev = words[i]["text"][::-1], out[-1]["text"][::-1]
        if (
            len(letter) == 1
            and HEB_ONLY.match(letter)
            and len(prev) >= 2
            and HEB_ONLY.match(prev)
            and gap < 0.75 * median
        ):
            out[-1]["text"] = words[i]["text"] + out[-1]["text"]
        else:
            out.append(dict(words[i]))
    return out


def read_page(page):
    """(text, marked) per line. `marked` = highlighted or bold."""
    highlights = [
        r
        for r in page.rects
        if 5 < r["bottom"] - r["top"] < 25 and r["x1"] - r["x0"] > 20
    ]
    bold = {
        (round(c["top"]), round(c["x0"]))
        for c in page.chars
        if "Bold" in c.get("fontname", "")
    }
    out = []
    for r in line_rows(page):
        # Sorting right-to-left already puts the words in logical order; only
        # each word's own letters come out reversed, so reverse per word — not
        # the whole line, which would undo the ordering. These files are
        # Hebrew-only, so the ligature problem that forced a glyph-level
        # rebuild for the Arabic editions does not arise here.
        words = merge_split_letters(sorted(r["ws"], key=lambda w: -w["x0"]))
        text = fix_bidi_runs(" ".join(w["text"][::-1] for w in words)).strip()
        if not text or FOOTER_RE.search(text):
            continue
        marked = any(
            h["top"] - 2 <= r["top"] and r["bottom"] <= h["bottom"] + 2
            and h["x0"] - 3 <= w["x0"] and w["x1"] <= h["x1"] + 3
            for h in highlights
            for w in r["ws"]
        ) or any((round(w["top"]), round(w["x0"])) in bold for w in r["ws"])
        out.append((text, marked))
    return out


def parse_pdf(path):
    lines = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            lines.extend(read_page(page))

    items, cur = [], None
    for text, marked in lines:
        m_opt = OPTION_RE.match(text)
        m_item = ITEM_RE.match(text)
        # An option label wins over an item number: "1. ..." inside an option is
        # rare, but "א) ..." is never an item.
        if m_opt and cur is not None:
            cur["options"].append({"text": m_opt.group(2).strip(), "marked": marked})
        elif m_item:
            if cur:
                items.append(cur)
            cur = {"n": int(m_item.group(1)), "q": m_item.group(2).strip(), "options": []}
        elif cur is not None:
            # Continuation of whatever came last — question stem or option.
            if cur["options"]:
                cur["options"][-1]["text"] += " " + text
            else:
                cur["q"] += " " + text
    if cur:
        items.append(cur)
    return items


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True, help="folder holding the downloaded PDFs")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    src = Path(args.dir)
    result, stats = [], []
    for answers in sorted(src.glob("*-test-answers.pdf")):
        topic = answers.name.replace("-test-answers.pdf", "")
        items = parse_pdf(answers)
        good = []
        dropped = {"options": 0, "key": 0}
        for it in items:
            if len(it["options"]) != 4:
                dropped["options"] += 1
                continue
            marks = [i for i, o in enumerate(it["options"]) if o["marked"]]
            if len(marks) != 1:
                dropped["key"] += 1
                continue
            good.append(
                {
                    "topic": topic,
                    "n": it["n"],
                    "question": re.sub(r"\s+", " ", it["q"]).strip(),
                    "options": [re.sub(r"\s+", " ", o["text"]).strip() for o in it["options"]],
                    "correctIndex": marks[0],
                }
            )
        result.extend(good)
        stats.append((topic, len(items), len(good), dropped))

    Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2))
    width = max(len(s[0]) for s in stats)
    for topic, found, kept, dropped in stats:
        note = ""
        if dropped["options"] or dropped["key"]:
            note = f"  (dropped {dropped['options']} malformed, {dropped['key']} unmarked)"
        print(f"{topic:{width}s}  {kept:4d}/{found:<4d}{note}")
    print(f"\n{len(result)} questions with exactly four options and one marked answer")


if __name__ == "__main__":
    main()
