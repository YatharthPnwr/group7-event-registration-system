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
