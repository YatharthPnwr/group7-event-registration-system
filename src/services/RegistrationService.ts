import { EventNotFoundError } from "@/domain/errors";
import type { EventReader, RegistrationRepository } from "@/domain/ports";
import type { RegistrationRecord } from "@/domain/registration";
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
}
