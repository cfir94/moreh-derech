"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, clearSession } from "@/lib/session";

export async function login(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!name || !email) {
    redirect("/login?error=missing");
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { name, email },
  });

  await createSession(user.id);
  redirect("/me");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
