import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eventRegistrants, eventRepository } from "@/container";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Registrations · Admin" };

export default async function EventRegistrationsPage(props: PageProps<"/admin/events/[id]">) {
  const { id } = await props.params;
  const event = await eventRepository.findById(id);
  if (!event) notFound();

  const registrants = await eventRegistrants.listForEvent(id);
  const confirmed = registrants.filter((r) => r.status === "CONFIRMED").length;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">
        ← Admin dashboard
      </Link>
      <h1 className="mt-2 text-3xl font-bold">{event.title}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        {formatDateTime(event.startsAt)} · {event.venue}
      </p>
      <p id="confirmed-count" className="mt-6 text-lg font-semibold">
        {confirmed} / {event.capacity} confirmed
      </p>

      {registrants.length === 0 ? (
        <p id="no-registrants" className="mt-6 text-zinc-500">
          No one has registered yet.
        </p>
      ) : (
        <table id="registrants" className="mt-6 w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Registered</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium">Confirmation email</th>
            </tr>
          </thead>
          <tbody>
            {registrants.map((r) => (
              <tr key={r.registrationId} data-registration-id={r.registrationId} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-3 pr-4 font-medium">{r.name}</td>
                <td className="py-3 pr-4">{r.email}</td>
                <td className="py-3 pr-4">{formatDateTime(r.registeredAt)}</td>
                <td className="py-3 pr-4">{r.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}</td>
                <td className="py-3">
                  {r.emailStatus === "SENT" ? (
                    <span className="text-green-700 dark:text-green-500">Sent</span>
                  ) : r.emailStatus === "FAILED" ? (
                    <span className="font-medium text-red-600">Failed</span>
                  ) : (
                    <span className="text-zinc-500">Not sent</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
