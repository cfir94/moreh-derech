# Course timeline sorting expansion — 25 October 2026
Three new sets (21 Second Temple, 26 Roman, 18 Byzantine; 65 cards) precede all seven unchanged existing sets. The existing pointer/arrow ordering, hidden dates, feedback, retry, reveal and progress IDs are preserved. New keys are second_temple_events, roman_events and byzantine_events. Source notebook links appear after checking an answer.

NotebookLM original course audio/PDFs were queried in all three requested notebooks:
e1eef0d4-ef58-4296-92d1-e8eb32859abc
35a76d16-c61b-42f8-aeea-bb60af7a6303
3c37ca0a-7c26-49f8-b23e-58cfe9c69d14
Second Temple: Eyal lessons 10–14, especially lesson11 (Persia), lesson12 (Hellenism), lesson13 (Hasmoneans), lesson14 parts1/2 (Herod/Rome/revolt).
Roman/Byzantine: the three original lectures on Mishnah/Talmud, Bar Kokhba and Byzantium, plus concepts PDF.
Architecture: the three original lectures, especially the core city-planning lecture and temples/walls/floors lecture.

Chronology review excludes vague overlapping building phases and unsupported precision. Herod's actual rule starts37BCE (not the erroneous31BCE transcript); his Roman appointment is40BCE. Vespasian's Galilee campaign67 precedes accession69; Titus's siege70 precedes accession79. Diocletian's accession284 is distinguished from tetrarchy293. Constantine's313 settlement is not the380 Nicene establishment. No false Nicaea325 patriarchate list. The429 card describes imperial handling of abolished patriarchate revenues, not a claim that GamalielVI died429. Julian's project363 is distinct from Julian ben Sabar's Samaritan revolt529. Approximate dates and Jerusalem637/638 are labelled. Architecture supplies context for Herodian Temple expansion and Justinian's Nea/Cardo without inventing a single year for a construction process.

Supplementary chronology checks: Metropolitan Museum, https://www.metmuseum.org/toah/hd/roru/hd_roru.htm and https://www.metmuseum.org/essays/the-roman-empire-27-b-c-393-a-d ; IAA Temple Mount expansion https://hadashot.iaa.org.il/report_detail_eng.aspx?id=1738 .

Validation: targeted lint, production build, real browser sorting and full-score/reveal/retry for all three new sets, hidden dates and mobile widths. Existing sets and IDs compared byte-for-byte in data parsing before commit.
Base: 364af79015642093c5d0b54ee517d47be8416e47.

Verified: https://github.com/cfir94/moreh-derech/actions/runs/40170138782 passed targeted ESLint, full production export, and all browser scenarios. All seven original sets compared equal after parsing. No changes to authentication, progress storage, or legacy set keys.
