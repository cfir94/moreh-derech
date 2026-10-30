import type { CrosswordNotebook } from "@/data/crossword/types";

/**
 * The 19 course notebooks the crossword draws its words from, in syllabus
 * order. `notebookId` is the NotebookLM id; the bank is filled by asking each
 * notebook for its people, events, places and terms (docs/crossword.md).
 */
export const CROSSWORD_NOTEBOOKS: CrosswordNotebook[] = [
  { id: "geology-a", title: "גאולוגיה א׳", short: "גאולוגיה א׳", notebookId: "a2ec758d-63dd-4006-bd88-6daf8e6acf9b", color: "var(--rose)" },
  { id: "geology-b", title: "גאולוגיה ב׳", short: "גאולוגיה ב׳", notebookId: "688ad1a8-ac54-41b3-82b7-c0281f16a647", color: "var(--rose)" },
  { id: "flora-fauna-a", title: "חי וצומח א׳", short: "חי וצומח א׳", notebookId: "29cf720c-5ce5-4f15-bf3e-503bbf5d582a", color: "var(--green)" },
  { id: "flora-fauna-b", title: "חי וצומח ב׳", short: "חי וצומח ב׳", notebookId: "678f8153-31a2-4cee-bb4e-318353705fb9", color: "var(--green)" },
  { id: "borders-intro", title: "מבוא לגבולות ארץ ישראל", short: "מבוא לגבולות", notebookId: "1aa0b310-e74f-4127-852f-7c374c786bdd", color: "var(--teal)" },
  { id: "borders", title: "גבולות ארץ ישראל", short: "גבולות", notebookId: "fbce2f5c-3ae7-478a-aef7-6869cb84952f", color: "var(--teal)" },
  { id: "archaeology-intro", title: "מבוא לארכיאולוגיה", short: "מבוא לארכיאולוגיה", notebookId: "98e0faca-5ea0-42bc-99c2-763a646bfd87", color: "var(--gold)" },
  { id: "prehistory", title: "פרהיסטוריה", short: "פרהיסטוריה", notebookId: "d407b5f1-3dc0-49a8-b88e-97ac086a4b75", color: "var(--violet)" },
  { id: "bronze", title: "תקופת הברונזה", short: "ברונזה", notebookId: "aaf4d95b-6aba-44a5-889a-0dc294f3414d", color: "var(--rose)" },
  { id: "iron1", title: "ברזל א׳", short: "ברזל א׳", notebookId: "049b364f-2dfd-4dc2-8b0b-26f8f9797872", color: "var(--blue)" },
  { id: "iron2", title: "ברזל ב׳", short: "ברזל ב׳", notebookId: "60ee95aa-2ddf-4f0a-9609-925833a4efc7", color: "var(--blue)" },
  { id: "second-temple", title: "בית שני", short: "בית שני", notebookId: "e1eef0d4-ef58-4296-92d1-e8eb32859abc", color: "var(--gold)" },
  { id: "roman-byzantine", title: "התקופה הרומית המאוחרת והתקופה הביזנטית", short: "רומית־ביזנטית", notebookId: "35a76d16-c61b-42f8-aeea-bb60af7a6303", color: "var(--violet)" },
  { id: "classical-architecture", title: "מושגי יסוד באדריכלות קלאסית", short: "אדריכלות קלאסית", notebookId: "3c37ca0a-7c26-49f8-b23e-58cfe9c69d14", color: "var(--gold)" },
  { id: "judaism-b", title: "יהדות ב׳", short: "יהדות ב׳", notebookId: "0260c30c-37ba-45fa-8e3b-7e74a1705085", color: "var(--blue)" },
  { id: "judaism-c", title: "יהדות ג׳", short: "יהדות ג׳", notebookId: "a8757f6a-476e-4fff-abe5-7b97d7911dc7", color: "var(--blue)" },
  { id: "christianity-a", title: "נצרות א׳", short: "נצרות א׳", notebookId: "78eb78ed-77c8-4b1d-b5b0-dc6dfb7f02ef", color: "var(--violet)" },
  { id: "christianity-b", title: "נצרות ב׳", short: "נצרות ב׳", notebookId: "d4b2d38a-0810-4580-9ca5-6403ff71bd74", color: "var(--violet)" },
  { id: "christianity-c", title: "נצרות ג׳", short: "נצרות ג׳", notebookId: "facc56ee-64d3-47a3-9286-15253b683919", color: "var(--violet)" },
];

export const NOTEBOOK_BY_ID = new Map(CROSSWORD_NOTEBOOKS.map((notebook) => [notebook.id, notebook]));
