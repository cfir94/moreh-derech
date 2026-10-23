# Historical identity game — מי אני?

Native Next.js route: /games/who-am-i/. Added to Games, home and site search. The existing עזרי למידה naming remains intact.

117 unique characters, four requested course notebooks, five period filters:
- Iron I: 15; includes the later figures discussed in the lecture's Mizpah context.
- Iron II / First Temple: 35.
- Second Temple: 38, including Pompey, Pilate, Vespasian and Titus.
- Roman and Byzantine notebook: 34 (split into Roman / Byzantine filters).
Overlapping people appear only once per round.

Sources: the four notebooks in src/data/who-am-i/index.ts. NotebookLM extraction was restricted to original lecturer audio and the concepts handouts, excluding generated briefings. Each person carries lecture titles and source IDs. Biblical and rabbinic traditions are identified as traditions. Judges 3 supplements the otherwise uninformative Ehud and Othniel clues; linked separately.

Question modes: balanced randomized mix (default), multiple choice, or typed name. Round lengths 10 / 20 / all. Explicit alias matching ignores niqqud and punctuation, accepts specified English names and ordinals, and rejects ambiguous or incomplete names. Four distinct options come from the selected periods; a review of one missed figure still gets four distractors from the original selection. Score, streak, optional hints, skip, reveal, and missed-only review. Session state is ephemeral; there is no account or cloud schema change.

Images: 95 new local WebP assets plus 22 existing reviewed portraits. All candidates were inspected on contact sheets. Transparent historical engravings were composited on white. Every figure has an image; artifact/site context is explicitly labeled where an identified likeness is unavailable. Rejected: Fayum portrait falsely identified as Egeria, uncertain Hazael sculpture, unqualified identification of the Necho statuette. Egeria uses the surviving manuscript; Hazael uses the Tel Dan stele; Necho caption states the I/II ambiguity. Metadata and free-license attribution are in portraits.json. Existing Varus and Theodosius I portraits are untouched.

Validation workflow: .github/workflows/validate-who-am-i.yml. Meaningful logic/data checks, ESLint, static production build, Chromium mixed/typed playthrough, score and single-mistake review, filtering, keyboard submission, mobile widths down to 320px, and actual decoding of all 117 images. Review screenshots are retained as a CI artifact.

Continuity: baseline main f94d6eaf1039ccdcb1af030503839a65a382251a. The canonical private project notebook was last saved as Library version26. Local execution and file creation are blocked by a runner sandbox path error (file:///workspace on Windows), preventing the normal Library replacement flow. This public implementation note contains no private notebook body and does not replace the canonical notebook.
