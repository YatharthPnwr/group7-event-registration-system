import type { Metadata } from "next";
import { eventCatalog } from "@/container";
import { EventCard } from "@/components/EventCard";

export const metadata: Metadata = { title: "Upcoming events · Event Registration System" };

export default async function EventsPage() {
  const events = await eventCatalog.findUpcoming({ now: new Date() });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold">Upcoming events</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        College and tech events open for registration, soonest first.
      </p>

      {events.length === 0 ? (
        <p id="no-events" className="mt-10 text-zinc-500">
          No events found.
        </p>
      ) : (
        <ul id="event-list" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}
    </main>
  );
}
