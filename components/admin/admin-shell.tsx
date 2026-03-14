"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { logoutAction } from "@/app/admin/actions";

type SectionLink = {
  key: string;
  name: string;
};

type AdminShellProps = {
  currentUser: {
    name: string;
    email: string;
  };
  sections: SectionLink[];
  children: React.ReactNode;
};

const SCROLL_KEY = "bm-admin-scroll-y";
const TOAST_KEY = "bm-admin-toast-status";

function buildHref(pathname: string, locale: string) {
  return `${pathname}?locale=${locale}`;
}

function NavLink({
  href,
  isActive,
  label
}: {
  href: string;
  isActive: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={isActive ? "admin-nav-link-active" : "admin-nav-link"}
    >
      {label}
    </Link>
  );
}

export function AdminShell({ currentUser, sections, children }: AdminShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = searchParams.get("locale") || "en";
  const status = searchParams.get("status") || "";

  useEffect(() => {
    const handlePointerDown = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".admin-root")) {
        return;
      }

      const submitter = target.closest(
        'button[type="submit"],input[type="submit"]'
      ) as HTMLElement | null;

      if (submitter) {
        window.sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      }
    };

    const handleSubmit = async (event: Event) => {
      const form = event.target as HTMLFormElement | null;
      if (!form?.closest(".admin-root")) {
        return;
      }

      const submitEvent = event as SubmitEvent;
      const submitter = submitEvent.submitter as HTMLButtonElement | HTMLInputElement | null;

      if (
        submitter?.classList.contains("admin-button-danger") &&
        submitter.dataset.confirmed !== "true"
      ) {
        event.preventDefault();

        const result = await Swal.fire({
          title: "Delete item?",
          text: "This action cannot be undone.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          reverseButtons: true,
          confirmButtonColor: "#b91c1c",
          cancelButtonColor: "#cbd5e1",
          background: "#ffffff",
          color: "#0f172a"
        });

        if (result.isConfirmed) {
          submitter.dataset.confirmed = "true";
          form.requestSubmit(submitter);
        }

        return;
      }

      if (submitter?.dataset.confirmed === "true") {
        delete submitter.dataset.confirmed;
      }

      window.sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(SCROLL_KEY);

    if (!stored) {
      return;
    }

    const scrollY = Number(stored);
    if (Number.isFinite(scrollY)) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: "auto" });
        window.sessionStorage.removeItem(SCROLL_KEY);
      });
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!status) {
      return;
    }

    const key = `${pathname}?${searchParams.toString()}`;
    const handled = window.sessionStorage.getItem(TOAST_KEY);

    if (handled === key) {
      return;
    }

    window.sessionStorage.setItem(TOAST_KEY, key);

    if (status === "saved") {
      void Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Changes saved",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#16a34a",
        color: "#ffffff"
      });
      return;
    }

    if (status === "error") {
      void Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Something went wrong",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  }, [pathname, searchParams, status]);

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div>
            <div className="admin-sidebar-title">Blue Dashboard</div>
          </div>

          <div>
            <div className="admin-sidebar-label">Locale</div>
            <div className="admin-locale-row">
              {["en", "ru"].map((code) => (
                <Link
                  key={code}
                  href={buildHref(pathname, code)}
                  className={`admin-locale-link ${
                    locale === code ? "admin-locale-link-active" : ""
                  }`}
                >
                  {code}
                </Link>
              ))}
            </div>
          </div>

          <details className="admin-nav-group" open>
            <summary>Sections</summary>
            <div className="admin-nav-list">
              {sections.map((section) => (
                <NavLink
                  key={section.key}
                  href={buildHref(`/admin/sections/${section.key}`, locale)}
                  isActive={pathname === `/admin/sections/${section.key}`}
                  label={section.name}
                />
              ))}
            </div>
          </details>

          <details className="admin-nav-group" open>
            <summary>Data - Leads</summary>
            <div className="admin-nav-list">
              <NavLink
                href={buildHref("/admin/form-data", locale)}
                isActive={pathname === "/admin/form-data"}
                label="Form Data"
              />
              <NavLink
                href={buildHref("/admin/spin-data", locale)}
                isActive={pathname === "/admin/spin-data"}
                label="Spin Data"
              />
            </div>
          </details>

          <details className="admin-nav-group" open>
            <summary>Settings</summary>
            <div className="admin-nav-list">
              <NavLink
                href={buildHref("/admin/overview", locale)}
                isActive={pathname === "/admin/overview" || pathname === "/admin"}
                label="Overview"
              />
              <NavLink
                href={buildHref("/admin/general", locale)}
                isActive={pathname === "/admin/general"}
                label="General"
              />
              <NavLink
                href={buildHref("/admin/reorder", locale)}
                isActive={pathname === "/admin/reorder"}
                label="Reorder Sections"
              />
              <NavLink
                href={buildHref("/admin/custom-codes", locale)}
                isActive={pathname === "/admin/custom-codes"}
                label="Custom Codes"
              />
              <NavLink
                href={buildHref("/admin/seo", locale)}
                isActive={pathname === "/admin/seo"}
                label="SEO"
              />
              <NavLink
                href={buildHref("/admin/media", locale)}
                isActive={pathname === "/admin/media"}
                label="Media"
              />
              <NavLink
                href={buildHref("/admin/pages", locale)}
                isActive={pathname === "/admin/pages" || pathname.startsWith("/admin/pages/")}
                label="Pages"
              />
              <NavLink
                href={buildHref("/admin/admin-users", locale)}
                isActive={pathname === "/admin/admin-users"}
                label="Admin Users"
              />
            </div>
          </details>

          <div className="admin-sidebar-footer">
            <div className="admin-card">
              <div className="admin-eyebrow">Signed In</div>
              <p>Admin</p>
              <form action={logoutAction}>
                <button type="submit" className="admin-button-muted">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
