import Link from "next/link";
import { StatusNotice } from "@/components/admin/status-notice";
import { getManagedPagePath, getManagedPages } from "@/lib/cms";

export default async function AdminPagesIndexPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string; status?: string }>;
}) {
  const { locale = "en", status } = await searchParams;
  const pages = await getManagedPages(locale);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Pages</div>
          <h1 className="admin-page-title">Static pages</h1>
          <p className="admin-help">
            Edit the public page copy for locale {locale.toUpperCase()}.
          </p>
        </div>
        <span className="admin-pill">{pages.length} pages</span>
      </div>

      <StatusNotice status={status} />

      <section className="admin-grid">
        {pages.map((page) => (
          <Link
            key={page.key}
            href={`/admin/pages/${page.key}?locale=${locale}`}
            className="admin-card block transition-colors hover:border-primary/40"
          >
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Page</div>
                <h2>{page.title}</h2>
                <p className="admin-muted">{getManagedPagePath(page.key)}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
