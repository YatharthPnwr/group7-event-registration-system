"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button id="logout-button" type="button" onClick={logOut} className="text-zinc-600 hover:underline dark:text-zinc-400">
      Log out
    </button>
  );
}
