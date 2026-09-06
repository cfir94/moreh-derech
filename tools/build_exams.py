"""
Build every licensing sitting we hold an answer key for, in all three of its
published languages, and write them into the site.

One script for the whole pipeline, because the two outputs must never drift:

  * src/data/exams/<slug>.ts — the full sitting for exam mode
  * src/data/exams/index.ts  — the list of sittings
  * src/data/quizzes/past-exams.ts — the same questions as single-question
    practice, in Hebrew, under the sitting's category

A question carries the same id in both, so a mistake made in exam mode joins
the ordinary review queue.

Sittings come in two kinds, and the site never blurs them:

  * SITTINGS — the official answer key marks the correct option in the PDF.
    Where more than one language edition is marked, they cross-check each other.
  * DERIVED — the 2016-2019 papers, for which no key was ever published. The
    owner asked for them anyway, so their answers were worked out by hand and
    live in tools/answer_keys/<slug>.txt, each with a confidence. They are
    labelled as unofficial everywhere they appear, and a low-confidence answer
    says so on the results screen.

Summer 2020, summer 2022, summer 2024, winter 2025 and summer 2025 have neither
a key nor a worked answer, so they are not here at all.

Usage (from the repo root, with the PDF folders alongside):
    python3 tools/build_exams.py --pdfs /path/to/exam/pdfs
"""

import argparse
import json
import re
import sys
from pathlib import Path

from parse_exam import parse
from parse_exam_2026 import parse as parse_2026
from topics import LABELS as TOPIC_LABELS, TOPICS, topic_of

ROOT = Path(__file__).resolve().parent.parent
QUIZ_FILE = ROOT / "src/data/quizzes/past-exams.ts"
EXAM_DIR = ROOT / "src/data/exams"
TOPIC_FILE = ROOT / "src/data/topics.ts"
KEY_DIR = Path(__file__).resolve().parent / "answer_keys"

LANGS = ("he", "en", "ar")

# Sittings in chronological order. `id_base` is frozen per sitting: question ids
# are `id_base + item number`, so re-running this never renumbers a sitting that
# did not change, and a new sitting cannot collide with an old one.
SITTINGS = [
    {
        "slug": "winter-2021",
        "id_base": 1000,
        "category": "חורף 2021",
        "date": "חורף 2021",
        "label": {
            "he": "מבחן רישוי — חורף 2021",
            "en": "Licensing Exam — Winter 2021",
            "ar": "امتحان الترخيص — شتاء 2021",
        },
        "sources": {
            "he": "2021/multiple_choice_he_winter_2021.pdf",
            "en": "2021/multiple_choice_en_winter_2021.pdf",
            "ar": "2021/multiple_choice_ar_winter_2021.pdf",
        },
    },
    {
        "slug": "winter-2022",
        "id_base": 2000,
        "category": "חורף 2022",
        "date": "חורף 2022",
        "label": {
            "he": "מבחן רישוי — חורף 2022",
            "en": "Licensing Exam — Winter 2022",
            "ar": "امتحان الترخيص — شتاء 2022",
        },
        "sources": {
            "he": "2022/multiple_choice_he_winter_2022_resolved.pdf",
            "en": "2022/multiple_choice_en_winter_2022.pdf",
            "ar": "2022/multiple_choice_ar_winter_2022.pdf",
        },
    },
    {
        "slug": "summer-2023",
        "id_base": 3000,
        "category": "קיץ 2023",
        "date": "קיץ 2023",
        "label": {
            "he": "מבחן רישוי — קיץ 2023",
            "en": "Licensing Exam — Summer 2023",
            "ar": "امتحان الترخيص — صيف 2023",
        },
        "sources": {
            "he": "2023/AmericanQuestionnaireSolution Summer2023Hebrew.pdf",
            "en": "2023/2023-multiple-choice-english.pdf",
            "ar": "2023/2023-multiple-choice-arabic.pdf",
        },
    },
    {
        "slug": "july-2024",
        "id_base": 4000,
        "category": "יולי 2024",
        "date": "יולי 2024",
        "label": {
            "he": "מבחן רישוי — יולי 2024",
            "en": "Licensing Exam — July 2024",
            "ar": "امتحان الترخيص — تموز 2024",
        },
        "sources": {
            "he": "2024/answers-theory-test-july-2024-hebrew.pdf",
            "en": "2024/answers-theory-test-july-2024-english.pdf",
            "ar": "2024/answers-theory-test-july-2024-arabic.pdf",
        },
    },
    {
        "slug": "january-2025",
        "id_base": 5000,
        "category": "ינואר 2025",
        "date": "ינואר 2025",
        "label": {
            "he": "מבחן רישוי — ינואר 2025",
            "en": "Licensing Exam — January 2025",
            "ar": "امتحان الترخيص — كانون الثاني 2025",
        },
        "sources": {
            "he": "2025/january-test-part-a-hebrew.pdf",
            "en": "2025/january-test-part-a-english.pdf",
            "ar": "2025/january-test-part-a-arabic.pdf",
        },
    },
    {
        "slug": "july-2025",
        "id_base": 6000,
        "category": "יולי 2025",
        "date": "יולי 2025",
        "label": {
            "he": "מבחן רישוי — יולי 2025",
            "en": "Licensing Exam — July 2025",
            "ar": "امتحان الترخيص — تموز 2025",
        },
        "sources": {
            "he": "2025/Part1_jul2025_He.pdf",
            "en": "2025/Part1_jul2025_En.pdf",
            "ar": "2025/Part1_jul2025_Ar.pdf",
        },
    },
]

# The 2026 papers, which the Ministry rebuilt: two independent sections of 45
# rather than 33 paired items, so 90 graded questions instead of 33. Hebrew
# only — that is the edition we hold — and read by tools/parse_exam_2026.py,
# since the old parser assumes the pairing.
SITTINGS_2026 = [
    {
        "slug": "january-2026",
        "id_base": 12000,
        "category": "ינואר 2026",
        "date": "ינואר 2026",
        "label": {
            "he": "מבחן רישוי — ינואר 2026",
            "en": "Licensing Exam — January 2026",
            "ar": "امتحان الترخيص — كانون الثاني 2026",
        },
        "source": "exams2026/jan2026-a.pdf",
    },
    {
        "slug": "july-2026",
        "id_base": 13000,
        "category": "יולי 2026",
        "date": "יולי 2026",
        "label": {
            "he": "מבחן רישוי — יולי 2026",
            "en": "Licensing Exam — July 2026",
            "ar": "امتحان الترخيص — تموز 2026",
        },
        "source": "exams2026/july2026-a.pdf",
    },
]

# Sittings with no published key. `key` names a file in tools/answer_keys/,
# one line per question: "<number> <answer index 0-3> <h|m|l confidence>".
DERIVED_SITTINGS = [
    {
        "slug": "summer-2016",
        "id_base": 7000,
        "category": "יוני 2016",
        "date": "יוני 2016",
        "label": {
            "he": "מבחן רישוי — יוני 2016",
            "en": "Licensing Exam — June 2016",
            "ar": "امتحان الترخيص — حزيران 2016",
        },
        "source": "old/multi_q_summer_2016.pdf",
    },
    {
        "slug": "winter-2016",
        "id_base": 8000,
        "category": "נובמבר 2016",
        "date": "נובמבר 2016",
        "label": {
            "he": "מבחן רישוי — נובמבר 2016",
            "en": "Licensing Exam — November 2016",
            "ar": "امتحان الترخيص — تشرين الثاني 2016",
        },
        "source": "old/multi_q_winter_2016-17.pdf",
    },
    {
        "slug": "winter-2017",
        "id_base": 9000,
        "category": "נובמבר 2017",
        "date": "נובמבר 2017",
        "label": {
            "he": "מבחן רישוי — נובמבר 2017",
            "en": "Licensing Exam — November 2017",
            "ar": "امتحان الترخيص — تشرين الثاني 2017",
        },
        "source": "old/mc_question_oct-nov_2017.pdf",
    },
    {
        "slug": "summer-2018",
        "id_base": 10000,
        "category": "יוני 2018",
        "date": "יוני 2018",
        "label": {
            "he": "מבחן רישוי — יוני 2018",
            "en": "Licensing Exam — June 2018",
            "ar": "امتحان الترخيص — حزيران 2018",
        },
        "source": "old/mc_ques_june_2018.pdf",
    },
    {
        "slug": "summer-2019",
        "id_base": 11000,
        "category": "יוני 2019",
        "date": "יוני 2019",
        "label": {
            "he": "מבחן רישוי — יוני 2019",
            "en": "Licensing Exam — June 2019",
            "ar": "امتحان الترخيص — حزيران 2019",
        },
        "source": "old/multi_q_summer_2019.pdf",
    },
]

BRACKET_RE = re.compile(r"[\[(]([^\[\]()]{2,80})[\])]")

QUIZ_HEADER = """// Auto-generated by tools/build_exams.py from the official answer keys of the
// Ministry of Tourism licensing exams. Only the four-option comprehension half
// of each item is here, and only where the key marks exactly one answer. Do not
// edit by hand — see CLAUDE.md.
import type { Quiz } from "@/data/quizzes/types";

const quiz: Quiz = """

EXAM_HEADER = """// Auto-generated by tools/build_exams.py from the official answer key of this
// sitting, in every language it was published in. Each answer was checked
// against the editions that carry their own marking: the marked option has to
// sit at the same index in all of them. Do not edit by hand.
import type { Exam } from "@/data/exams/types";

const exam: Exam = """


def tidy(q):
    """
    Move the fill-in half's leftovers out of the comprehension question.

    The two halves are printed as one paragraph, and the bracketed answer the
    key adds does not always land where the line breaks: it can open the next
    line, dragging the tail of its own sentence with it. When an edition has no
    answer of its own and its question opens with a bracketed group, that group
    is that answer and anything before it belongs to the statement.
    """
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
                q["statement"][lang] = (
                    q["statement"][lang] + " " + text[: i + 1]
                ).strip()
                text = text[i + 2 :].strip()

        q["question"][lang] = text
    return q


def correct_index(item):
    if not item or not item.get("marksOk", True):
        return None
    marks = [i for i, a in enumerate(item["answers"]) if a["correct"]]
    return marks[0] if len(marks) == 1 else None


def build_sitting(sitting, pdf_dir):
    parsed, keyed = {}, {}
    for lang in LANGS:
        path = pdf_dir / sitting["sources"][lang]
        items, problems, found = parse(str(path), lang)
        parsed[lang] = {i["number"]: i for i in items}
        # An edition without a key still has a stray bold word or two. Its marks
        # are only worth cross-checking against when it marks most of the paper.
        marked = sum(1 for i in items if i["marksOk"])
        keyed[lang] = marked >= 0.6 * len(items) if items else False
        print(
            f"  {lang}: {len(items)}/{found} items"
            f", {marked} marked{' (key)' if keyed[lang] else ''}",
            file=sys.stderr,
        )

    if not keyed["he"]:
        raise SystemExit(f"{sitting['slug']}: the Hebrew edition carries no key")

    questions, dropped = [], []
    for n in sorted(parsed["he"]):
        idx = correct_index(parsed["he"][n])
        if idx is None:
            dropped.append((n, "no single marked answer in Hebrew"))
            continue

        conflict = False
        for lang in ("en", "ar"):
            if not keyed[lang]:
                continue
            other = correct_index(parsed[lang].get(n))
            if other is not None and other != idx:
                conflict = True
                print(
                    f"  ! Q{n}: {lang} marks answer {other + 1}, Hebrew {idx + 1}",
                    file=sys.stderr,
                )
        if conflict:
            dropped.append((n, "editions disagree on the answer"))
            continue

        def field(name):
            return {
                lang: (parsed[lang].get(n) or {}).get(name) or "" for lang in LANGS
            }

        answers = []
        for i in range(4):
            answers.append(
                {
                    "text": {
                        lang: (
                            parsed[lang][n]["answers"][i]["text"]
                            if n in parsed[lang]
                            else ""
                        )
                        for lang in LANGS
                    }
                }
            )

        question = tidy(
            {
                    "number": n,
                    "quizId": sitting["id_base"] + n,
                    "statement": field("statement"),
                    "statementAnswer": field("statementAnswer"),
                    "question": field("question"),
                    "answers": answers,
                    "correctIndex": idx,
            }
        )
        question["topic"] = topic_of(
            question["quizId"],
            question["question"]["he"],
            [a["text"]["he"] for a in question["answers"]],
        )
        questions.append(question)

    if dropped:
        print(f"  dropped: {dropped}", file=sys.stderr)

    # A language is offered only if it carries text for every question kept and
    # that text came out clean. A file that scatters zero-width letters beside
    # real ones (the 2023 Arabic edition) reads as a spray of one-letter words,
    # which no reader should be handed: two per cent of words is normal ("a",
    # "in", a digit), eighteen is a broken file.
    languages = []
    for lang in LANGS:
        if not all(
            q["question"][lang] and q["answers"][0]["text"][lang] for q in questions
        ):
            print(f"  {lang}: incomplete text, not offered", file=sys.stderr)
            continue
        words = [
            w
            for q in questions
            for text in [q["question"][lang]] + [a["text"][lang] for a in q["answers"]]
            for w in text.split()
        ]
        stray = sum(1 for w in words if len(w) == 1 and w.isalpha()) / max(1, len(words))
        if stray > 0.08:
            print(
                f"  {lang}: {stray:.0%} stray one-letter words, not offered",
                file=sys.stderr,
            )
            continue
        languages.append(lang)
    print(f"  -> {len(questions)} questions, languages {languages}", file=sys.stderr)

    return {
        "slug": sitting["slug"],
        "label": sitting["label"],
        "date": sitting["date"],
        "languages": languages,
        "keySource": "official",
        "questions": questions,
    }


def build_derived(sitting, pdf_dir):
    """
    A sitting whose answers were worked out by hand rather than read off a key.

    The questions still come from the PDF — only the answer index and its
    confidence come from tools/answer_keys/. These papers are Hebrew-only and
    single-part: 50 standalone questions, no fill-in half.
    """
    key_file = KEY_DIR / f"{sitting['slug']}.txt"
    key = {}
    for line in key_file.read_text().split("\n"):
        if not line.strip():
            continue
        number, answer, confidence = line.split()
        key[int(number)] = (int(answer), confidence)

    # The 2016-2019 papers are 50 questions long, not 33.
    items, problems, found = parse(
        str(pdf_dir / sitting["source"]), "he", expected_count=len(key)
    )
    print(f"  he: {len(items)}/{found} items, {len(key)} worked answers", file=sys.stderr)

    questions = []
    for item in items:
        n = item["number"]
        if n not in key:
            print(f"  ! Q{n}: no worked answer, dropped", file=sys.stderr)
            continue
        answer, confidence = key[n]
        quiz_id = sitting["id_base"] + n
        questions.append(
            {
                "topic": topic_of(
                    quiz_id, item["question"], [a["text"] for a in item["answers"]]
                ),
                "number": n,
                "quizId": quiz_id,
                "statement": {lang: "" for lang in LANGS},
                "statementAnswer": {lang: "" for lang in LANGS},
                "question": {"he": item["question"], "en": "", "ar": ""},
                "answers": [
                    {"text": {"he": a["text"], "en": "", "ar": ""}}
                    for a in item["answers"]
                ],
                "correctIndex": answer,
                "confidence": confidence,
            }
        )

    unsure = [q["number"] for q in questions if q["confidence"] != "h"]
    print(
        f"  -> {len(questions)} questions, {len(unsure)} of them less certain:"
        f" {unsure}",
        file=sys.stderr,
    )
    return {
        "slug": sitting["slug"],
        "label": sitting["label"],
        "date": sitting["date"],
        "languages": ["he"],
        "keySource": "derived",
        "questions": questions,
    }


def build_2026(sitting, pdf_dir):
    """
    A 2026-format sitting: 45 fill-in items, then 45 four-option items.

    Nothing is paired, so `statement` stays empty throughout and the two halves
    differ only in `kind`. The runner already renders a fill item as a typed
    answer and skips an empty statement, so this needs no component of its own.
    """
    items, problems = parse_2026(str(pdf_dir / sitting["source"]))
    fills = sum(1 for i in items if i["kind"] == "fill")
    print(
        f"  he: {len(items)} items ({fills} fill, {len(items) - fills} mc)",
        file=sys.stderr,
    )
    for why in problems:
        print(f"  ! {why}", file=sys.stderr)

    questions = []
    for item in items:
        quiz_id = sitting["id_base"] + item["number"]
        options = [a["text"] for a in item.get("answers", [])]
        q = {
            "topic": topic_of(quiz_id, item["question"], options),
            "number": item["number"],
            "quizId": quiz_id,
            "kind": item["kind"],
            "statement": {lang: "" for lang in LANGS},
            "statementAnswer": {lang: "" for lang in LANGS},
            "question": {"he": item["question"], "en": "", "ar": ""},
            "answers": [
                {"text": {"he": t, "en": "", "ar": ""}} for t in options
            ],
            "correctIndex": item.get("correctIndex", 0),
        }
        if item["kind"] == "fill":
            q["answerText"] = item["answerText"]
        questions.append(q)

    return {
        "slug": sitting["slug"],
        "label": sitting["label"],
        "date": sitting["date"],
        "languages": ["he"],
        "keySource": "official",
        "questions": questions,
    }


def load_generated(slug):
    """
    A sitting read back from the file this script wrote for it earlier.

    The archive of Ministry PDFs is not kept in the repo, so a run that only
    adds a new sitting would otherwise have to re-download eleven papers to
    rewrite index.ts and past-exams.ts — both of which are built from the whole
    list. Reading the untouched sittings back keeps one script in charge of the
    pipeline without demanding every source it ever consumed.
    """
    text = (EXAM_DIR / f"{slug}.ts").read_text()
    start = text.index("{", text.index("const exam"))
    return json.loads(text[start : text.rindex("}") + 1])


def load_quiz():
    text = QUIZ_FILE.read_text()
    start = text.index("{", text.index("const quiz"))
    return json.loads(text[start : text.rindex("}") + 1])


def write_site(exams, sittings):
    EXAM_DIR.mkdir(parents=True, exist_ok=True)
    for exam in exams:
        (EXAM_DIR / f"{exam['slug']}.ts").write_text(
            EXAM_HEADER
            + json.dumps(exam, ensure_ascii=False, indent=2)
            + ";\n\nexport default exam;\n"
        )

    newest_first = list(reversed(exams))
    imports = "\n".join(
        f'import {slug_var(e["slug"])} from "@/data/exams/{e["slug"]}";'
        for e in newest_first
    )
    listed = ", ".join(slug_var(e["slug"]) for e in newest_first)
    (EXAM_DIR / "index.ts").write_text(
        "// Auto-generated by tools/build_exams.py — do not edit by hand.\n"
        'import type { Exam } from "@/data/exams/types";\n'
        'import { COURSE_EXAMS } from "@/data/exams/course";\n'
        f"{imports}\n\n"
        "/** The Ministry's own sittings, newest first, then the course's own\n"
        " *  practice exams. */\n"
        f"export const MINISTRY_EXAMS: Exam[] = [{listed}];\n\n"
        "export const EXAMS: Exam[] = [...MINISTRY_EXAMS, ...COURSE_EXAMS];\n\n"
        "export function getExam(slug: string): Exam | undefined {\n"
        "  return EXAMS.find((e) => e.slug === slug);\n"
        "}\n"
    )

    # Rebuild the past-exams quiz: sittings we generate, plus any category that
    # came from elsewhere and still has no exam of its own.
    # The category carries the warning, because it is what the quiz shows on the
    # chip, in the results and in the review list — everywhere one of these
    # questions can surface.
    def category_of(sitting, exam):
        if exam.get("keySource") == "derived":
            return sitting["category"] + " · תשובות לא רשמיות"
        return sitting["category"]

    categories = [category_of(s, e) for s, e in zip(sittings, exams)]

    quiz = load_quiz()
    ours = set(categories) | {s["category"] for s in sittings}
    kept = [q for q in quiz["questions"] if q["category"] not in ours]
    for q in kept:
        # Questions inherited from the older extractor still need a subject.
        q.setdefault(
            "topic",
            topic_of(q["id"], q["question"], [a["text"] for a in q["answers"]]),
        )

    generated = []
    for category, exam in zip(categories, exams):
        for q in exam["questions"]:
            # The 2026 papers' fill-in half has no options, so it cannot become
            # a four-option practice question. It is still sat in exam mode.
            if q.get("kind") == "fill":
                continue
            generated.append(
                {
                    "id": q["quizId"],
                    "question": q["question"]["he"],
                    "category": category,
                    "topic": q["topic"],
                    "answers": [
                        {
                            "text": a["text"]["he"],
                            "correct": i == q["correctIndex"],
                        }
                        for i, a in enumerate(q["answers"])
                    ],
                }
            )

    quiz["questions"] = generated + kept
    quiz["categories"] = categories + sorted({q["category"] for q in kept})
    QUIZ_FILE.write_text(
        QUIZ_HEADER
        + json.dumps(quiz, ensure_ascii=False, indent=2)
        + ";\n\nexport default quiz;\n"
    )
    print(
        f"\npast-exams quiz: {len(generated)} generated + {len(kept)} kept",
        file=sys.stderr,
    )


# Each subject's own summary on Efrat Nakash's site — the thing to go and read
# after missing a question. Keyed by the title of the link in resources.ts.
TOPIC_READING = {
    "prehistory": "פרהיסטוריה בארץ ישראל",
    "bible": "תקופת הבית הראשון וארכאולוגיה של התקופות הקדומות",
    "second-temple": "תקופת הבית השני",
    "roman-byzantine": "התקופה הרומית-ביזנטית, ארכאולוגיה קלאסית ויהודית",
    "early-islam": "התקופה הערבית הקדומה",
    "crusader": "התקופה הצלבנית",
    "mamluk-ottoman": "התקופה המוסלמית-ערבית השנייה",
    "modern-yishuv": "העת החדשה",
    "state": "מדינת ישראל מהקמתה ועד היום",
    "jerusalem": "ירושלים לדורותיה",
    "geology": "גאולוגיה וגאומורפולוגיה",
    "water-climate": "הידרולוגיה ומשאבי המים של ישראל",
    "flora-fauna": "הצומח בארץ ישראל",
    "geography": "מבוא לארץ ישראל – דרכים",
    "judaism": "יהדות",
    "christianity": "נצרות",
    "islam": "אסלאם",
    "minorities": "מיעוטים ופולקלור במדינת ישראל",
    "art-arch": "סגנונות אדריכליים ואמנותיים",
    "tourism": "תיירות בישראל",
}


def write_topics():
    """The subject list, with the summary to read for each."""
    resources = (ROOT / "src/data/resources.ts").read_text()
    urls = dict(
        re.findall(r'title: "([^"]+)", url: "([^"]+)"', resources)
    )

    rows = []
    for key, label, _ in TOPICS:
        title = TOPIC_READING.get(key)
        url = urls.get(title or "")
        reading = (
            f', reading: {{ title: {json.dumps(title, ensure_ascii=False)},'
            f" url: {json.dumps(url)} }}"
            if url
            else ""
        )
        rows.append(
            f"  {{ key: {json.dumps(key)}, label:"
            f" {json.dumps(label, ensure_ascii=False)}{reading} }},"
        )

    TOPIC_FILE.write_text(
        "// Auto-generated by tools/build_exams.py — do not edit by hand.\n"
        "//\n"
        "// The licensing syllabus, used as the subject axis of the question\n"
        "// bank. `reading` links to the free summary for that subject.\n"
        "export type Topic = {\n"
        "  key: string;\n"
        "  label: string;\n"
        "  reading?: { title: string; url: string };\n"
        "};\n\n"
        "export const TOPICS: Topic[] = [\n" + "\n".join(rows) + "\n];\n\n"
        "export const TOPIC_LABELS: Record<string, string> = Object.fromEntries(\n"
        "  TOPICS.map((t) => [t.key, t.label]),\n"
        ");\n\n"
        "export function topicOf(key?: string): Topic | undefined {\n"
        "  return TOPICS.find((t) => t.key === key);\n"
        "}\n"
    )
    print(f"topics: {len(rows)} subjects", file=sys.stderr)


def slug_var(slug):
    parts = slug.split("-")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdfs", default=".", help="folder holding the exam PDF folders")
    args = ap.parse_args()

    pdf_dir = Path(args.pdfs)
    exams = []
    for builder, group in (
        (build_derived, DERIVED_SITTINGS),
        (build_sitting, SITTINGS),
        (build_2026, SITTINGS_2026),
    ):
        for sitting in group:
            names = sitting.get("sources", {"he": sitting.get("source")}).values()
            if not all((pdf_dir / n).exists() for n in names if n):
                print(f"{sitting['slug']}: PDFs absent, kept as built",
                      file=sys.stderr)
                exams.append(load_generated(sitting["slug"]))
                continue
            print(f"{sitting['slug']}:", file=sys.stderr)
            exams.append(builder(sitting, pdf_dir))

    write_site(exams, DERIVED_SITTINGS + SITTINGS + SITTINGS_2026)
    write_topics()


if __name__ == "__main__":
    main()
