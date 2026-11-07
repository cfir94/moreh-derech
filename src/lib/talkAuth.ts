"use client";

import { useEffect } from "react";
import { HISTORY_TALK_ORIGIN } from "@/data/history-talk";
import { freshAccessToken } from "@/lib/cloudAuth";

/**
 * The "talk with history" iframe (Moti and the characters) runs on the Worker's origin and can't
 * read this site's login. When the Worker enforces access (REQUIRE_ENTITLEMENT), the iframe asks
 * for the user's token with postMessage, and we answer only that exact origin.
 * See history-talk/web/src/site-auth.ts for the other side.
 */
let listening = false;

export function useTalkAuthBridge() {
  useEffect(() => {
    if (!HISTORY_TALK_ORIGIN || listening) return;
    listening = true;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== HISTORY_TALK_ORIGIN) return;
      if ((event.data as { type?: string } | null)?.type !== "md-auth-request") return;
      const source = event.source as Window | null;
      void freshAccessToken().then((token) => source?.postMessage({ type: "md-auth", token }, HISTORY_TALK_ORIGIN));
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      listening = false;
    };
  }, []);
}
