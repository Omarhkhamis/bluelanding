"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { QuoteForm } from "@/components/quote-form";
import type { Section } from "@/lib/cms";

type FaqSectionProps = {
  section: Section;
  whatsappUrl: string;
};

export function FaqSection({ section, whatsappUrl }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding bg-background">
      <div className="container-dental">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="heading-secondary mb-4 text-dental-navy">{section.heading}</h2>
          <p className="text-foreground/70">{section.description}</p>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-xl rounded-2xl bg-secondary p-6 md:p-8">
            <h3 className="mb-2 text-2xl font-bold text-dental-navy">{section.subheading}</h3>
            <p className="mb-6 text-muted-foreground">
              Complete the form and allow our experts to promptly address any
              questions you may have.
            </p>

            <QuoteForm className="space-y-4" whatsappUrl={whatsappUrl} />
          </div>

          <div className="space-y-4">
            {section.items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-card px-4"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-dental-navy transition-colors hover:text-primary"
                    onClick={() =>
                      setOpenIndex((current) => (current === index ? null : index))
                    }
                    aria-expanded={isOpen}
                  >
                    {item.title}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen ? (
                    <div className="pb-4 text-sm text-foreground/70">
                      {item.description}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
