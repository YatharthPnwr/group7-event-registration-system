import Link from "next/link";
import { getSession } from "@/infrastructure/session";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-semibold">
          Event Registration
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {session ? (
            <span id="current-user">
              Signed in as <strong>{session.name}</strong> (
              {session.role === "ADMIN" ? "Admin" : "Student"})
            </span>
          ) : (
            <Link href="/signup" className="font-medium text-blue-600 hover:underline">
              Sign up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
