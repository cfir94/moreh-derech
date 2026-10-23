// טיפוסים לפונקציות של build-knowledge.mjs שהבדיקות משתמשות בהן.
export interface Block {
  kind: "book" | "chapter" | "para";
  text: string;
  anchor?: string;
}
export interface Chunk {
  ref: string;
  text: string;
  url: string;
}
export interface SourceMeta {
  title: string;
  url: string;
  refTitle?: string;
  includeBooks?: string[];
}
export declare function estimateTokens(text: string): number;
export declare function parseSource(raw: string, ext: string): Block[];
export declare function chunkSource(blocks: Block[], source: SourceMeta): Chunk[];
export declare function verifyQuotes(sheet: string, chunks: Chunk[]): { quote: string; ref: string | null }[];
