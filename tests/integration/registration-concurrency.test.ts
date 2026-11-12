import { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { AlreadyRegisteredError, EventFullError } from "@/domain/errors";
import { PrismaEventRepository } from "@/infrastructure/PrismaEventRepository";
import { PrismaRegistrationRepository } from "@/infrastructure/PrismaRegistrationRepository";
import { RegistrationService } from "@/services/RegistrationService";

const db = new PrismaClient();
const service = new RegistrationService(new PrismaEventRepository(db), new PrismaRegistrationRepository(db));
const run = `it-${Date.now()}`;
const createdEvents: string[] = [];
const createdUsers: string[] = [];

async function createStudent(label: string) {
  const user = await db.user.create({
    data: { name: label, email: `${run}-${label}@example.com`, passwordHash: "not-a-real-hash" },
  });
  createdUsers.push(user.id);
  return user.id;
}

async function createEvent(capacity: number) {
  const event = await db.event.create({
    data: {
      title: `Concurrency test ${run}`,
      description: "Created by an integration test",
      category: "TECH",
      venue: "Test lab",
      startsAt: new Date(Date.now() + 7 * 86_400_000),
      registrationDeadline: new Date(Date.now() + 6 * 86_400_000),
      capacity,
    },
  });
  createdEvents.push(event.id);
  return event.id;
}

describe("Registration against Postgres (US-07)", () => {
  beforeEach(() => {
    expect(process.env.DATABASE_URL, "DATABASE_URL must point at a test database").toBeTruthy();
  });

  afterAll(async () => {
    await db.registration.deleteMany({ where: { eventId: { in: createdEvents } } });
    await db.event.deleteMany({ where: { id: { in: createdEvents } } });
    await db.user.deleteMany({ where: { id: { in: createdUsers } } });
    await db.$disconnect();
  });

  it("gives the last seat to exactly one of two students registering at the same moment", async () => {
    const eventId = await createEvent(1);
    const [asha, ravi] = await Promise.all([createStudent("asha"), createStudent("ravi")]);

    const results = await Promise.allSettled([
      service.register(asha, eventId),
      service.register(ravi, eventId),
    ]);

    const won = results.filter((r) => r.status === "fulfilled");
    const lost = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    expect(won).toHaveLength(1);
    expect(lost).toHaveLength(1);
    expect(lost[0].reason).toBeInstanceOf(EventFullError);

    const event = await db.event.findUniqueOrThrow({ where: { id: eventId } });
    expect(event.seatsTaken).toBe(1);
    expect(await db.registration.count({ where: { eventId } })).toBe(1);
  });

  it("does not double-book when the same student clicks Register twice at once", async () => {
    const eventId = await createEvent(10);
    const student = await createStudent("double-click");

    const results = await Promise.allSettled([
      service.register(student, eventId),
      service.register(student, eventId),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
    expect(rejected?.reason).toBeInstanceOf(AlreadyRegisteredError);

    const event = await db.event.findUniqueOrThrow({ where: { id: eventId } });
    expect(event.seatsTaken).toBe(1);
    expect(await db.registration.count({ where: { eventId } })).toBe(1);
  });
});
