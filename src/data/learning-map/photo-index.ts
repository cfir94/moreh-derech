import { ARCH_PHOTOS } from "@/data/classical-architecture/photos";
import type { SitePhoto } from "./photo-types";
import { LEARNING_MAP_PHOTOS } from "@/data/learning-map/photos";
import type { MapSite } from "./types";

/**
 * תמונות שכבר נבחרו ונבדקו לסטודיו האדריכלות משמשות גם כאן, בלי להוריד אותן
 * שוב: מזהה תמונה במפה ← מזהה ב־ARCH_PHOTOS. השאר מגיעות מ־photos.ts.
 */
const ARCH_ALIASES: Record<string, string> = {
  "jason-tomb": "jason-tomb",
  "kidron-tombs": "hezir",
  "kidron-tombs-absalom-photo": "absalom",
  "damascus-gate": "damascus-gate",
  "tombs-of-the-kings-sarcophagus": "sarcophagus-helena",
  "temple-mount-model": "tl-holyland",
  "city-of-david-theodotos": "theodotus",
  "holy-sepulchre": "holy-sepulchre",
  kathisma: "tl-kathisma",
  "caesarea-theatre": "caesarea-theatre",
  "caesarea-aqueduct": "caesarea-aqueduct",
  "caesarea-hippodrome": "caesarea-hippodrome",
  "beit-shearim-coffins": "beit-shearim",
  "gamla-synagogue": "gamla",
  "magdala-stone": "magdala-stone",
  capernaum: "capernaum",
  kursi: "kursi",
  "beit-alfa": "beit-alpha",
  "hamat-tiberias": "hammat-tiberias",
  "beit-shean": "beit-shean-city",
  "beit-shean-theatre": "beit-shean-theatre",
  "beit-guvrin-amphitheatre": "beit-guvrin-amphitheatre",
  "maresha-sidonian": "tl-maresha",
  nativity: "nativity",
  eshtemoa: "eshtemoa",
  "jericho-palaces": "tl-jericho-pools",
};

const BY_ID = new Map<string, SitePhoto>();
for (const photo of LEARNING_MAP_PHOTOS) BY_ID.set(photo.id, photo);
for (const [id, archId] of Object.entries(ARCH_ALIASES)) {
  const arch = ARCH_PHOTOS.find((p) => p.id === archId);
  if (arch && !BY_ID.has(id)) BY_ID.set(id, { ...arch, id });
}

export function photoById(id: string) {
  return BY_ID.get(id);
}

/** The site's general view first, then one photo per find that has one. */
export function sitePhotos(site: MapSite) {
  const out: { photo: SitePhoto; findId?: string }[] = [];
  const general = BY_ID.get(site.id);
  if (general) out.push({ photo: general });
  for (const find of site.finds ?? []) {
    const photo = BY_ID.get(find.id);
    if (photo) out.push({ photo, findId: find.id });
  }
  return out;
}

export const ARCH_ALIAS_IDS = Object.keys(ARCH_ALIASES);
