type LinkBehavior = {
  target?: "_blank";
  rel?: "noopener noreferrer";
};

export const DEFAULT_WHATSAPP_PHONE = "905528007000";

function normalizeWhatsAppPhone(value: string) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits || DEFAULT_WHATSAPP_PHONE;
}

export function getFallbackWhatsAppUrl() {
  return `https://api.whatsapp.com/send/?phone=${DEFAULT_WHATSAPP_PHONE}&type=phone_number&app_absent=0`;
}

export function isWhatsAppUrl(url: string) {
  const value = String(url || "").trim().toLowerCase();

  if (!value) {
    return false;
  }

  if (value.startsWith("whatsapp://")) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return (
      parsed.hostname === "wa.me" ||
      parsed.hostname.endsWith(".wa.me") ||
      parsed.hostname === "api.whatsapp.com" ||
      parsed.hostname.endsWith(".whatsapp.com") ||
      parsed.hostname === "web.whatsapp.com"
    );
  } catch {
    return value.includes("wa.me") || value.includes("whatsapp");
  }
}

export function getSafeWhatsAppUrl(url: string) {
  const value = String(url || "").trim();
  return isWhatsAppUrl(value) ? value : getFallbackWhatsAppUrl();
}

export function buildWhatsAppApiUrl(url: string, extraText = "") {
  const safeUrl = getSafeWhatsAppUrl(url);
  let phone = "";
  let existingText = "";

  try {
    const parsed = new URL(safeUrl);
    phone = parsed.searchParams.get("phone") || "";
    existingText = parsed.searchParams.get("text") || "";

    if (!phone) {
      const pathValue = parsed.pathname.replace(/^\/+|\/+$/g, "");
      if (pathValue && pathValue.toLowerCase() !== "send") {
        phone = pathValue.split("/").pop() || "";
      }
    }
  } catch {
    phone = "";
    existingText = "";
  }

  const nextUrl = new URL("https://api.whatsapp.com/send/");
  const mergedText = [existingText.trim(), String(extraText || "").trim()]
    .filter(Boolean)
    .join("\n\n");

  nextUrl.searchParams.set("phone", normalizeWhatsAppPhone(phone));
  if (mergedText) {
    nextUrl.searchParams.set("text", mergedText);
  }
  nextUrl.searchParams.set("type", "phone_number");
  nextUrl.searchParams.set("app_absent", "0");

  return nextUrl.toString();
}

export function getWhatsAppLinkProps(url: string): LinkBehavior {
  if (!isWhatsAppUrl(getSafeWhatsAppUrl(url))) {
    return {};
  }

  return {
    target: "_blank",
    rel: "noopener noreferrer"
  };
}
