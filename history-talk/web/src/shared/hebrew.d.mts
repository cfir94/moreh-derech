import type { Options } from "minisearch";
export declare function stripNiqqud(text: string): string;
export declare const PREFIXES: string[];
export declare function tokenize(text: string): string[];
export declare function processTerm(raw: string): string[] | null;
export declare const MINISEARCH_OPTIONS: Options<{ id: number; ref: string; text: string; url: string }>;
export declare function rankedSearch<T>(ms: import("minisearch").default<T>, query: string, limit?: number): (import("minisearch").SearchResult & { coverage: number })[];
