import { BcryptPasswordHasher } from "@/infrastructure/BcryptPasswordHasher";
import { prisma } from "@/infrastructure/db";
import { PrismaEventRepository } from "@/infrastructure/PrismaEventRepository";
import { PrismaNotificationLog } from "@/infrastructure/PrismaNotificationLog";
import { PrismaRegistrationRepository } from "@/infrastructure/PrismaRegistrationRepository";
import { PrismaUserRepository } from "@/infrastructure/PrismaUserRepository";
import { SmtpEmailSender, smtpConfigFromEnv } from "@/infrastructure/SmtpEmailSender";
import { AuthService } from "@/services/AuthService";
import { EventService } from "@/services/EventService";
import { NotificationService } from "@/services/NotificationService";
import { RegistrationService } from "@/services/RegistrationService";

// Composition root: the one place that picks concrete implementations.
export const eventRepository = new PrismaEventRepository(prisma);
export const eventCatalog = eventRepository;
export const registrationRepository = new PrismaRegistrationRepository(prisma);

export const userRepository = new PrismaUserRepository(prisma);

export const authService = new AuthService(userRepository, new BcryptPasswordHasher());

export const registrationService = new RegistrationService(eventRepository, registrationRepository);

export const eventService = new EventService(eventRepository);

export const notificationService = new NotificationService(
  new SmtpEmailSender(smtpConfigFromEnv()),
  new PrismaNotificationLog(prisma),
);
