import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getCustomCodes, getSeoSettings, getSiteSettings } from "@/lib/cms";
import { ConsultationModalProvider } from "@/components/consultation-modal";
import { normalizeLocaleSegment, parseSiteKey } from "@/lib/sites";

function getMetadataBase(baseUrl: string) {
  try {
    return new URL(baseUrl);
  } catch {
    return new URL("https://example.com");
  }
}

async function resolveRouteContext(paramsPromise: Promise<{ site: string; locale: string }>) {
  const params = await paramsPromise;
  const siteKey = parseSiteKey(params.site);

  if (!siteKey) {
    notFound();
  }

  return {
    siteKey,
    locale: normalizeLocaleSegment(params.locale)
  };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ site: string; locale: string }>;
}): Promise<Metadata> {
  const { siteKey, locale } = await resolveRouteContext(params);
  const [site, seo] = await Promise.all([
    getSiteSettings(siteKey, locale),
    getSeoSettings(siteKey, locale)
  ]);
  const baseUrl = seo.canonicalUrl || "https://example.com";

  return {
    title: seo.metaTitle || site.siteTitle,
    description: seo.metaDescription || site.siteDescription,
    metadataBase: getMetadataBase(baseUrl),
    keywords: seo.metaKeywords,
    robots: seo.robots,
    icons: {
      icon: site.faviconUrl
    },
    openGraph: {
      title: seo.metaTitle || site.siteTitle,
      description: seo.metaDescription || site.siteDescription,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : []
    }
  };
}

export default async function PublicSiteLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ site: string; locale: string }>;
}>) {
  const { siteKey, locale } = await resolveRouteContext(params);
  const [codes, siteSettings] = await Promise.all([
    getCustomCodes(siteKey),
    getSiteSettings(siteKey, locale)
  ]);
  const headCodes = codes.filter((code) => code.isActive && code.placement === "HEAD");
  const bodyStartCodes = codes.filter(
    (code) => code.isActive && code.placement === "BODY_START"
  );
  const bodyEndCodes = codes.filter(
    (code) => code.isActive && code.placement === "BODY_END"
  );

  return (
    <>
      {headCodes.map((code) => (
        <Script
          key={code.id}
          id={`site-head-${siteKey}-${code.id}`}
          strategy="beforeInteractive"
        >
          {code.code}
        </Script>
      ))}
      {bodyStartCodes.map((code) => (
        <div key={code.id} dangerouslySetInnerHTML={{ __html: code.code }} />
      ))}
      <ConsultationModalProvider locale={locale} whatsappUrl={siteSettings.whatsappUrl}>
        {children}
      </ConsultationModalProvider>
      {bodyEndCodes.map((code) => (
        <div key={code.id} dangerouslySetInnerHTML={{ __html: code.code }} />
      ))}
    </>
  );
}
