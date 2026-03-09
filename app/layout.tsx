import type { Metadata } from "next";
import { getCustomCodes, getSeoSettings, getSiteSettings } from "@/lib/cms";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [site, seo] = await Promise.all([getSiteSettings(), getSeoSettings()]);
  const baseUrl = seo.canonicalUrl || "https://example.com";

  return {
    title: seo.metaTitle || site.siteTitle,
    description: seo.metaDescription || site.siteDescription,
    metadataBase: new URL(baseUrl),
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

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const codes = await getCustomCodes();
  const headCodes = codes.filter((code) => code.isActive && code.placement === "HEAD");
  const bodyStartCodes = codes.filter(
    (code) => code.isActive && code.placement === "BODY_START"
  );
  const bodyEndCodes = codes.filter(
    (code) => code.isActive && code.placement === "BODY_END"
  );

  return (
    <html lang="en">
      <head>
        {headCodes.map((code) => (
          <script
            key={code.id}
            dangerouslySetInnerHTML={{ __html: code.code }}
          />
        ))}
      </head>
      <body>
        {bodyStartCodes.map((code) => (
          <div key={code.id} dangerouslySetInnerHTML={{ __html: code.code }} />
        ))}
        {children}
        {bodyEndCodes.map((code) => (
          <div key={code.id} dangerouslySetInnerHTML={{ __html: code.code }} />
        ))}
      </body>
    </html>
  );
}
