import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaEventRepository } from "@/infrastructure/PrismaEventRepository";

const db = new PrismaClient();
const catalog = new PrismaEventRepository(db);
const run = `cat-${Date.now()}`;
const NOW = new Date("2030-01-10T00:00:00Z"); // far future so seeded demo events count as past
const day = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

function event(title: string, startsAt: Date, extra: Record<string, unknown> = {}) {
  return {
    title: `${run} ${title}`,
    description: "Catalog test",
    category: "TECH" as const,
    venue: "Hall",
    startsAt,
    registrationDeadline: day(-1),
    capacity: 10,
    ...extra,
  };
}

describe("PrismaEventRepository.findUpcoming (US-04)", () => {
  beforeAll(async () => {
    await db.event.createMany({
      data: [
        event("Later", day(5)),
        event("Sooner", day(2)),
        event("Already happened", day(-3)),
        event("Cancelled", day(4), { status: "CANCELLED" }),
        event("Culture night", day(3), { category: "COLLEGE" }),
      ],
    });
  });

  afterAll(async () => {
    await db.event.deleteMany({ where: { title: { startsWith: run } } });
    await db.$disconnect();
  });

  const titles = (events: { title: string }[]) =>
    events.filter((e) => e.title.startsWith(run)).map((e) => e.title.replace(`${run} `, ""));

  it("lists only published events that have not started, soonest first", async () => {
    expect(titles(await catalog.findUpcoming({ now: NOW }))).toEqual(["Sooner", "Culture night", "Later"]);
  });

  it("filters by category", async () => {
    expect(titles(await catalog.findUpcoming({ now: NOW, category: "COLLEGE" }))).toEqual(["Culture night"]);
  });

  it("searches titles ignoring upper and lower case", async () => {
    expect(titles(await catalog.findUpcoming({ now: NOW, search: "  SOON " }))).toEqual(["Sooner"]);
  });
});
