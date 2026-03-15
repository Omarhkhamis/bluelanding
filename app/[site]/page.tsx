import { notFound, redirect } from "next/navigation";
import { defaultPublicLocale, getSiteBasePath, parseSiteKey } from "@/lib/sites";

export default async function SiteIndexRedirect({
  params
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const siteKey = parseSiteKey(site);

  if (!siteKey) {
    notFound();
  }

  redirect(getSiteBasePath(siteKey, defaultPublicLocale));
}
