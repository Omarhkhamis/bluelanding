import { saveSeoAction } from "@/app/admin/actions";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { StatusNotice } from "@/components/admin/status-notice";
import { getSeoSettings } from "@/lib/cms";

export default async function AdminSeoPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string; status?: string }>;
}) {
  const { locale = "en", status } = await searchParams;
  const seo = await getSeoSettings(locale);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Settings</div>
          <h1 className="admin-page-title">SEO</h1>
          <p className="admin-help">
            Controls search listing and social preview presentation for the public site.
          </p>
        </div>
      </div>

      <StatusNotice status={status} />

      <form action={saveSeoAction} className="admin-card admin-form">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnPath" value="/admin/seo" />

        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="metaTitle">Meta title</label>
            <input id="metaTitle" name="metaTitle" defaultValue={seo.metaTitle} className="admin-input" />
          </div>
          <MediaUrlField
            name="ogImageUrl"
            label="Meta image"
            defaultValue={seo.ogImageUrl}
          />
          <div className="admin-field">
            <label htmlFor="metaKeywords">Meta keywords</label>
            <input
              id="metaKeywords"
              name="metaKeywords"
              defaultValue={seo.metaKeywords}
              className="admin-input"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="canonicalUrl">Canonical URL</label>
            <input
              id="canonicalUrl"
              name="canonicalUrl"
              defaultValue={seo.canonicalUrl}
              className="admin-input"
            />
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="metaDescription">Meta description</label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            defaultValue={seo.metaDescription}
            className="admin-textarea"
          />
        </div>

        <div className="admin-field">
          <label htmlFor="robots">Robots</label>
          <input id="robots" name="robots" defaultValue={seo.robots} className="admin-input" />
        </div>

        <div className="admin-actions">
          <button type="submit" className="admin-button">
            Save SEO
          </button>
        </div>
      </form>
    </>
  );
}
