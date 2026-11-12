import { z } from "zod";
import { EmailAlreadyRegisteredError, ValidationError, type FieldErrors } from "@/domain/errors";
import type { PasswordHasher, UserRepository } from "@/domain/ports";
import { toPublicUser, type User } from "@/domain/user";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignUpInput = z.input<typeof signUpSchema>;

function toFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    fieldErrors[field] ??= issue.message;
  }
  return fieldErrors;
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  /** US-01: creates a STUDENT account. Throws ValidationError or EmailAlreadyRegisteredError. */
  async signUp(input: unknown): Promise<User> {
    const parsed = signUpSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }
    const { name, email, password } = parsed.data;

    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyRegisteredError();
    }

    const passwordHash = await this.hasher.hash(password);
    const created = await this.users.create({ name, email, passwordHash, role: "STUDENT" });
    return toPublicUser(created);
  }
}
