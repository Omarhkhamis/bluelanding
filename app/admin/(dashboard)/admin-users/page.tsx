import {
  createAdminUserAction,
  deleteAdminUserAction,
  updateAdminUserAction
} from "@/app/admin/actions";
import { StatusNotice } from "@/components/admin/status-notice";
import { getAdminUsers } from "@/lib/cms";

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string; status?: string }>;
}) {
  const { locale = "en", status } = await searchParams;
  const adminUsers = await getAdminUsers();

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Settings</div>
          <h1 className="admin-page-title">Admin users</h1>
          <p className="admin-help">Manage internal dashboard access only.</p>
        </div>
      </div>

      <StatusNotice status={status} />

      <section className="admin-card admin-form">
        <div className="admin-card-header">
          <div>
            <div className="admin-eyebrow">Create</div>
            <h2>New admin user</h2>
          </div>
        </div>
        <form action={createAdminUserAction} className="admin-form">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="returnPath" value="/admin/admin-users" />
          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="create-name">Name</label>
              <input id="create-name" name="name" className="admin-input" defaultValue="Admin" />
            </div>
            <div className="admin-field">
              <label htmlFor="create-email">Email</label>
              <input id="create-email" name="email" type="email" className="admin-input" required />
            </div>
            <div className="admin-field">
              <label htmlFor="create-password">Password</label>
              <input id="create-password" name="password" type="password" className="admin-input" required />
            </div>
            <div className="admin-field">
              <label htmlFor="create-avatarUrl">Avatar URL</label>
              <input id="create-avatarUrl" name="avatarUrl" className="admin-input" />
            </div>
          </div>
          <label className="admin-checkbox">
            <input type="checkbox" name="isActive" defaultChecked />
            Active
          </label>
          <div className="admin-actions">
            <button type="submit" className="admin-button">
              Create admin
            </button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <div className="admin-eyebrow">Directory</div>
            <h2>Existing admin users</h2>
          </div>
        </div>

        <div className="admin-list">
          {adminUsers.map((admin) => (
            <form key={admin.id} action={updateAdminUserAction} className="admin-card admin-form">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="returnPath" value="/admin/admin-users" />
              <input type="hidden" name="id" value={admin.id} />
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label htmlFor={`name-${admin.id}`}>Name</label>
                  <input
                    id={`name-${admin.id}`}
                    name="name"
                    defaultValue={admin.name}
                    className="admin-input"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor={`email-${admin.id}`}>Email</label>
                  <input
                    id={`email-${admin.id}`}
                    name="email"
                    defaultValue={admin.email}
                    className="admin-input"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor={`password-${admin.id}`}>Password</label>
                  <input
                    id={`password-${admin.id}`}
                    name="password"
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="admin-input"
                  />
                </div>
              </div>
              <input type="hidden" name="avatarUrl" value={admin.avatarUrl} />
              <div className="admin-actions">
                <label className="admin-checkbox">
                  <input type="checkbox" name="isActive" defaultChecked={admin.isActive} />
                  Active
                </label>
                <button type="submit" className="admin-button">
                  Save user
                </button>
              </div>
            </form>
          ))}
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((admin) => (
              <tr key={`row-${admin.id}`}>
                <td>{admin.email}</td>
                <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                <td>
                  <form action={deleteAdminUserAction} className="admin-inline-form">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="returnPath" value="/admin/admin-users" />
                    <input type="hidden" name="id" value={admin.id} />
                    <button type="submit" className="admin-button-danger">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
