"use client";

import { FormEvent, useState } from "react";
import { FormBenefits } from "@/components/form-benefits";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { Section } from "@/lib/cms";
import { buildFormPayload, submitFormPayload } from "@/lib/form-submit";
import { getWhatsAppLinkProps } from "@/lib/whatsapp";

type HeroLpbmProps = {
  section: Section;
  whatsappUrl: string;
};

export function HeroLpbm({ section, whatsappUrl }: HeroLpbmProps) {
  const settings = (section.settings || {}) as Record<string, unknown>;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("+90");
  const videoUrl = String(settings.videoUrl || "");
  const kicker = String(settings.kicker || "Istanbul • Turkiye");
  const titleLine1 = String(settings.titleLine1 || "Dental Implants in Turkiye");
  const titleLine2 = String(settings.titleLine2 || "with BM TURKIYE");
  const subtitle = String(
    settings.lpbmSubtitle ||
      settings.subtitle ||
      "Advanced implantology, immediate-load options, and long-lasting restorations."
  );
  const ctaLabel = String(settings.whatsappCta || section.buttonLabel || "WhatsApp Implant Plan");
  const formTitle = String(settings.formTitle || "Start your implant assessment");
  const formDescription = String(
    settings.formDescription ||
      "Tell us about your missing teeth or implant needs. Our coordinators will contact you shortly."
  );
  const formPrivacyNote = String(settings.formPrivacyNote || "Your details stay private.");
  const formSubmitText = String(settings.formSubmitText || "Submit Request");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);

    const result = await submitFormPayload(
      buildFormPayload(form, "hero-2-form", {
        formName: "Hero 2 Form",
        whatsappUrl
      })
    );

    if (!result.ok) {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="lpbm-hero">
      {videoUrl ? (
        <video className="lpbm-hero__media" autoPlay muted loop playsInline preload="none">
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : section.imageUrl ? (
        <img src={section.imageUrl} alt={section.heading || "Hero"} className="lpbm-hero__media" />
      ) : null}

      <div className="lpbm-hero__overlay" />

      <div className="container-dental lpbm-hero__inner">
        <div className="lpbm-hero__content">
          <p className="lpbm-hero__kicker">{kicker}</p>
          <h1 className="lpbm-hero__title">
            <span>{titleLine1}</span>
            <span>{titleLine2}</span>
          </h1>
          <p className="lpbm-hero__subtitle">{subtitle}</p>
          <a href={whatsappUrl} {...getWhatsAppLinkProps(whatsappUrl)} className="lpbm-hero__cta">
            {ctaLabel}
          </a>
        </div>

        <div className="lpbm-hero__card">
          <p className="lpbm-hero__card-title">{formTitle}</p>
          <p className="lpbm-hero__card-description">{formDescription}</p>
          <form className="lpbm-hero__form" onSubmit={handleSubmit}>
            <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
            <input type="text" name="fullName" placeholder="Full name" className="lpbm-hero__input" />
            <div className="lpbm-hero__form-row">
              <PhoneInput
                international
                defaultCountry="TR"
                value={phoneNumber}
                onChange={setPhoneNumber}
                className="phone-input lpbm-hero__phone-input"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                name="phone"
                countrySelectProps={{ "aria-label": "Country code" }}
                placeholder="Phone"
              />
              <input type="email" name="email" placeholder="Email (optional)" className="lpbm-hero__input" />
            </div>
            <textarea
              name="message"
              placeholder="Message (optional)"
              className="lpbm-hero__textarea"
              rows={4}
            />
            <button type="submit" className="lpbm-hero__submit">
              {isSubmitting ? "Submitting..." : formSubmitText}
            </button>
            <FormBenefits variant="inverse" />
          </form>
          <p className="lpbm-hero__privacy">{formPrivacyNote}</p>
        </div>
      </div>
    </section>
  );
}
