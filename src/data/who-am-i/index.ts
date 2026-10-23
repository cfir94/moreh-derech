import rawPeople from "./people.json";
import images from "./portraits.json";
import { LOCAL_PORTRAITS } from "@/data/roman-portraits";
import { HERODIAN_COMPANIONS } from "@/data/herodian-companions";
import type { Portrait } from "@/data/roman-people";

export type PeriodId = "iron1" | "iron2" | "temple" | "roman" | "byzantine" | "judaism" | "christianity";
export type BookId = "iron1" | "iron2" | "temple" | "roman-byzantine" | "judaism-a" | "judaism-b" | "judaism-c" | "christianity-a" | "christianity-b" | "christianity-c";
export type Person = {
  id: string; name: string; aliases: string[]; periods: PeriodId[]; books: BookId[];
  gender?: string; kind?: string;
  date: string; role: string; clues: string[]; distinction: string;
  sources: { label: string; href: string; sourceIds: string[] }[];
  supplement?: string; portrait: Portrait;
};
export const BOOKS: { id: BookId; label: string; href: string; periods: PeriodId[] }[] = [
  {
    "id": "iron1",
    "label": "ברזל א׳ — ההתנחלות והשופטים",
    "href": "https://notebook.google.com/notebook/049b364f-2dfd-4dc2-8b0b-26f8f9797872",
    "periods": [
      "iron1"
    ]
  },
  {
    "id": "iron2",
    "label": "ברזל ב׳ — ימי הבית הראשון",
    "href": "https://notebook.google.com/notebook/60ee95aa-2ddf-4f0a-9609-925833a4efc7",
    "periods": [
      "iron2"
    ]
  },
  {
    "id": "temple",
    "label": "ימי הבית השני",
    "href": "https://notebook.google.com/notebook/e1eef0d4-ef58-4296-92d1-e8eb32859abc",
    "periods": [
      "temple"
    ]
  },
  {
    "id": "roman-byzantine",
    "label": "התקופה הרומית והביזנטית",
    "href": "https://notebook.google.com/notebook/35a76d16-c61b-42f8-aeea-bb60af7a6303",
    "periods": [
      "roman",
      "byzantine"
    ]
  },
  {
    "id": "judaism-a",
    "label": "יהדות א׳ — מקרא, תורה שבעל פה וספרות",
    "href": "https://notebook.google.com/notebook/b3e29f0b-6779-4016-84b4-f1b58e5089c8",
    "periods": [
      "judaism"
    ]
  },
  {
    "id": "judaism-b",
    "label": "יהדות ב׳ — לוח השנה והמועדים",
    "href": "https://notebook.google.com/notebook/0260c30c-37ba-45fa-8e3b-7e74a1705085",
    "periods": [
      "judaism"
    ]
  },
  {
    "id": "judaism-c",
    "label": "יהדות ג׳ — תפילה, בית הכנסת והלכה",
    "href": "https://notebook.google.com/notebook/a8757f6a-476e-4fff-abe5-7b97d7911dc7",
    "periods": [
      "judaism"
    ]
  },
  {
    "id": "christianity-a",
    "label": "נצרות א׳ — יסודות האמונה והברית החדשה",
    "href": "https://notebook.google.com/notebook/78eb78ed-77c8-4b1d-b5b0-dc6dfb7f02ef",
    "periods": [
      "christianity"
    ]
  },
  {
    "id": "christianity-b",
    "label": "נצרות ב׳ — חיי ישוע ואתרי הבשורות",
    "href": "https://notebook.google.com/notebook/d4b2d38a-0810-4580-9ca5-6403ff71bd74",
    "periods": [
      "christianity"
    ]
  },
  {
    "id": "christianity-c",
    "label": "נצרות ג׳ — הכנסייה, נזירות וזרמים",
    "href": "https://notebook.google.com/notebook/facc56ee-64d3-47a3-9286-15253b683919",
    "periods": [
      "christianity"
    ]
  }
];
export const PERIODS: { id: PeriodId; label: string; dates: string; icon: string }[] = [
  { id: "iron1", label: "ברזל א׳ והשופטים", dates: "מאות 12–11 לפנה״ס והמעבר למלוכה", icon: "⚱" },
  { id: "iron2", label: "בית ראשון", dates: "המלוכה · עד 587/586 לפנה״ס", icon: "♜" },
  { id: "temple", label: "בית שני", dates: "שיבת ציון · עד 70 לספירה", icon: "✦" },
  { id: "roman", label: "רומא וחז״ל", dates: "חורבן · מרידות · משנה", icon: "⚔" },
  { id: "byzantine", label: "ביזנטיון", dates: "נצרות · קיסרים · נזירות", icon: "☩" },
  { id: "judaism", label: "לימודי יהדות", dates: "מקרא · חכמים · תפילה ומועדים", icon: "✡" },
  { id: "christianity", label: "לימודי נצרות", dates: "הברית החדשה · כנסייה · זרמים", icon: "☩" },
];
const portraits: Record<string, Portrait> = {
  ...LOCAL_PORTRAITS,
  ...Object.fromEntries(HERODIAN_COMPANIONS.map(portrait => [portrait.id, portrait])),
  ...images,
};
export const PEOPLE: Person[] = (rawPeople as Omit<Person, "portrait">[]).map(person => ({
  ...person, portrait: portraits[person.id],
}));
