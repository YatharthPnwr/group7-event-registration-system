export type Role = "STUDENT" | "ADMIN";

/** A user as the rest of the app sees it: never carries the password hash. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** A user as stored, including the bcrypt hash. Only auth code touches this. */
export interface UserRecord extends User {
  passwordHash: string;
}

export function toPublicUser(record: UserRecord): User {
  return { id: record.id, name: record.name, email: record.email, role: record.role };
}
