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
import { TreatmentMatrixSection } from "@/components/sections/treatment-matrix-section";
import { WhyChooseSection } from "@/components/sections/why-choose-section";
import { getPublicSiteContent } from "@/lib/cms";

export default async function HomePage() {
  const content = await getPublicSiteContent();
  const activeHeader = content.header2?.isActive ? content.header2 : content.header;
  const activeHero = content.hero2?.isActive ? content.hero2 : content.hero;
  const activeFooter = content.footerSection2?.isActive ? content.footerSection2 : content.footerSection;

  if (
    !activeHero ||
    !content.whyChoose ||
    !content.servicesSection ||
    !content.beforeAfter ||
    !content.serviceDetails ||
    !content.hotel ||
    !content.clinicGallerySection ||
    !content.consultationVirtual ||
    !content.consultationOnline ||
    !content.influencers ||
    !content.faq
  ) {
    notFound();
  }

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
      <main>
        <HeroSection section={activeHero} whatsappUrl={content.site.whatsappUrl} />
        <WhyChooseSection
          section={content.whyChoose}
          whatsappUrl={content.site.whatsappUrl}
        />
        <ServicesSection
          section={content.servicesSection}
          whatsappUrl={content.site.whatsappUrl}
        />
        {content.treatmentMatrix?.isActive ? (
          <TreatmentMatrixSection section={content.treatmentMatrix} />
        ) : null}
        <ConsultationCtaSection
          section={content.consultationVirtual}
          whatsappUrl={content.site.whatsappUrl}
        />
        <BeforeAfterSection
          section={content.beforeAfter}
          whatsappUrl={content.site.whatsappUrl}
        />
        <ServiceDetailsSection
          section={content.serviceDetails}
          whatsappUrl={content.site.whatsappUrl}
        />
        {content.certificatesGallery?.isActive ? (
          <CertificatesGallerySection section={content.certificatesGallery} />
        ) : null}
        {content.googleReviews?.isActive ? (
          <ReviewsSection
            section={content.googleReviews}
            provider="google"
            whatsappUrl={content.site.whatsappUrl}
          />
        ) : null}
        {content.trustpilotReviews?.isActive ? (
          <ReviewsSection
            section={content.trustpilotReviews}
            provider="trustpilot"
            whatsappUrl={content.site.whatsappUrl}
          />
        ) : null}
        <HotelSection section={content.hotel} />
        <ClinicGallerySection section={content.clinicGallerySection} />
        {content.luckySpin?.isActive ? (
          <LuckySpinSection section={content.luckySpin} whatsappUrl={content.site.whatsappUrl} />
        ) : null}
        <ConsultationCtaSection
          section={content.consultationOnline}
          whatsappUrl={content.site.whatsappUrl}
        />
        <InfluencersSection section={content.influencers} />
        <FaqSection section={content.faq} whatsappUrl={content.site.whatsappUrl} />
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
