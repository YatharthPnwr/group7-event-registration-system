import {
  AlreadyRegisteredError,
  EventCancelledError,
  EventFullError,
  RegistrationClosedError,
} from "@/domain/errors";
import type { EventRecord } from "@/domain/event";
import type { RegistrationRecord } from "@/domain/registration";

export interface EligibilityContext {
  event: EventRecord;
  existing: RegistrationRecord | null;
  now: Date;
}

/**
 * One registration rule. Each rule throws the error that explains why the
 * student cannot register. New rules are added as new classes, without
 * editing RegistrationService (Open/Closed principle).
 */
export interface EligibilityRule {
  check(context: EligibilityContext): void;
}

export class EventNotCancelledRule implements EligibilityRule {
  check({ event }: EligibilityContext) {
    if (event.status === "CANCELLED") throw new EventCancelledError();
  }
}

export class BeforeDeadlineRule implements EligibilityRule {
  check({ event, now }: EligibilityContext) {
    if (now > event.registrationDeadline) throw new RegistrationClosedError();
  }
}

export class NotAlreadyRegisteredRule implements EligibilityRule {
  check({ existing }: EligibilityContext) {
    if (existing?.status === "CONFIRMED") throw new AlreadyRegisteredError();
  }
}

export class SeatAvailableRule implements EligibilityRule {
  check({ event }: EligibilityContext) {
    if (event.seatsTaken >= event.capacity) throw new EventFullError();
  }
}

/** Checked in this order, so the first failing rule decides the message. */
export const defaultEligibilityRules: readonly EligibilityRule[] = [
  new EventNotCancelledRule(),
  new BeforeDeadlineRule(),
  new NotAlreadyRegisteredRule(),
  new SeatAvailableRule(),
];
