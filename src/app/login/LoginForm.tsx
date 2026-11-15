"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        // Only follow same-site paths from ?next=, never a full URL.
        const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
        router.push(safeNext ?? body.redirectTo ?? "/events");
        router.refresh();
        return;
      }
      setError(body.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const input =
    "rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";

  return (
    <form id="login-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" className={input} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" className={input} />
      </div>
      {error && (
        <p id="login-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        id="login-submit"
        type="submit"
        disabled={submitting}
        className="rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
