import { saveGeneralSettingsAction } from "@/app/admin/actions";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { StatusNotice } from "@/components/admin/status-notice";
import { getFooterSettings, getSiteSettings } from "@/lib/cms";
import { normalizeSiteKey } from "@/lib/sites";

export default async function AdminGeneralPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string; site?: string; status?: string }>;
}) {
  const { locale = "en", site: siteParam, status } = await searchParams;
  const siteKey = normalizeSiteKey(siteParam);
  const [site, footer] = await Promise.all([
    getSiteSettings(siteKey, locale),
    getFooterSettings(siteKey, locale)
  ]);

  const instagram = footer.socialLinks.find((item) => item.platform === "instagram")?.url || "";
  const facebook = footer.socialLinks.find((item) => item.platform === "facebook")?.url || "";
  const youtube = footer.socialLinks.find((item) => item.platform === "youtube")?.url || "";

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Settings</div>
          <h1 className="admin-page-title">General settings</h1>
          <p className="admin-help">Core contact, brand, and social data for the site.</p>
        </div>
      </div>

      <StatusNotice status={status} />

      <form action={saveGeneralSettingsAction} className="admin-form">
        <input type="hidden" name="site" value={siteKey} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnPath" value="/admin/general" />

        <section className="admin-card admin-form">
          <div className="admin-card-header">
            <div>
              <div className="admin-eyebrow">Brand</div>
              <h2>Brand assets</h2>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="siteName">Site name</label>
              <input id="siteName" name="siteName" defaultValue={site.siteName} className="admin-input" />
            </div>
            <div className="admin-field">
              <label htmlFor="siteTitle">Site title</label>
              <input id="siteTitle" name="siteTitle" defaultValue={site.siteTitle} className="admin-input" />
            </div>
            <MediaUrlField name="logoUrl" label="Logo URL" defaultValue={site.logoUrl} />
            <MediaUrlField
              name="faviconUrl"
              label="Favicon URL"
              defaultValue={site.faviconUrl}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="siteDescription">Site description</label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              defaultValue={site.siteDescription}
              className="admin-textarea"
            />
          </div>
        </section>

        <section className="admin-card admin-form">
          <div className="admin-card-header">
            <div>
              <div className="admin-eyebrow">Contact</div>
              <h2>Public contact details</h2>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" defaultValue={footer.phone} className="admin-input" />
            </div>
            <div className="admin-field">
              <label htmlFor="whatsappUrl">WhatsApp URL</label>
              <input
                id="whatsappUrl"
                name="whatsappUrl"
                defaultValue={site.whatsappUrl}
                className="admin-input"
              />
            </div>
            <div className="admin-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" defaultValue={footer.email} className="admin-input" />
            </div>
            <div className="admin-field">
              <label htmlFor="copyrightText">Copyright text</label>
              <input
                id="copyrightText"
                name="copyrightText"
                defaultValue={footer.copyrightText}
                className="admin-input"
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              defaultValue={footer.address}
              className="admin-textarea"
            />
          </div>

          <input type="hidden" name="footerLogoUrl" value={footer.logoUrl} />
        </section>

        <section className="admin-card admin-form">
          <div className="admin-card-header">
            <div>
              <div className="admin-eyebrow">Social</div>
              <h2>Social links</h2>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="instagram">Instagram</label>
              <input id="instagram" name="instagram" defaultValue={instagram} className="admin-input" />
            </div>
            <div className="admin-field">
              <label htmlFor="facebook">Facebook</label>
              <input id="facebook" name="facebook" defaultValue={facebook} className="admin-input" />
            </div>
            <div className="admin-field">
              <label htmlFor="youtube">YouTube</label>
              <input id="youtube" name="youtube" defaultValue={youtube} className="admin-input" />
            </div>
          </div>
        </section>

        <div className="admin-actions">
          <button type="submit" className="admin-button">
            Save settings
          </button>
        </div>
      </form>
    </>
  );
}
