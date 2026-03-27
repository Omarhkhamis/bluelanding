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
    <section
      id="cost-difference"
      className="relative overflow-hidden bg-gradient-to-r from-[#f5f5f4] via-[#e7e7e6] to-[#f5f5f4] pt-10"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="pointer-events-none absolute top-10 z-0 h-px w-[200vw] -translate-x-[3.333333%] rotate-[-10deg] bg-gradient-to-r from-transparent via-[#8e8171]/40 to-transparent opacity-60 md:-left-16 md:top-[50rem] md:w-[120vw] md:rotate-[70deg]" />

      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative z-10 space-y-6 py-8 lg:max-w-4xl lg:py-24 lg:pr-24">
            <h2 className="relative z-10 text-4xl font-extralight leading-snug text-[#0a0908] lg:text-5xl">
              {headingLine1}
              {headingLine2 ? (
                <>
                  <br />
                  <span className="relative inline-block">
                    {headingLine2}
                    <span className="absolute left-0 right-0 -bottom-1 h-px rounded-full bg-[#2f2c27]" />
                  </span>
                </>
              ) : null}
            </h2>

            {paragraphOne ? (
              <p className="relative z-10 leading-relaxed text-[#1b1a19]">{paragraphOne}</p>
            ) : null}

            {paragraphTwo ? (
              <p className="relative z-10 leading-relaxed text-[#1b1a19]">{paragraphTwo}</p>
            ) : null}

            {ctaUrl ? (
              <a
                href={ctaUrl}
                {...getWhatsAppLinkProps(ctaUrl)}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#27241f] to-[#2f2c27] px-4 py-3 text-[11.5px] font-medium uppercase tracking-[0.13em] text-white shadow-[0_10px_10px_rgba(0,0,0,0.09)] transition-transform duration-200 ease-out hover:from-[#1f1c18] hover:to-[#2f2c27]"
              >
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                {buttonLabel}
              </a>
            ) : null}
          </div>

          <div className="relative lg:static">
            <div className="relative h-[360px] sm:h-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-1/2">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={mainImageAlt}
                  className="absolute inset-0 h-full w-full object-cover object-right"
                />
              ) : null}

              <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-[#e7e7e6] via-[#e7e7e6]/60 to-transparent md:block" />

              {detailImage ? (
                <div className="absolute -top-40 right-0 flex h-28 w-28 items-center justify-center rounded-full border border-white/35 bg-white/25 backdrop-blur-sm md:bottom-14 md:right-[24vh] md:top-auto md:h-[10.5rem] md:w-[10.5rem]">
                  <img
                    src={detailImage}
                    alt={detailImageAlt}
                    className="h-24 w-24 rounded-full object-cover md:h-36 md:w-36"
                  />
                </div>
              ) : null}
            </div>

            <div className="hidden lg:block lg:h-[620px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
