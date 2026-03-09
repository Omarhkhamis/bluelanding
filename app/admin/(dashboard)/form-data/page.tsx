import { getFormSubmissions } from "@/lib/cms";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export default async function AdminFormDataPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale = "en" } = await searchParams;
  const records = await getFormSubmissions(locale);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Form Data</div>
          <h1 className="admin-page-title">Submissions</h1>
          <p className="admin-help">
            Saved form requests for locale {locale.toUpperCase()}.
          </p>
        </div>
        <span className="admin-pill">{records.length} records</span>
      </div>

      <section className="admin-card">
        {records.length === 0 ? (
          <p className="admin-muted">No form submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Form</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Page</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-border/70 align-top">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {record.formName || record.source}
                    </td>
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
                    <td className="px-4 py-3 text-foreground/70">{record.page || "—"}</td>
                    <td className="px-4 py-3 text-foreground/70">
                      {formatDate(record.createdAt)}
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
