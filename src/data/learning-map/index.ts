import { JERUSALEM_SITES } from "@/data/learning-map/jerusalem";
import { NORTH_SITES } from "@/data/learning-map/north";
import { SOUTH_SITES } from "@/data/learning-map/south";
import type { Layer, MapSite } from "./types";

export * from "@/data/learning-map/types";
export * from "@/data/learning-map/periods";

export const SITES: MapSite[] = [...JERUSALEM_SITES, ...NORTH_SITES, ...SOUTH_SITES];

export const SITE_BY_ID = new Map(SITES.map((s) => [s.id, s]));

/** A row of the list: one building phase of one site. */
export type Row = { site: MapSite; layer: Layer };

/** All the phases, in the order they were built (ties: north before south). */
export const ROWS: Row[] = SITES.flatMap((site) => site.layers.map((layer) => ({ site, layer }))).sort(
  (a, b) => a.layer.year - b.layer.year || b.site.lat - a.site.lat,
);
