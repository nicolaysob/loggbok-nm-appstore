"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = { error: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Fyll inn både brukernavn og passord." };
  }

  let user;
  try {
    user = await db.user.findUnique({ where: { username } });
  } catch (error) {
    console.error("Login database error:", error);
    return {
      error:
        "Kunne ikke koble til databasen. Sjekk DATABASE_URL (Transaction pooler) i Vercel.",
    };
  }

  // Samme feilmelding uansett — så ingen kan kartlegge hvilke brukere som finnes
  if (!user || !user.active || !(await compare(password, user.passwordHash))) {
    return { error: "Feil brukernavn eller passord." };
  }

  await createSession(user.id);
  redirect(user.role === "CUSTOMER" ? "/portal" : "/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
