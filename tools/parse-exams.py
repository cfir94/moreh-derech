"""
Extract multiple-choice questions + official answers from the Ministry of
Tourism tour-guide licensing exams.

Each exam item has two parts: a fill-in-the-blank knowledge statement and a
four-option comprehension question. Only the second part fits a multiple-choice
quiz, so that is what we take.

Text comes from pdfplumber, read right-to-left to recover Hebrew reading order.
That reverses embedded Latin/digit runs too (1917 -> 7191), so those runs are
flipped back afterwards. pypdf's extract_text() gets bidi right by itself but
silently drops spaces between words in these files, which is worse.

The correct option is marked visually in the official keys — bold text in some
years, a yellow highlight rectangle in others — so both are detected.

Anything that does not parse cleanly is dropped rather than guessed at: a wrong
"correct" answer would actively mislead someone studying for a licensing exam.
"""

import json
import re
import sys
from collections import defaultdict

import pdfplumber

OPTION_RE = re.compile(r"^\s*([אבגד1234])\s*[.)．]\s*(.+?)\s*$")
HEB_ORDER = ["א", "ב", "ג", "ד"]
NUM_ORDER = ["1", "2", "3", "4"]
YELLOW = (1.0, 1.0, 0.0)

# Stems that lean on the fill-in-the-blank half for their subject ("this wadi
# runs through...") are meaningless on their own, so they are not usable here.
CONTEXT_DEPENDENT = re.compile(
    r"(^|\s)(נחל|שלטון|דרך|עיר|אתר|מבנה|תקופה|מלך|אגם|הר|כנסייה|שבט|עם|ארגון|חוק|הסכם|מפלגה|תנועה|איש|אישיות|דמות)\s+(זה|זו|זאת|הזה|הזו)(\s|$)"
)


def fix_bidi_runs(s: str) -> str:
    """Flip Latin/digit runs back to logical order after RTL reconstruction."""
    # Commas are kept inside the run so thousands groups travel together
    # ("000,006" -> "600,000" rather than "000,600").
    s = re.sub(
        r"[0-9A-Za-z]+(?:,[0-9A-Za-z]+)*", lambda m: m.group(0)[::-1], s
    )
    # A trailing percent sign lands ahead of its number when reversed.
    s = re.sub(r"%\s*(\d+(?:\.\d+)?)", r"\1%", s)
    # A year range comes out with its two numbers swapped (1930-1940 -> 1940-1930).
    s = re.sub(
        r"\b(\d{4})\s*-\s*(\d{4})\b",
        lambda m: f"{m.group(2)}-{m.group(1)}"
        if int(m.group(1)) > int(m.group(2))
        else m.group(0),
        s,
    )
    return s


def clean(s: str) -> str:
    s = s.replace("‏", "").replace("‎", "")
    s = re.sub(r"[_\.]{3,}", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip(" .:-–־")


def page_lines(page):
    buckets = defaultdict(list)
    for ch in page.chars:
        buckets[round(ch["top"] / 3.0)].append(ch)
    yellows = [r for r in page.rects if r.get("non_stroking_color") == YELLOW]

    lines = []
    for key in sorted(buckets):
        chars = sorted(buckets[key], key=lambda c: -c["x0"])
        text = clean(fix_bidi_runs("".join(c["text"] for c in chars)))
        if not text:
            continue
        cy = sum(c["top"] for c in chars) / len(chars)
        marked = any("Bold" in c["fontname"] for c in chars) or any(
            r["top"] - 3 <= cy <= r["bottom"] + 3 for r in yellows
        )
        lines.append({"text": text, "marked": marked})
    return lines


def option_runs(lines):
    """Locate runs of four consecutive, correctly-ordered options."""
    labelled = []
    for idx, line in enumerate(lines):
        m = OPTION_RE.match(line["text"])
        if m:
            labelled.append((idx, m.group(1), m.group(2), line["marked"]))

    runs, i = [], 0
    while i < len(labelled):
        if labelled[i][1] not in ("א", "1"):
            i += 1
            continue
        order = HEB_ORDER if labelled[i][1] == "א" else NUM_ORDER
        run, j, k = [], i, 0
        while j < len(labelled) and k < 4 and labelled[j][1] == order[k]:
            run.append(labelled[j])
            j += 1
            k += 1
        if len(run) == 4:
            runs.append(run)
            i = j
        else:
            i += 1
    return runs


def parse(pdf_path, exam_label):
    questions, skipped = [], 0

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            lines = page_lines(page)
            prev_end = 0

            for run in option_runs(lines):
                first_line = run[0][0]
                window = [
                    l["text"]
                    for l in lines[prev_end:first_line]
                    if len(l["text"]) > 12 and not OPTION_RE.match(l["text"])
                ]
                prev_end = run[-1][0] + 1

                stem = next((t for t in reversed(window) if t.endswith("?")), None)
                if stem is None and window:
                    stem = window[-1]

                options = [payload for _, _, payload, _ in run]
                marks = [marked for _, _, _, marked in run]

                if (
                    not stem
                    or len(stem) < 18
                    or sum(marks) != 1
                    or any(len(o) < 2 for o in options)
                    or CONTEXT_DEPENDENT.search(stem)
                ):
                    skipped += 1
                    continue

                questions.append(
                    {
                        "question": stem if stem.endswith("?") else stem + "?",
                        "category": exam_label,
                        "answers": [
                            {"text": o, "correct": bool(mk)}
                            for o, mk in zip(options, marks)
                        ],
                    }
                )
    return questions, skipped


SOURCES = [
    ("2021/multiple_choice_he_winter_2021.pdf", "חורף 2021"),
    ("2022/multiple_choice_he_winter_2022_resolved.pdf", "חורף 2022"),
    ("2023/AmericanQuestionnaireSolution Summer2023Hebrew.pdf", "קיץ 2023"),
    ("2024/answers-theory-test-july-2024-hebrew.pdf", "יולי 2024"),
    ("2024/theoretic-exam2024-answers.pdf", "מועד נוסף 2024"),
    ("2025/january-test-part-a-hebrew.pdf", "ינואר 2025"),
    ("2025/Part1_jul2025_He.pdf", "יולי 2025"),
]

if __name__ == "__main__":
    all_q = []
    for path, label in SOURCES:
        qs, skipped = parse(path, label)
        print(f"{len(qs):3d} kept, {skipped:3d} skipped  {label:16s}", file=sys.stderr)
        all_q.extend(qs)
    print(f"TOTAL {len(all_q)}", file=sys.stderr)
    json.dump(all_q, open("/workspace/exams/parsed.json", "w"), ensure_ascii=False, indent=1)
