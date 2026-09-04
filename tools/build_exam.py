"""
Build one trilingual exam for the site.

The three language editions are the same exam, so the correct option must sit at
the same index in each. That gives a genuine cross-check: each edition is marked
independently in its own PDF, and any disagreement means a parsing error rather
than a judgement call. Hebrew is the authority where an edition's own marking is
unusable (the English key highlights all four options on Q20).
"""

import json
import re
import sys

from parse_exam import parse

SOURCES = {
    "he": "2024/answers-theory-test-july-2024-hebrew.pdf",
    "en": "2024/answers-theory-test-july-2024-english.pdf",
    "ar": "2024/answers-theory-test-july-2024-arabic.pdf",
}


BRACKET_RE = re.compile(r"[\[(]([^\[\]()]{2,80})[\])]")


def tidy(q):
    """
    Move the fill-in half's leftovers out of the comprehension question.

    The two halves are printed as one paragraph, and the bracketed answer the
    key adds does not always land where the line breaks: it can open the next
    line, dragging the tail of its own sentence with it. When an edition has no
    answer of its own and its question opens with a bracketed group, that group
    is that answer and anything before it belongs to the statement.
    """
    # Whether each edition found its own answer, before this pass changes any:
    # a bracket in one edition's question is that edition's misplaced answer
    # only when the other editions did print an answer for the same item.
    had = {lang: bool(text) for lang, text in q["statementAnswer"].items()}

    for lang, text in q["question"].items():
        elsewhere = any(v for l, v in had.items() if l != lang)
        m = BRACKET_RE.search(text)
        # A bracket the question opens with is misplaced wherever it appears;
        # one further in is only misplaced if this edition lost its answer.
        misplaced = m and (
            (not had[lang] and elsewhere and m.start() < 60)
            or (had[lang] and m.start() < 20)
        )
        if misplaced:
            q["statementAnswer"][lang] = m.group(1).strip()
            q["statement"][lang] = (
                q["statement"][lang] + " " + text[: m.start()]
            ).strip()
            text = text[m.end() :].strip()

        # An English question never opens mid-sentence, so a lowercase start is
        # the statement's own tail.
        if lang == "en" and text[:1].islower():
            i = text.find(". ")
            if 0 < i < 80:
                q["statement"][lang] = (q["statement"][lang] + " " + text[: i + 1]).strip()
                text = text[i + 2 :].strip()

        q["question"][lang] = text
    return q


def correct_index(item):
    if not item.get("marksOk", True):
        return None
    marks = [i for i, a in enumerate(item["answers"]) if a["correct"]]
    return marks[0] if len(marks) == 1 else None


def main():
    parsed = {}
    for lang, path in SOURCES.items():
        items, problems, found = parse(path, lang)
        parsed[lang] = {i["number"]: i for i in items}
        print(
            f"{lang}: {found} items found, {len(items)} parsed"
            + (f" (issues: {problems})" if problems else ""),
            file=sys.stderr,
        )

    authority = parsed["he"]
    questions, dropped, disagreements = [], [], []

    for n in sorted(authority):
        base = authority[n]
        idx = correct_index(base)
        if idx is None:
            dropped.append((n, "no single marked answer in Hebrew"))
            continue

        # Cross-check: every edition that marked cleanly must agree.
        for lang in ("en", "ar"):
            other = parsed[lang].get(n)
            if not other:
                continue
            other_idx = correct_index(other)
            if other_idx is not None and other_idx != idx:
                disagreements.append((n, lang, idx, other_idx))

        if any(d[0] == n for d in disagreements):
            dropped.append((n, "languages disagree on the answer"))
            continue

        def field(name, fallback=""):
            out = {}
            for lang in SOURCES:
                item = parsed[lang].get(n)
                out[lang] = (item or {}).get(name) or fallback
            return out

        answers = []
        for i in range(4):
            texts = {}
            for lang in SOURCES:
                item = parsed[lang].get(n)
                texts[lang] = item["answers"][i]["text"] if item else ""
            answers.append({"text": texts})

        questions.append(
            tidy({
                "number": n,
                "statement": field("statement"),
                "statementAnswer": field("statementAnswer", ""),
                "question": field("question"),
                "answers": answers,
                "correctIndex": idx,
            })
        )

    print(f"\nquestions built: {len(questions)}", file=sys.stderr)
    if disagreements:
        print(f"DISAGREEMENTS: {disagreements}", file=sys.stderr)
    if dropped:
        print(f"dropped: {dropped}", file=sys.stderr)

    missing = {
        lang: [q["number"] for q in questions if not q["question"][lang]]
        for lang in SOURCES
    }
    print(f"questions missing text per language: {missing}", file=sys.stderr)

    json.dump(questions, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
