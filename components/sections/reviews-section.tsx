"use client";

import { useEffect, useMemo, useState } from "react";
import { ConsultationModalTrigger } from "@/components/consultation-modal";
import type { Section } from "@/lib/cms";

type ReviewsSectionProps = {
  section: Section;
  provider: "google" | "trustpilot";
  whatsappUrl: string;
};

function getProviderName(provider: "google" | "trustpilot") {
  return provider === "google" ? "Google" : "Trustpilot";
}

function ProviderIcon({ provider }: { provider: "google" | "trustpilot" }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 48 48" className="reviews-section__provider-icon" aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303C33.236 32.659 29.02 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.047 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.047 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.236 35.091 26.747 36 24 36c-4.999 0-9.205-3.324-10.685-7.955l-6.522 5.025C9.993 39.556 16.457 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303a12.07 12.07 0 0 1-4.085 5.565l.003-.002 6.191 5.238C36.971 40.205 44 36 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="reviews-section__provider-icon" aria-hidden="true">
      <path
        fill="#00B67A"
        d="M24 0l6.9 17.1H48L34.5 28.7 41.4 46 24 35.8 6.6 46 13.5 28.7 0 17.1h17.1z"
      />
    </svg>
  );
}

export function ReviewsSection({ section, provider, whatsappUrl }: ReviewsSectionProps) {
  const settings = (section.settings || {}) as Record<string, unknown>;
  const reviews = section.items.filter((item) => item.title || item.description);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function updateViewport() {
      setIsMobile(window.innerWidth < 768);
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const trackItems = useMemo(
    () => (isMobile ? reviews : [...reviews, ...reviews]),
    [isMobile, reviews]
  );

  if (!reviews.length) {
    return null;
  }

  return (
    <section id={`${provider}-reviews`} className="reviews-section">
      <div className="container-dental">
        <div className="reviews-section__head">
          <div>
            <p className="reviews-section__kicker">{section.subheading}</p>
            <h2 className="reviews-section__title">{section.heading}</h2>
            <p className="reviews-section__description">{section.description}</p>
          </div>

          <div className="reviews-section__rating">
            <span className="reviews-section__rating-brand">
              <ProviderIcon provider={provider} />
              <span>{getProviderName(provider)}</span>
            </span>
            <div className="reviews-section__rating-meta">
              <div className="reviews-section__stars" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={`${provider}-star-${index}`}>★</span>
                ))}
              </div>
              <span className="reviews-section__rating-value">{String(settings.rating || "4.9")}</span>
              <span className="reviews-section__rating-count">
                {String(settings.ratingCountLabel || "380+ Reviews")}
              </span>
            </div>
          </div>
        </div>

        <div className="reviews-section__marquee">
          <div className="reviews-section__track">
            {trackItems.map((review, index) => (
              <article
                key={`${provider}-${review.id}-${index}`}
                className="reviews-section__card"
                tabIndex={0}
              >
                <div className="reviews-section__card-top">
                  <span className="reviews-section__avatar">
                    {(review.altText || review.title || "?").slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="reviews-section__name">{review.title}</p>
                    <p className="reviews-section__meta">{review.subtitle || "Verified Review"}</p>
                  </div>
                </div>
                <p className="reviews-section__text">{review.description}</p>
                {review.description.trim().length > 160 ? (
                  <p className="reviews-section__hint">Hover to read more</p>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        <div className="reviews-section__cta-wrap">
          <ConsultationModalTrigger className="reviews-section__cta">
            {section.buttonLabel || "Free Consultation"}
          </ConsultationModalTrigger>
        </div>
      </div>
    </section>
  );
}
