"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Field = "name" | "email" | "password";
type Errors = Partial<Record<Field | "form", string>>;

export function SignUpForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    const values = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        router.push("/");
        router.refresh();
        return;
      }
      const body = await response.json().catch(() => ({}));
      setErrors(body.fieldErrors ?? { form: "Something went wrong. Please try again." });
    } catch {
      setErrors({ form: "Could not reach the server. Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id="signup-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField name="name" label="Full name" autoComplete="name" error={errors.name} />
      <TextField name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <TextField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters"
        error={errors.password}
      />
      {errors.form && (
        <p id="form-error" role="alert" className="text-sm text-red-600">
          {errors.form}
        </p>
      )}
      <button
        id="signup-submit"
        type="submit"
        disabled={submitting}
        className="rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

function TextField(props: {
  name: Field;
  label: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
}) {
  const { name, label, type = "text", autoComplete, hint, error } = props;
  const describedBy = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700 aria-[invalid=true]:border-red-500"
      />
      {hint && !error && (
        <p id={`${name}-hint`} className="text-xs text-zinc-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
