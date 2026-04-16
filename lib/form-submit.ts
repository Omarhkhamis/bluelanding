"use client";

import { parsePhoneNumberFromString } from "libphonenumber-js";
import { extractSiteLocaleFromPathname, getSitePagePath } from "@/lib/sites";

type FormPayload = Record<string, string>;

type SubmitOptions = {
  skipRedirect?: boolean;
  popup?: Window | null;
};

type ValidationOptions = {
  requireEmail?: boolean;
};

type ValidationResult =
  | {
      ok: true;
      payload: FormPayload;
      fullName: string;
      phone: string;
      email: string;
    }
  | {
      ok: false;
      field: "fullName" | "phone" | "email";
      title: string;
      text: string;
    };

let swalPromise: Promise<any> | null = null;

async function loadSwal() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!swalPromise) {
    swalPromise = import("sweetalert2").then((mod) => mod.default || mod);
  }

  return swalPromise;
}

async function showAlert(title: string, text: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const Swal = await loadSwal();
    if (Swal) {
      await Swal.fire({
        title,
        text,
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#2a3089",
        background: "#ffffff",
        color: "#0f172a"
      });
      return;
    }
  } catch {
    // Fallback to native alert below.
  }

  window.alert(text);
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

function pickFirstFilled(payload: FormPayload, keys: string[]) {
  for (const key of keys) {
    const value = String(payload[key] || "").trim();
    if (value) {
      return value;
    }
  }

  return "";
}

export function openSubmissionPopup() {
  if (typeof window === "undefined") {
    return null;
  }

  const popup = window.open("", "_blank");

  if (!popup) {
    return null;
  }

  try {
    popup.opener = null;
    popup.document.title = "Redirecting...";
    popup.document.body.innerHTML =
      '<div style="font-family:Arial,sans-serif;padding:24px;color:#0f172a">Redirecting to WhatsApp...</div>';
  } catch {
    // Ignore popup initialization errors and continue with a best-effort redirect later.
  }

  return popup;
}

export function buildFormPayload(
  form: HTMLFormElement,
  source: string,
  overrides: Record<string, string> = {}
) {
  const payload: FormPayload = {};
  const formData = new FormData(form);

  for (const [key, value] of formData.entries()) {
    if (!key) {
      continue;
    }

    const nextValue = typeof value === "string" ? value.trim() : String(value);
    if (nextValue) {
      payload[key] = nextValue;
    }
  }

  payload.source = source;

  if (typeof window !== "undefined") {
    payload.page = window.location.pathname;
    const routeContext = extractSiteLocaleFromPathname(window.location.pathname);
    payload.site = routeContext.siteKey;
    payload.locale = routeContext.locale;
  }

  for (const [key, value] of Object.entries(overrides)) {
    const nextValue = String(value || "").trim();
    if (nextValue) {
      payload[key] = nextValue;
    }
  }

  return payload;
}

export function validateFormPayload(
  payload: FormPayload,
  options: ValidationOptions = {}
): ValidationResult {
  const fullName = pickFirstFilled(payload, ["fullName", "name"]);
  const phone = pickFirstFilled(payload, ["phone"]);
  const email = pickFirstFilled(payload, ["email"]);

  if (!fullName) {
    return {
      ok: false,
      field: "fullName",
      title: "Missing details",
      text: "Please enter your full name."
    };
  }

  if (!phone) {
    return {
      ok: false,
      field: "phone",
      title: "Missing details",
      text: "Please enter your phone number."
    };
  }

  if (!isValidPhone(phone)) {
    return {
      ok: false,
      field: "phone",
      title: "Invalid phone",
      text: "Please enter a valid phone number."
    };
  }

  if (options.requireEmail && !email) {
    return {
      ok: false,
      field: "email",
      title: "Missing details",
      text: "Please enter your email address."
    };
  }

  if (email && !isValidEmail(email)) {
    return {
      ok: false,
      field: "email",
      title: "Invalid email",
      text: "Please enter a valid email address."
    };
  }

  return {
    ok: true,
    payload: {
      ...payload,
      fullName,
      phone: normalizePhone(phone)
    },
    fullName,
    phone: normalizePhone(phone),
    email
  };
}

export async function submitFormPayload(payload: FormPayload, options: SubmitOptions = {}) {
  const validation = validateFormPayload(payload);

  if (!validation.ok) {
    await showAlert(validation.title, validation.text);
    return { ok: false };
  }

  const popup =
    options.popup !== undefined
      ? options.popup
      : openSubmissionPopup();
  const normalizedPayload = validation.payload;

  try {
    const response = await fetch("/api/forms/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(normalizedPayload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.ok) {
      popup?.close();
      await showAlert("Submission failed", "Please try again.");
      return { ok: false, ...data };
    }

    const whatsappUrl = data.whatsappUrl || data.redirectTo;

    if (whatsappUrl) {
      if (popup) {
        popup.location.replace(whatsappUrl);
      } else if (typeof window !== "undefined") {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } else {
      popup?.close();
    }

    if (!options.skipRedirect && typeof window !== "undefined") {
      const routeContext = extractSiteLocaleFromPathname(normalizedPayload.page || "/");
      window.location.assign(
        String(
          data.thankYouUrl ||
            getSitePagePath(routeContext.siteKey, routeContext.locale, "thankyou")
        )
      );
    }

    return { ok: true, ...data };
  } catch (error) {
    popup?.close();
    await showAlert("Submission failed", "Please try again.");
    return { ok: false, error };
  }
}
