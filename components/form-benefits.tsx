"use client";

type FormBenefitsProps = {
  variant?: "default" | "inverse";
};

const benefitItems = [
  "Free consultation",
  "Personalized treatment plan",
  "Reply within 5 minutes"
];

export function FormBenefits({ variant = "default" }: FormBenefitsProps) {
  const textClassName =
    variant === "inverse" ? "text-white/88" : "text-[#111111]";

  return (
    <div className={`mt-4 space-y-2 text-left text-base font-normal leading-8 ${textClassName}`}>
      {benefitItems.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
}
