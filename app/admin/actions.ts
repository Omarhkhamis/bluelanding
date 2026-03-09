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
  getSectionByKey,
  reorderSections,
  replaceSocialLinks,
  supportedDashboardLocales,
  updateAdminUser,
  updateCustomCode,
  updateSection,
  upsertFooterSettings,
  upsertSectionItem,
  upsertSeoSettings,
  upsertSiteSettings
} from "@/lib/cms";
import {
  authenticateAdmin,
  clearAdminSession,
  createAdminSession
} from "@/lib/admin-auth";

function getLocale(formData: FormData) {
  const rawLocale = String(formData.get("locale") || "en");
  return supportedDashboardLocales.includes(rawLocale as (typeof supportedDashboardLocales)[number])
    ? rawLocale
    : "en";
}

function getReturnPath(formData: FormData, fallback: string) {
  const pathname = String(formData.get("returnPath") || fallback);
  return pathname.startsWith("/admin") ? pathname : fallback;
}

function redirectWithStatus(pathname: string, locale: string, status: "saved" | "error") {
  redirect(`${pathname}?locale=${locale}&status=${status}`);
}

function revalidateAdminAndSite(pathname: string) {
  revalidatePath(pathname);
  revalidatePath("/", "layout");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const admin = await authenticateAdmin(email, password);

  if (!admin) {
    redirect("/admin/login?error=invalid");
  }

  await createAdminSession(admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveGeneralSettingsAction(formData: FormData) {
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/general");

  await upsertSiteSettings({
    locale,
    siteName: String(formData.get("siteName") || ""),
    siteTitle: String(formData.get("siteTitle") || ""),
    siteDescription: String(formData.get("siteDescription") || ""),
    logoUrl: String(formData.get("logoUrl") || ""),
    faviconUrl: String(formData.get("faviconUrl") || ""),
    whatsappUrl: String(formData.get("whatsappUrl") || "")
  });

  await upsertFooterSettings({
    locale,
    logoUrl: String(formData.get("footerLogoUrl") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    address: String(formData.get("address") || ""),
    copyrightText: String(formData.get("copyrightText") || "")
  });

  await replaceSocialLinks(locale, [
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

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
}

export async function saveSeoAction(formData: FormData) {
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/seo");

  await upsertSeoSettings({
    locale,
    metaTitle: String(formData.get("metaTitle") || ""),
    metaDescription: String(formData.get("metaDescription") || ""),
    metaKeywords: String(formData.get("metaKeywords") || ""),
    ogImageUrl: String(formData.get("ogImageUrl") || ""),
    robots: String(formData.get("robots") || ""),
    canonicalUrl: String(formData.get("canonicalUrl") || "")
  });

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
}

export async function saveCustomCodesAction(formData: FormData) {
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
      await updateCustomCode(entry);
      continue;
    }

    await createCustomCode(entry);
  }

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
}

export async function saveReorderSectionsAction(formData: FormData) {
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

  await reorderSections(updates, locale);
  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
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

export async function saveSectionAction(formData: FormData) {
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin");
  const key = String(formData.get("key") || "");
  const existingSection = await getSectionByKey(key, locale);
  const normalizedSectionSettings =
    existingSection?.settings && typeof existingSection.settings === "object"
      ? { ...existingSection.settings }
      : {};

  if (key === "hotel") {
    normalizedSectionSettings.hotelName = String(formData.get("hotelName") || "").trim();
    normalizedSectionSettings.hotelStars = Math.min(
      5,
      Math.max(1, Number(formData.get("hotelStars") || 5) || 5)
    );
  }

  await updateSection({
    key,
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

    const nextSettings =
      Object.keys(normalizedSettings).length > 0 ? normalizedSettings : existingSettings;

    await upsertSectionItem({
      id: Number(formData.get(`items.${index}.id`) || 0) || undefined,
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

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
}

export async function addSectionItemAction(formData: FormData) {
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin");
  const sectionKey = String(formData.get("sectionKey") || formData.get("key") || "");
  const itemType = String(formData.get("itemType") || formData.get("addItemType") || "default");
  const existingSection = sectionKey ? await getSectionByKey(sectionKey, locale) : null;
  const sortOrder = existingSection?.items.length ?? 0;

  await upsertSectionItem({
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

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
}

export async function deleteSectionItemAction(
  itemId: number,
  formData: FormData
) {
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin");
  const id = itemId || Number(formData.get("id") || 0);

  if (id > 0) {
    await deleteSectionItem(id);
  }

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
}

export async function uploadMediaAction(formData: FormData) {
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/media");
  const file = formData.get("file");

  if (file instanceof File && file.size > 0) {
    await createMediaAsset(file, String(formData.get("altText") || ""), "library");
  }

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
}

export async function deleteMediaAction(formData: FormData) {
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/media");
  const id = Number(formData.get("id") || 0);

  if (id > 0) {
    await deleteMediaAsset(id);
  }

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
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

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
}

export async function updateAdminUserAction(formData: FormData) {
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

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
}

export async function deleteAdminUserAction(formData: FormData) {
  const locale = getLocale(formData);
  const returnPath = getReturnPath(formData, "/admin/admin-users");
  const id = Number(formData.get("id") || 0);

  if (id > 0) {
    await deleteAdminUser(id);
  }

  revalidateAdminAndSite(returnPath);
  redirectWithStatus(returnPath, locale, "saved");
}
