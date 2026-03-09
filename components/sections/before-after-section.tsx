"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Section } from "@/lib/cms";
import { getWhatsAppLinkProps } from "@/lib/whatsapp";

type BeforeAfterSectionProps = {
  section: Section;
  whatsappUrl: string;
};

export function BeforeAfterSection({ section, whatsappUrl }: BeforeAfterSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 1 }
    }
  });
  const slides = section.items.filter((item) => item.imageUrl.trim().length > 0);
  const ctaUrl = section.buttonUrl || whatsappUrl;

  return (
    <section id="before-after" className="section-padding bg-background">
      <div className="container-dental">
        <h2 className="heading-secondary mb-12 text-center text-dental-navy">
          {section.heading}
        </h2>

        <div className="relative mx-auto mb-8 max-w-6xl px-4 md:px-12">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-2 md:-ml-4">
              {slides.map((item) => (
                <div
                  key={item.id}
                  className="min-w-0 shrink-0 grow-0 basis-full pl-2 md:basis-1/3 md:pl-4"
                >
                  <div className="group relative h-[400px] overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src={item.imageUrl}
                      alt={item.altText || section.heading}
                      width={700}
                      height={700}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="absolute -left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-dental-navy transition hover:text-primary md:-left-12"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="absolute -right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-dental-navy transition hover:text-primary md:-right-12"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center">
          <a
            href={ctaUrl}
            {...getWhatsAppLinkProps(ctaUrl)}
            className="inline-flex h-11 items-center justify-center rounded-md bg-dental-navy px-8 text-sm font-medium text-white transition-colors hover:bg-dental-navy/90"
          >
            {section.buttonLabel || "Get the Best Dental Treatment"}
          </a>
        </div>
      </div>
    </section>
  );
}
