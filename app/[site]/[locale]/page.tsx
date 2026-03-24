import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { BeforeAfterSection } from "@/components/sections/before-after-section";
import { ClinicGallerySection } from "@/components/sections/clinic-gallery-section";
import { ConsultationCtaSection } from "@/components/sections/consultation-cta-section";
import { CertificatesGallerySection } from "@/components/sections/certificates-gallery-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HotelSection } from "@/components/sections/hotel-section";
import { InfluencersSection } from "@/components/sections/influencers-section";
import { LuckySpinSection } from "@/components/sections/lucky-spin-section";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { ServiceDetailsSection } from "@/components/sections/service-details-section";
import { ServicesSection } from "@/components/sections/services-section";
import { TeamSection } from "@/components/sections/team-section";
import { TreatmentMatrixSection } from "@/components/sections/treatment-matrix-section";
import { WhyChooseSection } from "@/components/sections/why-choose-section";
import { getPublicSiteContent, type Section } from "@/lib/cms";
import { getSiteBasePath, normalizeLocaleSegment, parseSiteKey } from "@/lib/sites";

function getActiveVariant(...sections: Array<Section | null | undefined>) {
  return sections.find((section): section is Section => Boolean(section?.isActive)) || null;
}

function renderSection(section: Section, whatsappUrl: string) {
  switch (section.key) {
    case "hero":
    case "hero-2":
      return <HeroSection key={section.key} section={section} whatsappUrl={whatsappUrl} />;
    case "why-choose":
      return <WhyChooseSection key={section.key} section={section} whatsappUrl={whatsappUrl} />;
    case "services":
      return <ServicesSection key={section.key} section={section} whatsappUrl={whatsappUrl} />;
    case "team":
      return <TeamSection key={section.key} section={section} />;
    case "treatment-matrix":
      return <TreatmentMatrixSection key={section.key} section={section} />;
    case "consultation-virtual":
    case "consultation-online":
      return (
        <ConsultationCtaSection
          key={section.key}
          section={section}
          whatsappUrl={whatsappUrl}
        />
      );
    case "before-after":
      return <BeforeAfterSection key={section.key} section={section} whatsappUrl={whatsappUrl} />;
    case "service-details":
      return (
        <ServiceDetailsSection key={section.key} section={section} whatsappUrl={whatsappUrl} />
      );
    case "certificates-gallery":
      return <CertificatesGallerySection key={section.key} section={section} />;
    case "google-reviews":
      return (
        <ReviewsSection
          key={section.key}
          section={section}
          provider="google"
          whatsappUrl={whatsappUrl}
        />
      );
    case "trustpilot-reviews":
      return (
        <ReviewsSection
          key={section.key}
          section={section}
          provider="trustpilot"
          whatsappUrl={whatsappUrl}
        />
      );
    case "hotel":
      return <HotelSection key={section.key} section={section} />;
    case "clinic-gallery":
      return <ClinicGallerySection key={section.key} section={section} />;
    case "lucky-spin":
      return <LuckySpinSection key={section.key} section={section} whatsappUrl={whatsappUrl} />;
    case "influencers":
      return <InfluencersSection key={section.key} section={section} />;
    case "faq":
      return <FaqSection key={section.key} section={section} whatsappUrl={whatsappUrl} />;
    default:
      return null;
  }
}

export default async function PublicHomePage({
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
  const content = await getPublicSiteContent(siteKey, normalizedLocale);
  const activeHeader = getActiveVariant(content.header2, content.header);
  const activeHero = getActiveVariant(content.hero2, content.hero);
  const activeFooter = getActiveVariant(content.footerSection2, content.footerSection);
  const hiddenSectionKeys = new Set(["header", "header-2", "footer", "footer-2"]);

  if (activeHero?.key === "hero-2") {
    hiddenSectionKeys.add("hero");
  } else if (activeHero?.key === "hero") {
    hiddenSectionKeys.add("hero-2");
  } else {
    hiddenSectionKeys.add("hero");
    hiddenSectionKeys.add("hero-2");
  }

  const orderedSections = content.sections.filter(
    (section) => section.isActive && !hiddenSectionKeys.has(section.key)
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        logoUrl={content.site.logoUrl}
        siteName={content.site.siteName}
        homeHref={basePath}
        navLinks={content.navLinks}
        footer={content.footer}
        whatsappUrl={content.site.whatsappUrl}
        section={activeHeader}
      />
      <main>
        {orderedSections.map((section) => renderSection(section, content.site.whatsappUrl))}
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
