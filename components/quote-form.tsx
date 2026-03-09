"use client";

import { FormEvent, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type QuoteFormProps = {
  className?: string;
  submitLabel?: string;
  whatsappUrl: string;
};

export function QuoteForm({
  className,
  submitLabel = "Hurry Up! Get A Free Quote",
  whatsappUrl
}: QuoteFormProps) {
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("+90");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <input
        type="text"
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
        placeholder="Email (optional)"
        className="h-12 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
      />

      <button
        type="submit"
        className="inline-flex h-12 w-full items-center justify-center rounded-md bg-dental-navy px-8 text-sm font-medium text-white transition-colors hover:bg-dental-navy/90"
      >
        {submitLabel}
      </button>
    </form>
  );
}
