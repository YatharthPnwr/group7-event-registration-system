import { beforeEach, describe, expect, it } from "vitest";
import type { EmailMessage, NotificationLogEntry } from "@/domain/notification";
import type { EmailSender, NotificationLog } from "@/domain/ports";
import { NotificationService } from "@/services/NotificationService";

class FakeEmailSender implements EmailSender {
  sent: EmailMessage[] = [];
  failWith: Error | null = null;

  async send(message: EmailMessage) {
    if (this.failWith) throw this.failWith;
    this.sent.push(message);
  }
}

class InMemoryNotificationLog implements NotificationLog {
  entries: NotificationLogEntry[] = [];

  async record(entry: Omit<NotificationLogEntry, "id" | "createdAt">) {
    const saved = { id: `log-${this.entries.length + 1}`, createdAt: new Date(), ...entry };
    this.entries.push(saved);
    return saved;
  }
}

const details = {
  registrationId: "reg-42",
  studentName: "Asha Rao",
  studentEmail: "asha@example.com",
  event: {
    title: "Intro to Docker Workshop",
    startsAt: new Date("2026-11-20T04:30:00Z"), // 10:00 am IST
    venue: "Computer Lab 3",
  },
};

describe("NotificationService.sendConfirmation (US-12)", () => {
  let email: FakeEmailSender;
  let log: InMemoryNotificationLog;
  let service: NotificationService;

  beforeEach(() => {
    email = new FakeEmailSender();
    log = new InMemoryNotificationLog();
    service = new NotificationService(email, log);
  });

  it("emails the student the event title, date, venue and registration ID", async () => {
    await service.sendConfirmation(details);

    expect(email.sent).toHaveLength(1);
    const [message] = email.sent;
    expect(message.to).toBe("asha@example.com");
    expect(message.subject).toContain("Intro to Docker Workshop");
    expect(message.text).toContain("Hi Asha Rao");
    expect(message.text).toContain("20 Nov 2026");
    expect(message.text).toContain("10:00 am");
    expect(message.text).toContain("Computer Lab 3");
    expect(message.text).toContain("reg-42");
  });

  it("logs a SENT confirmation and reports SENT", async () => {
    const status = await service.sendConfirmation(details);

    expect(status).toBe("SENT");
    expect(log.entries).toEqual([
      expect.objectContaining({ registrationId: "reg-42", type: "CONFIRMATION", status: "SENT", error: null }),
    ]);
  });

  it("does not throw when the mail server fails, and logs FAILED with the reason", async () => {
    email.failWith = new Error("connect ECONNREFUSED 127.0.0.1:1025");

    const status = await service.sendConfirmation(details);

    expect(status).toBe("FAILED");
    expect(log.entries).toEqual([
      expect.objectContaining({ status: "FAILED", error: "connect ECONNREFUSED 127.0.0.1:1025" }),
    ]);
  });

  it("records every attempt with its time", async () => {
    await service.sendConfirmation(details);
    email.failWith = new Error("timeout");
    await service.sendConfirmation(details);

    expect(log.entries.map((e) => e.status)).toEqual(["SENT", "FAILED"]);
    expect(log.entries.every((e) => e.createdAt instanceof Date)).toBe(true);
  });

  it("still records a reason when the error has an empty message", async () => {
    email.failWith = Object.assign(new AggregateError([], ""), { code: "ECONNREFUSED" });

    await service.sendConfirmation(details);

    expect(log.entries[0]).toMatchObject({ status: "FAILED", error: "ECONNREFUSED" });
  });
});
