import { beforeEach, describe, expect, it } from "vitest";
import {
  AlreadyRegisteredError,
  EventCancelledError,
  EventFullError,
  EventNotFoundError,
  RegistrationClosedError,
} from "@/domain/errors";
import { seatsLeft, type EventRecord } from "@/domain/event";
import type { ConfirmRegistration, EventReader, RegistrationRepository } from "@/domain/ports";
import type { RegistrationRecord } from "@/domain/registration";
import { RegistrationService } from "@/services/RegistrationService";

const NOW = new Date("2026-11-12T10:00:00Z");

function makeEvent(overrides: Partial<EventRecord> = {}): EventRecord {
  return {
    id: "event-1",
    title: "Intro to Docker",
    description: "Hands-on workshop",
    category: "TECH",
    venue: "Lab 3",
    startsAt: new Date("2026-11-20T09:00:00Z"),
    registrationDeadline: new Date("2026-11-18T18:00:00Z"),
    capacity: 10,
    seatsTaken: 3,
    status: "PUBLISHED",
    ...overrides,
  };
}

/** In-memory stand-in for the database: events plus registrations. */
class FakeStore implements EventReader, RegistrationRepository {
  events = new Map<string, EventRecord>();
  registrations: RegistrationRecord[] = [];

  async findById(id: string) {
    const event = this.events.get(id);
    return event ? { ...event } : null;
  }

  async findByUserAndEvent(userId: string, eventId: string) {
    return this.registrations.find((r) => r.userId === userId && r.eventId === eventId) ?? null;
  }

  async confirm({ userId, eventId, existingRegistrationId }: ConfirmRegistration) {
    const event = this.events.get(eventId)!;
    if (event.seatsTaken >= event.capacity) throw new EventFullError();
    event.seatsTaken += 1;
    if (existingRegistrationId) {
      const existing = this.registrations.find((r) => r.id === existingRegistrationId)!;
      existing.status = "CONFIRMED";
      return { ...existing };
    }
    const created: RegistrationRecord = {
      id: `reg-${this.registrations.length + 1}`,
      userId,
      eventId,
      status: "CONFIRMED",
    };
    this.registrations.push(created);
    return { ...created };
  }
}

describe("RegistrationService.register (US-07)", () => {
  let store: FakeStore;
  let service: RegistrationService;

  beforeEach(() => {
    store = new FakeStore();
    store.events.set("event-1", makeEvent());
    service = new RegistrationService(store, store);
  });

  it("confirms the registration and takes one seat", async () => {
    const registration = await service.register("student-1", "event-1", NOW);

    expect(registration).toMatchObject({ userId: "student-1", eventId: "event-1", status: "CONFIRMED" });
    expect(seatsLeft(store.events.get("event-1")!)).toBe(6);
  });

  it("rejects a second registration by the same student", async () => {
    await service.register("student-1", "event-1", NOW);

    await expect(service.register("student-1", "event-1", NOW)).rejects.toThrow(AlreadyRegisteredError);
    expect(store.registrations).toHaveLength(1);
    expect(seatsLeft(store.events.get("event-1")!)).toBe(6);
  });

  it("rejects registration when the event is full", async () => {
    store.events.set("event-1", makeEvent({ capacity: 5, seatsTaken: 5 }));

    await expect(service.register("student-1", "event-1", NOW)).rejects.toThrow(EventFullError);
    expect(store.registrations).toHaveLength(0);
  });

  it("rejects registration after the deadline", async () => {
    store.events.set("event-1", makeEvent({ registrationDeadline: new Date("2026-11-12T09:59:00Z") }));

    await expect(service.register("student-1", "event-1", NOW)).rejects.toThrow(RegistrationClosedError);
    expect(store.registrations).toHaveLength(0);
  });

  it("rejects registration for a cancelled event", async () => {
    store.events.set("event-1", makeEvent({ status: "CANCELLED" }));

    await expect(service.register("student-1", "event-1", NOW)).rejects.toThrow(EventCancelledError);
  });

  it("rejects registration for an event that does not exist", async () => {
    await expect(service.register("student-1", "missing", NOW)).rejects.toThrow(EventNotFoundError);
  });

  it("lets a student who cancelled register again, reusing the same registration", async () => {
    const first = await service.register("student-1", "event-1", NOW);
    store.registrations[0].status = "CANCELLED";
    store.events.get("event-1")!.seatsTaken -= 1;

    const again = await service.register("student-1", "event-1", NOW);

    expect(again).toMatchObject({ id: first.id, status: "CONFIRMED" });
    expect(store.registrations).toHaveLength(1);
    expect(seatsLeft(store.events.get("event-1")!)).toBe(6);
  });
});
