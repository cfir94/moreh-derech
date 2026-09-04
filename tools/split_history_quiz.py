"""
Split "תקופות היסטוריות" into the three subjects it actually held.

The quiz came in from an older project as one 145-question pile covering
prehistory, the introduction to archaeology and the Bronze Age — three separate
subjects on the syllabus, examined separately in the course. One quiz that wide
cannot be used to revise for any of them: a run of twenty questions lands on
whatever it lands on.

The split is by category, not by guesswork: every one of the eleven categories
belongs to exactly one of the three subjects (see GROUPS). Question ids are kept
as they were, so a question keeps its identity inside its new quiz.

One-shot migration. It reads src/data/quizzes/history.ts, writes the three new
quizzes, and then history.ts is deleted by hand along with its entry in
src/data/quizzes/index.ts. The edits file tools/quiz_edits/history.json is split
the same way so later fixes stay per-quiz.

    python3 tools/split_history_quiz.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUIZ_DIR = ROOT / "src/data/quizzes"
EDIT_DIR = Path(__file__).resolve().parent / "quiz_edits"

HEADER = """// Split out of the old "תקופות היסטוריות" quiz by
// tools/split_history_quiz.py. Edit through tools/quiz_edits/{slug}.json and
// tools/apply_quiz_edits.py — not by hand.
import type {{ Quiz }} from "@/data/quizzes/types";

const quiz: Quiz = """

# (slug, label, the categories of the old quiz that belong to it)
GROUPS = [
    (
        "prehistory",
        "פרהיסטוריה",
        [
            "מבוא לפרהיסטוריה ואבולוציית האדם",
            "פליאולית",
            "אפיפליאולית והתרבות הנטופית",
            "ניאולית וכלקוליתי",
        ],
    ),
    (
        "archaeology-intro",
        "מבוא לארכיאולוגיה",
        [
            "יסודות בארכיאולוגיה",
            "שיטות חפירה, טיפולוגיה ותיארוך",
            "חלוצי המחקר הארכיאולוגי",
        ],
    ),
    (
        "bronze-age",
        "תקופת הברונזה",
        [
            "ברונזה קדומה",
            "ברונזה ביניימית",
            "ברונזה תיכונה",
            "ברונזה מאוחרת",
        ],
    ),
]


def load(path):
    text = path.read_text()
    start = text.index("{", text.index("const quiz"))
    return json.loads(text[start : text.rindex("}") + 1])


def main():
    old = load(QUIZ_DIR / "history.ts")
    placed = {c for _, _, cats in GROUPS for c in cats}
    stray = {q["category"] for q in old["questions"]} - placed
    if stray:
        raise SystemExit(f"categories not assigned to a subject: {sorted(stray)}")

    edits = json.loads((EDIT_DIR / "history.json").read_text())

    for slug, label, categories in GROUPS:
        questions = [q for q in old["questions"] if q["category"] in categories]
        quiz = {
            "slug": slug,
            "label": label,
            "categories": [
                c for c in categories if any(q["category"] == c for q in questions)
            ],
            "questions": questions,
        }
        (QUIZ_DIR / f"{slug}.ts").write_text(
            HEADER.format(slug=slug)
            + json.dumps(quiz, ensure_ascii=False, indent=2)
            + ";\n\nexport default quiz;\n"
        )

        ids = {str(q["id"]) for q in questions}
        (EDIT_DIR / f"{slug}.json").write_text(
            json.dumps(
                {
                    "note": edits.get("note", ""),
                    "drop": {k: v for k, v in edits.get("drop", {}).items() if k in ids},
                    "replace": {
                        k: v for k, v in edits.get("replace", {}).items() if k in ids
                    },
                    "add": [a for a in edits.get("add", []) if a["category"] in categories],
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n"
        )
        print(f"{slug:18s} {len(questions):3d} questions, {len(quiz['categories'])} categories")


if __name__ == "__main__":
    main()
