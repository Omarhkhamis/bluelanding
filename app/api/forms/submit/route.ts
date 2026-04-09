import { parsePhoneNumberFromString } from "libphonenumber-js";
import { createFormSubmission, createSpinSubmission, getSiteSettings } from "@/lib/cms";
import {
  extractSiteLocaleFromPathname,
  getSitePagePath,
  normalizeLocaleSegment,
  normalizeSiteKey
} from "@/lib/sites";
import { buildWhatsAppApiUrl } from "@/lib/whatsapp";

function asString(value: unknown) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function sanitizePayload(payload: Record<string, unknown>) {
  const cleaned: Record<string, string> = {};

  for (const [key, value] of Object.entries(payload || {})) {
    if (!key) {
      continue;
    }

    const nextValue = asString(value).trim();
    if (nextValue) {
      cleaned[key] = nextValue.slice(0, 4000);
    }
  }

  return cleaned;
}

function pickFirstFilled(fields: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = String(fields[key] || "").trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function normalizePhone(value: string) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "")
    .slice(0, 15);

  return digits ? `+${digits}` : "";
}

function isValidPhone(value: string) {
  const normalized = normalizePhone(value);
  if (!normalized) {
    return false;
  }

  const parsed = parsePhoneNumberFromString(normalized);
  return Boolean(parsed?.isValid());
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function buildWhatsAppRedirect(baseLink: string, fields: Record<string, string>) {
  const name = pickFirstFilled(fields, ["fullName", "name"]);
  const message = pickFirstFilled(fields, ["message", "notes", "details"]);
  const prize = pickFirstFilled(fields, ["prize", "spinPrize"]);
  const phone = pickFirstFilled(fields, ["phone"]);
  const lines = [
    name ? `Name: ${name}` : "",
    phone ? `Phone: ${phone}` : "",
    message ? `Message: ${message}` : "",
    prize ? `Prize: ${prize}` : ""
  ].filter(Boolean);
  return buildWhatsAppApiUrl(baseLink, lines.join("\n"), { replaceText: true });
}

function buildSpinWhatsAppRedirect(baseLink: string, fields: Record<string, string>) {
  const name = pickFirstFilled(fields, ["fullName", "name"]);
  const prize = pickFirstFilled(fields, ["prize", "spinPrize"]);
  const lines = [
    name ? `Name: ${name}` : "",
    prize ? `Prize: ${prize}` : ""
  ].filter(Boolean);

  return buildWhatsAppApiUrl(baseLink, lines.join("\n"), { replaceText: true });
}

function resolveSiteContext(fields: Record<string, string>) {
  const pathContext = extractSiteLocaleFromPathname(String(fields.page || ""));

  return {
    siteKey: normalizeSiteKey(fields.site || pathContext.siteKey),
    locale: normalizeLocaleSegment(fields.locale || pathContext.locale)
  };
}

export async function POST(request: Request) {
  let payload: Record<string, unknown> = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const cleaned = sanitizePayload(payload);
  const { siteKey, locale } = resolveSiteContext(cleaned);

  if (cleaned.company) {
    return Response.json({
      ok: true,
      thankYouUrl: getSitePagePath(siteKey, locale, "thankyou")
    });
  }

  const fullName = pickFirstFilled(cleaned, ["fullName", "name"]);
  const phone = normalizePhone(pickFirstFilled(cleaned, ["phone"]));
  const email = pickFirstFilled(cleaned, ["email"]);
  const message = pickFirstFilled(cleaned, ["message", "notes", "details"]);
  const prize = pickFirstFilled(cleaned, ["prize", "spinPrize"]);
  const source = cleaned.source || "website";
  const submittedAt = new Date().toISOString();
  const isSpin = source === "lucky-spin" || Boolean(prize);

  if (!fullName || !phone) {
    return Response.json({ ok: false, error: "MISSING_CONTACT_INFO" }, { status: 400 });
  }

  if (!isValidPhone(phone)) {
    return Response.json({ ok: false, error: "INVALID_PHONE" }, { status: 400 });
  }

  if (email && !isValidEmail(email)) {
    return Response.json({ ok: false, error: "INVALID_EMAIL" }, { status: 400 });
  }

  const storedPayload = {
    ...cleaned,
    source,
    fullName,
    phone,
    email,
    message,
    prize,
    submittedAt
  };

  if (isSpin) {
    await createSpinSubmission({
      siteKey,
      locale,
      source,
      page: cleaned.page || "",
      fullName,
      phone,
      prize,
      payload: storedPayload
    });
  } else {
    await createFormSubmission({
      siteKey,
      locale,
      source,
      formName: cleaned.formName || "",
      page: cleaned.page || "",
      fullName,
      phone,
      email,
      message,
      payload: storedPayload
    });
  }

  let siteWhatsappUrl = "";

  try {
    const siteSettings = await getSiteSettings(siteKey, locale);
    siteWhatsappUrl = siteSettings.whatsappUrl || "";
  } catch {
    siteWhatsappUrl = "";
  }

  const whatsappUrl = isSpin
    ? buildSpinWhatsAppRedirect(cleaned.whatsappUrl || siteWhatsappUrl, storedPayload)
    : buildWhatsAppRedirect(cleaned.whatsappUrl || siteWhatsappUrl, storedPayload);

  return Response.json({
    ok: true,
    whatsappUrl,
    redirectTo: whatsappUrl,
    thankYouUrl: getSitePagePath(siteKey, locale, "thankyou")
  });
}
