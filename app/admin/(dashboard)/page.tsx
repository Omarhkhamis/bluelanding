import { redirect } from "next/navigation";

export default async function AdminIndexPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale = "en" } = await searchParams;
  redirect(`/admin/overview?locale=${locale}`);
}
