import type { ConfirmationDetails, NotificationStatus } from "@/domain/notification";
import type { EmailSender, NotificationLog } from "@/domain/ports";

export class NotificationService {
  constructor(
    private readonly email: EmailSender,
    private readonly log: NotificationLog,
  ) {}

  /** US-12: email the student their confirmation. Never throws. */
  async sendConfirmation(details: ConfirmationDetails): Promise<NotificationStatus> {
    void details;
    void this.email;
    void this.log;
    throw new Error("Not implemented");
  }
}
