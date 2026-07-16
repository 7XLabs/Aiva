import { NextRequest, NextResponse } from "next/server";
import { getBusiness } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Downloads the full business configuration as portable JSON —
// backup, migrate between installs, or keep in version control.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const business = await getBusiness(params.id);
  if (!business) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return new NextResponse(JSON.stringify(business, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="aiva-${business.id}.json"`,
    },
  });
}
