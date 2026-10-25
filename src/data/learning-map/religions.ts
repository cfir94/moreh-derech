/**
 * סינון לפי דת: לאיזו מסורת דתית האתר שייך — יהדות, נצרות, אסלאם, ו"שונות"
 * (פולחן אלילי, שומרונים, נבטים). אתר יכול להשתייך לכמה. אתר אזרחי או צבאי
 * (עיר, מבצר, נמל) בלי משמעות דתית מקבל רשימה ריקה, ומופיע רק ב"כל הדתות".
 *
 * כל אתר במפה חייב רשומה כאן — גם ריקה — כדי שאתר חדש לא יישכח
 * (`tests/learning-map.test.mjs`).
 */

export type ReligionId = "judaism" | "christianity" | "islam" | "other";

export type Religion = { id: ReligionId; title: string; symbol: string; note: string };

export const RELIGIONS: Religion[] = [
  { id: "judaism", title: "יהדות", symbol: "✡", note: "המקדש, בתי כנסת, מקוואות, קבורה ומרכזי החכמים." },
  { id: "christianity", title: "נצרות", symbol: "✝", note: "מקומות חייו של ישו, כנסיות, מנזרים ודרכי הצליינים." },
  { id: "islam", title: "אסלאם", symbol: "☪", note: "מקומות שקדושים לאסלאם — גם כשהקדושה מאוחרת לתקופות שבמפה." },
  { id: "other", title: "שונות", symbol: "◈", note: "מקדשים אליליים, השומרונים והנבטים." },
];

export const RELIGION_BY_ID = Object.fromEntries(RELIGIONS.map((r) => [r.id, r])) as Record<ReligionId, Religion>;

export const SITE_RELIGIONS: Record<string, ReligionId[]> = {
  // ---- Jerusalem
  "temple-mount": ["judaism", "islam"],
  "robinson-arch": ["judaism"],
  antonia: [],
  "tower-of-david": [],
  "city-of-david": ["judaism"],
  givati: ["judaism"],
  siloam: ["judaism", "christianity"],
  "burnt-house": ["judaism"],
  "kidron-tombs": ["judaism"],
  "jason-tomb": ["judaism"],
  "tombs-of-the-kings": ["judaism"],
  "third-wall": [],
  "damascus-gate": [],
  "ecce-homo": ["christianity"],
  "binyanei-hauma": [],
  "holy-sepulchre": ["christianity", "other"],
  eleona: ["christianity"],
  nea: ["christianity"],
  cardo: [],
  "st-stephen": ["christianity"],
  "mount-zion": ["christianity"],
  gethsemane: ["christianity"],
  kathisma: ["christianity"],
  "ramat-rachel": [],
  // ---- north
  caesarea: ["christianity", "other"],
  antipatris: [],
  sebastia: ["other", "christianity"],
  gerizim: ["other", "christianity"],
  legio: ["christianity"],
  "beit-shearim": ["judaism"],
  usha: ["judaism"],
  shefaram: ["judaism"],
  sepphoris: ["judaism", "christianity"],
  yodfat: ["judaism"],
  akko: [],
  tiberias: ["judaism"],
  "hamat-tiberias": ["judaism"],
  magdala: ["judaism", "christianity"],
  tabgha: ["christianity"],
  capernaum: ["christianity", "judaism"],
  kursi: ["christianity"],
  hippos: ["christianity"],
  gamla: ["judaism"],
  banias: ["other", "christianity"],
  baram: ["judaism"],
  "beit-alfa": ["judaism"],
  "beit-shean": ["other"],
  rehov: ["judaism"],
  "tel-shalem": [],
  "hamat-gader": [],
  // ---- south
  modiin: ["judaism"],
  emmaus: ["judaism", "christianity"],
  yavne: ["judaism"],
  lod: ["judaism", "christianity"],
  "beit-guvrin": [],
  maresha: [],
  lachish: [],
  betar: ["judaism"],
  nativity: ["christianity"],
  herodium: ["judaism"],
  "solomons-pools": [],
  mamre: ["judaism", "christianity", "other"],
  machpelah: ["judaism", "islam"],
  susya: ["judaism"],
  eshtemoa: ["judaism"],
  theodosius: ["christianity"],
  "mar-saba": ["christianity"],
  martyrius: ["christianity"],
  euthymius: ["christianity"],
  chariton: ["christianity"],
  koziba: ["christianity"],
  "jericho-palaces": [],
  gerasimos: ["christianity"],
  "wadi-daliyeh": ["other"],
  alexandrium: [],
  qumran: ["judaism"],
  hyrcania: ["christianity"],
  "nahal-hever": ["judaism"],
  masada: ["judaism"],
  mamshit: ["christianity"],
  haluza: ["christianity"],
  shivta: ["christianity"],
  nitzana: ["christianity"],
  avdat: ["other", "christianity"],
  yotvata: [],
  aila: [],
  machaerus: ["christianity"],
  madaba: ["christianity"],
  "santa-katarina": ["christianity", "islam"],
};
