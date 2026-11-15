import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvalidCredentialsError } from "@/domain/errors";
import type { PasswordHasher, UserRepository } from "@/domain/ports";
import type { UserRecord } from "@/domain/user";
import { AuthService } from "@/services/AuthService";

const student: UserRecord = {
  id: "u1",
  name: "Asha Rao",
  email: "asha@example.com",
  role: "STUDENT",
  passwordHash: "hashed:s3cret-pass",
};
const admin: UserRecord = { ...student, id: "u2", name: "Admin", email: "admin@example.com", role: "ADMIN" };

describe("AuthService.logIn (US-02)", () => {
  let hasher: PasswordHasher;
  let auth: AuthService;

  beforeEach(() => {
    const users: UserRepository = {
      findByEmail: async (email) => [student, admin].find((u) => u.email === email) ?? null,
      create: async () => {
        throw new Error("not used");
      },
    };
    hasher = {
      hash: vi.fn(async (plain: string) => `hashed:${plain}`),
      verify: vi.fn(async (plain: string, hash: string) => hash === `hashed:${plain}`),
    };
    auth = new AuthService(users, hasher);
  });

  it("returns the student for the right email and password", async () => {
    await expect(auth.logIn({ email: "asha@example.com", password: "s3cret-pass" })).resolves.toEqual({
      id: "u1",
      name: "Asha Rao",
      email: "asha@example.com",
      role: "STUDENT",
    });
  });

  it("returns the role, so admins can be sent to the admin dashboard", async () => {
    const user = await auth.logIn({ email: "admin@example.com", password: "s3cret-pass" });
    expect(user.role).toBe("ADMIN");
  });

  it("accepts the email in any case and with spaces", async () => {
    const user = await auth.logIn({ email: "  ASHA@example.COM ", password: "s3cret-pass" });
    expect(user.id).toBe("u1");
  });

  it("rejects a wrong password with a message that does not say which field was wrong", async () => {
    await expect(auth.logIn({ email: "asha@example.com", password: "wrong" })).rejects.toThrow(
      new InvalidCredentialsError(),
    );
  });

  it("rejects an unknown email with the same message, after still checking a password hash", async () => {
    await expect(auth.logIn({ email: "nobody@example.com", password: "whatever" })).rejects.toThrow(
      "Invalid email or password",
    );
    expect(hasher.verify).toHaveBeenCalledTimes(1);
  });

  it("rejects empty fields", async () => {
    await expect(auth.logIn({ email: "", password: "" })).rejects.toThrow(InvalidCredentialsError);
  });
});
