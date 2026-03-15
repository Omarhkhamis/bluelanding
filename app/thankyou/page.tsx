import { redirect } from "next/navigation";
import { defaultSiteKey, getSitePagePath, normalizeLocaleSegment } from "@/lib/sites";

export default async function LegacyThankYouPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale } = await searchParams;
  redirect(getSitePagePath(defaultSiteKey, normalizeLocaleSegment(locale), "thankyou"));
}
