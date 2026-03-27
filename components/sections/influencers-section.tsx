"use client";

import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { Section } from "@/lib/cms";

type InfluencersSectionProps = {
  section: Section;
};

function parseYouTubeVideo(url: string) {
  const value = url.trim();

  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id
        ? {
            id,
            embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
            thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
          }
        : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id
          ? {
              id,
              embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
              thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
            }
          : null;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1];
        return id
          ? {
              id,
              embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
              thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
            }
          : null;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1];
        return id
          ? {
              id,
              embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
              thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
            }
          : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function InfluencersSection({ section }: InfluencersSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: false
  });
  const videos = section.items
    .map((item) => {
      const parsed = parseYouTubeVideo(item.videoUrl);
      return parsed
        ? {
            key: item.id,
            ...parsed,
            coverImageUrl: item.imageUrl.trim() || parsed.thumbnailUrl
          }
        : null;
    })
    .filter(Boolean) as Array<{
    key: number;
    id: string;
    embedUrl: string;
    thumbnailUrl: string;
    coverImageUrl: string;
  }>;
  const [activeVideo, setActiveVideo] = useState<(typeof videos)[number] | null>(null);

  if (videos.length === 0) {
    return null;
  }

  return (
    <>
      <section id="influencers" className="section-padding bg-secondary">
        <div className="container-dental">
          <h2 className="heading-secondary mb-12 text-center">
            {section.heading}
          </h2>
          <div className="text-center relative mx-auto max-w-7xl px-8 md:px-10">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4">
                {videos.map((video) => (
                  <div
                    key={video.key}
                    className="influencer-slide min-w-0 shrink-0 grow-0 pl-4"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      className="group relative mx-auto h-[360px] w-full max-w-[185px] overflow-hidden rounded-2xl border border-white/40 bg-black shadow-lg"
                    >
                      <img
                        src={video.coverImageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/28 transition group-hover:bg-slate-950/18" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white/10 text-white shadow-lg backdrop-blur-sm">
                          <Play className="ml-1 h-7 w-7 fill-current" />
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-dental-navy transition hover:text-primary"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous videos"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-dental-navy transition hover:text-primary"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next videos"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {activeVideo ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative"
            style={{ width: "min(82vw, calc(72vh * 9 / 16))" }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute -top-14 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="w-full overflow-hidden rounded-2xl bg-black shadow-2xl"
              style={{ aspectRatio: "9 / 16", maxHeight: "72vh" }}
            >
              <iframe
                src={activeVideo.embedUrl}
                title={`Influencer video ${activeVideo.id}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
