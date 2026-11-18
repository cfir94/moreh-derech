# EB: rebuilding the licensing-exam bank with our own answers and topics

**Who:** Codex · **Supervised by:** Claude · **Written:** 18.11.2026.

## Why
The old bank, `exam-bank`, was built from Efrat Nakash's collection: the questions sorted into her topics, plus the answers she proposed. The legal research the owner commissioned (18.11) says her sorting and her solutions are protected works. The bank was taken off the site, and her file was removed from the repo.

The question texts themselves are the Ministry of Tourism's, from the licensing exams of 2000–2017. They stay.

**Missing:** the answers and the topic of each question. Both have to be ours.

## The input
`tools/exam_bank/items.json`: 2,634 questions. Each one has:
- `id`: unchanged, so users' progress is kept;
- `question`;
- `options`: four, in the printed order.

The file has no answer and no topic, and its order is shuffled. Don't go looking for the old answers anywhere (not in git history and not on the web). The answer must come from your own knowledge.

## The tasks: EB-01 … EB-09
Each task covers a range of positions in the file (not ids):

| Task | Positions | Output file |
|---|---|---|
| EB-01 | 0–299 | `tools/exam_bank/keys/01.txt` |
| EB-02 | 300–599 | `tools/exam_bank/keys/02.txt` |
| EB-03 | 600–899 | `tools/exam_bank/keys/03.txt` |
| EB-04 | 900–1199 | `tools/exam_bank/keys/04.txt` |
| EB-05 | 1200–1499 | `tools/exam_bank/keys/05.txt` |
| EB-06 | 1500–1799 | `tools/exam_bank/keys/06.txt` |
| EB-07 | 1800–2099 | `tools/exam_bank/keys/07.txt` |
| EB-08 | 2100–2399 | `tools/exam_bank/keys/08.txt` |
| EB-09 | 2400–2633 | `tools/exam_bank/keys/09.txt` |

## How to answer
One line per question, in this format (the same as `tools/answer_keys/*.txt`):

```
<id> <answer index 0-3> <h|m|l>
```

- **`h`:** you're sure, and it's knowledge a tour guide learns in the course.
- **`m`:** probable, but there's room for doubt.
- **`l`:** a guess. Also use `l` when:
  - the question depends on its year ("today", "this year", a figure that has changed since);
  - the question is broken;
  - more than one answer is correct.
- **`x` instead of an index:** the question can't be answered at all (missing text, empty options). Example: `40123 x l`.

Answer according to what was correct **when the exam was set** (2000–2017), not by what changed afterwards. When the answer has changed since, mark it `l`.

Don't add explanations to the file. If you have a note on a particular question, add a line to the report: `<id>: <note>`.

## Delivery
You can't push. Reply with:
1. **The file:** the whole thing, in a single ```text block.
2. **A short report** in a ```markdown block:
   - how many `h`, `m`, `l` and `x`;
   - questions that need a person to check them (id and one sentence each).

Claude saves the file, runs the import (see below) and spot-checks the answers against the course notebooks.

## After the last task (Claude)
`tools/import_exam_bank.py` will be rewritten to read `items.json` plus the keys. Each question gets:
- its topic from `tools/topics.py`, which is our own tagger;
- `source: "מבחני הרישוי של משרד התיירות, 2000–2017"`;
- a notice on screen: "התשובות נקבעו על ידינו ואינן מפתח רשמי", and a mark on every question that isn't `h`, as with the derived sittings.

The bank returns to the site in `src/data/quizzes/index.ts`.
