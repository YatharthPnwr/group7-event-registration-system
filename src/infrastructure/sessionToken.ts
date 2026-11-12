import { jwtVerify, SignJWT } from "jose";
import type { Role } from "@/domain/user";

export interface SessionPayload {
  userId: string;
  name: string;
  role: Role;
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const ALGORITHM = "HS256";

function key(secret: string) {
  return new TextEncoder().encode(secret);
}

/** Signs the session as a JWT. The secret never leaves the server. */
export function signSessionToken(
  payload: SessionPayload,
  secret: string,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS,
): Promise<string> {
  return new SignJWT({ name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(key(secret));
}

/** Returns the session, or null if the token is missing, tampered with or expired. */
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(secret), { algorithms: [ALGORITHM] });
    if (typeof payload.sub !== "string") return null;
    if (payload.role !== "STUDENT" && payload.role !== "ADMIN") return null;
    return { userId: payload.sub, name: String(payload.name ?? ""), role: payload.role };
  } catch {
    return null;
  }
}
