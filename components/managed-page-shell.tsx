import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getPublicSiteContent } from "@/lib/cms";

type ManagedPageShellProps = {
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
  locale,
  title,
  content
}: ManagedPageShellProps) {
  const normalizedLocale = locale === "ru" ? "ru" : "en";
  const siteContent = await getPublicSiteContent(normalizedLocale);
  const activeHeader = siteContent.header2?.isActive ? siteContent.header2 : siteContent.header;
  const activeFooter = siteContent.footerSection2?.isActive
    ? siteContent.footerSection2
    : siteContent.footerSection;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        logoUrl={siteContent.site.logoUrl}
        siteName={siteContent.site.siteName}
        navLinks={siteContent.navLinks}
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
        footer={siteContent.footer}
        navLinks={siteContent.navLinks}
        footerSection={activeFooter}
      />
      <WhatsAppFloat href={siteContent.site.whatsappUrl} />
    </div>
  );
}
