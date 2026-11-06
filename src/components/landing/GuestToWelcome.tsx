"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useLaunch } from "@/lib/launchClient";

/** כשה-Paywall דולק: אורח שמגיע לדף הבית מועבר לדף הנחיתה. משתמש מחובר נשאר. */
export function GuestToWelcome() {
  const router = useRouter();
  const { user, ready } = useUser();
  const { paywall } = useLaunch();
  useEffect(() => {
    if (paywall && ready && !user) router.replace("/welcome/");
  }, [paywall, ready, user, router]);
  return null;
}
