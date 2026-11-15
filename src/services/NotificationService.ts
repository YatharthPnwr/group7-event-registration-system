import type { ConfirmationDetails, NotificationStatus } from "@/domain/notification";
import type { EmailSender, NotificationLog } from "@/domain/ports";
import { formatDateTime } from "@/lib/format";

export class NotificationService {
  constructor(
    private readonly email: EmailSender,
    private readonly log: NotificationLog,
  ) {}

  /** US-12: email the student their confirmation. Never throws. */
  async sendConfirmation(details: ConfirmationDetails): Promise<NotificationStatus> {
    const { event } = details;
    try {
      await this.email.send({
        to: details.studentEmail,
        subject: `You're registered: ${event.title}`,
        text: [
          `Hi ${details.studentName},`,
          "",
          `Your seat is confirmed for ${event.title}.`,
          "",
          `When: ${formatDateTime(event.startsAt)}`,
          `Where: ${event.venue}`,
          `Registration ID: ${details.registrationId}`,
        ].join("\n"),
      });
      await this.log.record({ registrationId: details.registrationId, type: "CONFIRMATION", status: "SENT", error: null });
      return "SENT";
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      await this.log.record({ registrationId: details.registrationId, type: "CONFIRMATION", status: "FAILED", error: reason });
      return "FAILED";
    }
  }
}
