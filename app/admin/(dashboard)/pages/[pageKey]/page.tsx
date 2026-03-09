import { notFound } from "next/navigation";
import { savePageAction } from "@/app/admin/actions";
import { StatusNotice } from "@/components/admin/status-notice";
import { getManagedPageByKey, getManagedPagePath } from "@/lib/cms";

export default async function AdminPageEditorPage({
  params,
  searchParams
}: {
  params: Promise<{ pageKey: string }>;
  searchParams: Promise<{ locale?: string; status?: string }>;
}) {
  const { pageKey } = await params;
  const { locale = "en", status } = await searchParams;
  const page = await getManagedPageByKey(pageKey, locale);

  if (!page) {
    notFound();
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Page Editor</div>
          <h1 className="admin-page-title">{page.title}</h1>
          <p className="admin-help">
            Editing <strong>{getManagedPagePath(page.key)}</strong> for locale{" "}
            {locale.toUpperCase()}.
          </p>
        </div>
      </div>

      <StatusNotice status={status} />

      <form action={savePageAction} className="admin-form">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnPath" value={`/admin/pages/${page.key}`} />
        <input type="hidden" name="pageKey" value={page.key} />

        <section className="admin-card admin-form">
          <div className="admin-card-header">
            <div>
              <div className="admin-eyebrow">Content</div>
              <h2>Page details</h2>
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              defaultValue={page.title}
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              defaultValue={page.content}
              rows={14}
              className="admin-textarea"
            />
            <p className="admin-help">Use blank lines to separate paragraphs.</p>
          </div>
        </section>

        <div className="admin-actions">
          <button type="submit" className="admin-button">
            Save page
          </button>
        </div>
      </form>
    </>
  );
}
