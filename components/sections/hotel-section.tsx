import Image from "next/image";
import { Star } from "lucide-react";
import { ConfiguredSectionIcon } from "@/lib/admin-icons";
import type { Section } from "@/lib/cms";

const fallbackIcons = ["star", "bed-double", "coffee", "wifi", "shield-check", "map-pin"];

type HotelSectionProps = {
  section: Section;
};

export function HotelSection({ section }: HotelSectionProps) {
  const settings = section.settings && typeof section.settings === "object" ? section.settings : {};
  const hotelName = String(settings.hotelName || "Mercure Hotel");
  const hotelStars = Math.min(5, Math.max(1, Number(settings.hotelStars) || 5));
  const visibleFeatures = section.items
    .map((feature, index) => ({ feature, index }))
    .filter(({ feature }) => feature.title.trim().length > 0);

  return (
    <section className="section-padding bg-blue-50/30">
      <div className="container-dental">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <h2 className="heading-secondary mb-6 text-left text-dental-navy">
              {section.heading}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-foreground/80">
              {section.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {visibleFeatures.map(({ feature, index }) => {
                const fallbackIconName = fallbackIcons[index % fallbackIcons.length] || "star";
                return (
                  <div
                    key={feature.id}
                    className="flex items-center gap-3 rounded-lg border border-blue-50 bg-white p-3 shadow-sm"
                  >
                    <ConfiguredSectionIcon
                      item={feature}
                      fallbackIconName={fallbackIconName}
                      iconClassName="h-5 w-5 text-blue-500"
                      imageClassName="h-5 w-5 object-contain"
                    />
                    <span className="text-sm font-medium text-dental-navy">
                      {feature.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="group relative z-10 aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-2xl">
              <Image
                src={section.imageUrl}
                alt={`${hotelName} ${hotelStars} stars`}
                width={1200}
                height={900}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-1">
                <div className="flex text-yellow-400 drop-shadow-md">
                  {Array.from({ length: hotelStars }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-5 w-5 fill-current"
                      strokeWidth={2}
                    />
                  ))}
                </div>
                <span className="text-xl font-semibold text-white drop-shadow-lg">
                  {hotelName}
                </span>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 -z-0 h-full w-full rounded-2xl rounded-br-[4rem] border-2 border-blue-200" />
            <div className="absolute -left-6 -top-6 -z-0 h-32 w-32 rounded-full bg-blue-100/50 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
