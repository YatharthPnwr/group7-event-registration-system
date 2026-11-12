export type RegistrationStatus = "CONFIRMED" | "CANCELLED";

export interface RegistrationRecord {
  id: string;
  userId: string;
  eventId: string;
  status: RegistrationStatus;
}
