// The route map shows the learning map's photos on the sites they share (owner, 19.11).
//   node --import ./tests/register-ts.mjs tools/export_route_map_photos.mjs
// A route-map site takes the photo of the learning-map site that is whose name matches (within 8 km),
// or that stands on the same spot (250 m). Writes public/embeds/map/js/data/photos.json: { [route-map id]: photo[] }.
import { readFileSync, writeFileSync } from "node:fs";
import { SITES } from "../src/data/learning-map/index.ts";
import { sitePhotos } from "../src/data/learning-map/photo-index.ts";

const geo = JSON.parse(readFileSync("public/embeds/map/js/data/sites.geojson", "utf8"));
const strip = (s) => (s || "").replace(/[֑-ׇ]/g, "").replace(/["'״׳()\-–—,.]/g, " ").replace(/\s+/g, " ").trim();
const km = (a, b) => {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const lm = SITES.map((s) => ({ s, name: strip(s.name), photos: sitePhotos(s) })).filter((x) => x.photos.length);
// checked by eye: the nearest photo shows a neighbour, not this place
const NO_PHOTO = ["בית הקברות היהודי בהר הזיתים", "מסגד עומר"];
// the right photo is a different learning-map site's
const USE = { "מסגד אל-אקצא": "הר הבית" };
const out = {};
let matched = 0;
for (const f of geo.features) {
  const [lon, lat] = f.geometry.coordinates;
  const name = strip(f.properties.name_he);
  if (NO_PHOTO.some((n) => f.properties.name_he.startsWith(n))) continue;
  const use = Object.entries(USE).find(([n]) => f.properties.name_he.startsWith(n));
  let best = null;
  if (use) {
    const x = lm.find((y) => y.s.name === use[1]);
    if (x) best = { x, score: 0 };
  }
  for (const x of best ? [] : lm) {
    const d = km({ lat, lon }, { lat: x.s.lat, lon: x.s.lon ?? x.s.lng });
    const named = name && x.name && (name.includes(x.name) || x.name.includes(name));
    const score = named ? d - 5 : d;
    // a photo must show this place: the names agree, or the two points are practically the same spot
    if (((named && d <= 8) || d <= 0.25) && (!best || score < best.score)) best = { x, score };
  }
  if (!best) continue;
  matched++;
  out[f.properties.id] = best.x.photos.slice(0, 4).map(({ photo }) => ({
    src: "../.." + photo.src,
    caption: photo.caption,
    alt: photo.alt,
    author: photo.author,
    license: photo.license,
    licenseUrl: photo.licenseUrl,
    source: photo.source,
    from: best.x.s.name,
  }));
}
writeFileSync("public/embeds/map/js/data/photos.json", JSON.stringify(out));
console.log(`${matched} of ${geo.features.length} route-map sites have photos`);
