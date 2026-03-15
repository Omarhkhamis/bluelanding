import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getManagedPageByKey, getPublicSiteContent } from "@/lib/cms";
import { getSiteBasePath, normalizeLocaleSegment, parseSiteKey } from "@/lib/sites";

const copy = {
  en: {
    badge: "Request Received",
    home: "BACK TO HOME PAGE"
  },
  ru: {
    badge: "Запрос получен",
    home: "BACK TO HOME PAGE"
  }
};

function renderParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function ThankYouPage({
  params
}: {
  params: Promise<{ site: string; locale: string }>;
}) {
  const { site, locale } = await params;
  const siteKey = parseSiteKey(site);

  if (!siteKey) {
    notFound();
  }

  const normalizedLocale = normalizeLocaleSegment(locale);
  const basePath = getSiteBasePath(siteKey, normalizedLocale);
  const [content, page] = await Promise.all([
    getPublicSiteContent(siteKey, normalizedLocale),
    getManagedPageByKey("thankyou", siteKey, normalizedLocale)
  ]);
  const pageNavLinks = content.navLinks.map((link) => ({
    ...link,
    href: link.href.startsWith("#") ? `${basePath}${link.href}` : link.href
  }));
  const activeHeader = content.header2?.isActive ? content.header2 : content.header;
  const activeFooter = content.footerSection2?.isActive ? content.footerSection2 : content.footerSection;
  const uiCopy = normalizedLocale === "ru" ? copy.ru : copy.en;
  const paragraphs = renderParagraphs(page?.content || "");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        logoUrl={content.site.logoUrl}
        siteName={content.site.siteName}
        homeHref={basePath}
        navLinks={pageNavLinks}
        footer={content.footer}
        whatsappUrl={content.site.whatsappUrl}
        section={activeHeader}
      />

      <main className="bg-white px-4">
        <section className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
          <div className="w-full rounded-[32px] bg-white px-6 py-10 text-center text-[#2d2d2d] md:px-12 md:py-14">
            <div className="inline-flex items-center rounded-full border border-[#2d2d2d]/10 bg-[#2d2d2d]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#2d2d2d]">
              {uiCopy.badge}
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#2d2d2d] md:text-6xl">
              {page?.title || "Thank You"}
            </h1>

            <div className="mt-6 space-y-4 text-base leading-8 text-[#2d2d2d]/80 md:text-lg">
              {paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
            </div>

            <div className="mb-8 mt-14 flex items-center justify-center md:mb-10 md:mt-16">
              <Link
                href={basePath}
                className="inline-flex min-w-[260px] items-center justify-center rounded-full border border-[#2d2d2d]/15 bg-[#2d2d2d]/5 px-14 py-3 text-sm font-semibold text-[#2d2d2d] transition hover:bg-[#2d2d2d]/10 md:px-14"
              >
                {uiCopy.home}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        siteKey={siteKey}
        basePath={basePath}
        footer={content.footer}
        navLinks={content.navLinks}
        footerSection={activeFooter}
        whatsappUrl={content.site.whatsappUrl}
      />
      <WhatsAppFloat href={content.site.whatsappUrl} />
    </div>
  );
}
