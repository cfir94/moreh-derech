"use client";

import { useUser } from "@/contexts/UserContext";
import { useProgress } from "@/hooks/useProgress";
import { summarize } from "@/lib/progress";
import { useCommunityUnread } from "@/components/community/CommunityBadge";

/** The live numbers both design versions show: who is here, what waits for review, how it is going. */
export function useHomeData() {
  const { user, ready: userReady } = useUser();
  const { state, ready } = useProgress();
  const unread = useCommunityUnread();
  const s = ready ? summarize(state) : null;
  return {
    name: userReady && user ? user.name : null,
    ready,
    reviewCount: s?.reviewCount ?? 0,
    answered: s?.totalAnswered ?? 0,
    accuracy: s && s.totalAnswered > 0 ? s.accuracyPct : null,
    hasHistory: ready && state.attempts.length > 0,
    unread: unread ?? 0,
  };
}
