/** Field name -> message shown next to that field in the form. */
export type FieldErrors = Partial<Record<string, string>>;

export class ValidationError extends Error {
  constructor(public readonly fieldErrors: FieldErrors) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("Email already registered");
    this.name = "EmailAlreadyRegisteredError";
  }
}
