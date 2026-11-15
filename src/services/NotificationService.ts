import type { ConfirmationDetails, EmailMessage, NotificationStatus, NotificationType } from "@/domain/notification";
import type { EmailSender, NotificationLog } from "@/domain/ports";
import { confirmationEmail } from "./notifications/templates";

export class NotificationService {
  constructor(
    private readonly email: EmailSender,
    private readonly log: NotificationLog,
  ) {}

  /** US-12: email the student their confirmation. Never throws. */
  sendConfirmation(details: ConfirmationDetails): Promise<NotificationStatus> {
    return this.deliver(details.registrationId, "CONFIRMATION", confirmationEmail(details));
  }

  /** Sends one email and logs the attempt, SENT or FAILED. A mail outage is reported, not thrown. */
  private async deliver(registrationId: string, type: NotificationType, message: EmailMessage): Promise<NotificationStatus> {
    let status: NotificationStatus = "SENT";
    let error: string | null = null;
    try {
      await this.email.send(message);
    } catch (cause) {
      status = "FAILED";
      error = describeError(cause);
    }
    await this.log.record({ registrationId, type, status, error });
    return status;
  }
}

/** A readable reason. Some network errors (e.g. AggregateError for refused connections) have an empty message. */
function describeError(cause: unknown): string {
  if (cause instanceof Error) {
    const code = (cause as Error & { code?: unknown }).code;
    return cause.message || (typeof code === "string" ? code : "") || cause.name;
  }
  return String(cause);
}
