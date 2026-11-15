import {
  CancellationNotAllowedError,
  EventNotFoundError,
  RegistrationNotFoundError,
} from "@/domain/errors";
import type { EventReader, RegistrationRepository } from "@/domain/ports";
import type { RegistrationRecord, RegistrationWithEvent } from "@/domain/registration";
import { defaultEligibilityRules, type EligibilityRule } from "./registration/eligibility";

export class RegistrationService {
  constructor(
    private readonly events: EventReader,
    private readonly registrations: RegistrationRepository,
    private readonly rules: readonly EligibilityRule[] = defaultEligibilityRules,
  ) {}

  /** US-07: reserve a seat for a student. */
  async register(userId: string, eventId: string, now: Date = new Date()): Promise<RegistrationRecord> {
    const event = await this.events.findById(eventId);
    if (!event) throw new EventNotFoundError();

    const existing = await this.registrations.findByUserAndEvent(userId, eventId);
    for (const rule of this.rules) rule.check({ event, existing, now });

    // The repository re-checks the seat atomically, so a lost race still fails safely.
    return this.registrations.confirm({ userId, eventId, existingRegistrationId: existing?.id });
  }

  /** US-08: the student's registrations, soonest event first. */
  listForUser(userId: string): Promise<RegistrationWithEvent[]> {
    return this.registrations.listForUser(userId);
  }

  /** US-08: cancel before the event starts, freeing the seat. */
  async cancel(userId: string, registrationId: string, now: Date = new Date()): Promise<RegistrationRecord> {
    const registration = await this.registrations.findWithEvent(registrationId);
    // Someone else's registration looks the same as a missing one.
    if (!registration || registration.userId !== userId) throw new RegistrationNotFoundError();
    if (registration.status === "CANCELLED") {
      throw new CancellationNotAllowedError("Registration already cancelled");
    }
    if (now >= registration.event.startsAt) {
      throw new CancellationNotAllowedError("The event has already started");
    }
    return this.registrations.cancel(registrationId);
  }
}
