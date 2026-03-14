import Link from "next/link";

type FormsDataNavProps = {
  locale: string;
  current: "form-data" | "spin-data";
};

function buildHref(pathname: string, locale: string) {
  return `${pathname}?locale=${locale}`;
}

export function FormsDataNav({ locale, current }: FormsDataNavProps) {
  return (
    <div className="admin-locale-row">
      <Link
        href={buildHref("/admin/form-data", locale)}
        className={`admin-locale-link ${
          current === "form-data" ? "admin-locale-link-active" : ""
        }`}
      >
        Form Data
      </Link>
      <Link
        href={buildHref("/admin/spin-data", locale)}
        className={`admin-locale-link ${
          current === "spin-data" ? "admin-locale-link-active" : ""
        }`}
      >
        Spin Data
      </Link>
    </div>
  );
}
