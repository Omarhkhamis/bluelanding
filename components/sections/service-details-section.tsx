import { ConfiguredSectionIcon } from "@/lib/admin-icons";
import type { Section } from "@/lib/cms";

const fallbackIcons = ["refresh", "message-square", "car", "building", "plane", "heart-handshake"];

type ServiceDetailsSectionProps = {
  section: Section;
  whatsappUrl: string;
};

export function ServiceDetailsSection({
  section,
  whatsappUrl
}: ServiceDetailsSectionProps) {
  return (
    <section id="packages" className="section-padding bg-background">
      <div className="container-dental">
        <h2 className="heading-secondary mb-12 text-center text-dental-navy">
          {section.heading}
        </h2>
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {section.items.map((card, index) => {
            const fallbackIconName = fallbackIcons[index % fallbackIcons.length] || "message-square";
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center transition-shadow hover:shadow-lg md:p-8"
              >
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
          })}
        </div>
        <div className="text-center">
          <a
            href={whatsappUrl}
            className="inline-flex min-w-[200px] items-center justify-center rounded-md bg-[#1e1e3f] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1e1e3f]/90"
          >
            Get Price Information
          </a>
        </div>
      </div>
    </section>
  );
}
