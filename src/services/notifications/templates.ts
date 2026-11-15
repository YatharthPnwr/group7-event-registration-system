import type { ConfirmationDetails, EmailMessage } from "@/domain/notification";
import { formatDateTime } from "@/lib/format";

/** The confirmation email, kept apart from sending so wording changes never touch delivery code. */
export function confirmationEmail(details: ConfirmationDetails): EmailMessage {
  const { event } = details;
  return {
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
      "",
      "You can view or cancel your registration under My registrations.",
    ].join("\n"),
  };
}
