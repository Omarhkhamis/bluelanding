import { getCurrentAdminUser } from "@/lib/admin-auth";
import {
  escapeCsvValue,
  normalizeDataLeadsFilters
} from "@/lib/data-leads";
import { getFormSubmissions } from "@/lib/cms";

export async function GET(request: Request) {
  const user = await getCurrentAdminUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters = normalizeDataLeadsFilters(searchParams);
  const records = await getFormSubmissions({
    siteKey: filters.siteKey,
    order: filters.order,
    month: filters.month,
    from: filters.from,
    to: filters.to
  });

  const header = ["form", "locale", "name", "email", "phone", "message", "submitted"];
  const rows = records.map((record) =>
    [
      escapeCsvValue(record.formName || record.source),
      escapeCsvValue((record.locale || "en").toUpperCase()),
      escapeCsvValue(record.fullName || ""),
      escapeCsvValue(record.email || ""),
      escapeCsvValue(record.phone || ""),
      escapeCsvValue(record.message || ""),
      escapeCsvValue(record.createdAt || "")
    ].join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="form-data.csv"'
    }
  });
}
