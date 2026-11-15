export type NotificationType = "CONFIRMATION" | "CANCELLATION";
export type NotificationStatus = "SENT" | "FAILED";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface NotificationLogEntry {
  id: string;
  registrationId: string;
  type: NotificationType;
  status: NotificationStatus;
  error: string | null;
  createdAt: Date;
}

/** What the confirmation email needs to know about a registration. */
export interface ConfirmationDetails {
  registrationId: string;
  studentName: string;
  studentEmail: string;
  event: { title: string; startsAt: Date; venue: string };
}
