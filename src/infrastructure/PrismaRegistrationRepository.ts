import { Prisma, type PrismaClient } from "@prisma/client";
import { AlreadyRegisteredError, CancellationNotAllowedError, EventFullError } from "@/domain/errors";
import type { ConfirmRegistration, RegistrationRepository } from "@/domain/ports";
import type { RegistrationRecord, RegistrationWithEvent } from "@/domain/registration";

function toRecord(row: { id: string; userId: string; eventId: string; status: RegistrationRecord["status"] }) {
  return { id: row.id, userId: row.userId, eventId: row.eventId, status: row.status };
}

export class PrismaRegistrationRepository implements RegistrationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByUserAndEvent(userId: string, eventId: string): Promise<RegistrationRecord | null> {
    const row = await this.db.registration.findUnique({ where: { userId_eventId: { userId, eventId } } });
    return row ? toRecord(row) : null;
  }

  async confirm({ userId, eventId, existingRegistrationId }: ConfirmRegistration): Promise<RegistrationRecord> {
    try {
      return await this.db.$transaction(async (tx) => {
        // Take the seat with one conditional UPDATE. Postgres locks the row, so when
        // two students race for the last seat the second UPDATE matches 0 rows.
        const seatTaken = await tx.$executeRaw`
          UPDATE "Event"
          SET "seatsTaken" = "seatsTaken" + 1, "updatedAt" = NOW()
          WHERE "id" = ${eventId} AND "status" = 'PUBLISHED' AND "seatsTaken" < "capacity"`;
        if (seatTaken === 0) throw new EventFullError();

        const row = existingRegistrationId
          ? await tx.registration.update({
              where: { id: existingRegistrationId, status: "CANCELLED" },
              data: { status: "CONFIRMED" },
            })
          : await tx.registration.create({ data: { userId, eventId } });
        return toRecord(row);
      });
    } catch (error) {
      // P2002: duplicate (userId, eventId). P2025: the cancelled row was re-confirmed by a
      // parallel request. Either way the student is already registered, and the
      // transaction has rolled the seat back.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2002" || error.code === "P2025")
      ) {
        throw new AlreadyRegisteredError();
      }
      throw error;
    }
  }

  private static readonly withEvent = {
    event: { select: { id: true, title: true, venue: true, startsAt: true } },
  } as const;

  async findWithEvent(registrationId: string): Promise<RegistrationWithEvent | null> {
    const row = await this.db.registration.findUnique({
      where: { id: registrationId },
      include: PrismaRegistrationRepository.withEvent,
    });
    return row ? { ...toRecord(row), event: row.event } : null;
  }

  async listForUser(userId: string): Promise<RegistrationWithEvent[]> {
    const rows = await this.db.registration.findMany({
      where: { userId },
      include: PrismaRegistrationRepository.withEvent,
      orderBy: { event: { startsAt: "asc" } },
    });
    return rows.map((row) => ({ ...toRecord(row), event: row.event }));
  }

  async cancel(registrationId: string): Promise<RegistrationRecord> {
    return this.db.$transaction(async (tx) => {
      // Only a CONFIRMED row flips, so a double-click cannot free two seats.
      const flipped = await tx.registration.updateMany({
        where: { id: registrationId, status: "CONFIRMED" },
        data: { status: "CANCELLED" },
      });
      if (flipped.count === 0) throw new CancellationNotAllowedError("Registration already cancelled");

      const row = await tx.registration.findUniqueOrThrow({ where: { id: registrationId } });
      await tx.$executeRaw`
        UPDATE "Event" SET "seatsTaken" = GREATEST("seatsTaken" - 1, 0), "updatedAt" = NOW()
        WHERE "id" = ${row.eventId}`;
      return toRecord(row);
    });
  }
}
