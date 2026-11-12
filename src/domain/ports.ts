import type { Role, UserRecord } from "./user";

// Ports: services depend on these interfaces, never on Prisma or bcrypt directly
// (Dependency Inversion). Tests swap in in-memory fakes.

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  /** Throws EmailAlreadyRegisteredError if the email is taken. */
  create(user: NewUser): Promise<UserRecord>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}
