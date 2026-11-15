import { beforeEach, describe, expect, it } from "vitest";
import { ValidationError } from "@/domain/errors";
import type { EventRecord } from "@/domain/event";
import type { EventWriter, NewEvent } from "@/domain/ports";
import { EventService } from "@/services/EventService";

const NOW = new Date("2026-11-15T06:00:00Z");

const valid = {
  title: "Git Workshop",
  description: "Branches, pull requests and merge conflicts.",
  category: "TECH",
  venue: "Lab 2",
  startsAt: "2026-11-25T10:00:00+05:30",
  registrationDeadline: "2026-11-24T18:00:00+05:30",
  capacity: "30",
};

class InMemoryEvents implements EventWriter {
  saved: EventRecord[] = [];
  async create(event: NewEvent) {
    const record: EventRecord = { id: `e${this.saved.length + 1}`, seatsTaken: 0, status: "PUBLISHED", ...event };
    this.saved.push(record);
    return record;
  }
}

async function fieldErrors(promise: Promise<unknown>) {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ValidationError);
  return (error as ValidationError).fieldErrors;
}

describe("EventService.create (US-03)", () => {
  let store: InMemoryEvents;
  let service: EventService;

  beforeEach(() => {
    store = new InMemoryEvents();
    service = new EventService(store);
  });

  it("saves a valid event as published with no seats taken", async () => {
    const event = await service.create(valid, NOW);

    expect(event).toMatchObject({ title: "Git Workshop", category: "TECH", capacity: 30, seatsTaken: 0, status: "PUBLISHED" });
    expect(event.startsAt.toISOString()).toBe("2026-11-25T04:30:00.000Z");
    expect(store.saved).toHaveLength(1);
  });

  it("rejects a deadline after the event starts and saves nothing", async () => {
    const errors = await fieldErrors(service.create({ ...valid, registrationDeadline: "2026-11-26T10:00:00+05:30" }, NOW));
    expect(errors.registrationDeadline).toBe("Registration deadline must be before the event starts");
    expect(store.saved).toHaveLength(0);
  });

  it("rejects a capacity below 1", async () => {
    const errors = await fieldErrors(service.create({ ...valid, capacity: "0" }, NOW));
    expect(errors.capacity).toBe("Capacity must be at least 1");
  });

  it("rejects an event date in the past", async () => {
    const errors = await fieldErrors(
      service.create({ ...valid, startsAt: "2026-11-10T10:00:00+05:30", registrationDeadline: "2026-11-09T10:00:00+05:30" }, NOW),
    );
    expect(errors.startsAt).toBe("Event date must be in the future");
  });

  it("reports missing fields", async () => {
    const errors = await fieldErrors(service.create({ ...valid, title: " ", venue: "", category: "SPORTS" }, NOW));
    expect(errors).toMatchObject({ title: "Title is required", venue: "Venue is required", category: "Choose College or Tech" });
  });
});
