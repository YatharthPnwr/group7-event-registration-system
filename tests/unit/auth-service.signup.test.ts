import { beforeEach, describe, expect, it } from "vitest";
import { EmailAlreadyRegisteredError, ValidationError } from "@/domain/errors";
import type { NewUser, PasswordHasher, UserRepository } from "@/domain/ports";
import type { UserRecord } from "@/domain/user";
import { AuthService } from "@/services/AuthService";

class InMemoryUserRepository implements UserRepository {
  users: UserRecord[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async create(user: NewUser) {
    if (this.users.some((u) => u.email === user.email)) throw new EmailAlreadyRegisteredError();
    const record = { id: `user-${this.users.length + 1}`, ...user };
    this.users.push(record);
    return record;
  }
}

const fakeHasher: PasswordHasher = {
  hash: async (plain) => `hashed:${plain}`,
  verify: async (plain, hash) => hash === `hashed:${plain}`,
};

const valid = { name: "Asha Rao", email: "asha@example.com", password: "s3cret-pass" };

async function validationErrors(promise: Promise<unknown>) {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ValidationError);
  return (error as ValidationError).fieldErrors;
}

describe("AuthService.signUp (US-01)", () => {
  let users: InMemoryUserRepository;
  let auth: AuthService;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    auth = new AuthService(users, fakeHasher);
  });

  it("creates a STUDENT account and returns it without the password hash", async () => {
    const user = await auth.signUp(valid);

    expect(user).toEqual({ id: "user-1", name: "Asha Rao", email: "asha@example.com", role: "STUDENT" });
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("stores only the hashed password, never the plain text", async () => {
    await auth.signUp(valid);

    expect(users.users[0].passwordHash).toBe("hashed:s3cret-pass");
    expect(JSON.stringify(users.users)).not.toContain('"s3cret-pass"');
  });

  it("normalises the email so the same address cannot register twice", async () => {
    await auth.signUp(valid);

    await expect(auth.signUp({ ...valid, email: "  ASHA@Example.com " })).rejects.toThrow(
      "Email already registered",
    );
    expect(users.users).toHaveLength(1);
  });

  it("rejects an empty name", async () => {
    const errors = await validationErrors(auth.signUp({ ...valid, name: "   " }));
    expect(errors.name).toBe("Name is required");
  });

  it("rejects an invalid email", async () => {
    const errors = await validationErrors(auth.signUp({ ...valid, email: "not-an-email" }));
    expect(errors.email).toBe("Enter a valid email address");
  });

  it("rejects a password shorter than 8 characters", async () => {
    const errors = await validationErrors(auth.signUp({ ...valid, password: "short" }));
    expect(errors.password).toBe("Password must be at least 8 characters");
  });

  it("reports every invalid field at once and creates nothing", async () => {
    const errors = await validationErrors(auth.signUp({ name: "", email: "", password: "" }));

    expect(Object.keys(errors).sort()).toEqual(["email", "name", "password"]);
    expect(users.users).toHaveLength(0);
  });
});
