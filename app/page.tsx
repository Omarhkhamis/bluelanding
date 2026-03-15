import { redirect } from "next/navigation";
import { defaultPublicLocale, defaultSiteKey, getSiteBasePath } from "@/lib/sites";

export default function RootPage() {
  redirect(getSiteBasePath(defaultSiteKey, defaultPublicLocale));
}
