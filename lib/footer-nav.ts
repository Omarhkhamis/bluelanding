export type FooterNavItem = {
  label: string;
  href: string;
};

const legacyFooterNavFields = [
  {
    labelKey: "navTreatments",
    hrefKey: "navTreatmentsHref",
    fallback: { label: "Treatments", href: "#services" }
  },
  {
    labelKey: "navBeforeAfter",
    hrefKey: "navBeforeAfterHref",
    fallback: { label: "Before & After", href: "#before-after" }
  },
  {
    labelKey: "navTestimonials",
    hrefKey: "navTestimonialsHref",
    fallback: { label: "Testimonials", href: "#google-reviews" }
  },
  {
    labelKey: "navFaqs",
    hrefKey: "navFaqsHref",
    fallback: { label: "FAQs", href: "#faq" }
  },
  {
    labelKey: "navHealthTourism",
    hrefKey: "navHealthTourismHref",
    fallback: { label: "Health Tourism", href: "#why" }
  }
] as const;

export const defaultFooterNavItems: FooterNavItem[] = legacyFooterNavFields.map((field) => ({
  ...field.fallback
}));

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeFooterNavItems(value: unknown): FooterNavItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const label = String(item.label || "").trim();
    const href = String(item.href || "").trim();

    if (!label && !href) {
      return [];
    }

    return [{ label, href }];
  });
}

export function getLegacyFooterNavItems(settings: Record<string, unknown>): FooterNavItem[] {
  const items = legacyFooterNavFields.flatMap((field) => {
    const label = String(settings[field.labelKey] || "").trim();
    const href = String(settings[field.hrefKey] || "").trim();

    if (!label && !href) {
      return [];
    }

    return [{ label, href }];
  });

  return items.length > 0 ? items : defaultFooterNavItems;
}

export function getFooterNavItems(settings: Record<string, unknown>): FooterNavItem[] {
  if (Array.isArray(settings.navItems)) {
    return normalizeFooterNavItems(settings.navItems);
  }

  return getLegacyFooterNavItems(settings);
}

export function getLegacyFooterNavSettings(items: FooterNavItem[]) {
  return legacyFooterNavFields.reduce<Record<string, string>>((acc, field, index) => {
    const item = items[index];
    acc[field.labelKey] = item?.label || "";
    acc[field.hrefKey] = item?.href || "";
    return acc;
  }, {});
}
