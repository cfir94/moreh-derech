"""
Parse one Ministry of Tourism licensing exam into complete items, in any of the
three languages it is published in.

This supersedes the earlier option-run scanner, which silently lost questions:
an option whose label and text landed on separate lines (the yellow highlight
shifts the baseline), an option whose text wrapped, and a question whose options
straddled a page break were each dropped. Walking numbered items over one
continuous line stream catches all three.

Each exam item has two halves and both are captured:
  * a fill-in-the-blank statement, whose official answer the key prints inline
    in brackets or parentheses
  * a four-option comprehension question, whose correct option the key marks
    with a yellow highlight (2024-2025) or bold text (2021-2023)

Only the second half can be graded automatically, but the first is what gives
questions like "this wadi runs through..." their subject, so it is kept as the
item's context and shown alongside.
"""

import json
import re
import sys
from collections import defaultdict

import pdfplumber

YELLOW = (1.0, 1.0, 0.0)

LANGS = {
    "he": {"rtl": True, "sets": [["א", "ב", "ג", "ד"], ["1", "2", "3", "4"]]},
    "ar": {"rtl": True, "sets": [["أ", "ب", "ج", "د"], ["1", "2", "3", "4"]]},
    "en": {
        "rtl": False,
        "sets": [["A", "B", "C", "D"], ["a", "b", "c", "d"], ["1", "2", "3", "4"]],
    },
}

ITEM_RE = re.compile(r"^\s*(\d{1,2})\s*[.)]\s*(.*)$")
# The key prints the fill-in answer inline, e.g. "... is called ____ [Gezer]".
FILL_ANSWER_RE = re.compile(r"[\[(]([^\[\]()]{2,80})[\])][\s_.]*$")


def fix_bidi_runs(s: str) -> str:
    """Flip Latin/digit runs back after reading an RTL line right-to-left."""
    s = re.sub(r"[0-9A-Za-z]+(?:,[0-9A-Za-z]+)*", lambda m: m.group(0)[::-1], s)
    s = re.sub(
        r"\b(\d{4})\s*-\s*(\d{4})\b",
        lambda m: f"{m.group(2)}-{m.group(1)}"
        if int(m.group(1)) > int(m.group(2))
        else m.group(0),
        s,
    )
    s = re.sub(r"%\s*(\d+(?:\.\d+)?)", r"\1%", s)
    return s


# Arabic vowel marks are optional in print and arrive as zero-width boxes that
# split a word in two ("ال ُمسترجعة"); dropping them restores the word.
TASHKEEL_RE = re.compile(r"[ً-ٰٕ]")


def word_texts(words, chars, rtl):
    """
    Each word rebuilt from its own glyphs, in logical order.

    Reversing an RTL word's *string* corrupts the lam-alef ligatures, which the
    font maps to a single glyph carrying two codepoints ("لإ"): the string
    reversal splits it into "إل". Reversing the glyph list instead keeps each
    ligature whole.

    Glyphs are handed to the word they overlap most, because some pages set
    words so tightly that their boxes overlap by a point.
    """
    owned = [[] for _ in words]
    for c in chars:
        best, best_overlap = None, 0.0
        for i, w in enumerate(words):
            # A row can hold two interleaved printed lines; a glyph belongs to
            # the word it shares a baseline with, not merely a column.
            share = min(c["bottom"], w["bottom"]) - max(c["top"], w["top"])
            if share <= 0.5 * (c["bottom"] - c["top"]):
                continue
            overlap = min(c["x1"], w["x1"]) - max(c["x0"], w["x0"])
            # A vowel mark has no width of its own; place it by its position.
            if c["x1"] - c["x0"] <= 0 and w["x0"] - 0.3 <= c["x0"] <= w["x1"] + 0.3:
                overlap = 0.01
            if overlap > best_overlap:
                best, best_overlap = i, overlap
        if best is not None:
            owned[best].append(c)

    out = []
    for w, cs in zip(words, owned):
        cs.sort(key=lambda c: c["x0"], reverse=rtl)
        raw = "".join(c["text"] for c in cs) or w["text"]
        text = TASHKEEL_RE.sub("", raw)
        out.append({"text": text, "marks": text != raw})
    return out


def clean(s: str) -> str:
    s = s.replace("‏", "").replace("‎", "")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def strip_blanks(s: str) -> str:
    """Normalise the printed blank to one short marker, in place."""
    return clean(re.sub(r"[_.]{3,}", " ____ ", s))


def read_lines(pdf, lang):
    """
    All pages as one line stream, each line carrying its answer marking.

    Text comes from word boxes rather than raw characters: pdfplumber infers
    spaces from horizontal gaps, and without that Arabic loses every space
    between words ("hi mia sarf" arrives as one run). For a right-to-left
    language the words are joined left-to-right and the whole line is then
    reversed, which restores logical order without disturbing the spacing.
    """
    rtl = LANGS[lang]["rtl"]
    out = []
    for page in pdf.pages:
        yellows = [r for r in page.rects if r.get("non_stroking_color") == YELLOW]
        bolds = [c for c in page.chars if "Bold" in c["fontname"]]

        # Cluster words into lines by vertical overlap rather than a fixed
        # bucket: a highlighted answer sits a few points off its neighbours, and
        # fixed buckets split its label from its text — sometimes ordering the
        # text before the label, which no later pass can undo.
        rows = []
        for w in sorted(page.extract_words(), key=lambda w: w["top"]):
            placed = False
            for row in rows:
                overlap = min(row["bottom"], w["bottom"]) - max(row["top"], w["top"])
                height = min(row["bottom"] - row["top"], w["bottom"] - w["top"])
                if height > 0 and overlap > 0.5 * height:
                    row["words"].append(w)
                    row["top"] = min(row["top"], w["top"])
                    row["bottom"] = max(row["bottom"], w["bottom"])
                    placed = True
                    break
            if not placed:
                rows.append(
                    {"top": w["top"], "bottom": w["bottom"], "words": [w]}
                )

        for row in sorted(rows, key=lambda r: r["top"]):
            words = sorted(row["words"], key=lambda w: w["x0"])
            row_chars = [
                c
                for c in page.chars
                if min(c["bottom"], row["bottom"]) - max(c["top"], row["top"])
                > 0.5 * (c["bottom"] - c["top"])
            ]
            built = word_texts(words, row_chars, rtl)
            texts = [b["text"] for b in built]
            # A word split off by a vowel mark is rejoined to its other half:
            # the mark has no width, so no real space separates them.
            gaps = [
                ""
                if i
                and (built[i]["marks"] or built[i - 1]["marks"])
                and words[i]["x0"] - words[i - 1]["x1"] <= 0.6
                else " "
                for i in range(len(words))
            ]
            if rtl:
                joined = texts[-1] if texts else ""
                for i in range(len(texts) - 1, 0, -1):
                    joined += gaps[i] + texts[i - 1]
                joined = fix_bidi_runs(joined)
            else:
                joined = "".join(
                    (gaps[i] if i else "") + t for i, t in enumerate(texts)
                )
            text = clean(joined)
            if not text:
                continue

            top, bottom = row["top"], row["bottom"]
            cy = (top + bottom) / 2
            x0 = min(w["x0"] for w in words)
            x1 = max(w["x1"] for w in words)
            # A bold marking must cover most of this line, not merely share its
            # band with a bold heading elsewhere on the page.
            line_bold = [
                c
                for c in bolds
                if top - 1 <= c["top"] <= bottom + 1 and x0 - 1 <= c["x0"] <= x1 + 1
            ]
            marked = any(
                r["top"] - 3 <= cy <= r["bottom"] + 3 for r in yellows
            ) or len(line_bold) > max(3, 0.5 * len(text))
            out.append({"text": text, "marked": marked})
    return out


def option_re_for(labels):
    escaped = "|".join(re.escape(l) for l in labels)
    return re.compile(rf"^\s*({escaped})\s*[.)]\s*(.*)$")


def split_items(lines, lang, expected_count):
    """
    Slice the stream at lines that open the next numbered item.

    Some questions label their options 1-4 rather than א-ד, so "4. Ahasuerus"
    looks exactly like the start of item 4. An item therefore cannot begin
    until the current one has collected its four options.
    """
    any_opt = option_re_for([l for s in LANGS[lang]["sets"] for l in s])

    starts, want, opts_seen = [], 1, 0
    for i, line in enumerate(lines):
        m = ITEM_RE.match(line["text"])
        # An item's statement is long and carries the fill-in blank or its
        # bracketed answer; an option that happens to share the number is short.
        # Either signal is enough, since fragmented options can leave the
        # option count short of four.
        looks_like_statement = (
            len(line["text"]) > 40
            or "_" in line["text"]
            or "[" in line["text"]
            or "(" in line["text"]
        )
        if (
            m
            and int(m.group(1)) == want
            and (want == 1 or opts_seen >= 4 or looks_like_statement)
        ):
            starts.append(i)
            want += 1
            opts_seen = 0
            if want > expected_count:
                break
            continue
        if any_opt.match(line["text"]):
            opts_seen += 1

    return [
        lines[starts[i] : (starts[i + 1] if i + 1 < len(starts) else len(lines))]
        for i in range(len(starts))
    ]


def parse_item(block, labels):
    """One numbered item -> fill-in half + four-option half."""
    opt_re = option_re_for(labels)

    # Locate the option lines, tolerating a label alone on its own line.
    opts, first_opt_idx = [], None
    i = 0
    while i < len(block):
        m = opt_re.match(block[i]["text"])
        if m and len(opts) < 4 and m.group(1) == labels[len(opts)]:
            text, marked = m.group(2).strip(), block[i]["marked"]
            if not text and i + 1 < len(block):
                # Highlighted answers sometimes push their text to the next line.
                i += 1
                text, marked = block[i]["text"], marked or block[i]["marked"]
            opts.append({"label": m.group(1), "text": text, "marked": marked})
            if first_opt_idx is None:
                first_opt_idx = i
        elif opts and len(opts) < 4:
            # A wrapped continuation of the option we are inside.
            if not opt_re.match(block[i]["text"]) and not ITEM_RE.match(block[i]["text"]):
                opts[-1]["text"] = clean(opts[-1]["text"] + " " + block[i]["text"])
                opts[-1]["marked"] = opts[-1]["marked"] or block[i]["marked"]
        elif opts and len(opts) == 4:
            if not opt_re.match(block[i]["text"]) and not ITEM_RE.match(block[i]["text"]):
                opts[-1]["text"] = clean(opts[-1]["text"] + " " + block[i]["text"])
                opts[-1]["marked"] = opts[-1]["marked"] or block[i]["marked"]
        i += 1

    # A final option sometimes loses its label entirely (the highlight eats it),
    # leaving its text stranded after the third option. Adopt it only when that
    # yields exactly the four options an item must have.
    if len(opts) == 3 and first_opt_idx is not None:
        after = [
            l
            for l in block[first_opt_idx:]
            if not opt_re.match(l["text"]) and not ITEM_RE.match(l["text"])
        ]
        tail = [l for l in after if len(l["text"]) > 2]
        if len(tail) == 1:
            opts.append(
                {"label": labels[3], "text": tail[0]["text"], "marked": tail[0]["marked"]}
            )

    if len(opts) != 4 or first_opt_idx is None:
        return None

    head = [l["text"] for l in block[:first_opt_idx]]
    if not head:
        return None

    # The first line still carries "N." — drop the numbering.
    m = ITEM_RE.match(head[0])
    if m:
        head[0] = m.group(2)

    # The statement is the fill-in half; it ends where its blank or its
    # bracketed answer closes. Everything after that is the comprehension
    # question, which may itself wrap over several lines — so the boundary has
    # to be found from the front rather than by taking the last line ending
    # in "?" (English questions wrap, and that rule kept only their tail).
    stem_idx = None
    depth = 0
    for j, line in enumerate(head):
        for ch in line:
            if ch in "([":
                depth += 1
            elif ch in ")]":
                depth = max(0, depth - 1)
        if depth == 0 and ("_" in line or "]" in line or ")" in line):
            stem_idx = j + 1
            break

    if stem_idx is None or stem_idx >= len(head):
        # No blank found (or nothing after it): fall back to the last question.
        stem_idx = next(
            (j for j in range(len(head) - 1, -1, -1) if head[j].rstrip().endswith("?")),
            len(head) - 1,
        )

    statement_lines = head[:stem_idx]
    stem_lines = head[stem_idx:]

    statement_raw = clean(" ".join(statement_lines))
    fill_answer = None
    fa = FILL_ANSWER_RE.search(statement_raw)
    if fa:
        fill_answer = clean(fa.group(1))
        statement_raw = clean(statement_raw[: fa.start()])

    return {
        "statement": strip_blanks(statement_raw),
        "statementAnswer": fill_answer,
        "question": strip_blanks(" ".join(stem_lines)),
        "answers": [
            {"text": strip_blanks(o["text"]), "correct": o["marked"]} for o in opts
        ],
    }


def parse(path, lang, expected_count=33):
    with pdfplumber.open(path) as pdf:
        lines = read_lines(pdf, lang)

    blocks = split_items(lines, lang, expected_count)
    items, problems = [], []

    for n, block in enumerate(blocks, 1):
        parsed = None
        for labels in LANGS[lang]["sets"]:
            parsed = parse_item(block, labels)
            if parsed:
                break

        if not parsed:
            problems.append((n, "no clean 4-option set"))
            continue
        if not parsed["question"] or any(len(a["text"]) < 2 for a in parsed["answers"]):
            problems.append((n, "empty question or option"))
            continue

        # An unusable marking does not invalidate the text: another language
        # edition of the same exam can supply the answer index instead.
        marks = sum(a["correct"] for a in parsed["answers"])
        if marks != 1:
            problems.append((n, f"{marks} answers marked"))
        parsed["marksOk"] = marks == 1

        parsed["number"] = n
        items.append(parsed)

    return items, problems, len(blocks)


if __name__ == "__main__":
    path, lang = sys.argv[1], sys.argv[2]
    items, problems, found = parse(path, lang)
    print(f"items found: {found} | parsed cleanly: {len(items)}", file=sys.stderr)
    for n, why in problems:
        print(f"  Q{n}: {why}", file=sys.stderr)
    json.dump(items, sys.stdout, ensure_ascii=False, indent=1)
