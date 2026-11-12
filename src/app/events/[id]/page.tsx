import Link from "next/link";
import { notFound } from "next/navigation";
import { eventRepository, registrationRepository } from "@/container";
import { seatsLeft } from "@/domain/event";
import { getSession } from "@/infrastructure/session";
import { formatDateTime } from "@/lib/format";
import { RegisterButton } from "./RegisterButton";

export default async function EventPage(props: PageProps<"/events/[id]">) {
  const { id } = await props.params;
  const event = await eventRepository.findById(id);
  if (!event) notFound();

  const session = await getSession();
  const registration =
    session?.role === "STUDENT"
      ? await registrationRepository.findByUserAndEvent(session.userId, event.id)
      : null;
  const left = seatsLeft(event);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
        {event.category === "TECH" ? "Tech event" : "College event"}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{event.title}</h1>

      <dl className="mt-6 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-zinc-500">When</dt>
        <dd>{formatDateTime(event.startsAt)}</dd>
        <dt className="text-zinc-500">Where</dt>
        <dd>{event.venue}</dd>
        <dt className="text-zinc-500">Register by</dt>
        <dd>{formatDateTime(event.registrationDeadline)}</dd>
        <dt className="text-zinc-500">Seats left</dt>
        <dd id="seats-left">
          {left} of {event.capacity}
        </dd>
      </dl>

      <p className="mt-6 max-w-prose text-zinc-700 dark:text-zinc-300">{event.description}</p>

      <div className="mt-8" id="registration-status">
        {event.status === "CANCELLED" ? (
          <p className="font-medium text-red-600">This event has been cancelled.</p>
        ) : registration?.status === "CONFIRMED" ? (
          <p className="font-medium text-green-600">You&apos;re registered for this event.</p>
        ) : !session ? (
          <p>
            <Link href="/signup" className="font-medium text-blue-600 hover:underline">
              Sign up
            </Link>{" "}
            to register for this event.
          </p>
        ) : session.role !== "STUDENT" ? (
          <p className="text-zinc-500">Admins can&apos;t register for events.</p>
        ) : new Date() > event.registrationDeadline ? (
          <p className="font-medium text-zinc-500">Registration closed</p>
        ) : left === 0 ? (
          <button
            id="register-button"
            type="button"
            disabled
            className="w-fit rounded-md bg-zinc-400 px-5 py-2.5 font-medium text-white"
          >
            Full
          </button>
        ) : (
          <RegisterButton eventId={event.id} />
        )}
      </div>
    </main>
  );
}
