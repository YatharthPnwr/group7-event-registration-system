import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/infrastructure/session";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = { title: "Sign up · Event Registration System" };

export default async function SignUpPage() {
  if (await getSession()) redirect("/");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <h1 className="mb-2 text-2xl font-bold">Create your student account</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Sign up to register for college and tech events.
      </p>
      <SignUpForm />
    </main>
  );
}
