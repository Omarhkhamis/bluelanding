type LinkBehavior = {
  target?: "_blank";
  rel?: "noopener noreferrer";
};

export const DEFAULT_WHATSAPP_PHONE = "905528007000";

export function getFallbackWhatsAppUrl() {
  return `https://api.whatsapp.com/send?phone=${DEFAULT_WHATSAPP_PHONE}`;
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

export function getWhatsAppLinkProps(url: string): LinkBehavior {
  if (!isWhatsAppUrl(getSafeWhatsAppUrl(url))) {
    return {};
  }

  return {
    target: "_blank",
    rel: "noopener noreferrer"
  };
}
