"use client";

import { FormEvent, useMemo, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { Section } from "@/lib/cms";
import {
  buildFormPayload,
  validateFormPayload
} from "@/lib/form-submit";
import { LUCKY_SPIN_SECTION_ID } from "@/lib/lucky-spin";

type LuckySpinSectionProps = {
  section: Section;
  whatsappUrl: string;
};

const wheelColors = [
  "#b98459",
  "#935d37",
  "#c69062",
  "#7d4e31",
  "#b98459",
  "#935d37",
  "#c69062",
  "#7d4e31"
];

const SPIN_DURATION_MS = 3600;

function getSubmissionErrorMessage(errorCode?: string) {
  switch (errorCode) {
    case "MISSING_CONTACT_INFO":
      return "Please enter your full name and phone number.";
    case "INVALID_PHONE":
      return "Please enter a valid phone number.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
    default:
      return "We couldn't complete your spin submission. Please try again.";
  }
}

function waitForNextPaint() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const radians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians)
  };
}

function normalizeTextRotation(rotationInDegrees: number) {
  let rotation = rotationInDegrees;

  while (rotation > 180) {
    rotation -= 360;
  }

  while (rotation < -180) {
    rotation += 360;
  }

  if (rotation > 90) {
    rotation -= 180;
  }

  if (rotation < -90) {
    rotation += 180;
  }

  return rotation;
}

function splitPrizeLabel(label: string) {
  const words = String(label || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= 1) {
    return words;
  }

  const middle = Math.ceil(words.length / 2);
  return [words.slice(0, middle).join(" "), words.slice(middle).join(" ")].filter(Boolean);
}

export function LuckySpinSection({ section, whatsappUrl }: LuckySpinSectionProps) {
  const wheelTextFontSize = 46;
  const wheelTextLineHeight = 50;
  const settings = (section.settings || {}) as Record<string, unknown>;
  const prizes = ((settings.prizes as string[] | undefined) || [])
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .slice(0, 8);
  const anglePerSlice = 360 / Math.max(prizes.length, 1);
  const resultPlaceholder = String(settings.resultPlaceholder || "Spin to reveal your prize.");
  const resultLabel = String(settings.resultLabel || "You get");
  const spinLabel = String(settings.spinLabel || section.buttonLabel || "Spin Now");
  const spinLoadingLabel = String(settings.spinLoadingLabel || "Spinning...");
  const formTitle = String(settings.formTitle || "Get your prize");
  const formDescription = String(
    settings.formDescription || "Enter your details to claim your offer."
  );
  const formPrivacyNote = String(settings.formPrivacyNote || "Your details stay private.");
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(resultPlaceholder);
  const [selectedPrize, setSelectedPrize] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("+90");

  const wheelBackground = useMemo(() => {
    if (!prizes.length) {
      return "";
    }

    const stops = prizes.map((_, index) => {
      const start = anglePerSlice * index;
      const end = start + anglePerSlice;
      const color = wheelColors[index % wheelColors.length];
      return `${color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(from 0deg, ${stops.join(", ")})`;
  }, [anglePerSlice, prizes]);

  const slices = useMemo(
    () =>
      prizes.map((prize, index) => {
        const centerAngle = index * anglePerSlice + anglePerSlice / 2;
        const point = polarToCartesian(500, 500, 310, centerAngle);
        const lines = splitPrizeLabel(prize);
        const rotationAngle = normalizeTextRotation(centerAngle - 90);
        const lineHeight = wheelTextLineHeight;
        const firstOffset = lines.length > 1 ? -((lines.length - 1) * lineHeight) / 2 : 0;

        return {
          prize,
          lines,
          x: point.x,
          y: point.y,
          rotationAngle,
          firstOffset
        };
      }),
    [anglePerSlice, prizes, wheelTextLineHeight]
  );

  if (!prizes.length) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSpinning || isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const basePayload = buildFormPayload(form, "lucky-spin", {
      formName: "Lucky Spin Form",
      whatsappUrl
    });
    const validation = validateFormPayload(basePayload);

    if (!validation.ok) {
      const nextFieldErrors: {
        fullName?: string;
        phone?: string;
        email?: string;
      } = {};
      nextFieldErrors[validation.field] = validation.text;
      setFieldErrors(nextFieldErrors);
      setFormError("");
      return;
    }

    setFieldErrors({});
    setFormError("");
    setIsSubmitting(true);
    setIsSpinning(true);
    setSelectedPrize("");
    setResult(spinLoadingLabel);

    const selectedIndex = Math.floor(Math.random() * prizes.length);
    const chosenPrize = prizes[selectedIndex] || "";
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const centerAngle = selectedIndex * anglePerSlice + anglePerSlice / 2;
    const targetOffset =
      (360 - centerAngle - normalizedRotation + 360) % 360;
    const nextRotation = rotation + 360 * 5 + targetOffset;

    setRotation(nextRotation);

    await new Promise((resolve) => window.setTimeout(resolve, SPIN_DURATION_MS));

    setSelectedPrize(chosenPrize);
    setResult(`${resultLabel}: ${chosenPrize}`);
    setIsSpinning(false);

    await waitForNextPaint();

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...basePayload,
          ...validation.payload,
          prize: chosenPrize
        })
      });
      const data = await response.json().catch(() => ({}));
      const nextWhatsappUrl = String(data?.whatsappUrl || "");
      const thankYouUrl = String(data?.thankYouUrl || "");

      if (!response.ok || !data?.ok || !nextWhatsappUrl) {
        setFormError(getSubmissionErrorMessage(data?.error));
        setIsSubmitting(false);
        return;
      }

      const openedWindow = window.open(nextWhatsappUrl, "_blank", "noopener,noreferrer");

      if (!openedWindow) {
        setFormError("Please allow pop-ups to continue to WhatsApp.");
        setIsSubmitting(false);
        return;
      }

      if (thankYouUrl) {
        window.location.assign(thankYouUrl);
        return;
      }

      setIsSubmitting(false);
    } catch {
      setFormError(getSubmissionErrorMessage());
      setIsSubmitting(false);
    }
  }

  return (
    <section id={LUCKY_SPIN_SECTION_ID} className="lucky-spin-section">
      {section.imageUrl ? (
        <img
          src={section.imageUrl}
          alt={String(settings.backgroundAlt || "Lucky spin")}
          className="lucky-spin-section__bg"
        />
      ) : null}
      <div className="lucky-spin-section__overlay" />

      <div className="container-dental lucky-spin-section__inner">
        <div className="lucky-spin-section__content">
          <p className="lucky-spin-section__kicker">{section.subheading}</p>
          <p className="lucky-spin-section__tagline">
            {String(settings.tagline || "Flip to Win")}
          </p>
          <h2 className="lucky-spin-section__title">{section.heading}</h2>
          <p className="lucky-spin-section__description">{section.description}</p>
          <p className="lucky-spin-section__result" aria-live="polite">
            {result}
          </p>
        </div>

        <div className="lucky-spin-section__wheel-area">
          <div className="lucky-spin-section__pointer" />
          <div
            className="lucky-spin-section__wheel"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: wheelBackground
            }}
          >
            <svg
              viewBox="0 0 1000 1000"
              className="lucky-spin-section__wheel-svg"
              aria-hidden="true"
            >
              {slices.map((slice) => (
                <text
                  key={slice.prize}
                  x={slice.x}
                  y={slice.y}
                  fill="rgba(255,255,255,0.97)"
                  fontSize={wheelTextFontSize}
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${slice.rotationAngle} ${slice.x} ${slice.y})`}
                  className="lucky-spin-section__wheel-text"
                >
                  {slice.lines.map((line, lineIndex) => (
                    <tspan
                      key={`${slice.prize}-${lineIndex}`}
                      x={slice.x}
                      dy={lineIndex === 0 ? slice.firstOffset : wheelTextLineHeight}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              ))}
              <circle cx="500" cy="500" r="38" fill="rgba(255,255,255,0.92)" />
              <circle cx="500" cy="500" r="22" fill="#b87333" />
            </svg>
          </div>
        </div>

        <div className="lucky-spin-section__form-card">
          <h3>{formTitle}</h3>
          <p>{formDescription}</p>
          <form className="lucky-spin-section__form" onSubmit={handleSubmit}>
            <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
            <input
              type="text"
              name="fullName"
              placeholder="Full name"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                if (fieldErrors.fullName) {
                  setFieldErrors((current) => ({ ...current, fullName: undefined }));
                }
                if (formError) {
                  setFormError("");
                }
              }}
              className={`lucky-spin-section__input${
                fieldErrors.fullName ? " lucky-spin-section__input--error" : ""
              }`}
            />
            {fieldErrors.fullName ? (
              <p className="lucky-spin-section__field-error">{fieldErrors.fullName}</p>
            ) : null}
            <PhoneInput
              international
              defaultCountry="TR"
              value={phoneNumber}
              onChange={(value) => {
                setPhoneNumber(value);
                if (fieldErrors.phone) {
                  setFieldErrors((current) => ({ ...current, phone: undefined }));
                }
                if (formError) {
                  setFormError("");
                }
              }}
              className={`phone-input lucky-spin-section__phone-input${
                fieldErrors.phone ? " lucky-spin-section__input--error" : ""
              }`}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              name="phone"
              countrySelectProps={{ "aria-label": "Country code" }}
              placeholder="Phone"
            />
            {fieldErrors.phone ? (
              <p className="lucky-spin-section__field-error">{fieldErrors.phone}</p>
            ) : null}
            <button
              type="submit"
              className="lucky-spin-section__submit"
              disabled={isSubmitting || isSpinning}
            >
              {isSpinning || isSubmitting ? spinLoadingLabel : spinLabel}
            </button>
            {formError ? (
              <p className="lucky-spin-section__form-error" role="alert">
                {formError}
              </p>
            ) : null}
          </form>
          <p className="lucky-spin-section__privacy">{formPrivacyNote}</p>
          {selectedPrize ? (
            <p className="lucky-spin-section__prize-note">
              <strong>{resultLabel}:</strong> {selectedPrize}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
