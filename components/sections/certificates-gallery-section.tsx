"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Section } from "@/lib/cms";

type CertificatesGallerySectionProps = {
  section: Section;
};

export function CertificatesGallerySection({ section }: CertificatesGallerySectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true
  });
  const items = section.items.filter((item) => item.imageUrl.trim());

  if (!items.length) {
    return null;
  }

  return (
    <section id="certificates-gallery" className="certificates-section">
      <div className="container-dental">
        <div className="certificates-section__head">
          <p className="certificates-section__kicker">{section.subheading}</p>
          <h2 className="certificates-section__title">{section.heading}</h2>
          <p className="certificates-section__description">{section.description}</p>
        </div>

        <div className="certificates-section__mobile-slider">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="min-w-0 shrink-0 grow-0 basis-full pl-4"
                >
                  <figure className="certificates-section__item certificates-section__item--mobile">
                    <img
                      src={item.imageUrl}
                      alt={item.altText || item.title || "Certificate"}
                      className="certificates-section__image"
                      loading="lazy"
                    />
                  </figure>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="certificates-section__nav certificates-section__nav--prev"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous certificate"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="certificates-section__nav certificates-section__nav--next"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next certificate"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="certificates-section__track">
          {items.map((item) => (
            <figure key={item.id} className="certificates-section__item">
              <img
                src={item.imageUrl}
                alt={item.altText || item.title || "Certificate"}
                className="certificates-section__image"
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
