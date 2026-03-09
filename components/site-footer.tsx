import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { FooterSettings } from "@/lib/cms";

const socialIconMap: Record<string, string> = {
  Facebook:
    "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  Instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  TikTok:
    "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
};

type SiteFooterProps = {
  footer: FooterSettings;
  navLinks: Array<{
    href: string;
    label: string;
  }>;
};

export function SiteFooter({ footer, navLinks }: SiteFooterProps) {
  return (
    <footer id="contact" className="bg-dental-navy text-white">
      <div className="container-dental py-12">
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <Image
            src={footer.logoUrl}
            alt="Footer Logo"
            width={180}
            height={60}
            className="h-10 w-auto md:h-14"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-white" />
              <span className="font-medium">{footer.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-white" />
              <a
                href={`tel:${footer.phone}`}
                className="font-medium transition-colors hover:text-primary"
              >
                {footer.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-white" />
              <a
                href={`mailto:${footer.email}`}
                className="font-medium transition-colors hover:text-primary"
              >
                {footer.email}
              </a>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-4">
            <h3 className="text-2xl font-medium">Our Social Media</h3>
            <div className="flex gap-4">
              {footer.socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white transition-all duration-300 hover:bg-white hover:text-dental-navy"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d={socialIconMap[link.label]} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="container-dental text-center">
          <p className="text-sm text-white/60">
            {footer.copyrightText}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
