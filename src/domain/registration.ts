export type RegistrationStatus = "CONFIRMED" | "CANCELLED";

export interface RegistrationRecord {
  id: string;
  userId: string;
  eventId: string;
  status: RegistrationStatus;
}

/** A student's registration with the event details shown on "My registrations". */
export interface RegistrationWithEvent extends RegistrationRecord {
  event: { id: string; title: string; venue: string; startsAt: Date };
}

/** One row on the admin's "who registered" page (US-09). */
export interface EventRegistrant {
  registrationId: string;
  name: string;
  email: string;
  registeredAt: Date;
  status: RegistrationStatus;
  /** Latest confirmation email attempt, or null if none was sent. */
  emailStatus: "SENT" | "FAILED" | null;
}
