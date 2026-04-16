"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ConsultationModalTrigger } from "@/components/consultation-modal";
import type { Section, SectionItem } from "@/lib/cms";

type ServicesSectionProps = {
  section: Section;
  whatsappUrl: string;
};

export function ServicesSection({ section, whatsappUrl }: ServicesSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true
  });
  const cards = section.items;
  const sectionId = section.key || "services";

  return (
    <section id={sectionId} className="section-padding bg-background">
      <div className="container-dental">
        <h2 className="heading-secondary mb-12 text-center text-dental-navy">
          {section.heading}
        </h2>

        <div className="services-mobile-slider relative mb-8 px-10">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {cards.map((card) => (
                <div key={card.id} className="min-w-0 shrink-0 grow-0 basis-full pl-4">
                  <ServiceCard service={card} whatsappUrl={whatsappUrl} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-dental-navy transition hover:text-primary"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label={`Previous ${section.name.toLowerCase()}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-dental-navy transition hover:text-primary"
            onClick={() => emblaApi?.scrollNext()}
            aria-label={`Next ${section.name.toLowerCase()}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="services-desktop-grid mb-6 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.slice(0, 3).map((card) => (
            <ServiceCard key={card.id} service={card} whatsappUrl={whatsappUrl} />
          ))}
        </div>

        {cards.length > 3 ? (
          <div className="services-desktop-grid mx-auto max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
            {cards.slice(3).map((card) => (
              <ServiceCard key={card.id} service={card} whatsappUrl={whatsappUrl} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

type ServiceCardProps = {
  service: SectionItem;
  whatsappUrl: string;
};

function ServiceCard({ service, whatsappUrl }: ServiceCardProps) {
  const items = (service.settings.items as string[] | undefined) || [];
  const buttonLabel =
    (service.settings.buttonLabel as string | undefined) || "Get More Information";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <Image
            src={service.imageUrl}
            alt={service.title}
            width={700}
            height={700}
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <ConsultationModalTrigger
            className="block bg-dental-navy px-4 py-3 text-center text-lg font-bold text-white transition-colors hover:bg-primary"
          >
            {service.title}
          </ConsultationModalTrigger>
        </div>
      </div>
      <div className="p-6 text-center">
        <p className="mb-4 font-semibold text-foreground">{service.subtitle}</p>
        {service.description ? (
          <p className="mb-4 text-sm text-muted-foreground">{service.description}</p>
        ) : null}
        <ul className="mb-6 space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start justify-center gap-2 text-left"
            >
              <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <ConsultationModalTrigger
                className="text-sm text-dental-navy underline hover:text-primary"
              >
                {item}
              </ConsultationModalTrigger>
            </li>
          ))}
        </ul>
        <ConsultationModalTrigger
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          {buttonLabel}
        </ConsultationModalTrigger>
      </div>
    </div>
  );
}
