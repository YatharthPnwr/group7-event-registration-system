export type EventCategory = "COLLEGE" | "TECH";
export type EventStatus = "PUBLISHED" | "CANCELLED";

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  startsAt: Date;
  registrationDeadline: Date;
  capacity: number;
  seatsTaken: number;
  status: EventStatus;
}

export function seatsLeft(event: Pick<EventRecord, "capacity" | "seatsTaken">): number {
  return Math.max(0, event.capacity - event.seatsTaken);
}
