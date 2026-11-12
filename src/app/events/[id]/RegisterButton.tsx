"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function register() {
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/events/${eventId}/register`, { method: "POST" });
      if (response.ok) {
        router.refresh();
        return;
      }
      const body = await response.json().catch(() => ({}));
      setMessage(body.error ?? "Something went wrong. Please try again.");
      router.refresh();
    } catch {
      setMessage("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        id="register-button"
        type="button"
        onClick={register}
        disabled={submitting}
        className="w-fit rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "Registering…" : "Register"}
      </button>
      {message && (
        <p id="register-message" role="alert" className="text-sm text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
