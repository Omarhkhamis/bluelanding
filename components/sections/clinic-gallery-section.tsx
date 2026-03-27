import Image from "next/image";
import type { Section } from "@/lib/cms";

type ClinicGallerySectionProps = {
  section: Section;
};

export function ClinicGallerySection({ section }: ClinicGallerySectionProps) {
  const items = section.items.filter((item) => item.imageUrl.trim());

  if (!items.length) {
    return null;
  }

  return (
    <section className="section-padding bg-background">
      <div className="container-dental">
        <h2 className="heading-secondary mb-4 text-center text-dental-navy sm:mb-5">
          {section.heading}
        </h2>

        {section.description ? (
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-7 text-foreground/70 sm:mb-10 sm:text-base">
            {section.description}
          </p>
        ) : null}

        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 sm:gap-4">
          {items.map((image, index) => {
            const wide = index === 4;
            const tall = index === 3;

            return (
              <div
                key={image.id}
                className={[
                  "overflow-hidden rounded-lg shadow-lg sm:rounded-xl",
                  wide ? "col-span-2 h-36 sm:h-56 md:h-[25.875rem]" : "",
                  tall ? "h-36 sm:h-56 md:h-[25.875rem]" : "",
                  !wide && !tall ? "h-24 sm:h-40 md:h-72" : ""
                ].join(" ")}
              >
                <Image
                  src={image.imageUrl}
                  alt={image.altText}
                  width={1000}
                  height={1000}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  sizes={
                    wide
                      ? "(max-width: 640px) 66vw, (max-width: 1024px) 50vw, 40rem"
                      : "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20rem"
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
