import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

/** For server pages: the logged-in user, or a redirect to the login page. */
export async function requireSession(nextPath: string): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return session;
}

/** For admin pages: students are sent to the events list. */
export async function requireAdmin(nextPath: string): Promise<SessionPayload> {
  const session = await requireSession(nextPath);
  if (session.role !== "ADMIN") redirect("/events");
  return session;
}
