import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { PrismaRegistrationRepository } from "@/infrastructure/PrismaRegistrationRepository";

const db = new PrismaClient();
const repo = new PrismaRegistrationRepository(db);
const run = `reg-list-${Date.now()}`;

afterAll(async () => {
  await db.event.deleteMany({ where: { title: run } });
  await db.user.deleteMany({ where: { email: { startsWith: run } } });
  await db.$disconnect();
});

describe("PrismaRegistrationRepository.listForEvent (US-09)", () => {
  it("lists registrants oldest first with status and their latest email status", async () => {
    const event = await db.event.create({
      data: {
        title: run, description: "-", category: "TECH", venue: "Hall",
        startsAt: new Date(Date.now() + 86_400_000), registrationDeadline: new Date(Date.now() + 3_600_000), capacity: 5,
      },
    });
    const mk = (n: string) => db.user.create({ data: { name: n, email: `${run}-${n}@example.com`, passwordHash: "x" } });
    const asha = await mk("asha");
    const ravi = await mk("ravi");
    const r1 = await db.registration.create({ data: { userId: asha.id, eventId: event.id } });
    const r2 = await db.registration.create({ data: { userId: ravi.id, eventId: event.id, status: "CANCELLED" } });
    await db.notificationLog.create({ data: { registrationId: r1.id, type: "CONFIRMATION", status: "FAILED", error: "ESOCKET" } });
    await db.notificationLog.create({ data: { registrationId: r1.id, type: "CONFIRMATION", status: "SENT" } });

    const rows = await repo.listForEvent(event.id);

    expect(rows.map((r) => [r.name, r.status, r.emailStatus])).toEqual([
      ["asha", "CONFIRMED", "SENT"],
      ["ravi", "CANCELLED", null],
    ]);
    expect(rows[0]).toMatchObject({ registrationId: r1.id, email: `${run}-asha@example.com` });
    expect(rows[1].registrationId).toBe(r2.id);
  });
});
