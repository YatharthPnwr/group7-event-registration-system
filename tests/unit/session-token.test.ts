import { describe, expect, it } from "vitest";
import { signSessionToken, verifySessionToken } from "@/infrastructure/sessionToken";

const secret = "test-secret-at-least-32-characters-long";
const payload = { userId: "user-1", name: "Asha Rao", role: "STUDENT" as const };

describe("session token", () => {
  it("round-trips the user id, name and role", async () => {
    const token = await signSessionToken(payload, secret);
    await expect(verifySessionToken(token, secret)).resolves.toEqual(payload);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken(payload, "some-other-secret-that-is-long-enough");
    await expect(verifySessionToken(token, secret)).resolves.toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken(payload, secret);
    const [header, , signature] = token.split(".");
    const forgedBody = Buffer.from(JSON.stringify({ sub: "user-1", role: "ADMIN" })).toString("base64url");
    await expect(verifySessionToken(`${header}.${forgedBody}.${signature}`, secret)).resolves.toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signSessionToken(payload, secret, -10);
    await expect(verifySessionToken(token, secret)).resolves.toBeNull();
  });

  it("treats a missing cookie as logged out", async () => {
    await expect(verifySessionToken(undefined, secret)).resolves.toBeNull();
  });
});
