import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/infrastructure/db";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Admin · Event Registration System" };

export default async function AdminDashboard() {
  const events = await prisma.event.findMany({ orderBy: { startsAt: "asc" } });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Admin dashboard</h1>
        <Link
          id="create-event-link"
          href="/admin/events/new"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Create event
        </Link>
      </div>

      <table id="admin-events" className="mt-8 w-full text-left text-sm">
        <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
          <tr>
            <th className="py-2 pr-4 font-medium">Event</th>
            <th className="py-2 pr-4 font-medium">Starts</th>
            <th className="py-2 pr-4 font-medium">Registered</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-3 pr-4">
                <Link href={`/events/${event.id}`} className="font-medium hover:underline">
                  {event.title}
                </Link>
              </td>
              <td className="py-3 pr-4">{formatDateTime(event.startsAt)}</td>
              <td className="py-3 pr-4">
                <Link href={`/admin/events/${event.id}`} className="text-blue-600 hover:underline">
                  {event.seatsTaken} / {event.capacity}
                </Link>
              </td>
              <td className="py-3">{event.status === "CANCELLED" ? "Cancelled" : "Published"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
