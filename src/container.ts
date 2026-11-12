import { BcryptPasswordHasher } from "@/infrastructure/BcryptPasswordHasher";
import { prisma } from "@/infrastructure/db";
import { PrismaEventRepository } from "@/infrastructure/PrismaEventRepository";
import { PrismaRegistrationRepository } from "@/infrastructure/PrismaRegistrationRepository";
import { PrismaUserRepository } from "@/infrastructure/PrismaUserRepository";
import { AuthService } from "@/services/AuthService";
import { RegistrationService } from "@/services/RegistrationService";

// Composition root: the one place that picks concrete implementations.
export const eventRepository = new PrismaEventRepository(prisma);
export const registrationRepository = new PrismaRegistrationRepository(prisma);

export const authService = new AuthService(
  new PrismaUserRepository(prisma),
  new BcryptPasswordHasher(),
);

export const registrationService = new RegistrationService(eventRepository, registrationRepository);
