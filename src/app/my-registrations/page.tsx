import type { Metadata } from "next";
import Link from "next/link";
import { registrationService } from "@/container";
import { requireSession } from "@/infrastructure/session";
import { formatDateTime } from "@/lib/format";
import { CancelButton } from "./CancelButton";

export const metadata: Metadata = { title: "My registrations · Event Registration System" };

export default async function MyRegistrationsPage() {
  const session = await requireSession("/my-registrations");
  const registrations = await registrationService.listForUser(session.userId);
  const now = new Date();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold">My registrations</h1>

      {registrations.length === 0 ? (
        <p id="no-registrations" className="mt-8 text-zinc-500">
          You haven&apos;t registered for any events yet.{" "}
          <Link href="/events" className="font-medium text-blue-600 hover:underline">
            Browse events
          </Link>
        </p>
      ) : (
        <ul id="registration-list" className="mt-8 flex flex-col gap-3">
          {registrations.map((registration) => (
            <li
              key={registration.id}
              data-registration-id={registration.id}
              className="registration flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex flex-col gap-1">
                <Link href={`/events/${registration.event.id}`} className="font-semibold hover:underline">
                  {registration.event.title}
                </Link>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDateTime(registration.event.startsAt)} · {registration.event.venue}
                </span>
                <span
                  className={`registration-status text-sm font-medium ${
                    registration.status === "CONFIRMED" ? "text-green-700 dark:text-green-500" : "text-zinc-500"
                  }`}
                >
                  {registration.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}
                </span>
              </div>
              {registration.status === "CONFIRMED" && registration.event.startsAt > now && (
                <CancelButton registrationId={registration.id} />
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
