// Liveness check used by CI, Docker and deployment smoke tests.
export function GET() {
  return Response.json({ status: "ok" });
}
