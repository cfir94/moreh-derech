"""
Parse a 2026-format Ministry of Tourism licensing paper (part A).

The Ministry changed the paper's shape in 2026, and the old parser cannot read
it. Every sitting from 2016 to 2025 was 33 *paired* items — a fill-in-the-blank
statement followed by a four-option question about the same subject, where only
the second half was graded. The 2026 papers drop the pairing entirely and print
two independent sections of 45 questions each:

    section 1   45 fill-in-the-blank items, the official answer in brackets,
                "/" separating the wordings the Ministry accepts
    section 2   45 four-option questions with their own stems, the answer
                highlighted, and no fill-in half at all

So the paper went from 33 graded questions to 90. It is also the first sitting
whose multiple-choice half asks real questions — "איזה מבין...", "מה נושא...",
"כיצד נקראת..." — rather than the cut-off sentences that dominated 2000-2017.

Both halves are emitted into the site's existing ExamQuestion shape: the
fill-ins as `kind: "fill"` items with an empty statement, the multiple-choice as
ordinary `mc` items, likewise with an empty statement. The numbering is made
continuous (1-45, then 46-90) because the runner keys its answer sheet on it,
and the printed section number is kept in `printedNumber` so a student
comparing against the PDF can find the item.

    python3 tools/parse_exam_2026.py /workspace/sources/exams2026/jan2026-a.pdf
"""

import json
import re
import sys
from pathlib import Path

import pdfplumber

sys.path.insert(0, str(Path(__file__).resolve().parent))
from parse_exam import clean, read_lines, strip_blanks  # noqa: E402

ITEM_RE = re.compile(r"^\s*(\d{1,2})\s*[.)(]\s*(.*)$")
OPTION_RE = re.compile(r"^\s*([אבגד])\s*[.)(]\s*(.*)$")
LABELS = ["א", "ב", "ג", "ד"]

# A word whose first or last letter was set a hair too far from the rest comes
# back as two tokens ("מבני ה אבן", "ביטומ ן", "ביזנטי ת"). Which way it belongs
# is decided by the letter and by what follows, because Hebrew writes neither a
# bare prefix letter nor a bare final form as a word of its own.
FINALS = "ןםץףך"
PREFIXES = "הובלכמש"


def join_split_letters(s: str) -> str:
    # A final form can only close a word.
    s = re.sub(rf"(\S) ([{FINALS}])(?!\S)", r"\1\2", s)
    # A prefix letter with a word or a hyphenated run after it opens that word
    # ("ה אבן" → "האבן", "ה -20" → "ה-20").
    s = re.sub(rf"(?<!\S)([{PREFIXES}]) (?=[א-ת\-\"])", r"\1", s)
    # Any lone letter with nothing after it to open came off the word in front
    # ("ביזנטי ת", "הגימנסי ה"). "/" counts as nothing, since it separates the
    # wordings the key accepts.
    s = re.sub(r"(\S) ([א-ת])(?=\s*(?:/|$))", r"\1\2", s)
    return s


# The key prints the answer in brackets straight after the blank — usually at
# the end of the statement, but not always ("בעיר ____ [לוד] יש גשר ועליו
# כתובת המיוחסת לבייברס"). So the answer is found by the blank in front of it
# rather than by the end of the line, which also keeps an ordinary parenthetical
# out of it ("לפארק קנדה (איילון) נקראת ____ [מעלה בית חורון]").
#
# Any bracket may meet any other: reading an RTL line mirrors them, and the
# papers are inconsistent anyway — January's 13 opens "[" and closes ")", and
# its 38 is ")...)".
BRACKET = r"[\[\]()]"
ANSWER_RE = re.compile(rf"_{{3,}}\s*[,.]?\s*{BRACKET}\s*([^\[\]()]{{1,120}}?)\s*{BRACKET}")
BLANK_RE = re.compile(r"_{3,}")


def sections(lines):
    """
    Split the line stream where the numbering restarts.

    The fill-in section and the multiple-choice section both run 1-45, so the
    second "1." in the file opens section 2. Nothing else in these papers
    restarts a count, which makes this safe without looking at the content.
    """
    starts = []
    want = 1
    for i, line in enumerate(lines):
        m = ITEM_RE.match(line["text"])
        if not m:
            continue
        n = int(m.group(1))
        if n == want:
            if n == 1:
                starts.append(i)
            want += 1
        elif n == 1:
            # A restart: close the section and open the next one.
            starts.append(i)
            want = 2
    if len(starts) != 2:
        raise SystemExit(f"expected 2 sections, found {len(starts)}")
    return lines[starts[0] : starts[1]], lines[starts[1] :]


def blocks_of(lines):
    """One block per numbered item, in printed order."""
    starts, want = [], 1
    for i, line in enumerate(lines):
        m = ITEM_RE.match(line["text"])
        if m and int(m.group(1)) == want:
            starts.append(i)
            want += 1
    return [
        lines[starts[i] : (starts[i + 1] if i + 1 < len(starts) else len(lines))]
        for i in range(len(starts))
    ]


def parse_fill(block, n):
    """A fill-in item: the printed statement, and the key's bracketed answer."""
    text = clean(" ".join(l["text"] for l in block))
    text = ITEM_RE.match(text).group(2)
    matches = list(ANSWER_RE.finditer(text))
    if not matches:
        return None, f"Q{n}: no bracketed answer"
    m = matches[-1]
    answer = join_split_letters(clean(m.group(1)))
    # Cut out only the bracket, leaving the blank and anything printed after it.
    statement = join_split_letters(strip_blanks(text[: m.start()] + " ____ " + text[m.end() :]))
    if not statement or not answer:
        return None, f"Q{n}: empty statement or answer"

    # The key separates the wordings it accepts with "/" and, just as often,
    # with a comma ("[כתב, אלפבית]"); the site's matcher splits on "/" only.
    # An item with more than one blank is the exception — there the comma joins
    # two different answers rather than two wordings of one ("בין המדינות ____ ,
    # ____ (בריטניה / אנגליה, צרפת)") — and splitting it would key the item to
    # accept half an answer.
    sep = r"[/,]" if len(BLANK_RE.findall(statement)) < 2 else r"/"
    answer = " / ".join(p.strip() for p in re.split(sep, answer) if p.strip())
    return {
        "printedNumber": n,
        "kind": "fill",
        "question": statement,
        "answerText": answer,
    }, None


def parse_mc(block, n):
    """A four-option item: the stem, the options, and the highlighted answer."""
    opts, first = [], None
    for i in range(1, len(block)):
        m = OPTION_RE.match(block[i]["text"])
        if m and len(opts) < 4 and m.group(1) == LABELS[len(opts)]:
            opts.append({"text": m.group(2).strip(), "marked": block[i]["marked"]})
            if first is None:
                first = i
        elif opts:
            # A wrapped continuation of the option we are inside. The highlight
            # covers both of its lines, so the marking carries over too.
            opts[-1]["text"] = clean(opts[-1]["text"] + " " + block[i]["text"])
            opts[-1]["marked"] = opts[-1]["marked"] or block[i]["marked"]

    if len(opts) != 4 or first is None:
        return None, f"Q{n}: {len(opts)} options"
    stem = clean(" ".join(l["text"] for l in block[:first]))
    stem = join_split_letters(ITEM_RE.match(stem).group(2))
    if not stem or any(not o["text"] for o in opts):
        return None, f"Q{n}: empty stem or option"

    marked = [i for i, o in enumerate(opts) if o["marked"]]
    if len(marked) != 1:
        return None, f"Q{n}: {len(marked)} answers marked"

    return {
        "printedNumber": n,
        "kind": "mc",
        "question": strip_blanks(stem),
        "answers": [{"text": join_split_letters(strip_blanks(o["text"]))} for o in opts],
        "correctIndex": marked[0],
    }, None


def parse(path):
    with pdfplumber.open(path) as pdf:
        lines = read_lines(pdf, "he")

    fill_lines, mc_lines = sections(lines)
    items, problems = [], []

    for parser, chunk in ((parse_fill, fill_lines), (parse_mc, mc_lines)):
        for n, block in enumerate(blocks_of(chunk), 1):
            item, why = parser(block, n)
            if why:
                problems.append(why)
            else:
                item["number"] = len(items) + 1
                items.append(item)

    return items, problems


if __name__ == "__main__":
    items, problems = parse(sys.argv[1])
    fills = sum(1 for i in items if i["kind"] == "fill")
    print(
        f"parsed {len(items)} items ({fills} fill, {len(items) - fills} mc)",
        file=sys.stderr,
    )
    for why in problems:
        print(f"  {why}", file=sys.stderr)
    json.dump(items, sys.stdout, ensure_ascii=False, indent=1)
