"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <button
                key={video.key}
                type="button"
                onClick={() => setActiveVideo(video)}
                className="group relative aspect-video overflow-hidden rounded-2xl border border-white/40 bg-black shadow-lg"
              >
                <img
                  src={video.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/28 transition group-hover:bg-slate-950/18" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/92 text-dental-navy shadow-lg">
                    <Play className="ml-1 h-7 w-7 fill-current" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeVideo ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl"
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

            <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
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
