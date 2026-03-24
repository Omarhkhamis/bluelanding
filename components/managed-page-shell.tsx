import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getPublicSiteContent } from "@/lib/cms";
import { getSiteBasePath, type SiteKey } from "@/lib/sites";

type ManagedPageShellProps = {
  siteKey: SiteKey;
  locale: string;
  title: string;
  content: string;
};

function renderParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function ManagedPageShell({
  siteKey,
  locale,
  title,
  content
}: ManagedPageShellProps) {
  const normalizedLocale = locale === "ru" ? "ru" : locale;
  const basePath = getSiteBasePath(siteKey, normalizedLocale);
  const siteContent = await getPublicSiteContent(siteKey, normalizedLocale);
  const pageNavLinks = siteContent.navLinks.map((link) => ({
    ...link,
    href: link.href.startsWith("#") ? `${basePath}${link.href}` : link.href
  }));
  const activeHeader =
    [siteContent.header2, siteContent.header].find((section) => section?.isActive) || null;
  const activeFooter =
    [siteContent.footerSection2, siteContent.footerSection].find(
      (section) => section?.isActive
    ) || null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        logoUrl={siteContent.site.logoUrl}
        siteName={siteContent.site.siteName}
        homeHref={basePath}
        navLinks={pageNavLinks}
        footer={siteContent.footer}
        whatsappUrl={siteContent.site.whatsappUrl}
        section={activeHeader}
      />

      <main className="px-4 pb-20 pt-10 md:pt-12">
        <section className="mx-auto max-w-4xl rounded-[32px] border border-border/60 bg-white px-6 py-10 shadow-sm md:px-10 md:py-14">
          <h1 className="text-3xl font-bold tracking-tight text-dental-navy md:text-5xl">
            {title}
          </h1>

          <div className="mt-6 space-y-4 text-base leading-8 text-foreground/80">
            {renderParagraphs(content).map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter
        siteKey={siteKey}
        basePath={basePath}
        footer={siteContent.footer}
        navLinks={siteContent.navLinks}
        footerSection={activeFooter}
        whatsappUrl={siteContent.site.whatsappUrl}
      />
      <WhatsAppFloat href={siteContent.site.whatsappUrl} />
    </div>
  );
}
