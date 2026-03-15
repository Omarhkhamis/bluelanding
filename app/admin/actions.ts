"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createAdminUser,
  createCustomCode,
  createMediaAsset,
  deleteAdminUser,
  deleteMediaAsset,
  deleteSectionItem,
  getManagedPagePublicPath,
  getSectionByKey,
  managedPageKeys,
  reorderSections,
  replaceSocialLinks,
  supportedDashboardLocales,
  updateAdminUser,
  updateCustomCode,
  updateSection,
  upsertFooterSettings,
  upsertManagedPage,
  upsertSectionItem,
  upsertSeoSettings,
  upsertSiteSettings
} from "@/lib/cms";
import {
  authenticateAdmin,
  clearAdminSession,
  createAdminSession
} from "@/lib/admin-auth";
import { getLegacyFooterNavSettings, type FooterNavItem } from "@/lib/footer-nav";
import { buildAdminPath, defaultSiteKey, normalizeSiteKey } from "@/lib/sites";

function getLocale(formData: FormData) {
  const rawLocale = String(formData.get("locale") || "en");
  return supportedDashboardLocales.includes(rawLocale as (typeof supportedDashboardLocales)[number])
    ? rawLocale
    : "en";
}

function getSiteKey(formData: FormData) {
  return normalizeSiteKey(String(formData.get("site") || defaultSiteKey));
}

function getReturnPath(formData: FormData, fallback: string) {
  const pathname = String(formData.get("returnPath") || fallback);
  return pathname.startsWith("/admin") ? pathname : fallback;
}

function redirectWithStatus(
  pathname: string,
  siteKey: string,
  locale: string,
  status: "saved" | "error"
) {
  redirect(buildAdminPath(pathname, { siteKey, locale, extras: { status } }));
}

function revalidateAdminAndSite(pathname: string, siteKey: string, locale: string) {
  revalidatePath(pathname);
  const localesToRevalidate = new Set([locale, ...supportedDashboardLocales]);

  for (const nextLocale of localesToRevalidate) {
    revalidatePath(`/${siteKey}/${nextLocale}`, "layout");
  }
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const admin = await authenticateAdmin(email, password);

  if (!admin) {
    redirect("/admin/login?error=invalid");
  }

  await createAdminSession(admin.id);
  redirect(buildAdminPath("/admin", { siteKey: defaultSiteKey, locale: "en" }));
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveGeneralSettingsAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/general");

  await upsertSiteSettings({
    siteKey,
    locale,
    siteName: String(formData.get("siteName") || ""),
    siteTitle: String(formData.get("siteTitle") || ""),
    siteDescription: String(formData.get("siteDescription") || ""),
    logoUrl: String(formData.get("logoUrl") || ""),
    faviconUrl: String(formData.get("faviconUrl") || ""),
    whatsappUrl: String(formData.get("whatsappUrl") || "")
  });

  await upsertFooterSettings({
    siteKey,
    locale,
    logoUrl: String(formData.get("footerLogoUrl") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    address: String(formData.get("address") || ""),
    copyrightText: String(formData.get("copyrightText") || "")
  });

  await replaceSocialLinks(siteKey, locale, [
    {
      platform: "instagram",
      label: "Instagram",
      url: String(formData.get("instagram") || "")
    },
    {
      platform: "facebook",
      label: "Facebook",
      url: String(formData.get("facebook") || "")
    },
    {
      platform: "youtube",
      label: "YouTube",
      url: String(formData.get("youtube") || "")
    }
  ]);

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

export async function saveSeoAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/seo");

  await upsertSeoSettings({
    siteKey,
    locale,
    metaTitle: String(formData.get("metaTitle") || ""),
    metaDescription: String(formData.get("metaDescription") || ""),
    metaKeywords: String(formData.get("metaKeywords") || ""),
    ogImageUrl: String(formData.get("ogImageUrl") || ""),
    robots: String(formData.get("robots") || ""),
    canonicalUrl: String(formData.get("canonicalUrl") || "")
  });

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

export async function savePageAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/pages");
  const key = String(formData.get("pageKey") || "");

  if (!managedPageKeys.includes(key as (typeof managedPageKeys)[number])) {
    redirectWithStatus(returnPath, siteKey, locale, "error");
  }

  await upsertManagedPage({
    siteKey,
    key: key as (typeof managedPageKeys)[number],
    locale,
    title: String(formData.get("title") || "").trim(),
    content: String(formData.get("content") || "").trim()
  });

  revalidateAdminAndSite(returnPath, siteKey, locale);
  revalidatePath(
    getManagedPagePublicPath(
      key as (typeof managedPageKeys)[number],
      normalizeSiteKey(siteKey),
      locale
    )
  );
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

export async function saveCustomCodesAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/custom-codes");
  const entries = [
    {
      id: Number(formData.get("headId") || 0),
      name: "Custom Header Snippet",
      placement: "HEAD",
      code: String(formData.get("headCode") || ""),
      isActive: Boolean(formData.get("headEnabled"))
    },
    {
      id: Number(formData.get("bodyId") || 0),
      name: "Custom Body Snippet",
      placement: "BODY_END",
      code: String(formData.get("bodyCode") || ""),
      isActive: Boolean(formData.get("bodyEnabled"))
    }
  ];

  for (const entry of entries) {
    if (entry.id > 0) {
      await updateCustomCode({ ...entry, siteKey });
      continue;
    }

    await createCustomCode({ ...entry, siteKey });
  }

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

export async function saveReorderSectionsAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/reorder");
  const sectionCount = Number(formData.get("sectionCount") || 0);
  const updates: Array<{ key: string; sortOrder: number; isActive: boolean }> = [];

  for (let index = 0; index < sectionCount; index += 1) {
    updates.push({
      key: String(formData.get(`sections.${index}.key`) || ""),
      sortOrder: Number(formData.get(`sections.${index}.sortOrder`) || index),
      isActive: Boolean(formData.get(`sections.${index}.isActive`))
    });
  }

  await reorderSections(updates, siteKey, locale);
  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

function parseItemIndexes(formData: FormData) {
  const indexes = new Set<number>();

  for (const key of formData.keys()) {
    const match = /^items\.(\d+)\./.exec(key);
    if (match) {
      indexes.add(Number(match[1]));
    }
  }

  return Array.from(indexes).sort((a, b) => a - b);
}

function parseFooterNavItems(formData: FormData) {
  const navItemCount = Number(formData.get("footerNavItemCount") || 0);
  const items: FooterNavItem[] = [];

  for (let index = 0; index < navItemCount; index += 1) {
    const label = String(formData.get(`footerNavItems.${index}.label`) || "").trim();
    const href = String(formData.get(`footerNavItems.${index}.href`) || "").trim();

    if (!label && !href) {
      continue;
    }

    items.push({ label, href });
  }

  return items;
}

export async function saveSectionAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin");
  const key = String(formData.get("key") || "");
  const existingSection = await getSectionByKey(key, siteKey, locale);
  const normalizedSectionSettings =
    existingSection?.settings && typeof existingSection.settings === "object"
      ? { ...existingSection.settings }
      : {};
  const readLines = (name: string) =>
    String(formData.get(name) || "")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);

  if (key === "hotel") {
    normalizedSectionSettings.hotelName = String(formData.get("hotelName") || "").trim();
    normalizedSectionSettings.hotelStars = Math.min(
      5,
      Math.max(1, Number(formData.get("hotelStars") || 5) || 5)
    );
  }

  if (key === "header" || key === "header-2") {
    normalizedSectionSettings.variant = key === "header-2" ? "lpbm" : "default";
    normalizedSectionSettings.ctaLabel = String(formData.get("headerCtaLabel") || "").trim();
    normalizedSectionSettings.callLabel = String(formData.get("headerCallLabel") || "").trim();
  }

  if (key === "hero" || key === "hero-2") {
    normalizedSectionSettings.variant = key === "hero-2" ? "lpbm" : "default";
    normalizedSectionSettings.videoUrl = String(formData.get("heroVideoUrl") || "").trim();
    normalizedSectionSettings.kicker = String(formData.get("heroKicker") || "").trim();
    normalizedSectionSettings.titleLine1 = String(formData.get("heroTitleLine1") || "").trim();
    normalizedSectionSettings.titleLine2 = String(formData.get("heroTitleLine2") || "").trim();
    normalizedSectionSettings.whatsappCta = String(formData.get("heroWhatsappCta") || "").trim();
    normalizedSectionSettings.formTitle = String(formData.get("heroFormTitle") || "").trim();
    normalizedSectionSettings.formDescription = String(
      formData.get("heroFormDescription") || ""
    ).trim();
    normalizedSectionSettings.formSubmitText = String(
      formData.get("heroFormSubmitText") || ""
    ).trim();
    normalizedSectionSettings.formPrivacyNote = String(
      formData.get("heroFormPrivacyNote") || ""
    ).trim();
    normalizedSectionSettings.lpbmSubtitle = String(
      formData.get("heroLpbmSubtitle") || ""
    ).trim();
  }

  if (key === "footer" || key === "footer-2") {
    normalizedSectionSettings.variant = key === "footer-2" ? "lpbm" : "default";
    normalizedSectionSettings.description = String(formData.get("footerDescription") || "").trim();
    normalizedSectionSettings.badge = String(formData.get("footerBadge") || "").trim();
    normalizedSectionSettings.note = String(formData.get("footerNote") || "").trim();

    if (formData.has("footerNavItemCount")) {
      const navItems = parseFooterNavItems(formData);
      normalizedSectionSettings.navItems = navItems;
      Object.assign(normalizedSectionSettings, getLegacyFooterNavSettings(navItems));
    } else {
      if (formData.has("footerNavTreatments")) {
        normalizedSectionSettings.navTreatments = String(
          formData.get("footerNavTreatments") || ""
        ).trim();
      }
      if (formData.has("footerNavTreatmentsHref")) {
        normalizedSectionSettings.navTreatmentsHref = String(
          formData.get("footerNavTreatmentsHref") || ""
        ).trim();
      }
      if (formData.has("footerNavBeforeAfter")) {
        normalizedSectionSettings.navBeforeAfter = String(
          formData.get("footerNavBeforeAfter") || ""
        ).trim();
      }
      if (formData.has("footerNavBeforeAfterHref")) {
        normalizedSectionSettings.navBeforeAfterHref = String(
          formData.get("footerNavBeforeAfterHref") || ""
        ).trim();
      }
      if (formData.has("footerNavTestimonials")) {
        normalizedSectionSettings.navTestimonials = String(
          formData.get("footerNavTestimonials") || ""
        ).trim();
      }
      if (formData.has("footerNavTestimonialsHref")) {
        normalizedSectionSettings.navTestimonialsHref = String(
          formData.get("footerNavTestimonialsHref") || ""
        ).trim();
      }
      if (formData.has("footerNavFaqs")) {
        normalizedSectionSettings.navFaqs = String(formData.get("footerNavFaqs") || "").trim();
      }
      if (formData.has("footerNavFaqsHref")) {
        normalizedSectionSettings.navFaqsHref = String(
          formData.get("footerNavFaqsHref") || ""
        ).trim();
      }
      if (formData.has("footerNavHealthTourism")) {
        normalizedSectionSettings.navHealthTourism = String(
          formData.get("footerNavHealthTourism") || ""
        ).trim();
      }
      if (formData.has("footerNavHealthTourismHref")) {
        normalizedSectionSettings.navHealthTourismHref = String(
          formData.get("footerNavHealthTourismHref") || ""
        ).trim();
      }
    }

    normalizedSectionSettings.phoneLabel = String(formData.get("footerPhoneLabel") || "").trim();
    normalizedSectionSettings.emailLabel = String(formData.get("footerEmailLabel") || "").trim();
    normalizedSectionSettings.addressLabel = String(
      formData.get("footerAddressLabel") || ""
    ).trim();
    normalizedSectionSettings.privacy = String(formData.get("footerPrivacy") || "").trim();
    normalizedSectionSettings.terms = String(formData.get("footerTerms") || "").trim();
  }

  if (key === "treatment-matrix") {
    const matrixColumnCount = Number(formData.get("matrixColumnCount") || 0);
    const matrixRowCount = Number(formData.get("matrixRowCount") || 0);
    const columns: string[] = [];
    const rows: Array<{ values: string[] }> = [];

    for (let columnIndex = 0; columnIndex < matrixColumnCount; columnIndex += 1) {
      columns.push(String(formData.get(`matrixColumns.${columnIndex}`) || "").trim());
    }

    for (let rowIndex = 0; rowIndex < matrixRowCount; rowIndex += 1) {
      const values: string[] = [];

      for (let columnIndex = 0; columnIndex < matrixColumnCount; columnIndex += 1) {
        values.push(String(formData.get(`matrixRows.${rowIndex}.${columnIndex}`) || "").trim());
      }

      rows.push({ values });
    }

    normalizedSectionSettings.columns = columns;
    normalizedSectionSettings.rows = rows;
  }

  if (key === "google-reviews" || key === "trustpilot-reviews") {
    normalizedSectionSettings.provider = key === "google-reviews" ? "google" : "trustpilot";
    normalizedSectionSettings.rating = String(formData.get("reviewsRating") || "").trim();
    normalizedSectionSettings.ratingCountLabel = String(
      formData.get("reviewsRatingCountLabel") || ""
    ).trim();
  }

  if (key === "lucky-spin") {
    normalizedSectionSettings.tagline = String(formData.get("luckySpinTagline") || "").trim();
    normalizedSectionSettings.resultLabel = String(
      formData.get("luckySpinResultLabel") || ""
    ).trim();
    normalizedSectionSettings.prizes = readLines("luckySpinPrizes");
    normalizedSectionSettings.formTitle = String(
      formData.get("luckySpinFormTitle") || ""
    ).trim();
    normalizedSectionSettings.formDescription = String(
      formData.get("luckySpinFormDescription") || ""
    ).trim();
    normalizedSectionSettings.formSubmitText = String(
      formData.get("luckySpinFormSubmitText") || ""
    ).trim();
    normalizedSectionSettings.formPrivacyNote = String(
      formData.get("luckySpinFormPrivacyNote") || ""
    ).trim();
  }

  await updateSection({
    key,
    siteKey,
    locale,
    name: String(formData.get("name") || existingSection?.name || ""),
    sectionType: existingSection?.sectionType || "",
    sortOrder: existingSection?.sortOrder || 0,
    isActive: Boolean(formData.get("isActive")),
    heading: String(formData.get("heading") || existingSection?.heading || ""),
    subheading: String(formData.get("subheading") || existingSection?.subheading || ""),
    description: String(formData.get("description") || existingSection?.description || ""),
    buttonLabel: String(formData.get("buttonLabel") || existingSection?.buttonLabel || ""),
    buttonUrl: String(formData.get("buttonUrl") || existingSection?.buttonUrl || ""),
    imageUrl: String(formData.get("imageUrl") || existingSection?.imageUrl || ""),
    settings:
      Object.keys(normalizedSectionSettings).length > 0
        ? normalizedSectionSettings
        : existingSection?.settings || null
  });

  for (const index of parseItemIndexes(formData)) {
    const existingItem = existingSection?.items[index];
    const existingSettings = existingItem?.settings || null;
    const normalizedSettings =
      typeof existingSettings === "object" && existingSettings ? { ...existingSettings } : {};
    const itemLines = String(formData.get(`items.${index}.itemsText`) || "")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
    const itemButtonLabel = String(formData.get(`items.${index}.buttonLabel`) || "").trim();
    const hasIconSettings =
      key !== "hotel" &&
      (formData.has(`items.${index}.iconName`) || formData.has(`items.${index}.iconUrl`));

    if (hasIconSettings) {
      normalizedSettings.iconName = String(formData.get(`items.${index}.iconName`) || "").trim();
      normalizedSettings.iconUrl = String(formData.get(`items.${index}.iconUrl`) || "").trim();
    }

    if (key === "services") {
      normalizedSettings.items = itemLines;
      normalizedSettings.buttonLabel = itemButtonLabel;
    }

    if (key === "team") {
      delete normalizedSettings.items;
      delete normalizedSettings.buttonLabel;
    }

    const nextSettings =
      key === "team"
        ? (Object.keys(normalizedSettings).length > 0 ? normalizedSettings : null)
        : Object.keys(normalizedSettings).length > 0
          ? normalizedSettings
          : existingSettings;

    await upsertSectionItem({
      id: Number(formData.get(`items.${index}.id`) || 0) || undefined,
      siteKey,
      sectionKey: key,
      locale,
      itemType: String(formData.get(`items.${index}.itemType`) || "default"),
      title: String(formData.get(`items.${index}.title`) || ""),
      subtitle: String(formData.get(`items.${index}.subtitle`) || ""),
      description: String(formData.get(`items.${index}.description`) || ""),
      imageUrl: String(formData.get(`items.${index}.imageUrl`) || ""),
      videoUrl: String(formData.get(`items.${index}.videoUrl`) || ""),
      linkUrl: String(formData.get(`items.${index}.linkUrl`) || ""),
      altText: String(formData.get(`items.${index}.altText`) || ""),
      sortOrder: index,
      isActive: existingItem?.isActive ?? true,
      settings: nextSettings
    });
  }

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

export async function addSectionItemAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin");
  const sectionKey = String(formData.get("sectionKey") || formData.get("key") || "");
  const itemType = String(formData.get("itemType") || formData.get("addItemType") || "default");
  const existingSection = sectionKey ? await getSectionByKey(sectionKey, siteKey, locale) : null;
  const sortOrder = existingSection?.items.length ?? 0;

  await upsertSectionItem({
    siteKey,
    sectionKey,
    locale,
    itemType,
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    linkUrl: "",
    altText: "",
    sortOrder,
    isActive: true,
    settings: null
  });

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

export async function deleteSectionItemAction(
  itemId: number,
  formData: FormData
) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin");
  const id = itemId || Number(formData.get("id") || 0);

  if (id > 0) {
    await deleteSectionItem(id);
  }

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

export async function uploadMediaAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/media");
  const file = formData.get("file");

  if (file instanceof File && file.size > 0) {
    await createMediaAsset(file, String(formData.get("altText") || ""), "library", siteKey);
  }

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

export async function deleteMediaAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/media");
  const id = Number(formData.get("id") || 0);

  if (id > 0) {
    await deleteMediaAsset(id, siteKey);
  }

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

const adminSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().trim().min(8).optional(),
  role: z.string().trim().min(1),
  avatarUrl: z.string().trim(),
  isActive: z.boolean()
});

export async function createAdminUserAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/admin-users");
  const payload = adminSchema.parse({
    name: String(formData.get("name") || "Admin"),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    role: "admin",
    avatarUrl: String(formData.get("avatarUrl") || ""),
    isActive: Boolean(formData.get("isActive"))
  });

  await createAdminUser({
    ...payload,
    password: payload.password || "Admin123!"
  });

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

export async function updateAdminUserAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/admin-users");
  const password = String(formData.get("password") || "").trim();
  const payload = adminSchema.parse({
    name: String(formData.get("name") || "Admin"),
    email: String(formData.get("email") || ""),
    password: password || undefined,
    role: "admin",
    avatarUrl: String(formData.get("avatarUrl") || ""),
    isActive: Boolean(formData.get("isActive"))
  });

  await updateAdminUser({
    id: Number(formData.get("id") || 0),
    ...payload,
    password: payload.password
  });

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}

export async function deleteAdminUserAction(formData: FormData) {
  const siteKey = getSiteKey(formData);
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/admin-users");
  const id = Number(formData.get("id") || 0);

  if (id > 0) {
    await deleteAdminUser(id);
  }

  revalidateAdminAndSite(returnPath, siteKey, locale);
  redirectWithStatus(returnPath, siteKey, locale, "saved");
}
