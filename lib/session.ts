import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  decryptSession,
  encryptSession,
  sessionExpiryDate,
  type SessionPayload,
} from "@/lib/session-token";

export { SESSION_COOKIE, type SessionPayload };
export const decrypt = decryptSession;

export async function createSession(userId: string) {
  const expiresAt = sessionExpiryDate();
  const session = await encryptSession({ userId }, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    // Localhost kjører over http, så secure kan ikke stå på i dev
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
