import type { Metadata } from "next";
import { NewEventForm } from "./NewEventForm";

export const metadata: Metadata = { title: "Create event · Admin" };

export default function NewEventPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Create an event</h1>
      <NewEventForm />
    </main>
  );
}
