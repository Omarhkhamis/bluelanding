import { deleteMediaAction, uploadMediaAction } from "@/app/admin/actions";
import { CopyAssetButton } from "@/components/admin/copy-asset-button";
import { StatusNotice } from "@/components/admin/status-notice";
import { getMediaAssets } from "@/lib/cms";
import { normalizeSiteKey } from "@/lib/sites";

export default async function AdminMediaPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string; site?: string; status?: string }>;
}) {
  const { locale = "en", site, status } = await searchParams;
  const siteKey = normalizeSiteKey(site);
  const mediaAssets = await getMediaAssets(siteKey);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Settings</div>
          <h1 className="admin-page-title">Media library</h1>
          <p className="admin-help">
            Upload image or video assets, then copy their URLs into content fields.
          </p>
        </div>
      </div>

      <StatusNotice status={status} />

      <form action={uploadMediaAction} className="admin-card admin-form">
        <input type="hidden" name="site" value={siteKey} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnPath" value="/admin/media" />
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="file">Asset file</label>
            <input id="file" name="file" type="file" className="admin-input" />
          </div>
          <div className="admin-field">
            <label htmlFor="altText">Alt text</label>
            <input id="altText" name="altText" className="admin-input" />
          </div>
        </div>
        <div className="admin-actions">
          <button type="submit" className="admin-button">
            Upload asset
          </button>
        </div>
      </form>

      <section className="admin-media-grid">
        {mediaAssets.map((asset) => {
          const isVideo = asset.mimeType.startsWith("video/");

          return (
            <article key={asset.id} className="admin-card admin-form">
              {isVideo ? (
                <video src={asset.url} controls className="admin-media-preview" />
              ) : (
                <img src={asset.url} alt={asset.altText || asset.originalName} className="admin-media-preview" />
              )}
              <div>
                <div className="admin-eyebrow">{asset.category}</div>
                <h3>{asset.originalName}</h3>
                <p className="admin-muted">{asset.url}</p>
              </div>
              <div className="admin-actions">
                <CopyAssetButton url={asset.url} />
                <form action={deleteMediaAction}>
                  <input type="hidden" name="site" value={siteKey} />
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="returnPath" value="/admin/media" />
                  <input type="hidden" name="id" value={asset.id} />
                  <button type="submit" className="admin-button-danger">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
