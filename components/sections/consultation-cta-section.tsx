import Image from "next/image";
import { Laptop, MessageSquare, User } from "lucide-react";
import type { Section } from "@/lib/cms";
import { getWhatsAppLinkProps } from "@/lib/whatsapp";

type ConsultationCtaSectionProps = {
  section: Section;
  whatsappUrl: string;
};

export function ConsultationCtaSection({
  section,
  whatsappUrl
}: ConsultationCtaSectionProps) {
  const ctaUrl = section.buttonUrl || whatsappUrl;

  return (
    <section className="bg-muted/30 py-16">
      <div className="container-dental">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-12 px-4 md:flex-row">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-bold text-dental-navy md:text-4xl">
              {section.heading}
            </h2>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground/80">
                {section.subheading}
              </h3>
              <p className="max-w-md text-muted-foreground">
                {section.description}
              </p>
            </div>
            <div className="pt-4">
              <a
                href={ctaUrl}
                {...getWhatsAppLinkProps(ctaUrl)}
                className="inline-flex min-w-[160px] items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                {section.buttonLabel}
              </a>
            </div>
          </div>

          <div className="flex flex-1 justify-center md:justify-end">
            {section.imageUrl ? (
              <div className="relative h-64 w-64 overflow-hidden rounded-3xl border border-border bg-white shadow-lg md:h-80 md:w-80">
                <Image
                  src={section.imageUrl}
                  alt={section.heading}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative h-64 w-64 md:h-80 md:w-80">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Laptop className="h-full w-full text-dental-navy/10" strokeWidth={1} />
                </div>
                <div
                  className="absolute right-1/4 top-1/4 rounded-2xl bg-white p-4 shadow-xl"
                  style={{ animation: "bounce 3s infinite" }}
                >
                  <MessageSquare className="h-8 w-8 text-dental-navy" />
                </div>
                <div className="absolute bottom-1/3 left-1/3 rounded-full bg-white p-4 shadow-lg">
                  <User className="h-12 w-12 text-primary" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
