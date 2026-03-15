import { notFound } from "next/navigation";
import { ManagedPageShell } from "@/components/managed-page-shell";
import { getManagedPageByKey } from "@/lib/cms";
import { normalizeLocaleSegment, parseSiteKey } from "@/lib/sites";

export default async function TermsPage({
  params
}: {
  params: Promise<{ site: string; locale: string }>;
}) {
  const { site, locale } = await params;
  const siteKey = parseSiteKey(site);

  if (!siteKey) {
    notFound();
  }

  const normalizedLocale = normalizeLocaleSegment(locale);
  const page = await getManagedPageByKey("terms", siteKey, normalizedLocale);

  if (!page) {
    notFound();
  }

  return (
    <ManagedPageShell
      siteKey={siteKey}
      locale={normalizedLocale}
      title={page.title}
      content={page.content}
    />
  );
}
