import Link from "next/link";
import { buildAdminPath, type SiteKey } from "@/lib/sites";

type FormsDataNavProps = {
  siteKey: SiteKey;
  locale: string;
  current: "form-data" | "spin-data";
};

function buildHref(pathname: string, siteKey: SiteKey, locale: string) {
  return buildAdminPath(pathname, { siteKey, locale });
}

export function FormsDataNav({ siteKey, locale, current }: FormsDataNavProps) {
  return (
    <div className="admin-locale-row">
      <Link
        href={buildHref("/admin/form-data", siteKey, locale)}
        className={`admin-locale-link ${
          current === "form-data" ? "admin-locale-link-active" : ""
        }`}
      >
        Form Data
      </Link>
      <Link
        href={buildHref("/admin/spin-data", siteKey, locale)}
        className={`admin-locale-link ${
          current === "spin-data" ? "admin-locale-link-active" : ""
        }`}
      >
        Spin Data
      </Link>
    </div>
  );
}
