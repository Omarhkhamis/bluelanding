import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { createMediaAsset, getMediaAssets } from "@/lib/cms";

export async function GET() {
  const user = await getCurrentAdminUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mediaAssets = await getMediaAssets();
  return NextResponse.json({ assets: mediaAssets });
}

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const altText = String(formData.get("altText") || "");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const url = await createMediaAsset(file, altText, "library");
  return NextResponse.json({ url });
}
