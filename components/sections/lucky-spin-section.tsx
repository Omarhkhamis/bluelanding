"use client";

import { FormEvent, useMemo, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { Section } from "@/lib/cms";
import {
  buildFormPayload,
  openSubmissionPopup,
  submitFormPayload,
  validateFormPayload
} from "@/lib/form-submit";
import { extractSiteLocaleFromPathname, getSitePagePath } from "@/lib/sites";

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
        const lineHeight = 58;
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
    [anglePerSlice, prizes]
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
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setIsSpinning(true);
    setSelectedPrize("");
    setResult(spinLoadingLabel);

    const popup = openSubmissionPopup();
    const popupOptions = popup ? { popup } : {};
    const selectedIndex = Math.floor(Math.random() * prizes.length);
    const chosenPrize = prizes[selectedIndex] || "";
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const centerAngle = selectedIndex * anglePerSlice + anglePerSlice / 2;
    const targetOffset =
      (360 - centerAngle - normalizedRotation + 360) % 360;
    const nextRotation = rotation + 360 * 5 + targetOffset;

    setRotation(nextRotation);

    window.setTimeout(async () => {
      setSelectedPrize(chosenPrize);
      setResult(`${resultLabel}: ${chosenPrize}`);
      setIsSpinning(false);

      const submitResult = await submitFormPayload(
        {
          ...basePayload,
          ...validation.payload,
          prize: chosenPrize
        },
        {
          ...popupOptions,
          skipRedirect: true
        }
      );

      if (!submitResult.ok) {
        setIsSubmitting(false);
        return;
      }

      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          const routeContext = extractSiteLocaleFromPathname(window.location.pathname);
          window.location.assign(
            String(
              submitResult.thankYouUrl ||
                getSitePagePath(routeContext.siteKey, routeContext.locale, "thankyou")
            )
          );
        }, 900);
      }
    }, 3600);
  }

  return (
    <section id="lucky-spin" className="lucky-spin-section">
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
          <p className="lucky-spin-section__result">{result}</p>
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
                  fontSize="54"
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
                      dy={lineIndex === 0 ? slice.firstOffset : 58}
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
