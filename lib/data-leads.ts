import { defaultSiteKey, normalizeSiteKey, type SiteKey } from "@/lib/sites";

export type DataLeadsOrder = "newest" | "oldest";

export type DataLeadsFilters = {
  siteKey: SiteKey;
  locale: string;
  order: DataLeadsOrder;
  month: string;
  from: string;
  to: string;
};

type FilterSource =
  | URLSearchParams
  | Record<string, string | string[] | undefined | null>;

function readValue(source: FilterSource, key: string) {
  if (source instanceof URLSearchParams) {
    return String(source.get(key) || "").trim();
  }

  const value = source[key];
  if (Array.isArray(value)) {
    return String(value[0] || "").trim();
  }

  return String(value || "").trim();
}

export function normalizeDataLeadsFilters(
  source: FilterSource,
  defaultLocale = "en"
): DataLeadsFilters {
  const siteKey = normalizeSiteKey(readValue(source, "site") || defaultSiteKey);
  const locale = readValue(source, "locale") || defaultLocale;
  const order = readValue(source, "order") === "oldest" ? "oldest" : "newest";

  return {
    siteKey,
    locale,
    order,
    month: readValue(source, "month"),
    from: readValue(source, "from"),
    to: readValue(source, "to")
  };
}

export function buildDataLeadsQueryString(filters: Partial<DataLeadsFilters>) {
  const params = new URLSearchParams();

  if (filters.siteKey) {
    params.set("site", filters.siteKey);
  }

  if (filters.locale) {
    params.set("locale", filters.locale);
  }

  if (filters.order) {
    params.set("order", filters.order);
  }

  if (filters.month) {
    params.set("month", filters.month);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  return params.toString();
}

export function toSubmissionSortOrder(order: DataLeadsOrder) {
  return order === "oldest" ? "asc" : "desc";
}

export function formatDataLeadsDate(value: string) {
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

export function escapeCsvValue(value: unknown) {
  if (value == null) {
    return "";
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}
