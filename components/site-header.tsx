"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { HeaderLpbm } from "@/components/header-lpbm";
import type { FooterSettings, Section } from "@/lib/cms";
type SiteHeaderProps = {
  logoUrl: string;
  siteName: string;
  navLinks: Array<{
    href: string;
    label: string;
  }>;
  footer: FooterSettings;
  whatsappUrl: string;
  section: Section | null;
};

export function SiteHeader({
  logoUrl,
  siteName,
  navLinks,
  footer,
  whatsappUrl,
  section
}: SiteHeaderProps) {
  if (section?.key === "header-2") {
    return (
      <HeaderLpbm
        logoUrl={logoUrl}
        siteName={siteName}
        footer={footer}
        whatsappUrl={whatsappUrl}
        section={section}
      />
    );
  }

  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container-dental">
        <div className="relative flex h-16 items-center justify-center lg:h-24 lg:justify-between">
          <Link
            href="/"
            className="flex items-center -translate-x-2 lg:translate-x-0"
          >
            <Image
              src={logoUrl}
              alt={siteName}
              width={190}
              height={60}
              className="h-8 w-auto transition-all duration-300 md:h-10 lg:h-12"
              priority
            />
          </Link>

          <nav className="ml-auto mr-8 hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="absolute right-0 rounded-lg p-2 transition-colors hover:bg-muted lg:hidden"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>

        {isOpen ? (
          <nav className="border-t border-border py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
