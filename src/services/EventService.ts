import { z } from "zod";
import { ValidationError, type FieldErrors } from "@/domain/errors";
import type { EventRecord } from "@/domain/event";
import type { EventWriter } from "@/domain/ports";

const required = (label: string) => z.string().trim().min(1, `${label} is required`);

const newEventSchema = z.object({
  title: required("Title").max(120, "Title is too long"),
  description: required("Description").max(2000, "Description is too long"),
  category: z.enum(["COLLEGE", "TECH"], "Choose College or Tech"),
  venue: required("Venue").max(120, "Venue is too long"),
  startsAt: z.coerce.date("Enter the event date and time"),
  registrationDeadline: z.coerce.date("Enter the registration deadline"),
  capacity: z.coerce.number("Capacity must be a number").int("Capacity must be a whole number").min(1, "Capacity must be at least 1"),
});

function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) errors[String(issue.path[0] ?? "form")] ??= issue.message;
  return errors;
}

export class EventService {
  constructor(private readonly events: EventWriter) {}

  /** US-03: an admin creates an event. Throws ValidationError with a message per field. */
  async create(input: unknown, now: Date = new Date()): Promise<EventRecord> {
    const parsed = newEventSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError(toFieldErrors(parsed.error));
    const event = parsed.data;

    const errors: FieldErrors = {};
    if (event.startsAt <= now) errors.startsAt = "Event date must be in the future";
    if (event.registrationDeadline > event.startsAt) {
      errors.registrationDeadline = "Registration deadline must be before the event starts";
    }
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);

    return this.events.create(event);
  }
}
