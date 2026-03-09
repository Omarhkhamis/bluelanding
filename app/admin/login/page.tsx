import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { getCurrentAdminUser } from "@/lib/admin-auth";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentAdminUser();

  if (user) {
    redirect("/admin");
  }

  const { error } = await searchParams;

  return (
    <main className="admin-login">
      <form action={loginAction} className="admin-login-card admin-form">
        <div>
          <div className="admin-eyebrow">Admin Panel</div>
          <h1 className="admin-page-title" style={{ fontSize: "2rem" }}>
            BM Dashboard Login
          </h1>
          <p className="admin-help">
            Sign in with an internal admin account to manage the landing page content.
          </p>
        </div>

        {error === "invalid" ? (
          <div className="admin-error">Invalid email or password.</div>
        ) : null}

        <div className="admin-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="admin-input" required />
        </div>

        <div className="admin-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="admin-input"
            required
          />
        </div>

        <button type="submit" className="admin-button">
          Login
        </button>
      </form>
    </main>
  );
}
