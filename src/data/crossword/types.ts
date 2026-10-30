/** One answer in the weekly crossword's bank, with the notebook it was drawn from. */
export type CrosswordEntry = {
  /** Stable id (`<notebook>:<answer>`). The schedule hashes it, so it is never renamed. */
  id: string;
  /** As written, words separated by spaces: "כנסיית הקבר". Only Hebrew letters count in the grid. */
  answer: string;
  /** The definition shown to the solver. It must not contain the answer. */
  clue: string;
  notebook: CrosswordNotebookId;
  /** One sentence from the notebook, shown after the puzzle is solved. */
  note?: string;
  kind?: "person" | "place" | "event" | "term" | "find" | "species";
  /**
   * The first week (a Friday, ISO date) this entry may appear in. A week's
   * puzzle depends only on entries already eligible when it began, so adding
   * entries never changes a puzzle someone has already played.
   */
  since: string;
  /** Retire instead of deleting: the entry stops appearing from this Friday on. */
  until?: string;
};

export type CrosswordNotebookId =
  | "prehistory"
  | "archaeology-intro"
  | "bronze"
  | "iron1"
  | "iron2"
  | "second-temple"
  | "roman-byzantine"
  | "classical-architecture"
  | "judaism-b"
  | "judaism-c"
  | "christianity-a"
  | "christianity-b"
  | "christianity-c"
  | "geology-a"
  | "geology-b"
  | "flora-fauna-a"
  | "flora-fauna-b"
  | "borders-intro"
  | "borders";

export type CrosswordNotebook = {
  id: CrosswordNotebookId;
  /** Full title, as the course names the notebook. */
  title: string;
  /** The chip next to a clue. */
  short: string;
  /** NotebookLM notebook id — what `ask_notebook` is called with. */
  notebookId: string;
  color: string;
};
