import { MessageCircle } from "lucide-react";
import type { Section } from "@/lib/cms";
import { getWhatsAppLinkProps } from "@/lib/whatsapp";

type CostDifferenceSectionProps = {
  section: Section;
  whatsappUrl: string;
};

export function CostDifferenceSection({
  section,
  whatsappUrl
}: CostDifferenceSectionProps) {
  const settings =
    section.settings && typeof section.settings === "object" ? section.settings : {};
  const headingLine1 = String(section.heading || "").trim();
  const headingLine2 = String(section.subheading || "").trim();
  const paragraphOne = String(section.description || "").trim();
  const paragraphTwo = String(settings.paragraph2 || "").trim();
  const mainImage = String(section.imageUrl || "").trim();
  const mainImageAlt = String(settings.mainImageAlt || headingLine1 || "Treatment result").trim();
  const detailImage = String(settings.detailImage || "").trim();
  const detailImageAlt = String(
    settings.detailImageAlt || headingLine2 || "Treatment detail"
  ).trim();
  const ctaUrl = String(section.buttonUrl || whatsappUrl || "").trim();
  const buttonLabel = String(section.buttonLabel || "Get Implant Quote →").trim();

  if (!headingLine1 && !headingLine2 && !paragraphOne && !mainImage) {
    return null;
  }

  return (
    <section id="cost-difference" className="section-padding relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 bottom-8 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-x-0 top-20 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      </div>

      <div className="container-dental relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:gap-14">
          <div className="space-y-6 lg:pr-8">
            <h2 className="text-3xl font-bold leading-tight text-dental-navy md:text-5xl">
              {headingLine1}
              {headingLine2 ? (
                <>
                  <br />
                  <span className="relative inline-block text-primary">
                    {headingLine2}
                    <span className="absolute left-0 right-0 -bottom-1 h-px rounded-full bg-primary/35" />
                  </span>
                </>
              ) : null}
            </h2>

            {paragraphOne ? (
              <p className="max-w-2xl text-base leading-8 text-foreground/75 md:text-lg">
                {paragraphOne}
              </p>
            ) : null}

            {paragraphTwo ? (
              <p className="max-w-2xl text-base leading-8 text-foreground/75 md:text-lg">
                {paragraphTwo}
              </p>
            ) : null}

            {ctaUrl ? (
              <a
                href={ctaUrl}
                {...getWhatsAppLinkProps(ctaUrl)}
                className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-dental transition-all duration-300 hover:shadow-dental-lg md:w-auto md:max-w-none md:px-8 md:py-4 md:text-base"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {buttonLabel}
              </a>
            ) : null}
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="relative h-[360px] overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-[0_24px_70px_rgba(25,40,96,0.12)] sm:h-[420px] lg:h-[520px]">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={mainImageAlt}
                  className="h-full w-full object-cover"
                />
              ) : null}

              <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[48%] bg-gradient-to-r from-background/85 via-background/25 to-transparent md:block" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dental-navy/10 to-transparent" />
            </div>

            {detailImage ? (
              <div className="absolute -bottom-6 right-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-white p-2 shadow-2xl md:-bottom-8 md:right-8 md:h-40 md:w-40">
                <div className="absolute inset-0 rounded-full bg-primary/8" />
                <div className="relative h-full w-full overflow-hidden rounded-full">
                  <img
                    src={detailImage}
                    alt={detailImageAlt}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
