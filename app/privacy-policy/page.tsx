import { notFound } from "next/navigation";
import { ManagedPageShell } from "@/components/managed-page-shell";
import { getManagedPageByKey } from "@/lib/cms";

export default async function PrivacyPolicyPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale = "en" } = await searchParams;
  const page = await getManagedPageByKey("privacy-policy", locale);

  if (!page) {
    notFound();
  }

  return (
    <ManagedPageShell
      locale={locale}
      title={page.title}
      content={page.content}
    />
  );
}
