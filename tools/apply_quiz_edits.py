"""
Apply hand-written edits to an imported quiz.

The topical quizzes came from older projects and are not regenerated from a
source, so improving one means editing its data. Doing that in place, by hand,
would be unreviewable; instead each quiz has an edits file under
tools/quiz_edits/<slug>.json saying what to drop, what to replace and what to
add, with a reason. Running this applies them to src/data/quizzes/<slug>.ts.

The file is written to be run more than once: a question already dropped stays
dropped, a replacement is idempotent, and an added question is recognised by
its text so it is not added twice.

    python3 tools/apply_quiz_edits.py flora-fauna
"""

import json
import sys
from pathlib import Path

from topics import topic_of

ROOT = Path(__file__).resolve().parent.parent
EDIT_DIR = Path(__file__).resolve().parent / "quiz_edits"


def load_quiz(path):
    text = path.read_text()
    start = text.index("{", text.index("const quiz"))
    end = text.rindex("}") + 1
    return text[:start], json.loads(text[start:end]), text[end:]


def as_answers(rows):
    return [{"text": text, "correct": bool(correct)} for text, correct in rows]


def main():
    slug = sys.argv[1]
    quiz_file = ROOT / f"src/data/quizzes/{slug}.ts"
    edits = json.loads((EDIT_DIR / f"{slug}.json").read_text())
    header, quiz, footer = load_quiz(quiz_file)

    drop = {int(k) for k in edits.get("drop", {})}
    kept = [q for q in quiz["questions"] if q["id"] not in drop]

    replace = {int(k): v for k, v in edits.get("replace", {}).items()}
    for question in kept:
        change = replace.get(question["id"])
        if not change:
            continue
        if "question" in change:
            question["question"] = change["question"]
        if "answers" in change:
            question["answers"] = as_answers(change["answers"])
        if "category" in change:
            question["category"] = change["category"]
        if "explanation" in change:
            question["explanation"] = change["explanation"]

    existing = {q["question"].strip() for q in kept}
    next_id = max(q["id"] for q in kept) + 1
    added = 0
    for new in edits.get("add", []):
        if new["question"].strip() in existing:
            continue
        kept.append(
            {
                "id": next_id,
                "question": new["question"],
                "category": new["category"],
                "answers": as_answers(new["answers"]),
                "explanation": new.get("explanation", ""),
            }
        )
        next_id += 1
        added += 1

    for question in kept:
        question.setdefault(
            "topic",
            topic_of(
                question["id"],
                question["question"],
                [a["text"] for a in question["answers"]],
            ),
        )

    quiz["questions"] = kept
    quiz["categories"] = [
        c for c in quiz["categories"] if any(q["category"] == c for q in kept)
    ] + sorted({q["category"] for q in kept} - set(quiz["categories"]))

    quiz_file.write_text(
        header + json.dumps(quiz, ensure_ascii=False, indent=2) + footer
    )

    bad = [q for q in kept if sum(a["correct"] for a in q["answers"]) != 1]
    print(
        f"{slug}: {len(kept)} questions"
        f" (dropped {len(drop)}, replaced {len(replace)}, added {added})"
        + (f" — WITHOUT ONE CORRECT ANSWER: {[q['id'] for q in bad]}" if bad else "")
    )
    sizes = {len(q["answers"]) for q in kept}
    print(f"   option counts present: {sorted(sizes)}")


if __name__ == "__main__":
    main()
