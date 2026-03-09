type LinkBehavior = {
  target?: "_blank";
  rel?: "noopener noreferrer";
};

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

export function getWhatsAppLinkProps(url: string): LinkBehavior {
  if (!isWhatsAppUrl(url)) {
    return {};
  }

  return {
    target: "_blank",
    rel: "noopener noreferrer"
  };
}
