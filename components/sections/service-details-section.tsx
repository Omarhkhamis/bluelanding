"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ConfiguredSectionIcon } from "@/lib/admin-icons";
import type { Section } from "@/lib/cms";
import { getWhatsAppLinkProps } from "@/lib/whatsapp";

const fallbackIcons = ["refresh", "message-square", "car", "building", "plane", "heart-handshake"];

type ServiceDetailsSectionProps = {
  section: Section;
  whatsappUrl: string;
};

export function ServiceDetailsSection({
  section,
  whatsappUrl
}: ServiceDetailsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true
  });

  return (
    <section id="packages" className="section-padding bg-background">
      <div className="container-dental">
        <h2 className="heading-secondary mb-12 text-center text-dental-navy">
          {section.heading}
        </h2>
        <div className="service-details-mobile-slider relative mb-12 px-10">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {section.items.map((card, index) => {
                const fallbackIconName = fallbackIcons[index % fallbackIcons.length] || "message-square";
                return (
                  <div key={card.title} className="min-w-0 shrink-0 grow-0 basis-full pl-4">
                    <ServiceDetailsCard card={card} fallbackIconName={fallbackIconName} />
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-dental-navy transition hover:text-primary"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous packages"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-dental-navy transition hover:text-primary"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next packages"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="service-details-desktop-grid mb-12 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {section.items.map((card, index) => {
            const fallbackIconName = fallbackIcons[index % fallbackIcons.length] || "message-square";
            return <ServiceDetailsCard key={card.title} card={card} fallbackIconName={fallbackIconName} />;
          })}
        </div>
        <div className="text-center">
          <a
            href={whatsappUrl}
            {...getWhatsAppLinkProps(whatsappUrl)}
            className="inline-flex min-w-[200px] items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Get Price Information
          </a>
        </div>
      </div>
    </section>
  );
}

function ServiceDetailsCard({
  card,
  fallbackIconName
}: {
  card: Section["items"][number];
  fallbackIconName: string;
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center transition-shadow hover:shadow-lg md:p-8">
      <ConfiguredSectionIcon
        item={card}
        fallbackIconName={fallbackIconName}
        wrapperClassName="mb-6 flex justify-center"
        iconClassName="h-12 w-12 text-blue-300 opacity-80"
        imageClassName="h-12 w-12 object-contain opacity-90"
      />
      <h3 className="mb-4 text-xl font-bold text-dental-navy">
        {card.title}
      </h3>
      <p className="text-sm leading-relaxed text-foreground/70">
        {card.description}
      </p>
    </div>
  );
}
