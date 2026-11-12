import {
  AlreadyRegisteredError,
  EventCancelledError,
  EventFullError,
  EventNotFoundError,
  RegistrationClosedError,
} from "@/domain/errors";
import type { EventReader, RegistrationRepository } from "@/domain/ports";
import type { RegistrationRecord } from "@/domain/registration";

export class RegistrationService {
  constructor(
    private readonly events: EventReader,
    private readonly registrations: RegistrationRepository,
  ) {}

  /** US-07: reserve a seat for a student. */
  async register(userId: string, eventId: string, now: Date = new Date()): Promise<RegistrationRecord> {
    const event = await this.events.findById(eventId);
    if (!event) throw new EventNotFoundError();
    if (event.status === "CANCELLED") throw new EventCancelledError();
    if (now > event.registrationDeadline) throw new RegistrationClosedError();

    const existing = await this.registrations.findByUserAndEvent(userId, eventId);
    if (existing?.status === "CONFIRMED") throw new AlreadyRegisteredError();

    if (event.seatsTaken >= event.capacity) throw new EventFullError();

    return this.registrations.confirm({
      userId,
      eventId,
      existingRegistrationId: existing?.id,
    });
  }
}
