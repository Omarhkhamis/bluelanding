import Image from "next/image";
import type { Section } from "@/lib/cms";

type ClinicGallerySectionProps = {
  section: Section;
};

export function ClinicGallerySection({ section }: ClinicGallerySectionProps) {
  return (
    <section className="section-padding bg-background">
      <div className="container-dental">
        <h2 className="heading-secondary mb-12 text-center text-dental-navy">
          {section.heading}
        </h2>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
          {section.items.map((image, index) => {
            const wide = index === 4;
            const tall = index === 3;

            return (
              <div
                key={image.id}
                className={[
                  "overflow-hidden rounded-xl shadow-lg",
                  wide ? "md:col-span-2 h-96 md:h-auto" : "",
                  tall ? "h-96 md:h-auto md:aspect-[3/4]" : "",
                  !wide && !tall ? "h-64 md:h-72" : ""
                ].join(" ")}
              >
                <Image
                  src={image.imageUrl}
                  alt={image.altText}
                  width={1000}
                  height={1000}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
