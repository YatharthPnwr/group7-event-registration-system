import { requireAdmin } from "@/infrastructure/session";

// Every page under /admin is admins-only (US-02).
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin("/admin");
  return <>{children}</>;
}
