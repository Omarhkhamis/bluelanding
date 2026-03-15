import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminUser } from "@/lib/admin-auth";
import { getSections } from "@/lib/cms";
import { defaultSiteKey } from "@/lib/sites";

export default async function ProtectedAdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();
  const sections = await getSections(defaultSiteKey, "en");

  return (
    <AdminShell
      currentUser={{ name: user.name, email: user.email }}
      sections={sections.map((section) => ({ key: section.key, name: section.name }))}
    >
      {children}
    </AdminShell>
  );
}
