import type { EventRecord } from "./event";
import type { RegistrationRecord } from "./registration";
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

export interface EventReader {
  findById(id: string): Promise<EventRecord | null>;
}

export interface ConfirmRegistration {
  userId: string;
  eventId: string;
  /** Set when the student had registered before and cancelled: reuse that row. */
  existingRegistrationId?: string;
}

export interface RegistrationRepository {
  findByUserAndEvent(userId: string, eventId: string): Promise<RegistrationRecord | null>;
  /**
   * Takes one seat and confirms the registration as a single atomic step.
   * Throws EventFullError if the last seat was taken meanwhile.
   */
  confirm(input: ConfirmRegistration): Promise<RegistrationRecord>;
}
