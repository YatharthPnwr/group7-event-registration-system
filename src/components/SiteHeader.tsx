import Link from "next/link";
import { getSession } from "@/infrastructure/session";
import { LogoutButton } from "./LogoutButton";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-semibold">
          Event Registration
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/events" className="hover:underline">
            Events
          </Link>
          {session?.role === "STUDENT" && (
            <Link href="/my-registrations" className="hover:underline">
              My registrations
            </Link>
          )}
          {session?.role === "ADMIN" && (
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          )}
          {session ? (
            <>
              <span id="current-user">
                Signed in as <strong>{session.name}</strong> (
                {session.role === "ADMIN" ? "Admin" : "Student"})
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Log in
              </Link>
              <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
