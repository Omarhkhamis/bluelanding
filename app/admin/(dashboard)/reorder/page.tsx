import { ReorderSectionsForm } from "@/components/admin/reorder-sections-form";
import { StatusNotice } from "@/components/admin/status-notice";
import { getSections } from "@/lib/cms";

export default async function AdminReorderPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string; status?: string }>;
}) {
  const { locale = "en", status } = await searchParams;
  const sections = await getSections(locale);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Settings</div>
          <h1 className="admin-page-title">Reorder sections</h1>
          <p className="admin-help">Adjust display order and enabled state only.</p>
        </div>
      </div>

      <StatusNotice status={status} />

      <ReorderSectionsForm
        locale={locale}
        sections={sections.map((section) => ({
          key: section.key,
          name: section.name,
          isActive: section.isActive
        }))}
      />
    </>
  );
}
