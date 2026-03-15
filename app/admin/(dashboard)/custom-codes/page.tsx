import { saveCustomCodesAction } from "@/app/admin/actions";
import { StatusNotice } from "@/components/admin/status-notice";
import { getCustomCodes } from "@/lib/cms";
import { normalizeSiteKey } from "@/lib/sites";

export default async function AdminCustomCodesPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string; site?: string; status?: string }>;
}) {
  const { locale = "en", site, status } = await searchParams;
  const siteKey = normalizeSiteKey(site);
  const codes = await getCustomCodes(siteKey);
  const headCode = codes.find((code) => code.placement === "HEAD");
  const bodyCode = codes.find((code) => code.placement === "BODY_END");

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Settings</div>
          <h1 className="admin-page-title">Custom codes</h1>
          <p className="admin-help">
            These snippets affect the public site and should be used carefully.
          </p>
        </div>
      </div>

      <StatusNotice status={status} />

      <form action={saveCustomCodesAction} className="admin-form">
        <input type="hidden" name="site" value={siteKey} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnPath" value="/admin/custom-codes" />
        <input type="hidden" name="headId" value={headCode?.id || ""} />
        <input type="hidden" name="bodyId" value={bodyCode?.id || ""} />

        <section className="admin-card admin-form">
          <div className="admin-card-header">
            <div>
              <div className="admin-eyebrow">Head</div>
              <h2>Custom header snippet</h2>
            </div>
            <label className="admin-checkbox">
              <input type="checkbox" name="headEnabled" defaultChecked={headCode?.isActive} />
              Enabled
            </label>
          </div>
          <textarea
            name="headCode"
            defaultValue={headCode?.code || ""}
            className="admin-textarea"
            style={{ minHeight: "16rem" }}
          />
        </section>

        <section className="admin-card admin-form">
          <div className="admin-card-header">
            <div>
              <div className="admin-eyebrow">Body</div>
              <h2>Custom body snippet</h2>
            </div>
            <label className="admin-checkbox">
              <input type="checkbox" name="bodyEnabled" defaultChecked={bodyCode?.isActive} />
              Enabled
            </label>
          </div>
          <textarea
            name="bodyCode"
            defaultValue={bodyCode?.code || ""}
            className="admin-textarea"
            style={{ minHeight: "16rem" }}
          />
        </section>

        <div className="admin-actions">
          <button type="submit" className="admin-button">
            Save snippets
          </button>
        </div>
      </form>
    </>
  );
}
