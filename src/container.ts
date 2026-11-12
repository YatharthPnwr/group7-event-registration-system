import { BcryptPasswordHasher } from "@/infrastructure/BcryptPasswordHasher";
import { prisma } from "@/infrastructure/db";
import { PrismaUserRepository } from "@/infrastructure/PrismaUserRepository";
import { AuthService } from "@/services/AuthService";

// Composition root: the one place that picks concrete implementations.
export const authService = new AuthService(
  new PrismaUserRepository(prisma),
  new BcryptPasswordHasher(),
);
