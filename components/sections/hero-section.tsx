import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { HeroLpbm } from "@/components/hero-lpbm";
import type { Section } from "@/lib/cms";
import { getWhatsAppLinkProps } from "@/lib/whatsapp";

type HeroSectionProps = {
  section: Section;
  whatsappUrl: string;
};

export function HeroSection({ section, whatsappUrl }: HeroSectionProps) {
  if (section.key === "hero-2") {
    return <HeroLpbm section={section} whatsappUrl={whatsappUrl} />;
  }

  const backgroundImage =
    section.imageUrl || section.items.find((item) => item.itemType === "image")?.imageUrl || "";
  const badges = section.items.filter((item) => item.itemType === "badge");

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pb-20 pt-20 md:pb-0">
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt={section.heading || "Hero background"}
          fill
          className="object-cover"
          priority
        />
      ) : null}
      <div className="absolute inset-0 bg-dental-dark/80" />

      <div className="container-dental relative z-10 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-3xl font-bold text-white md:mb-6 md:text-5xl lg:text-6xl">
            {section.heading}
          </h1>
          <p className="mb-2 text-xl font-semibold text-primary md:mb-3 md:text-2xl">
            {section.subheading}
          </p>
          <p className="mb-6 text-base text-white/80 md:mb-10 md:text-xl">
            {section.description}
          </p>
          <a
            href={whatsappUrl}
            {...getWhatsAppLinkProps(whatsappUrl)}
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-dental transition-all duration-300 hover:shadow-dental-lg md:w-auto md:max-w-none md:px-8 md:py-4 md:text-base"
          >
            Get the Best Dental Solution
          </a>
          <a href="#why" className="mt-8 block md:mt-16">
            <ChevronDown className="mx-auto h-8 w-8 text-white md:h-10 md:w-10" />
          </a>
        </div>

        <div className="mx-auto mt-12 hidden max-w-3xl flex-wrap items-center justify-center gap-8 rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm md:flex">
          {badges.map((badge) => (
            <Image
              key={badge.id}
              src={badge.imageUrl}
              alt={badge.altText || badge.title}
              width={120}
              height={64}
              className="h-16 w-auto opacity-90 drop-shadow-lg transition-opacity hover:opacity-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
