import type { PrismaClient } from "@prisma/client";
import type { NotificationLogEntry } from "@/domain/notification";
import type { NotificationLog } from "@/domain/ports";

export class PrismaNotificationLog implements NotificationLog {
  constructor(private readonly db: PrismaClient) {}

  record(entry: Omit<NotificationLogEntry, "id" | "createdAt">): Promise<NotificationLogEntry> {
    return this.db.notificationLog.create({ data: entry });
  }
}
