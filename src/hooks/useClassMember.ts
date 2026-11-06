"use client";

import { useUser } from "@/contexts/UserContext";
import { isClassMember } from "@/lib/classAccess";
import { usePreview } from "@/lib/launchClient";

/** True for a signed-in current classmate. Preview mode (any role but "real") shows a new user. */
export function useClassMember(): boolean {
  const { user } = useUser();
  const preview = usePreview();
  if (preview.on && preview.as !== "real") return false;
  return isClassMember(user?.createdAt);
}
