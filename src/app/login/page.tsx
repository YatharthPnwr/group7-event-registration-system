import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/infrastructure/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in · Event Registration System" };

export default async function LoginPage(props: PageProps<"/login">) {
  const session = await getSession();
  if (session) redirect(session.role === "ADMIN" ? "/admin" : "/events");

  const { next } = await props.searchParams;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <h1 className="mb-2 text-2xl font-bold">Log in</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        New here?{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:underline">
          Create a student account
        </Link>
      </p>
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </main>
  );
}
