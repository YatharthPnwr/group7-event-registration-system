import Link from "next/link";
import { seatsLeft, type EventRecord } from "@/domain/event";
import { formatDateTime } from "@/lib/format";

export function EventCard({ event }: { event: EventRecord }) {
  const left = seatsLeft(event);

  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        data-event-id={event.id}
        className="event-card flex h-full flex-col gap-2 rounded-xl border border-zinc-200 p-5 transition-colors hover:border-blue-500 dark:border-zinc-800"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          {event.category === "TECH" ? "Tech" : "College"}
        </span>
        <span className="event-title text-lg font-semibold">{event.title}</span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {formatDateTime(event.startsAt)} · {event.venue}
        </span>
        <span className="seats mt-auto pt-2 text-sm font-medium">
          {left === 0 ? (
            <span className="rounded bg-zinc-200 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Full
            </span>
          ) : (
            <span className="text-green-700 dark:text-green-500">
              {left} of {event.capacity} seats left
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}
