import { Prisma, type PrismaClient } from "@prisma/client";
import { EmailAlreadyRegisteredError } from "@/domain/errors";
import type { NewUser, UserRepository } from "@/domain/ports";
import type { UserRecord } from "@/domain/user";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async create(user: NewUser): Promise<UserRecord> {
    try {
      return await this.db.user.create({ data: user });
    } catch (error) {
      // Two sign-ups racing for the same email: the unique index decides.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new EmailAlreadyRegisteredError();
      }
      throw error;
    }
  }
}
