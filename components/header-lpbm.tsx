import Link from "next/link";
import { ExternalLink, Phone } from "lucide-react";
import { useMemo } from "react";
import type { FooterSettings, Section } from "@/lib/cms";
import { getWhatsAppLinkProps } from "@/lib/whatsapp";

const socialIconMap: Record<string, string> = {
  facebook: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  tiktok:
    "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z",
  youtube:
    "M21.58 7.19a2.84 2.84 0 0 0-2-2C17.88 4.7 12 4.7 12 4.7s-5.88 0-7.58.49a2.84 2.84 0 0 0-2 2A29.72 29.72 0 0 0 2 12a29.72 29.72 0 0 0 .42 4.81 2.84 2.84 0 0 0 2 2c1.7.49 7.58.49 7.58.49s5.88 0 7.58-.49a2.84 2.84 0 0 0 2-2A29.72 29.72 0 0 0 22 12a29.72 29.72 0 0 0-.42-4.81zM10 15.5v-7l6 3.5-6 3.5z"
};

type HeaderLpbmProps = {
  logoUrl: string;
  siteName: string;
  footer: FooterSettings;
  whatsappUrl: string;
  section: Section;
};

export function HeaderLpbm({
  logoUrl,
  siteName,
  footer,
  whatsappUrl,
  section
}: HeaderLpbmProps) {
  const settings = (section.settings || {}) as Record<string, unknown>;
  const ctaLabel = String(settings.ctaLabel || "Book Consultation");
  const callLabel = String(settings.callLabel || "Call Us");
  const socialLinks = useMemo(
    () => footer.socialLinks.filter((item) => item.url && item.url.trim()),
    [footer.socialLinks]
  );

  return (
    <header className="lpbm-header">
      <div className="lpbm-header__inner container-dental">
        <div className="lpbm-header__brand">
          <Link href="/" className="lpbm-header__logo">
            <img src={logoUrl} alt={siteName} className="lpbm-header__logo-image" />
          </Link>
        </div>

        <div className="lpbm-header__actions">
          <div className="lpbm-header__socials">
            {socialLinks.map((item) => {
              const key = item.platform.toLowerCase();
              const path = socialIconMap[key];

              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="lpbm-header__social-link"
                  aria-label={item.label}
                >
                  {path ? (
                    <svg className="lpbm-header__social-icon" fill="currentColor" viewBox="0 0 24 24">
                      <path d={path} />
                    </svg>
                  ) : (
                    <ExternalLink className="lpbm-header__social-icon" />
                  )}
                </a>
              );
            })}
          </div>

          <div className="lpbm-header__phone">
            <span className="lpbm-header__phone-label">{callLabel}</span>
            <a href={`tel:${footer.phone.replace(/\s+/g, "")}`} className="lpbm-header__phone-value">
              <Phone className="lpbm-header__phone-icon" />
              {footer.phone}
            </a>
          </div>

          <a
            href={whatsappUrl}
            {...getWhatsAppLinkProps(whatsappUrl)}
            className="lpbm-header__cta"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
