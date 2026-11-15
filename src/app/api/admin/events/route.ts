import { eventService } from "@/container";
import { ValidationError } from "@/domain/errors";
import { getSession } from "@/infrastructure/session";

// POST /api/admin/events  (admins only)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please log in" }, { status: 401 });
  if (session.role !== "ADMIN") return Response.json({ error: "Admins only" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  try {
    const event = await eventService.create(body);
    return Response.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json({ fieldErrors: error.fieldErrors }, { status: 400 });
    }
    throw error;
  }
}
