import { beforeEach, describe, expect, it } from "vitest";
import {
  AlreadyRegisteredError,
  CancellationNotAllowedError,
  RegistrationNotFoundError,
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

  async findWithEvent(id: string) {
    const r = this.registrations.find((x) => x.id === id);
    if (!r) return null;
    const e = this.events.get(r.eventId)!;
    return { ...r, event: { id: e.id, title: e.title, venue: e.venue, startsAt: e.startsAt } };
  }

  async listForUser(userId: string) {
    const mine = this.registrations.filter((r) => r.userId === userId);
    return Promise.all(mine.map(async (r) => (await this.findWithEvent(r.id))!));
  }

  async cancel(id: string) {
    const r = this.registrations.find((x) => x.id === id)!;
    if (r.status !== "CONFIRMED") throw new CancellationNotAllowedError("Registration already cancelled");
    r.status = "CANCELLED";
    this.events.get(r.eventId)!.seatsTaken -= 1;
    return { ...r };
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

describe("RegistrationService.cancel (US-08)", () => {
  let store: FakeStore;
  let service: RegistrationService;

  beforeEach(() => {
    store = new FakeStore();
    store.events.set("event-1", makeEvent());
    service = new RegistrationService(store, store);
  });

  it("cancels before the event starts and gives the seat back", async () => {
    const reg = await service.register("student-1", "event-1", NOW);

    const cancelled = await service.cancel("student-1", reg.id, NOW);

    expect(cancelled.status).toBe("CANCELLED");
    expect(seatsLeft(store.events.get("event-1")!)).toBe(7);
  });

  it("lets the student register again after cancelling", async () => {
    const reg = await service.register("student-1", "event-1", NOW);
    await service.cancel("student-1", reg.id, NOW);

    await expect(service.register("student-1", "event-1", NOW)).resolves.toMatchObject({ status: "CONFIRMED" });
  });

  it("treats another student's registration as not found", async () => {
    const reg = await service.register("student-1", "event-1", NOW);

    await expect(service.cancel("student-2", reg.id, NOW)).rejects.toThrow(RegistrationNotFoundError);
    expect(store.registrations[0].status).toBe("CONFIRMED");
  });

  it("refuses to cancel twice", async () => {
    const reg = await service.register("student-1", "event-1", NOW);
    await service.cancel("student-1", reg.id, NOW);

    await expect(service.cancel("student-1", reg.id, NOW)).rejects.toThrow("Registration already cancelled");
  });

  it("refuses to cancel once the event has started", async () => {
    const reg = await service.register("student-1", "event-1", NOW);
    const duringEvent = new Date("2026-11-20T09:30:00Z");

    await expect(service.cancel("student-1", reg.id, duringEvent)).rejects.toThrow("The event has already started");
  });

  it("lists the student's registrations with event details", async () => {
    await service.register("student-1", "event-1", NOW);

    const list = await service.listForUser("student-1");

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ status: "CONFIRMED", event: { title: "Intro to Docker", venue: "Lab 3" } });
  });
});
