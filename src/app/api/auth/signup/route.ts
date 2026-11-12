import { authService } from "@/container";
import { EmailAlreadyRegisteredError, ValidationError } from "@/domain/errors";
import { createSession } from "@/infrastructure/session";

// POST /api/auth/signup  { name, email, password }
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  try {
    const user = await authService.signUp(body);
    await createSession(user);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json({ fieldErrors: error.fieldErrors }, { status: 400 });
    }
    if (error instanceof EmailAlreadyRegisteredError) {
      return Response.json({ fieldErrors: { email: error.message } }, { status: 409 });
    }
    throw error;
  }
}
