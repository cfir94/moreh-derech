/**
 * ספריית "מחברות": סידור תוכן לימודי לפי אופן הלמידה ואז לפי מרחב או תחום.
 * כל רשומה מפנה ישירות למחברת המקור ואינה מעתיקה את התוכן מחוץ ל־NotebookLM.
 */
export type NotebookMode = "tours" | "theory" | "online";

export type TourRegion =
  | "coastal-lowlands"
  | "samaria-sharon"
  | "carmel-coast"
  | "galilee-valleys"
  | "golan"
  | "desert";

export type TheorySubject =
  | "borders"
  | "christianity"
  | "judaism"
  | "geology"
  | "nature";

export type CourseNotebook = {
  id: string;
  mode: NotebookMode;
  region: TourRegion;
  title: string;
  date: string;
  guide: string;
  places: string;
  url: string;
};

export type TheoryNotebook = Omit<CourseNotebook, "mode" | "region" | "places"> & {
  mode: "theory";
  subject: TheorySubject;
  focus: string;
};

export const NOTEBOOK_MODES: {
  id: NotebookMode;
  title: string;
  description: string;
}[] = [
  {
    id: "tours",
    title: "סיורים",
    description: "מחברות שטח מאורגנות לפי אזורים בארץ.",
  },
  {
    id: "theory",
    title: "עיוני",
    description: "מחברות הרצאה וחומרי עומק מאורגנים לפי תחום לימוד.",
  },
  {
    id: "online",
    title: "מקוון",
    description: "מחברות מפגשים מקוונים, הקלטות וחומרי המשך.",
  },
];

export const TOUR_REGIONS: {
  id: TourRegion;
  title: string;
  description: string;
  tone: "teal" | "blue" | "gold" | "violet" | "rose" | "sand";
}[] = [
  {
    id: "coastal-lowlands",
    title: "שפלה ומרכז",
    description: "תלים, ערים ומורשת בשולי מישור החוף.",
    tone: "gold",
  },
  {
    id: "samaria-sharon",
    title: "שומרון והשרון",
    description: "הר, מעיינות, יישובים ומפגש בין אזורים.",
    tone: "blue",
  },
  {
    id: "carmel-coast",
    title: "כרמל וחוף",
    description: "רכס הכרמל, חיפה, חוף ומורשת ימית.",
    tone: "teal",
  },
  {
    id: "galilee-valleys",
    title: "גליל ועמקים",
    description: "ערים קדומות, עמודי התווך של העמק והתיישבות.",
    tone: "violet",
  },
  {
    id: "golan",
    title: "רמת הגולן",
    description: "נוף געשי, גבול והתיישבות בצפון־מזרח.",
    tone: "rose",
  },
  {
    id: "desert",
    title: "מדבר יהודה וים המלח",
    description: "מסלע, מלחות ונופי קצה.",
    tone: "sand",
  },
];

export const THEORY_SUBJECTS: {
  id: TheorySubject;
  title: string;
  description: string;
  tone: "teal" | "blue" | "gold" | "violet" | "rose" | "sand";
}[] = [
  {
    id: "borders",
    title: "גבולות ארץ ישראל",
    description: "התפתחות קווי הגבול, גבולות מקראיים וגבולות מדינת ישראל.",
    tone: "blue",
  },
  {
    id: "christianity",
    title: "נצרות",
    description: "יסודות הנצרות, תולדות הכנסייה ואתרי הקודש בארץ.",
    tone: "violet",
  },
  {
    id: "judaism",
    title: "יהדות",
    description: "אמונה, מקורות, מוסדות ומרחבים יהודיים בארץ ישראל.",
    tone: "gold",
  },
  {
    id: "geology",
    title: "גאולוגיה",
    description: "סלעים, מבנה הארץ ותהליכים גאולוגיים בנוף הישראלי.",
    tone: "rose",
  },
  {
    id: "nature",
    title: "חי וצומח",
    description: "מערכות אקולוגיות, בתי גידול ומיני ארץ ישראל.",
    tone: "teal",
  },
];

export const TOUR_NOTEBOOKS: CourseNotebook[] = [
  {
    id: "rishon-ashkelon-ayalon",
    mode: "tours",
    region: "coastal-lowlands",
    title: 'ראשל"צ, בית הלוחמות, תל אשקלון ומכון איילון',
    date: "19.08.2026",
    guide: "ברק",
    places: "ראשון לציון · תל אשקלון · מכון איילון",
    url: "https://notebook.google.com/notebook/11acb135-6363-4eb6-b48c-d6e9782800fb",
  },
  {
    id: "gezer-migdal-tzedek-afek",
    mode: "tours",
    region: "coastal-lowlands",
    title: "תל גזר, מגדל צדק ותל אפק",
    date: "10.08.2026",
    guide: "אפרת",
    places: "תל גזר · מגדל צדק · תל אפק",
    url: "https://notebook.google.com/notebook/75cc71c9-b553-440b-a7f2-7a47156e4399",
  },
  {
    id: "samaria-shilat-gerizim",
    mode: "tours",
    region: "samaria-sharon",
    title: "שומרון, שילת והר גריזים",
    date: "03.08.2026",
    guide: "אפרת",
    places: "שומרון · שילת · הר גריזים",
    url: "https://notebook.google.com/notebook/61c8cddd-2d7e-44d6-b046-e56326eabf0b",
  },
  {
    id: "zippori-beit-shearim",
    mode: "tours",
    region: "galilee-valleys",
    title: "ציפורי ובית שערים",
    date: "27.07.2026",
    guide: "אסתר",
    places: "ציפורי · בית שערים",
    url: "https://notebook.google.com/notebook/18046275-3b89-4fcd-b9a5-86794d575f3f",
  },
  {
    id: "tanninim-jisr-pardes-hanna",
    mode: "tours",
    region: "samaria-sharon",
    title: "נחל תנינים, ג׳סר א־זרקא ופרדס חנה",
    date: "20.07.2026",
    guide: "גיא",
    places: "נחל תנינים · ג׳סר א־זרקא · פרדס חנה",
    url: "https://notebook.google.com/notebook/84c45e2e-d631-4049-baab-f894a0b8c659",
  },
  {
    id: "zichron-muhraka-atlit",
    mode: "tours",
    region: "carmel-coast",
    title: "זכרון יעקב, מוחרקה ומחנה המעפילים עתלית",
    date: "13.07.2026",
    guide: "גלי",
    places: "זכרון יעקב · מוחרקה · עתלית",
    url: "https://notebook.google.com/notebook/ad15b062-e0db-4d44-b92b-149564f36f2d",
  },
  {
    id: "lowlands-lachish-maresha",
    mode: "tours",
    region: "coastal-lowlands",
    title: "שפלה: תל לכיש, מרשה, בית גוברין ועזקה",
    date: "06.07.2026",
    guide: "שמוליק",
    places: "תל לכיש · מרשה · בית גוברין · עזקה",
    url: "https://notebook.google.com/notebook/1d46a484-8f39-4480-9075-2b282d08bf3d",
  },
  {
    id: "haifa",
    mode: "tours",
    region: "carmel-coast",
    title: "חיפה",
    date: "29.06.2026",
    guide: "גלי",
    places: "חיפה · הכרמל · העיר התחתית",
    url: "https://notebook.google.com/notebook/956725fa-26ee-4336-bd94-5471b404a6ee",
  },
  {
    id: "carmel-archaeology",
    mode: "tours",
    region: "carmel-coast",
    title: "סיור ארכאולוגיה בכרמל",
    date: "26.06.2026",
    guide: "מוטי זיק",
    places: "כרמל · ארכאולוגיה · אתרי מורשת",
    url: "https://notebook.google.com/notebook/b9ae8d8f-e759-4dcd-8000-57995d1a58e9",
  },
  {
    id: "south-golan",
    mode: "tours",
    region: "golan",
    title: "דרום רמת הגולן",
    date: "22.06.2026",
    guide: "יאיר",
    places: "דרום רמת הגולן · נוף געשי · גבול",
    url: "https://notebook.google.com/notebook/54cbbc3d-97db-4e4e-aa49-3fda3c9ca1ca",
  },
  {
    id: "megiddo-gilboa-tel-amal",
    mode: "tours",
    region: "galilee-valleys",
    title: "תל מגידו, הגלבוע ותל עמל",
    date: "15.06.2026",
    guide: "מיכל",
    places: "תל מגידו · הגלבוע · תל עמל",
    url: "https://notebook.google.com/notebook/8919d168-6145-4408-aad8-553d3a37962a",
  },
  {
    id: "mount-sodom",
    mode: "tours",
    region: "desert",
    title: "הר סדום",
    date: "01.06.2026",
    guide: "גיא",
    places: "הר סדום · ים המלח · גאולוגיה",
    url: "https://notebook.google.com/notebook/0e38b9b8-bb63-4810-924d-50fbbd0d4fa3",
  },
];

export const THEORY_NOTEBOOKS: TheoryNotebook[] = [
  {
    id: "borders-part-two",
    mode: "theory",
    subject: "borders",
    title: 'גבולות א"י — חלק ב׳',
    date: "14.08.2026",
    guide: "גיא",
    focus: "גבולות ארץ ישראל · חלק ב׳",
    url: "https://notebook.google.com/notebook/fbce2f5c-3ae7-478a-aef7-6869cb84952f",
  },
  {
    id: "christianity-part-three",
    mode: "theory",
    subject: "christianity",
    title: "נצרות ג׳",
    date: "07.08.2027",
    guide: "איילת",
    focus: "נצרות · חלק ג׳",
    url: "https://notebook.google.com/notebook/facc56ee-64d3-47a3-9286-15253b683919",
  },
  {
    id: "christianity-part-two",
    mode: "theory",
    subject: "christianity",
    title: "נצרות ב׳",
    date: "30.06.2026",
    guide: "איילת",
    focus: "נצרות · חלק ב׳",
    url: "https://notebook.google.com/notebook/d4b2d38a-0810-4580-9ca5-6403ff71bd74",
  },
  {
    id: "christianity-part-one",
    mode: "theory",
    subject: "christianity",
    title: "נצרות א׳",
    date: "24.06.2026",
    guide: "איילת",
    focus: "נצרות · חלק א׳",
    url: "https://notebook.google.com/notebook/78eb78ed-77c8-4b1d-b5b0-dc6dfb7f02ef",
  },
  {
    id: "judaism-part-three",
    mode: "theory",
    subject: "judaism",
    title: "יהדות ג׳",
    date: "17.07.2026",
    guide: "שמוליק",
    focus: "יהדות · חלק ג׳",
    url: "https://notebook.google.com/notebook/a8757f6a-476e-4fff-abe5-7b97d7911dc7",
  },
  {
    id: "judaism-part-two",
    mode: "theory",
    subject: "judaism",
    title: "יהדות ב׳",
    date: "10.07.2026",
    guide: "שמוליק",
    focus: "יהדות · חלק ב׳",
    url: "https://notebook.google.com/notebook/0260c30c-37ba-45fa-8e3b-7e74a1705085",
  },
  {
    id: "judaism-part-one",
    mode: "theory",
    subject: "judaism",
    title: "יהדות א׳",
    date: "03.06.2026",
    guide: "שמוליק",
    focus: "יהדות · חלק א׳",
    url: "https://notebook.google.com/notebook/b3e29f0b-6779-4016-84b4-f1b58e5089c8",
  },
  {
    id: "geology-part-two",
    mode: "theory",
    subject: "geology",
    title: "גאולוגיה ב׳",
    date: "19.06.2026",
    guide: "מוטי זיק",
    focus: "גאולוגיה · חלק ב׳",
    url: "https://notebook.google.com/notebook/688ad1a8-ac54-41b3-82b7-c0281f16a647",
  },
  {
    id: "geology-part-one",
    mode: "theory",
    subject: "geology",
    title: "גאולוגיה א׳",
    date: "12.06.2026",
    guide: "מוטי זיק",
    focus: "גאולוגיה · חלק א׳",
    url: "https://notebook.google.com/notebook/a2ec758d-63dd-4006-bd88-6daf8e6acf9b",
  },
  {
    id: "flora-in-israel",
    mode: "theory",
    subject: "nature",
    title: "הצומח בישראל",
    date: "05.06.2026",
    guide: "אוהד",
    focus: "צומח ארץ ישראל · מערכות אקולוגיות",
    url: "https://notebook.google.com/notebook/29cf720c-5ce5-4f15-bf3e-503bbf5d582a",
  },
  {
    id: "fauna-in-israel",
    mode: "theory",
    subject: "nature",
    title: "החי בארץ ישראל",
    date: "29.05.2026",
    guide: "אוהד",
    focus: "חי ארץ ישראל · בתי גידול",
    url: "https://notebook.google.com/notebook/678f8153-31a2-4cee-bb4e-318353705fb9",
  },
  {
    id: "introduction-to-israel-borders",
    mode: "theory",
    subject: "borders",
    title: "מבוא לגבולות ישראל",
    date: "25.05.2026",
    guide: "גיא",
    focus: "גבולות ארץ ישראל · מבוא",
    url: "https://notebook.google.com/notebook/1aa0b310-e74f-4127-852f-7c374c786bdd",
  },
];

export const notebookCount = TOUR_NOTEBOOKS.length + THEORY_NOTEBOOKS.length;
