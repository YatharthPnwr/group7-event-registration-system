// Demo data for local development and the viva. Safe to run more than once.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const events = [
  {
    id: "seed-docker-workshop",
    title: "Intro to Docker Workshop",
    description: "Hands-on session: containers, images and docker compose. Bring a laptop.",
    category: "TECH",
    venue: "Computer Lab 3",
    startsAt: "2026-11-20T10:00:00+05:30",
    registrationDeadline: "2026-11-19T18:00:00+05:30",
    capacity: 40,
  },
  {
    id: "seed-ai-talk",
    title: "Guest Talk: AI in Healthcare",
    description: "An industry speaker on how hospitals use machine learning. Only 2 seats, to demo a full event.",
    category: "TECH",
    venue: "Seminar Hall",
    startsAt: "2026-11-24T15:00:00+05:30",
    registrationDeadline: "2026-11-23T18:00:00+05:30",
    capacity: 2,
  },
  {
    id: "seed-hackathon",
    title: "24-Hour Campus Hackathon",
    description: "Teams of up to four build anything in 24 hours. Food provided.",
    category: "TECH",
    venue: "Innovation Centre",
    startsAt: "2026-11-28T09:00:00+05:30",
    registrationDeadline: "2026-11-26T23:59:00+05:30",
    capacity: 100,
  },
  {
    id: "seed-cultural-night",
    title: "Annual Cultural Night",
    description: "Music, dance and drama from every department.",
    category: "COLLEGE",
    venue: "Main Auditorium",
    startsAt: "2026-12-05T18:00:00+05:30",
    registrationDeadline: "2026-12-04T18:00:00+05:30",
    capacity: 300,
  },
];

for (const event of events) {
  await prisma.event.upsert({
    where: { id: event.id },
    update: {},
    create: {
      ...event,
      startsAt: new Date(event.startsAt),
      registrationDeadline: new Date(event.registrationDeadline),
    },
  });
}

console.log(`Seeded ${events.length} demo events.`);

// Admin account. Credentials come from the environment (see .env.example),
// so production uses its own password.
const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      name: "Event Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });
  console.log(`Admin account ready: ${adminEmail}`);
} else {
  console.log("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set: no admin account created.");
}
await prisma.$disconnect();
