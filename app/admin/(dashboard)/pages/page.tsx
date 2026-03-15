import Link from "next/link";
import { StatusNotice } from "@/components/admin/status-notice";
import { getManagedPagePublicPath, getManagedPages } from "@/lib/cms";
import { buildAdminPath, getSiteLabel, normalizeSiteKey } from "@/lib/sites";

export default async function AdminPagesIndexPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string; site?: string; status?: string }>;
}) {
  const { locale = "en", site, status } = await searchParams;
  const siteKey = normalizeSiteKey(site);
  const pages = await getManagedPages(siteKey, locale);

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
        <div className="flex gap-2">
          <span className="admin-pill">{getSiteLabel(siteKey)}</span>
          <span className="admin-pill">{pages.length} pages</span>
        </div>
      </div>

      <StatusNotice status={status} />

      <section className="admin-grid">
        {pages.map((page) => (
          <Link
            key={page.key}
            href={buildAdminPath(`/admin/pages/${page.key}`, { siteKey, locale })}
            className="admin-card block transition-colors hover:border-primary/40"
          >
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Page</div>
                <h2>{page.title}</h2>
                <p className="admin-muted">
                  {getManagedPagePublicPath(page.key, siteKey, locale)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
