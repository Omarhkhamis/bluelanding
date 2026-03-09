import { parsePhoneNumberFromString } from "libphonenumber-js";
import { createFormSubmission, getSiteSettings } from "@/lib/cms";

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
  const base = String(baseLink || "").trim();
  if (!base) {
    return "";
  }

  const name = pickFirstFilled(fields, ["fullName", "name"]);
  const message = pickFirstFilled(fields, ["message", "notes", "details"]);
  const prize = pickFirstFilled(fields, ["prize"]);
  const phone = pickFirstFilled(fields, ["phone"]);
  const lines = prize
    ? [
        "Lucky Spin Submission",
        name ? `Name: ${name}` : "",
        prize ? `Prize: ${prize}` : "",
        message ? `Message: ${message}` : "",
        phone ? `Phone: ${phone}` : ""
      ].filter(Boolean)
    : [name, message].filter(Boolean);

  try {
    const url = new URL(base);
    const existingText = url.searchParams.get("text");
    const nextText = lines.join("\n");

    if (nextText) {
      url.searchParams.set(
        "text",
        existingText ? `${existingText}\n\n${nextText}` : nextText
      );
    }

    return url.toString();
  } catch {
    return base;
  }
}

export async function POST(request: Request) {
  let payload: Record<string, unknown> = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const cleaned = sanitizePayload(payload);

  if (cleaned.company) {
    return Response.json({ ok: true, thankYouUrl: "/thankyou" });
  }

  const fullName = pickFirstFilled(cleaned, ["fullName", "name"]);
  const phone = normalizePhone(pickFirstFilled(cleaned, ["phone"]));
  const email = pickFirstFilled(cleaned, ["email"]);
  const message = pickFirstFilled(cleaned, ["message", "notes", "details"]);
  const locale = cleaned.locale === "ru" ? "ru" : "en";

  if (!fullName || !phone) {
    return Response.json({ ok: false, error: "MISSING_CONTACT_INFO" }, { status: 400 });
  }

  if (!isValidPhone(phone)) {
    return Response.json({ ok: false, error: "INVALID_PHONE" }, { status: 400 });
  }

  if (email && !isValidEmail(email)) {
    return Response.json({ ok: false, error: "INVALID_EMAIL" }, { status: 400 });
  }

  await createFormSubmission({
    locale,
    source: cleaned.source || "website",
    formName: cleaned.formName || "",
    page: cleaned.page || "",
    fullName,
    phone,
    email,
    message,
    payload: {
      ...cleaned,
      phone,
      submittedAt: new Date().toISOString()
    }
  });

  const siteSettings = await getSiteSettings(locale);
  const redirectTo = buildWhatsAppRedirect(siteSettings.whatsappUrl, {
    ...cleaned,
    fullName,
    phone,
    email,
    message
  });

  return Response.json({
    ok: true,
    redirectTo,
    thankYouUrl: `/thankyou?locale=${locale}`
  });
}
