"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Errors = Partial<Record<string, string>>;

const input = "rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700 aria-[invalid=true]:border-red-500";

export function NewEventForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    // datetime-local has no timezone: read it in the admin's own timezone, send ISO.
    for (const field of ["startsAt", "registrationDeadline"]) {
      if (values[field]) values[field] = new Date(values[field]).toISOString();
    }
    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        router.push(`/events/${body.event.id}`);
        router.refresh();
        return;
      }
      setErrors(body.fieldErrors ?? { form: body.error ?? "Something went wrong. Please try again." });
    } catch {
      setErrors({ form: "Could not reach the server. Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const field = (name: string, label: string, control: React.ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {control}
      {errors[name] && (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {errors[name]}
        </p>
      )}
    </div>
  );
  const invalid = (name: string) => (errors[name] ? true : undefined);

  return (
    <form id="new-event-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {field("title", "Title", <input id="title" name="title" className={input} aria-invalid={invalid("title")} />)}
      {field(
        "description",
        "Description",
        <textarea id="description" name="description" rows={4} className={input} aria-invalid={invalid("description")} />,
      )}
      {field(
        "category",
        "Category",
        <select id="category" name="category" defaultValue="TECH" className={input} aria-invalid={invalid("category")}>
          <option value="TECH">Tech</option>
          <option value="COLLEGE">College</option>
        </select>,
      )}
      {field("venue", "Venue", <input id="venue" name="venue" className={input} aria-invalid={invalid("venue")} />)}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "startsAt",
          "Starts at",
          <input id="startsAt" name="startsAt" type="datetime-local" className={input} aria-invalid={invalid("startsAt")} />,
        )}
        {field(
          "registrationDeadline",
          "Registration deadline",
          <input
            id="registrationDeadline"
            name="registrationDeadline"
            type="datetime-local"
            className={input}
            aria-invalid={invalid("registrationDeadline")}
          />,
        )}
      </div>
      {field(
        "capacity",
        "Capacity (seats)",
        <input id="capacity" name="capacity" type="number" min={1} className={input} aria-invalid={invalid("capacity")} />,
      )}
      {errors.form && (
        <p id="form-error" role="alert" className="text-sm text-red-600">
          {errors.form}
        </p>
      )}
      <button
        id="create-event-submit"
        type="submit"
        disabled={submitting}
        className="w-fit rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
