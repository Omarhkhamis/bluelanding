"use client";

import { FormEvent, useState } from "react";
import { FormBenefits } from "@/components/form-benefits";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { buildFormPayload, submitFormPayload } from "@/lib/form-submit";

type QuoteFormProps = {
  className?: string;
  formName?: string;
  submitLabel?: string;
  whatsappUrl: string;
};

export function QuoteForm({
  className,
  formName = "Quote Form",
  submitLabel = "Hurry Up! Get A Free Quote",
  whatsappUrl
}: QuoteFormProps) {
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("+90");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);

    const result = await submitFormPayload(
      buildFormPayload(form, "quote-form", {
        formName,
        whatsappUrl
      })
    );

    if (!result.ok) {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      <input
        type="text"
        name="fullName"
        placeholder="Name & Surname"
        className="h-12 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
      />

      <PhoneInput
        international
        defaultCountry="TR"
        value={phoneNumber}
        onChange={setPhoneNumber}
        className="phone-input"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        name="phone"
        countrySelectProps={{ "aria-label": "Country code" }}
        placeholder="Phone number"
      />

      <input
        type="email"
        name="email"
        placeholder="Email (optional)"
        className="h-12 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
      />

      <textarea
        name="message"
        placeholder="Message (optional)"
        rows={4}
        className="w-full rounded-md border border-border bg-white px-3 py-3 text-sm"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center rounded-md bg-dental-navy px-8 text-sm font-medium text-white transition-colors hover:bg-dental-navy/90"
      >
        {isSubmitting ? "Submitting..." : submitLabel}
      </button>

      <FormBenefits />
    </form>
  );
}
