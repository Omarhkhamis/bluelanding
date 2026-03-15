import {
  buildDataLeadsQueryString,
  formatDataLeadsDate,
  normalizeDataLeadsFilters
} from "@/lib/data-leads";
import { getFormSubmissions } from "@/lib/cms";
import { FormsDataNav } from "@/components/admin/forms-data-nav";
import { buildAdminPath } from "@/lib/sites";

export default async function AdminFormDataPage({
  searchParams
}: {
  searchParams: Promise<{
    site?: string;
    locale?: string;
    order?: string;
    month?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const filters = normalizeDataLeadsFilters(await searchParams);
  const records = await getFormSubmissions({
    siteKey: filters.siteKey,
    order: filters.order,
    month: filters.month,
    from: filters.from,
    to: filters.to
  });
  const exportQuery = buildDataLeadsQueryString(filters);
  const resetHref = buildAdminPath("/admin/form-data", {
    siteKey: filters.siteKey,
    locale: filters.locale
  });

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Form Data</div>
          <h1 className="admin-page-title">Submissions</h1>
          <p className="admin-help">
            Total records for the selected site: {records.length}
          </p>
          <FormsDataNav siteKey={filters.siteKey} locale={filters.locale} current="form-data" />
        </div>
        <a
          href={`/admin/form-data/export?${exportQuery}`}
          className="admin-button admin-button-link"
        >
          Export CSV
        </a>
      </div>

      <form method="get" className="admin-card admin-form">
        <input type="hidden" name="site" value={filters.siteKey} />
        <input type="hidden" name="locale" value={filters.locale} />

        <div className="admin-data-filter-grid">
          <div className="admin-field">
            <label htmlFor="order">Order</label>
            <select
              id="order"
              name="order"
              defaultValue={filters.order}
              className="admin-select"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <div className="admin-field">
            <label htmlFor="month">Month</label>
            <input
              id="month"
              name="month"
              type="month"
              defaultValue={filters.month}
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="from">From</label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={filters.from}
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="to">To</label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={filters.to}
              className="admin-input"
            />
          </div>
        </div>

        <div className="admin-actions admin-actions-end">
          <a href={resetHref} className="admin-button-muted admin-button-link">
            Reset
          </a>
          <button type="submit" className="admin-button">
            Apply
          </button>
        </div>
      </form>

      <section className="admin-card">
        {records.length === 0 ? (
          <p className="admin-muted">No form submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Form</th>
                  <th className="px-4 py-3">Locale</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-border/70 align-top">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {record.formName || record.source}
                    </td>
                    <td className="px-4 py-3">{(record.locale || "en").toUpperCase()}</td>
                    <td className="px-4 py-3">{record.fullName || "—"}</td>
                    <td className="px-4 py-3">{record.email || "—"}</td>
                    <td className="px-4 py-3">{record.phone || "—"}</td>
                    <td className="px-4 py-3">
                      {record.message ? (
                        <p className="max-w-sm whitespace-pre-wrap text-sm text-foreground/80">
                          {record.message}
                        </p>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground/70">
                      {formatDataLeadsDate(record.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
