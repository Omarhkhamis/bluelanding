import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getManagedPageByKey, getPublicSiteContent } from "@/lib/cms";
import { getWhatsAppLinkProps } from "@/lib/whatsapp";

const copy = {
  en: {
    badge: "Request Received",
    home: "Back To Home",
    whatsapp: "Open WhatsApp"
  },
  ru: {
    badge: "Запрос получен",
    home: "На главную",
    whatsapp: "Открыть WhatsApp"
  }
};

function renderParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function ThankYouPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale = "en" } = await searchParams;
  const normalizedLocale = locale === "ru" ? "ru" : "en";
  const [content, page] = await Promise.all([
    getPublicSiteContent(normalizedLocale),
    getManagedPageByKey("thankyou", normalizedLocale)
  ]);
  const activeHeader = content.header2?.isActive ? content.header2 : content.header;
  const activeFooter = content.footerSection2?.isActive ? content.footerSection2 : content.footerSection;
  const uiCopy = normalizedLocale === "ru" ? copy.ru : copy.en;
  const paragraphs = renderParagraphs(page?.content || "");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        logoUrl={content.site.logoUrl}
        siteName={content.site.siteName}
        navLinks={content.navLinks}
        footer={content.footer}
        whatsappUrl={content.site.whatsappUrl}
        section={activeHeader}
      />

      <main className="relative overflow-hidden bg-gradient-to-br from-dental-navy via-[#11184a] to-[#1d2570] px-4 pb-20 pt-32 text-white">
        <div className="absolute inset-0">
          <div className="absolute left-[-10%] top-[-5%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        </div>

        <section className="relative mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center text-center">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
            {uiCopy.badge}
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            {page?.title || "Thank You"}
          </h1>

          <div className="mt-6 space-y-4 text-base leading-8 text-white/80 md:text-lg">
            {paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={content.site.whatsappUrl}
              {...getWhatsAppLinkProps(content.site.whatsappUrl)}
              className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dental-navy transition hover:bg-white/90"
            >
              {uiCopy.whatsapp}
            </a>
            <Link
              href="/"
              className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {uiCopy.home}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter
        footer={content.footer}
        navLinks={content.navLinks}
        footerSection={activeFooter}
      />
      <WhatsAppFloat href={content.site.whatsappUrl} />
    </div>
  );
}
