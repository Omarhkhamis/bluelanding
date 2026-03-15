export const supportedSiteKeys = ["hollywood-smile", "dental-implant"] as const;

export type SiteKey = (typeof supportedSiteKeys)[number];

export const defaultSiteKey: SiteKey = "hollywood-smile";
export const defaultPublicLocale = "en";

const siteLabels: Record<SiteKey, string> = {
  "hollywood-smile": "Hollywood Smile",
  "dental-implant": "Dental Implant"
};

export function isSiteKey(value: string): value is SiteKey {
  return supportedSiteKeys.includes(value as SiteKey);
}

export function parseSiteKey(value?: string | null): SiteKey | null {
  const normalized = String(value || "").trim().toLowerCase();
  return isSiteKey(normalized) ? normalized : null;
}

export function normalizeSiteKey(value?: string | null): SiteKey {
  return parseSiteKey(value) || defaultSiteKey;
}

export function getSiteLabel(siteKey: SiteKey) {
  return siteLabels[siteKey];
}

export function normalizeLocaleSegment(value?: string | null) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return defaultPublicLocale;
  }

  return /^[a-z0-9-]+$/.test(normalized) ? normalized : defaultPublicLocale;
}

export function getSiteBasePath(siteKey: SiteKey, locale = defaultPublicLocale) {
  return `/${siteKey}/${normalizeLocaleSegment(locale)}`;
}

export function getSitePagePath(
  siteKey: SiteKey,
  locale = defaultPublicLocale,
  pagePath = ""
) {
  const basePath = getSiteBasePath(siteKey, locale);
  const normalizedPagePath = String(pagePath || "").trim().replace(/^\/+/, "");
  return normalizedPagePath ? `${basePath}/${normalizedPagePath}` : basePath;
}

export function buildAdminPath(
  pathname: string,
  options: {
    siteKey?: string | null;
    locale?: string | null;
    extras?: Record<string, string | number | boolean | null | undefined>;
  } = {}
) {
  const params = new URLSearchParams();
  params.set("site", normalizeSiteKey(options.siteKey));
  params.set("locale", normalizeLocaleSegment(options.locale));

  for (const [key, value] of Object.entries(options.extras || {})) {
    if (value == null || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  return `${pathname}?${params.toString()}`;
}

export function extractSiteLocaleFromPathname(pathname: string) {
  const segments = String(pathname || "")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const siteKey = parseSiteKey(segments[0]) || defaultSiteKey;
  const locale = normalizeLocaleSegment(segments[1]);

  return {
    siteKey,
    locale
  };
}
