import { cookies } from "next/headers";
import type { User } from "@/domain/user";
import {
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./sessionToken";

const COOKIE_NAME = "session";

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return value;
}

/** Logs the user in by setting a signed, httpOnly session cookie. */
export async function createSession(user: User): Promise<void> {
  const token = await signSessionToken(
    { userId: user.id, name: user.name, role: user.role },
    secret(),
  );
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return verifySessionToken(token, secret());
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
