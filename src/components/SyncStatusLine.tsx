"use client";

import { useSyncExternalStore } from "react";
import { SYNC_EVENT, syncStatus, type SyncStatus } from "@/lib/sync/cloudSync";

function subscribe(onChange: () => void) {
  window.addEventListener(SYNC_EVENT, onChange);
  return () => window.removeEventListener(SYNC_EVENT, onChange);
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribe, () => syncStatus().status, () => "idle" as SyncStatus);
}

const TEXT: Record<Exclude<SyncStatus, "idle">, string> = {
  syncing: "שומר בחשבון…",
  synced: "ההתקדמות שמורה בחשבון, וזמינה מכל מכשיר שתיכנסו ממנו.",
  offline: "אין חיבור כרגע. ההתקדמות נשמרת במכשיר ותישלח לחשבון כשהחיבור יחזור.",
  unavailable: "ההתקדמות נשמרת כרגע רק במכשיר הזה.",
};

/** שורה אחת באזור האישי: האם ההתקדמות כבר בחשבון (S-02). */
export function SyncStatusLine() {
  const status = useSyncStatus();
  if (status === "idle") return null;
  return (
    <p className="mt-1 text-sm text-txt-dim" role="status" data-sync-status={status}>
      {TEXT[status]}
    </p>
  );
}
