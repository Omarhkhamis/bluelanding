import { redirect } from "next/navigation";
import { buildAdminPath, normalizeSiteKey } from "@/lib/sites";

export default async function AdminIndexPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string; site?: string }>;
}) {
  const { locale = "en", site } = await searchParams;
  redirect(buildAdminPath("/admin/overview", { siteKey: normalizeSiteKey(site), locale }));
}
