import type { PrismaClient } from "@prisma/client";
import type { EventRecord } from "@/domain/event";
import type { EventCatalog, EventReader, EventWriter, NewEvent, UpcomingEventsQuery } from "@/domain/ports";

export class PrismaEventRepository implements EventReader, EventCatalog, EventWriter {
  constructor(private readonly db: PrismaClient) {}

  findById(id: string): Promise<EventRecord | null> {
    return this.db.event.findUnique({ where: { id } });
  }

  findUpcoming({ now, search, category }: UpcomingEventsQuery): Promise<EventRecord[]> {
    const term = search?.trim();
    return this.db.event.findMany({
      where: {
        status: "PUBLISHED",
        startsAt: { gt: now },
        ...(category ? { category } : {}),
        ...(term ? { title: { contains: term, mode: "insensitive" } } : {}),
      },
      orderBy: { startsAt: "asc" },
    });
  }

  create(event: NewEvent): Promise<EventRecord> {
    return this.db.event.create({ data: event });
  }
}
