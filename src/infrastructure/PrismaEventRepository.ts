import type { PrismaClient } from "@prisma/client";
import type { EventRecord } from "@/domain/event";
import type { EventReader } from "@/domain/ports";

export class PrismaEventRepository implements EventReader {
  constructor(private readonly db: PrismaClient) {}

  findById(id: string): Promise<EventRecord | null> {
    return this.db.event.findUnique({ where: { id } });
  }
}
