"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Section, SectionItem } from "@/lib/cms";

type TeamSectionProps = {
  section: Section;
};

export function TeamSection({ section }: TeamSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true
  });
  const members = section.items;

  return (
    <section id={section.key || "team"} className="section-padding bg-background">
      <div className="container-dental">
        <h2 className="heading-secondary mb-12 text-center text-dental-navy">
          {section.heading}
        </h2>

        <div className="services-mobile-slider relative mb-8 px-10">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {members.map((member) => (
                <div key={member.id} className="min-w-0 shrink-0 grow-0 basis-full pl-4">
                  <TeamCard member={member} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-dental-navy"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous team"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-dental-navy"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next team"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="services-desktop-grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}

type TeamCardProps = {
  member: SectionItem;
};

function TeamCard({ member }: TeamCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <Image
            src={member.imageUrl}
            alt={member.title}
            width={700}
            height={700}
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-dental-navy px-4 py-3 text-center text-lg font-bold text-white">
          {member.title}
        </div>
      </div>

      <div className="p-6">
        <p dir="ltr" className="text-left text-base leading-8 text-foreground">
          {member.description}
        </p>
      </div>
    </article>
  );
}
