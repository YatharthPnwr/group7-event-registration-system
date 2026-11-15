import type { EventRecord } from "./event";
import type { EmailMessage, NotificationLogEntry } from "./notification";
import type { EventRegistrant, RegistrationRecord, RegistrationWithEvent } from "./registration";
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
  findWithEvent(registrationId: string): Promise<RegistrationWithEvent | null>;
  listForUser(userId: string): Promise<RegistrationWithEvent[]>;
  /**
   * Marks a CONFIRMED registration CANCELLED and frees its seat atomically.
   * Throws CancellationNotAllowedError if it was already cancelled meanwhile.
   */
  cancel(registrationId: string): Promise<RegistrationRecord>;
}

export interface UpcomingEventsQuery {
  now: Date;
  /** Case-insensitive match on the title (US-06). */
  search?: string;
  category?: EventRecord["category"];
}

export interface EventCatalog {
  /** Published events that have not started yet, soonest first. */
  findUpcoming(query: UpcomingEventsQuery): Promise<EventRecord[]>;
}

export type NewEvent = Omit<EventRecord, "id" | "seatsTaken" | "status">;

export interface EventWriter {
  create(event: NewEvent): Promise<EventRecord>;
}

export interface EmailSender {
  /** Throws if the mail server rejects or cannot be reached. */
  send(message: EmailMessage): Promise<void>;
}

export interface NotificationLog {
  record(entry: Omit<NotificationLogEntry, "id" | "createdAt">): Promise<NotificationLogEntry>;
}

export interface UserLookup {
  findById(id: string): Promise<UserRecord | null>;
}

export interface EventRegistrantsQuery {
  /** Everyone who registered for the event, oldest registration first. */
  listForEvent(eventId: string): Promise<EventRegistrant[]>;
}
