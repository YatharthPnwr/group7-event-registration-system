import { registrationService } from "@/container";
import { CancellationNotAllowedError, RegistrationNotFoundError } from "@/domain/errors";
import { getSession } from "@/infrastructure/session";

// POST /api/registrations/:id/cancel  (the student who owns it)
export async function POST(_request: Request, ctx: RouteContext<"/api/registrations/[id]/cancel">) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please log in" }, { status: 401 });

  const { id } = await ctx.params;
  try {
    const registration = await registrationService.cancel(session.userId, id);
    return Response.json({ registration });
  } catch (error) {
    if (error instanceof RegistrationNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof CancellationNotAllowedError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
