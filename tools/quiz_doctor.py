"""
Measure how a quiz would score against the licensing exams' own style.

Written after readers said some quizzes were too easy. The complaint turned out
to be measurable: in the geology quiz the correct answer stood out as clearly
the longest option in 43% of the questions and ran 1.9x the average distractor,
against 12% and 1.15x in the Ministry's own papers. A student can pass a quiz
like that by picking the longest answer, having learned nothing.

The checks below are the ones that caught real defects here. Run it on every
quiz before and after editing:

    python3 tools/quiz_doctor.py            # every quiz
    python3 tools/quiz_doctor.py geology    # one, with the worst offenders
"""

import json
import statistics
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUIZ_DIR = ROOT / "src/data/quizzes"

# The Ministry's own papers are the target. Measured over their 452 questions,
# the correct answer stands out as clearly longest — by more than a fifth over
# the next option — in 12% of them, and runs 1.15x the average distractor.
TARGET_LONGEST = 0.25
TARGET_RATIO = 1.35

# Quizzes that quote the Ministry's papers verbatim. Their defects are the
# exam's, not ours, and "fixing" them would falsify the source — so they are
# measured and reported, but not held to the targets. Measured over the 2,634
# items of 2000-2017: 17% clearly longest, 1.27x, and 6% carry a meta answer.
QUOTED = {"past-exams", "exam-bank"}

IMAGE_WORDS = ("בתמונה", "בצילום", "זהה את", "מי בתמונה", "בסרטון")
META_WORDS = ("תשובות א", "תשובות ב", "כל התשובות", "אף תשובה", "אף אחת מן התשובות")


def load(slug):
    text = (QUIZ_DIR / f"{slug}.ts").read_text()
    start = text.index("{", text.index("const quiz"))
    return json.loads(text[start : text.rindex("}") + 1])


def examine(quiz):
    findings = {k: [] for k in (
        "option_count",
        "no_single_answer",
        "image_without_image",
        "meta_answer",
        "duplicate_options",
        "length_tell",
    )}
    longest = 0
    ratios = []

    for q in quiz["questions"]:
        answers = q["answers"]
        correct = [a for a in answers if a["correct"]]
        if len(answers) != 4:
            findings["option_count"].append(q)
        if len(correct) != 1:
            findings["no_single_answer"].append(q)
            continue
        if any(w in q["question"] for w in IMAGE_WORDS) and not q.get("image"):
            findings["image_without_image"].append(q)
        if any(w in a["text"] for a in answers for w in META_WORDS):
            findings["meta_answer"].append(q)
        if len({a["text"].strip() for a in answers}) != len(answers):
            findings["duplicate_options"].append(q)

        others = [len(a["text"]) for a in answers if not a["correct"]]
        ratio = len(correct[0]["text"]) / statistics.mean(others)
        ratios.append(ratio)
        # Longest by a nose is not a tell; longest by a fifth is one a student
        # can see across the page without reading.
        if len(correct[0]["text"]) > 1.2 * max(others):
            longest += 1
        if ratio > TARGET_RATIO:
            findings["length_tell"].append((round(ratio, 2), q))

    n = len(quiz["questions"])
    return {
        "n": n,
        "longest_share": longest / n,
        "ratio": statistics.mean(ratios) if ratios else 0,
        "explained": sum(1 for q in quiz["questions"] if q.get("explanation")) / n,
        "findings": findings,
    }


def report(slug, verbose):
    quiz = load(slug)
    r = examine(quiz)
    quoted = slug in QUOTED
    flags = []
    if r["longest_share"] > TARGET_LONGEST:
        flags.append(f"correct answer clearly longest in {r['longest_share']:.0%}")
    if r["ratio"] > TARGET_RATIO:
        flags.append(f"{r['ratio']:.2f}x the average distractor")
    for key, label in (
        ("option_count", "not four options"),
        ("no_single_answer", "not exactly one correct answer"),
        ("image_without_image", "asks about a picture it does not have"),
        ("meta_answer", "answers like 'תשובות א ו-ב'"),
        ("duplicate_options", "the same option twice"),
    ):
        if r["findings"][key]:
            flags.append(f"{len(r['findings'][key])} {label}")

    print(
        f"{slug:16s} n={r['n']:4d}  explained={r['explained']:4.0%}  "
        + ("; ".join(flags) if flags else "clean")
        + ("   [quoted from the exam — reported, not a target]" if quoted and flags else "")
    )

    if verbose:
        worst = sorted(r["findings"]["length_tell"], key=lambda x: -x[0])[:25]
        if worst:
            print(f"\n  the {len(worst)} strongest length tells:")
            for ratio, q in worst:
                correct = next(a for a in q["answers"] if a["correct"])
                print(f"   {q['id']:4d} ×{ratio:.1f}  {q['question'][:64]}")
                print(f"         ✔ {correct['text'][:96]}")
                for a in q["answers"]:
                    if not a["correct"]:
                        print(f"         ✗ {a['text'][:96]}")
                print()


def main():
    slugs = sys.argv[1:] or [
        p.stem
        for p in sorted(QUIZ_DIR.glob("*.ts"))
        if p.stem not in {"index", "types"}
    ]
    for slug in slugs:
        report(slug, verbose=len(sys.argv) > 1)


if __name__ == "__main__":
    main()
