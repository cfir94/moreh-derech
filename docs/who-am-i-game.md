# Historical identity game — מי אני?

Native Next.js route: /games/who-am-i/. Added to Games, home and site search. The existing עזרי למידה naming remains intact.

195 unique characters, ten source notebooks, five historical period filters and two faith topics (see the expansion below):
- Iron I: 15; includes the later figures discussed in the lecture's Mizpah context.
- Iron II / First Temple: 35.
- Second Temple: 54, including Pompey, Pilate, Vespasian and Titus.
- Roman and Byzantine notebook: 35 (split into Roman / Byzantine filters).
Overlapping people appear only once per round.

Sources: the ten notebooks in src/data/who-am-i/index.ts. NotebookLM extraction was restricted to original lecturer audio and the concepts handouts, excluding generated briefings. Each person carries lecture titles and source IDs. Biblical and rabbinic traditions are identified as traditions. Judges 3 supplements the otherwise uninformative Ehud and Othniel clues; linked separately.

Question modes: balanced randomized mix (default), multiple choice, or typed name. Round lengths 10 / 20 / all. Explicit alias matching ignores niqqud and punctuation, accepts specified English names and ordinals, and rejects ambiguous or incomplete names. Four distinct options come from the selected topics and notebooks; a review of one missed figure still gets four distractors from the original selection. Score, streak, optional hints, skip, reveal, and missed-only review. Session state is ephemeral; there is no account or cloud schema change.

Images: 102 new local WebP assets plus 31 existing reviewed portraits. All candidates were inspected on contact sheets. Transparent historical engravings were composited on white. Every figure has an image; artifact/site context is explicitly labeled where an identified likeness is unavailable. Rejected: Fayum portrait falsely identified as Egeria, uncertain Hazael sculpture, unqualified identification of the Necho statuette. Egeria uses the surviving manuscript; Hazael uses the Tel Dan stele; Necho caption states the I/II ambiguity. Metadata and free-license attribution are in portraits.json. Existing Varus and Theodosius I portraits are untouched.

Validation workflow: .github/workflows/validate-who-am-i.yml. Meaningful logic/data checks, ESLint, static production build, Chromium mixed/typed playthrough, score and single-mistake review, filtering, keyboard submission, mobile widths down to 320px, and actual decoding of all 133 images. Review screenshots are retained as a CI artifact.

Continuity: baseline main f94d6eaf1039ccdcb1af030503839a65a382251a. The canonical private project notebook was last saved as Library version26. Local execution and file creation are blocked by a runner sandbox path error (file:///workspace on Windows), preventing the normal Library replacement flow. This public implementation note contains no private notebook body and does not replace the canonical notebook.

Initial 117-character version validation: https://github.com/cfir94/moreh-derech/actions/runs/39943065477 — all seven logic/data tests, ESLint, static production build and Chromium flow passed. Desktop/mobile screenshots were visually reviewed. All initial 117 images decoded successfully; no horizontal overflow at 320, 390, or 768px. The main validation workflow retains read-only permissions and normal artifact uploads; visual log output was used only for temporary review.

Coverage follow-up against the course concepts sheet and lecture 14 added 16 figures omitted by the initial extraction cap: Antony, Augustus, Varus, Quirinius, Tiberius, Caligula, Claudius, Nero, Cestius Gallus, Menahem, Simon bar Giora, Eleazar ben Simon, Ptolemy I, Seleucus I, Philo, Agrippa II. The latter two are named in the required concepts sheet but lack a detailed lecture treatment; their clues explicitly cite primary-source supplements (Philo's Embassy to Gaius; Josephus War II.16). The Tiberius/Claudius 41 CE transcription error remains corrected. Eight regression checks now cover alias discrimination and coverage. All previous game-engine behavior is unchanged.


## Faith topics and clue quality — 23 October 2026

- 195 unique people across 10 notebooks. Added Judaism A/B/C and Christianity A/B/C as two independent topic cards, with per-notebook selection for every topic.
- Reused existing identities across source notebooks; shared figures never appear twice in a round. Notebook filters apply only to selected topics, including when all books of one topic are disabled.
- Added 62 people and downloaded 62 attributed WebP images. Paintings, icons, late portraits, and context-only material are identified as such. Hillel II uses a calendar; Saadia uses a traditional prayer text; the Ari and Baal Shem Tov use grave photographs; Theodotus uses his inscription; Rashbi uses the traditional burial complex.
- Revised clues for 39 existing identities plus the Jehoram comparison. Removed own names, explicit nicknames, father names printed in the answer, name-derived locations, letter-count hints, and self-referential book titles. The reported Eleazar clue now describes his faction's actions without naming his father.
- Multiple-choice alternatives prioritize plausible peer groups, then role, gender, source book, and topic, while randomizing equally plausible candidates and answer positions.
- Religious narratives and traditional attributions are labelled; Gospel authorship, fixed-calendar attribution, and Zohar authorship are not presented as settled historical facts. Supplementary canonical passages are linked for James's execution and Martha's hospitality.
- Validation covers identity leakage regressions, six new source filters, cross-topic isolation, ambiguous names, revolt leader distractors, mixed/typed rounds, scoring and review, 320–768 px overflow, and browser decoding of all 195 portraits.
- Canonical project notebook: local file tools remain unavailable in this session (invalid Windows sandbox URI). This public implementation record contains only technical task details; it is not a replacement for the private continuity notebook.

### Clue audit identities

joshua, othniel, deborah, gideon, samson, samuel, jonathan, asa, jeroboam1, sennacherib, zedekiah, jeshua, haggai, ezra, antiochus4, aristobulus1, herod-great, archelaus, antipas, philip, trajan, quietus, gamaliel2, bar-kokhba, judah-prince, constantine, constantius, gallus, eusebius, bordeaux, egeria, antony, augustus, varus, tiberius, menachem, eleazar-simon, philo, agrippa2, jehoram-judah.
