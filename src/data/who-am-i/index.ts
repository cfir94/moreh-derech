import rawPeople from "./people.json";
import images from "./portraits.json";
import { LOCAL_PORTRAITS } from "@/data/roman-portraits";
import { HERODIAN_COMPANIONS } from "@/data/herodian-companions";
import type { Portrait } from "@/data/roman-people";

export type PeriodId = "iron1" | "iron2" | "temple" | "roman" | "byzantine";
export type BookId = "iron1" | "iron2" | "temple" | "roman-byzantine";
export type Person = {
  id: string; name: string; aliases: string[]; periods: PeriodId[]; books: BookId[];
  date: string; role: string; clues: string[]; distinction: string;
  sources: { label: string; href: string; sourceIds: string[] }[];
  supplement?: string; portrait: Portrait;
};
export const BOOKS: { id: BookId; label: string; href: string }[] = [
  {
    "id": "iron1",
    "label": "ברזל א׳ — ההתנחלות והשופטים",
    "href": "https://notebook.google.com/notebook/049b364f-2dfd-4dc2-8b0b-26f8f9797872"
  },
  {
    "id": "iron2",
    "label": "ברזל ב׳ — ימי הבית הראשון",
    "href": "https://notebook.google.com/notebook/60ee95aa-2ddf-4f0a-9609-925833a4efc7"
  },
  {
    "id": "temple",
    "label": "ימי הבית השני",
    "href": "https://notebook.google.com/notebook/e1eef0d4-ef58-4296-92d1-e8eb32859abc"
  },
  {
    "id": "roman-byzantine",
    "label": "התקופה הרומית והביזנטית",
    "href": "https://notebook.google.com/notebook/35a76d16-c61b-42f8-aeea-bb60af7a6303"
  }
];
export const PERIODS: { id: PeriodId; label: string; dates: string; icon: string }[] = [
  { id: "iron1", label: "ברזל א׳ והשופטים", dates: "מאות 12–11 לפנה״ס והמעבר למלוכה", icon: "⚱" },
  { id: "iron2", label: "בית ראשון", dates: "המלוכה · עד 587/586 לפנה״ס", icon: "♜" },
  { id: "temple", label: "בית שני", dates: "שיבת ציון · עד 70 לספירה", icon: "✦" },
  { id: "roman", label: "רומא וחז״ל", dates: "חורבן · מרידות · משנה", icon: "⚔" },
  { id: "byzantine", label: "ביזנטיון", dates: "נצרות · קיסרים · נזירות", icon: "☩" },
];
const portraits: Record<string, Portrait> = {
  ...LOCAL_PORTRAITS,
  ...Object.fromEntries(HERODIAN_COMPANIONS.map(portrait => [portrait.id, portrait])),
  ...images,
};
export const PEOPLE: Person[] = (rawPeople as Omit<Person, "portrait">[]).map(person => ({
  ...person, portrait: portraits[person.id],
}));
