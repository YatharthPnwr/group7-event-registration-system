import { registrationService } from "@/container";
import {
  AlreadyRegisteredError,
  EventCancelledError,
  EventFullError,
  EventNotFoundError,
  RegistrationClosedError,
} from "@/domain/errors";
import { getSession } from "@/infrastructure/session";

// POST /api/events/:id/register  (logged-in students only)
export async function POST(_request: Request, ctx: RouteContext<"/api/events/[id]/register">) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Please log in to register" }, { status: 401 });
  }
  if (session.role !== "STUDENT") {
    return Response.json({ error: "Only students can register for events" }, { status: 403 });
  }

  const { id } = await ctx.params;
  try {
    const registration = await registrationService.register(session.userId, id);
    return Response.json({ registration }, { status: 201 });
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (
      error instanceof AlreadyRegisteredError ||
      error instanceof EventFullError ||
      error instanceof RegistrationClosedError ||
      error instanceof EventCancelledError
    ) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
