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
      error = cause instanceof Error ? cause.message : String(cause);
    }
    await this.log.record({ registrationId, type, status, error });
    return status;
  }
}
