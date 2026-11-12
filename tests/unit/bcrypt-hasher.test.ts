import { describe, expect, it } from "vitest";
import { BcryptPasswordHasher } from "@/infrastructure/BcryptPasswordHasher";

describe("BcryptPasswordHasher", () => {
  const hasher = new BcryptPasswordHasher(4); // low cost keeps the test fast

  it("produces a bcrypt hash, not the plain password", async () => {
    const hash = await hasher.hash("s3cret-pass");
    expect(hash).not.toContain("s3cret-pass");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hasher.hash("s3cret-pass");
    await expect(hasher.verify("s3cret-pass", hash)).resolves.toBe(true);
    await expect(hasher.verify("wrong-pass", hash)).resolves.toBe(false);
  });
});
