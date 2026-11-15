import { destroySession } from "@/infrastructure/session";

// POST /api/auth/logout
export async function POST() {
  await destroySession();
  return Response.json({ ok: true });
}
