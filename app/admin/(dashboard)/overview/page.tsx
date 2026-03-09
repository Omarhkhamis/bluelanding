import { StatusNotice } from "@/components/admin/status-notice";
import { getSections } from "@/lib/cms";

export default async function AdminOverviewPage({
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
          <div className="admin-eyebrow">Overview</div>
          <h1 className="admin-page-title">Section status</h1>
          <p className="admin-help">
            Internal content status for the active locale.
          </p>
        </div>
        <span className="admin-pill">{locale.toUpperCase()}</span>
      </div>

      <StatusNotice status={status} />

      <section className="admin-grid">
        {sections.map((section) => (
          <article key={section.key} className="admin-card">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>{section.name}</h2>
                <p className="admin-muted">{section.key}</p>
              </div>
              <div className="admin-status-row">
                <span
                  className={`admin-status-dot ${
                    section.isActive ? "admin-status-dot-active" : ""
                  }`}
                />
                <span className="admin-muted">
                  {section.isActive ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
