import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Section, SectionItem } from "@/lib/cms";

type ServicesSectionProps = {
  section: Section;
  whatsappUrl: string;
};

export function ServicesSection({ section, whatsappUrl }: ServicesSectionProps) {
  const services = section.items;

  return (
    <section id="services" className="section-padding bg-background">
      <div className="container-dental">
        <h2 className="heading-secondary mb-12 text-center text-dental-navy">
          {section.heading}
        </h2>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <ServiceCard key={service.id} service={service} whatsappUrl={whatsappUrl} />
          ))}
        </div>

        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
          {services.slice(3).map((service) => (
            <ServiceCard key={service.id} service={service} whatsappUrl={whatsappUrl} />
          ))}
        </div>
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
  const serviceLink = service.linkUrl || whatsappUrl;

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
          <a
            href={serviceLink}
            className="block bg-dental-navy px-4 py-3 text-center text-lg font-bold text-white transition-colors hover:bg-primary"
          >
            {service.title}
          </a>
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
              <a
                href={serviceLink}
                className="text-sm text-dental-navy underline hover:text-primary"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={serviceLink}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#1e1e3f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e1e3f]/90"
        >
          {buttonLabel}
        </a>
      </div>
    </div>
  );
}
