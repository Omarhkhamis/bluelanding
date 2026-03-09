import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminUser } from "@/lib/admin-auth";
import { getSections } from "@/lib/cms";

export default async function ProtectedAdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();
  const sections = await getSections("en");

  return (
    <AdminShell
      currentUser={{ name: user.name, email: user.email }}
      sections={sections.map((section) => ({ key: section.key, name: section.name }))}
    >
      {children}
    </AdminShell>
  );
}
