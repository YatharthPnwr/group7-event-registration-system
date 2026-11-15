import { authService } from "@/container";
import { InvalidCredentialsError } from "@/domain/errors";
import { createSession } from "@/infrastructure/session";

// POST /api/auth/login  { email, password }
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  try {
    const user = await authService.logIn(body);
    await createSession(user);
    return Response.json({ user, redirectTo: user.role === "ADMIN" ? "/admin" : "/events" });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }
}
