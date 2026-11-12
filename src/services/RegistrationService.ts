import type { EventReader, RegistrationRepository } from "@/domain/ports";
import type { RegistrationRecord } from "@/domain/registration";

export class RegistrationService {
  constructor(
    private readonly events: EventReader,
    private readonly registrations: RegistrationRepository,
  ) {}

  /** US-07: reserve a seat for a student. */
  async register(userId: string, eventId: string, now: Date = new Date()): Promise<RegistrationRecord> {
    void userId;
    void eventId;
    void now;
    void this.events;
    void this.registrations;
    throw new Error("Not implemented");
  }
}
