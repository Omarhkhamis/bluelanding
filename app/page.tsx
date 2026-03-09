import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { BeforeAfterSection } from "@/components/sections/before-after-section";
import { ClinicGallerySection } from "@/components/sections/clinic-gallery-section";
import { ConsultationCtaSection } from "@/components/sections/consultation-cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HotelSection } from "@/components/sections/hotel-section";
import { InfluencersSection } from "@/components/sections/influencers-section";
import { ServiceDetailsSection } from "@/components/sections/service-details-section";
import { ServicesSection } from "@/components/sections/services-section";
import { WhyChooseSection } from "@/components/sections/why-choose-section";
import { getPublicSiteContent } from "@/lib/cms";

export default async function HomePage() {
  const content = await getPublicSiteContent();

  if (
    !content.hero ||
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
      />
      <main>
        <HeroSection section={content.hero} whatsappUrl={content.site.whatsappUrl} />
        <WhyChooseSection
          section={content.whyChoose}
          whatsappUrl={content.site.whatsappUrl}
        />
        <ServicesSection
          section={content.servicesSection}
          whatsappUrl={content.site.whatsappUrl}
        />
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
        <HotelSection section={content.hotel} />
        <ClinicGallerySection section={content.clinicGallerySection} />
        <ConsultationCtaSection
          section={content.consultationOnline}
          whatsappUrl={content.site.whatsappUrl}
        />
        <InfluencersSection section={content.influencers} />
        <FaqSection section={content.faq} whatsappUrl={content.site.whatsappUrl} />
      </main>
      <SiteFooter footer={content.footer} navLinks={content.navLinks} />
      <WhatsAppFloat href={content.site.whatsappUrl} />
    </div>
  );
}
