import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // sju dager

const secret = process.env.SESSION_SECRET;
if (!secret) {
  throw new Error("SESSION_SECRET mangler i miljøvariablene");
}
const encodedKey = new TextEncoder().encode(secret);

export type SessionPayload = {
  userId: string;
};

export function sessionExpiryDate(now = Date.now()): Date {
  return new Date(now + SESSION_DURATION_MS);
}

export async function encryptSession(
  payload: SessionPayload,
  expiresAt: Date,
) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);
}

export async function decryptSession(
  session?: string,
): Promise<SessionPayload | null> {
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return typeof payload.userId === "string"
      ? { userId: payload.userId }
      : null;
  } catch {
    // Ugyldig eller utløpt token — behandles som ikke innlogget
    return null;
  }
}
