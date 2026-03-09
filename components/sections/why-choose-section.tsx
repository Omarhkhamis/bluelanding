"use client";

import { QuoteForm } from "@/components/quote-form";
import { ConfiguredSectionIcon } from "@/lib/admin-icons";
import type { Section } from "@/lib/cms";

type WhyChooseSectionProps = {
  section: Section;
  whatsappUrl: string;
};

export function WhyChooseSection({ section, whatsappUrl }: WhyChooseSectionProps) {
  return (
    <section id="why" className="section-padding bg-dental-navy">
      <div className="container-dental">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="heading-secondary mb-8 text-white">{section.heading}</h2>
            <div className="space-y-6">
              {section.items.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <ConfiguredSectionIcon
                    item={item}
                    fallbackIconName="check"
                    wrapperClassName="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary"
                    iconClassName="h-4 w-4 text-white"
                    imageClassName="h-4 w-4 object-contain"
                  />
                  <div>
                    <h3 className="mb-1 font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-white/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-secondary p-6 md:p-8">
            <h3 className="mb-2 text-2xl font-bold text-dental-navy">
              {section.subheading}
            </h3>
            <p className="mb-6 text-muted-foreground">{section.description}</p>

            <QuoteForm
              className="space-y-4"
              formName="Why Choose Form"
              submitLabel={section.buttonLabel}
              whatsappUrl={whatsappUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
