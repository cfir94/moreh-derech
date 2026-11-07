"use client";

import { useEffect } from "react";
import { startCloudSync } from "@/lib/sync/cloudSync";

/** מסנכרן את נתוני הלמידה של המשתמש המחובר לחשבון (S-02). לא מצייר כלום. */
export function CloudSync() {
  useEffect(() => startCloudSync(), []);
  return null;
}
