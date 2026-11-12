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

export class EventNotFoundError extends Error {
  constructor() {
    super("Event not found");
    this.name = "EventNotFoundError";
  }
}

export class AlreadyRegisteredError extends Error {
  constructor() {
    super("Already registered");
    this.name = "AlreadyRegisteredError";
  }
}

export class EventFullError extends Error {
  constructor() {
    super("Event full");
    this.name = "EventFullError";
  }
}

export class RegistrationClosedError extends Error {
  constructor() {
    super("Registration closed");
    this.name = "RegistrationClosedError";
  }
}

export class EventCancelledError extends Error {
  constructor() {
    super("Event cancelled");
    this.name = "EventCancelledError";
  }
}
