"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { LAUNCH } from "@/lib/launch";

/** כשה-Paywall דולק: אורח שמגיע לדף הבית מועבר לדף הנחיתה. משתמש מחובר נשאר. */
export function GuestToWelcome() {
  const router = useRouter();
  const { user, ready } = useUser();
  useEffect(() => {
    if (LAUNCH.paywall && ready && !user) router.replace("/welcome/");
  }, [ready, user, router]);
  return null;
}
